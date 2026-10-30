package com.hrms.modules.attendance.service;

import com.hrms.dto.request.AttendanceRequest;
import com.hrms.dto.response.AttendanceResponse;
import com.hrms.entity.*;
import com.hrms.enums.AttendanceStatus;
import com.hrms.exception.*;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.attendance.dto.AttendancePunchRequest;
import com.hrms.modules.attendance.dto.OfficeLocationDto;
import com.hrms.modules.attendance.dto.RegularizationRequestDto;
import com.hrms.modules.attendance.entity.AttendanceRegularization;
import com.hrms.modules.attendance.entity.OfficeLocation;
import com.hrms.modules.attendance.repository.AttendanceRegularizationRepository;
import com.hrms.modules.attendance.repository.OfficeLocationRepository;
import com.hrms.modules.attendance.service.GeofenceValidator;
import com.hrms.repository.*;
import com.hrms.modules.attendance.dto.BiometricDeviceDto;
import com.hrms.modules.attendance.dto.BiometricPunchDto;
import com.hrms.modules.attendance.entity.BiometricDevice;
import com.hrms.modules.attendance.repository.BiometricDeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service @Slf4j @RequiredArgsConstructor @Transactional
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final OfficeLocationRepository officeLocationRepository;
    private final AttendanceRegularizationRepository regularizationRepository;
    private final BiometricDeviceRepository biometricDeviceRepository;
    private final GeofenceValidator geofenceValidator;

    public AttendanceResponse punch(AttendancePunchRequest req) {
        Employee emp = employeeRepository.findById(req.getEmployeeId())
            .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", req.getEmployeeId()));

        LocalDate date = req.getDate() != null ? req.getDate() : LocalDate.now();
        LocalTime time = req.getTime() != null ? req.getTime() : LocalTime.now();

        boolean isWfh = req.getWorkMode() != null && "REMOTE_WFH".equalsIgnoreCase(req.getWorkMode());

        // Evaluate Geofencing
        String geofenceStatus = isWfh ? "REMOTE_EXEMPT" : "INSIDE_GEOFENCE";
        OfficeLocation office = null;
        if (!isWfh && req.getOfficeLocationId() != null) {
            office = officeLocationRepository.findById(req.getOfficeLocationId()).orElse(null);
            if (office != null && req.getLatitude() != null && req.getLongitude() != null) {
                boolean inside = geofenceValidator.isWithinGeofence(
                        req.getLatitude(), req.getLongitude(),
                        office.getLatitude(), office.getLongitude(),
                        office.getRadiusMeters()
                );
                geofenceStatus = inside ? "INSIDE_GEOFENCE" : "OUTSIDE_GEOFENCE";
            }
        }

        Optional<Attendance> existingOpt = attendanceRepository.findByEmployeeIdAndDate(emp.getId(), date);
        Attendance attendance;

        if ("CHECK_IN".equalsIgnoreCase(req.getPunchType())) {
            if (existingOpt.isPresent()) {
                attendance = existingOpt.get();
                if (attendance.getCheckInTime() != null) {
                    throw new BadRequestException("Employee already checked in for today at " + attendance.getCheckInTime());
                }
            } else {
                attendance = Attendance.builder()
                        .employee(emp)
                        .date(date)
                        .build();
            }

            attendance.setCheckInTime(time);
            attendance.setCheckInLatitude(req.getLatitude());
            attendance.setCheckInLongitude(req.getLongitude());
            attendance.setIpAddress(req.getIpAddress());
            attendance.setOfficeLocation(office);
            attendance.setSelfieUrl(req.getSelfieUrl());
            attendance.setGeofenceStatus(geofenceStatus);
            attendance.setWorkMode(isWfh ? "REMOTE_WFH" : "OFFICE");
            attendance.setPunchSource(req.getPunchSource() != null ? req.getPunchSource() : "WEB_MANUAL");
            if (req.getDeviceId() != null) attendance.setDeviceId(req.getDeviceId());
            attendance.setStatus(isWfh ? AttendanceStatus.WORK_FROM_HOME : AttendanceStatus.PRESENT);

            // Shift check: If after 09:30 AM and not WFH, flag as LATE
            if (!isWfh && time.isAfter(LocalTime.of(9, 30))) {
                attendance.setStatus(AttendanceStatus.LATE_ARRIVAL);
                attendance.setLateArrivalReason(req.getLateArrivalReason() != null ? req.getLateArrivalReason() : "Late arrival after 09:30 AM");
            }
        } else if ("CHECK_OUT".equalsIgnoreCase(req.getPunchType())) {
            if (existingOpt.isEmpty() || existingOpt.get().getCheckInTime() == null) {
                throw new BadRequestException("Cannot check out without a valid check-in recorded for today");
            }
            attendance = existingOpt.get();
            attendance.setCheckOutTime(time);
            attendance.setCheckOutLatitude(req.getLatitude());
            attendance.setCheckOutLongitude(req.getLongitude());
            if (req.getDeviceId() != null) attendance.setDeviceId(req.getDeviceId());

            // If employee was on break, auto-conclude break
            if (Boolean.TRUE.equals(attendance.getIsOnBreak()) && attendance.getLastBreakStart() != null) {
                long duration = Duration.between(attendance.getLastBreakStart(), LocalDateTime.now()).toMinutes();
                int currentBreak = attendance.getBreakMinutes() != null ? attendance.getBreakMinutes() : 0;
                attendance.setBreakMinutes((int) (currentBreak + duration));
                attendance.setIsOnBreak(false);
                attendance.setLastBreakStart(null);
            }

            // Calculate net working hours (minus break time)
            long totalMinutes = Duration.between(attendance.getCheckInTime(), time).toMinutes();
            int breakMins = attendance.getBreakMinutes() != null ? attendance.getBreakMinutes() : 0;
            double hours = Math.max(0.0, (totalMinutes - breakMins) / 60.0);
            attendance.setWorkingHours(Math.round(hours * 100.0) / 100.0);

            // Standard 8-hour workday
            double overtime = Math.max(0.0, hours - 8.0);
            attendance.setOvertimeHours(Math.round(overtime * 100.0) / 100.0);

            if (hours < 4.0) {
                attendance.setStatus(AttendanceStatus.HALF_DAY);
            }
        } else {
            throw new BadRequestException("Invalid punch type: " + req.getPunchType());
        }

        if (req.getRemarks() != null) {
            attendance.setRemarks(req.getRemarks());
        }

        attendance = attendanceRepository.save(attendance);
        log.info("Attendance punch processed: empId={}, type={}, time={}, geofence={}",
                emp.getId(), req.getPunchType(), time, geofenceStatus);
        return toResponse(attendance);
    }

    // --- Regularization Workflows ---
    public RegularizationRequestDto submitRegularization(RegularizationRequestDto req) {
        Employee emp = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", req.getEmployeeId()));

        Attendance att = null;
        if (req.getAttendanceId() != null) {
            att = attendanceRepository.findById(req.getAttendanceId()).orElse(null);
        }

        AttendanceRegularization reg = AttendanceRegularization.builder()
                .employee(emp)
                .attendance(att)
                .date(req.getDate())
                .requestedCheckIn(req.getRequestedCheckIn())
                .requestedCheckOut(req.getRequestedCheckOut())
                .reason(req.getReason())
                .status("PENDING")
                .build();

        reg = regularizationRepository.save(reg);

        if (att != null) {
            att.setRegularizationStatus("PENDING");
            attendanceRepository.save(att);
        }

        req.setId(reg.getId());
        req.setStatus(reg.getStatus());
        return req;
    }

    public RegularizationRequestDto reviewRegularization(Long regId, String action, String comments, String reviewerEmail) {
        AttendanceRegularization reg = regularizationRepository.findById(regId)
                .orElseThrow(() -> new ResourceNotFoundException("AttendanceRegularization", "id", regId));

        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", reviewerEmail));

        reg.setStatus(action.toUpperCase());
        reg.setReviewer(reviewer);
        reg.setReviewerComments(comments);
        reg.setReviewedAt(java.time.LocalDateTime.now());
        reg = regularizationRepository.save(reg);

        if ("APPROVED".equalsIgnoreCase(action)) {
            Attendance att = reg.getAttendance();
            if (att == null) {
                att = attendanceRepository.findByEmployeeIdAndDate(reg.getEmployee().getId(), reg.getDate())
                        .orElse(Attendance.builder().employee(reg.getEmployee()).date(reg.getDate()).build());
            }
            if (reg.getRequestedCheckIn() != null) att.setCheckInTime(reg.getRequestedCheckIn());
            if (reg.getRequestedCheckOut() != null) att.setCheckOutTime(reg.getRequestedCheckOut());
            if (att.getCheckInTime() != null && att.getCheckOutTime() != null) {
                double hours = Duration.between(att.getCheckInTime(), att.getCheckOutTime()).toMinutes() / 60.0;
                att.setWorkingHours(Math.round(hours * 100.0) / 100.0);
                att.setOvertimeHours(Math.round(Math.max(0.0, hours - 8.0) * 100.0) / 100.0);
            }
            att.setStatus(AttendanceStatus.PRESENT);
            att.setRegularizationStatus("REGULARIZED");
            attendanceRepository.save(att);
        }

        return RegularizationRequestDto.builder()
                .id(reg.getId())
                .employeeId(reg.getEmployee().getId())
                .date(reg.getDate())
                .requestedCheckIn(reg.getRequestedCheckIn())
                .requestedCheckOut(reg.getRequestedCheckOut())
                .reason(reg.getReason())
                .status(reg.getStatus())
                .reviewerComments(reg.getReviewerComments())
                .build();
    }

    // --- Office Locations ---
    public List<OfficeLocationDto> getOfficeLocations() {
        String tenantId = TenantContext.getTenantId();
        return officeLocationRepository.findByTenantIdAndIsActiveTrue(tenantId).stream()
                .map(ol -> OfficeLocationDto.builder()
                        .id(ol.getId())
                        .name(ol.getName())
                        .address(ol.getAddress())
                        .latitude(ol.getLatitude())
                        .longitude(ol.getLongitude())
                        .radiusMeters(ol.getRadiusMeters())
                        .ipWhitelist(ol.getIpWhitelist())
                        .isActive(ol.getIsActive())
                        .build())
                .collect(Collectors.toList());
    }

    public OfficeLocationDto saveOfficeLocation(OfficeLocationDto dto) {
        OfficeLocation ol = OfficeLocation.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .radiusMeters(dto.getRadiusMeters() != null ? dto.getRadiusMeters() : 200)
                .ipWhitelist(dto.getIpWhitelist())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        ol = officeLocationRepository.save(ol);
        dto.setId(ol.getId());
        return dto;
    }

    // --- Original Standard APIs ---
    public AttendanceResponse mark(AttendanceRequest req) {
        if (attendanceRepository.existsByEmployeeIdAndDate(req.getEmployeeId(), req.getDate()))
            throw new DuplicateResourceException("Attendance already recorded for this employee on " + req.getDate());
        if (req.getDate().isAfter(LocalDate.now()))
            throw new BadRequestException("Cannot mark attendance for a future date");

        Employee emp = employeeRepository.findById(req.getEmployeeId())
            .orElseThrow(() -> new ResourceNotFoundException("Employee","id",req.getEmployeeId()));

        Double hours = null;
        if (req.getCheckInTime() != null && req.getCheckOutTime() != null) {
            if (req.getCheckOutTime().isBefore(req.getCheckInTime()))
                throw new BadRequestException("Check-out time cannot be before check-in time");
            hours = Duration.between(req.getCheckInTime(), req.getCheckOutTime()).toMinutes() / 60.0;
        }

        Attendance attendance = Attendance.builder()
            .employee(emp).date(req.getDate())
            .checkInTime(req.getCheckInTime()).checkOutTime(req.getCheckOutTime())
            .workingHours(hours).status(req.getStatus())
            .remarks(req.getRemarks()).lateArrivalReason(req.getLateArrivalReason())
            .build();
        return toResponse(attendanceRepository.save(attendance));
    }

    public AttendanceResponse update(Long id, AttendanceRequest req) {
        Attendance a = attendanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Attendance","id",id));
        a.setCheckInTime(req.getCheckInTime()); a.setCheckOutTime(req.getCheckOutTime());
        a.setStatus(req.getStatus()); a.setRemarks(req.getRemarks());
        if (req.getCheckInTime() != null && req.getCheckOutTime() != null)
            a.setWorkingHours(Duration.between(req.getCheckInTime(), req.getCheckOutTime()).toMinutes() / 60.0);
        return toResponse(attendanceRepository.save(a));
    }

    @Transactional(readOnly = true)
    public Page<AttendanceResponse> getForEmployee(Long empId, Pageable pageable) {
        return attendanceRepository.findByEmployeeIdOrderByDateDesc(empId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getMonthly(Long empId, int year, int month) {
        return attendanceRepository.findMonthly(empId, year, month)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getByDate(LocalDate date) {
        return attendanceRepository.findByDateOrderByEmployee_FirstNameAsc(date)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // --- Auto-Login Punch ---
    public AttendanceResponse recordLoginPunch(Long employeeId, String ipAddress, String workMode) {
        Employee emp = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);
        if (existing.isPresent() && existing.get().getCheckInTime() != null) {
            return toResponse(existing.get());
        }

        LocalTime now = LocalTime.now();
        boolean isWfh = "REMOTE_WFH".equalsIgnoreCase(workMode);

        Attendance attendance = existing.orElseGet(() -> Attendance.builder()
            .employee(emp)
            .date(today)
            .build());

        attendance.setCheckInTime(now);
        attendance.setIpAddress(ipAddress);
        attendance.setPunchSource("AUTO_LOGIN");
        attendance.setWorkMode(isWfh ? "REMOTE_WFH" : "OFFICE");
        attendance.setGeofenceStatus(isWfh ? "REMOTE_EXEMPT" : "INSIDE_GEOFENCE");
        attendance.setStatus(isWfh ? AttendanceStatus.WORK_FROM_HOME : AttendanceStatus.PRESENT);

        if (!isWfh && now.isAfter(LocalTime.of(9, 30))) {
            attendance.setStatus(AttendanceStatus.LATE_ARRIVAL);
            attendance.setLateArrivalReason("Auto login after 09:30 AM");
        }
        attendance.setRemarks("Auto checked-in via portal login");
        return toResponse(attendanceRepository.save(attendance));
    }

    // --- Break Management ---
    public AttendanceResponse toggleBreak(Long employeeId) {
        LocalDate today = LocalDate.now();
        Attendance att = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
            .orElseThrow(() -> new BadRequestException("No attendance check-in found for today"));

        if (att.getCheckInTime() == null) {
            throw new BadRequestException("Employee has not checked in for today");
        }

        if (Boolean.TRUE.equals(att.getIsOnBreak())) {
            // End Break
            if (att.getLastBreakStart() != null) {
                long duration = Duration.between(att.getLastBreakStart(), LocalDateTime.now()).toMinutes();
                int currentBreak = att.getBreakMinutes() != null ? att.getBreakMinutes() : 0;
                att.setBreakMinutes((int) (currentBreak + duration));
            }
            att.setIsOnBreak(false);
            att.setLastBreakStart(null);
            log.info("Employee {} resumed from break. Total break: {} mins", employeeId, att.getBreakMinutes());
        } else {
            // Start Break
            att.setIsOnBreak(true);
            att.setLastBreakStart(LocalDateTime.now());
            log.info("Employee {} started break at {}", employeeId, att.getLastBreakStart());
        }

        return toResponse(attendanceRepository.save(att));
    }

    // --- Today Status ---
    @Transactional(readOnly = true)
    public AttendanceResponse getTodayStatus(Long employeeId) {
        return attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now())
            .map(this::toResponse)
            .orElse(null);
    }

    // --- Biometric Machine Sync Engine ---
    public Map<String, Object> syncBiometricPunches(List<BiometricPunchDto> punches) {
        int processed = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        for (BiometricPunchDto punch : punches) {
            try {
                Employee emp = employeeRepository.findByEmployeeNumber(punch.getEmployeeNumber())
                    .orElse(null);
                if (emp == null) {
                    errors.add("Employee not found for number: " + punch.getEmployeeNumber());
                    failed++;
                    continue;
                }

                LocalDate date = punch.getTimestamp().toLocalDate();
                LocalTime time = punch.getTimestamp().toLocalTime();

                Optional<Attendance> opt = attendanceRepository.findByEmployeeIdAndDate(emp.getId(), date);
                Attendance att;

                if (opt.isEmpty()) {
                    // First punch of the day is Check-In
                    att = Attendance.builder()
                        .employee(emp)
                        .date(date)
                        .checkInTime(time)
                        .punchSource("BIOMETRIC_DEVICE")
                        .deviceId(punch.getDeviceId())
                        .geofenceStatus("BIOMETRIC_VERIFIED")
                        .status(time.isAfter(LocalTime.of(9, 30)) ? AttendanceStatus.LATE_ARRIVAL : AttendanceStatus.PRESENT)
                        .remarks("Biometric punch via " + punch.getDeviceId())
                        .build();
                } else {
                    // Subsequent punch updates Check-Out and recalculates hours
                    att = opt.get();
                    if (att.getCheckInTime() != null && time.isAfter(att.getCheckInTime())) {
                        att.setCheckOutTime(time);
                        att.setDeviceId(punch.getDeviceId());
                        long totalMinutes = Duration.between(att.getCheckInTime(), time).toMinutes();
                        int breakMins = att.getBreakMinutes() != null ? att.getBreakMinutes() : 0;
                        double hours = Math.max(0.0, (totalMinutes - breakMins) / 60.0);
                        att.setWorkingHours(Math.round(hours * 100.0) / 100.0);
                        att.setOvertimeHours(Math.round(Math.max(0.0, hours - 8.0) * 100.0) / 100.0);
                        if (hours < 4.0) att.setStatus(AttendanceStatus.HALF_DAY);
                    }
                }

                attendanceRepository.save(att);
                processed++;

                // Update device lastSyncAt
                biometricDeviceRepository.findByDeviceCode(punch.getDeviceId()).ifPresent(dev -> {
                    dev.setLastSyncAt(LocalDateTime.now());
                    biometricDeviceRepository.save(dev);
                });

            } catch (Exception e) {
                errors.add("Error processing punch for " + punch.getEmployeeNumber() + ": " + e.getMessage());
                failed++;
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("total", punches.size());
        resp.put("processed", processed);
        resp.put("failed", failed);
        resp.put("errors", errors);
        log.info("Biometric sync complete: {} processed, {} failed", processed, failed);
        return resp;
    }

    // --- Bulk Biometric CSV Ingestion ---
    public Map<String, Object> uploadBiometricCsv(org.springframework.web.multipart.MultipartFile file) {
        List<BiometricPunchDto> punches = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean firstLine = true;
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            while ((line = br.readLine()) != null) {
                if (firstLine) { firstLine = false; continue; } // skip header
                String[] parts = line.split(",");
                if (parts.length >= 3) {
                    String empNum = parts[0].trim().replace("\"", "");
                    String tsStr = parts[1].trim().replace("\"", "");
                    String devId = parts[2].trim().replace("\"", "");
                    LocalDateTime ts;
                    if (tsStr.contains("T")) {
                        ts = LocalDateTime.parse(tsStr);
                    } else {
                        ts = LocalDateTime.parse(tsStr, dtf);
                    }
                    punches.add(BiometricPunchDto.builder()
                        .employeeNumber(empNum)
                        .timestamp(ts)
                        .deviceId(devId)
                        .build());
                }
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to parse biometric CSV: " + e.getMessage());
        }
        return syncBiometricPunches(punches);
    }

    // --- Biometric Devices CRUD ---
    @Transactional(readOnly = true)
    public List<BiometricDeviceDto> getBiometricDevices() {
        String tenantId = TenantContext.getTenantId();
        List<BiometricDevice> devices = (tenantId != null)
            ? biometricDeviceRepository.findByTenantId(tenantId)
            : biometricDeviceRepository.findAll();
        return devices.stream()
            .map(d -> BiometricDeviceDto.builder()
                .id(d.getId())
                .deviceCode(d.getDeviceCode())
                .deviceName(d.getDeviceName())
                .ipAddress(d.getIpAddress())
                .location(d.getLocation())
                .isActive(d.getIsActive())
                .lastSyncAt(d.getLastSyncAt())
                .build())
            .collect(Collectors.toList());
    }

    public BiometricDeviceDto saveBiometricDevice(BiometricDeviceDto dto) {
        BiometricDevice dev = dto.getId() != null
            ? biometricDeviceRepository.findById(dto.getId()).orElseGet(BiometricDevice::new)
            : new BiometricDevice();

        dev.setDeviceCode(dto.getDeviceCode());
        dev.setDeviceName(dto.getDeviceName());
        dev.setIpAddress(dto.getIpAddress());
        dev.setLocation(dto.getLocation());
        dev.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        dev = biometricDeviceRepository.save(dev);

        dto.setId(dev.getId());
        dto.setLastSyncAt(dev.getLastSyncAt());
        return dto;
    }

    public AttendanceResponse toResponse(Attendance a) {
        return AttendanceResponse.builder()
            .id(a.getId()).employeeId(a.getEmployee().getId())
            .employeeName(a.getEmployee().getFullName())
            .employeeNumber(a.getEmployee().getEmployeeNumber())
            .date(a.getDate()).checkInTime(a.getCheckInTime())
            .checkOutTime(a.getCheckOutTime()).workingHours(a.getWorkingHours())
            .overtimeHours(a.getOvertimeHours()).status(a.getStatus())
            .remarks(a.getRemarks())
            .geofenceStatus(a.getGeofenceStatus())
            .officeName(a.getOfficeLocation() != null ? a.getOfficeLocation().getName() : null)
            .selfieUrl(a.getSelfieUrl())
            .regularizationStatus(a.getRegularizationStatus())
            .lateArrivalReason(a.getLateArrivalReason())
            .punchSource(a.getPunchSource())
            .deviceId(a.getDeviceId())
            .breakMinutes(a.getBreakMinutes())
            .isOnBreak(a.getIsOnBreak())
            .workMode(a.getWorkMode())
            .build();
    }
}
