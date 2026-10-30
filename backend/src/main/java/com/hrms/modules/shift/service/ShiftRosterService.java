package com.hrms.modules.shift.service;

import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.shift.dto.*;
import com.hrms.modules.shift.entity.RosterAssignment;
import com.hrms.modules.shift.entity.Shift;
import com.hrms.modules.shift.entity.ShiftSwapRequest;
import com.hrms.modules.shift.repository.RosterAssignmentRepository;
import com.hrms.modules.shift.repository.ShiftRepository;
import com.hrms.modules.shift.repository.ShiftSwapRequestRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ShiftRosterService {

    private final ShiftRepository shiftRepository;
    private final RosterAssignmentRepository rosterAssignmentRepository;
    private final ShiftSwapRequestRepository shiftSwapRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ShiftDto> getShifts() {
        String tenantId = TenantContext.getTenantId();
        return shiftRepository.findByTenantId(tenantId).stream()
                .map(this::toShiftDto)
                .collect(Collectors.toList());
    }

    public ShiftDto createShift(ShiftDto dto) {
        String tenantId = TenantContext.getTenantId();
        shiftRepository.findByTenantIdAndShiftCode(tenantId, dto.getShiftCode())
                .ifPresent(s -> {
                    throw new BadRequestException("Shift with code " + dto.getShiftCode() + " already exists");
                });

        Shift shift = Shift.builder()
                .name(dto.getName())
                .shiftCode(dto.getShiftCode().toUpperCase())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .gracePeriodMins(dto.getGracePeriodMins() != null ? dto.getGracePeriodMins() : 15)
                .breakDurationMins(dto.getBreakDurationMins() != null ? dto.getBreakDurationMins() : 60)
                .isNightShift(Boolean.TRUE.equals(dto.getIsNightShift()))
                .nightAllowanceRate(dto.getNightAllowanceRate() != null ? dto.getNightAllowanceRate() : java.math.BigDecimal.ZERO)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        shift.setTenantId(tenantId);
        shift = shiftRepository.save(shift);

        log.info("Shift definition created: code={}, name={}", shift.getShiftCode(), shift.getName());
        return toShiftDto(shift);
    }

    public List<RosterAssignmentDto> assignRoster(RosterAssignRequest req, Long assignedByUserId) {
        String tenantId = TenantContext.getTenantId();
        Shift shift = shiftRepository.findByIdAndTenantId(req.getShiftId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift", "id", req.getShiftId()));

        User assignedBy = assignedByUserId != null ? userRepository.findById(assignedByUserId).orElse(null) : null;

        if (req.getStartDate().isAfter(req.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date");
        }

        List<RosterAssignment> savedAssignments = new ArrayList<>();

        for (Long empId : req.getEmployeeIds()) {
            Employee emp = employeeRepository.findById(empId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", empId));

            LocalDate current = req.getStartDate();
            while (!current.isAfter(req.getEndDate())) {
                Optional<RosterAssignment> existing = rosterAssignmentRepository
                        .findByTenantIdAndEmployeeIdAndEffectiveDate(tenantId, empId, current);

                RosterAssignment assignment;
                if (existing.isPresent()) {
                    assignment = existing.get();
                    assignment.setShift(shift);
                    assignment.setRotationPattern(req.getRotationPattern());
                    assignment.setNotes(req.getNotes());
                    assignment.setAssignedByUser(assignedBy);
                    assignment.setStatus("ACTIVE");
                } else {
                    assignment = RosterAssignment.builder()
                            .employee(emp)
                            .shift(shift)
                            .effectiveDate(current)
                            .rotationPattern(req.getRotationPattern() != null ? req.getRotationPattern() : "STANDARD")
                            .assignedByUser(assignedBy)
                            .notes(req.getNotes())
                            .status("ACTIVE")
                            .build();
                    assignment.setTenantId(tenantId);
                }
                savedAssignments.add(rosterAssignmentRepository.save(assignment));
                current = current.plusDays(1);
            }
        }

        log.info("Roster assigned: {} total shifts generated across {} employees from {} to {}",
                savedAssignments.size(), req.getEmployeeIds().size(), req.getStartDate(), req.getEndDate());

        return savedAssignments.stream().map(this::toRosterDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RosterAssignmentDto> getRosterSchedule(LocalDate startDate, LocalDate endDate) {
        String tenantId = TenantContext.getTenantId();
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(3);
        LocalDate end = endDate != null ? endDate : LocalDate.now().plusDays(14);
        return rosterAssignmentRepository.findRosterScheduleRange(tenantId, start, end).stream()
                .map(this::toRosterDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RosterAssignmentDto> getMyRoster(Long employeeId, LocalDate startDate, LocalDate endDate) {
        String tenantId = TenantContext.getTenantId();
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(7);
        LocalDate end = endDate != null ? endDate : LocalDate.now().plusDays(21);
        return rosterAssignmentRepository.findEmployeeRosterRange(tenantId, employeeId, start, end).stream()
                .map(this::toRosterDto)
                .collect(Collectors.toList());
    }

    public ShiftSwapDto createSwapRequest(ShiftSwapCreateRequest req) {
        String tenantId = TenantContext.getTenantId();

        if (req.getRequesterEmployeeId().equals(req.getTargetEmployeeId())) {
            throw new BadRequestException("Cannot request shift swap with yourself");
        }

        Employee requester = employeeRepository.findById(req.getRequesterEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", req.getRequesterEmployeeId()));
        Employee target = employeeRepository.findById(req.getTargetEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", req.getTargetEmployeeId()));

        RosterAssignment reqRoster = rosterAssignmentRepository
                .findByTenantIdAndEmployeeIdAndEffectiveDate(tenantId, req.getRequesterEmployeeId(), req.getSwapDate())
                .orElseThrow(() -> new BadRequestException("Requester has no active shift assigned on " + req.getSwapDate()));

        RosterAssignment targetRoster = rosterAssignmentRepository
                .findByTenantIdAndEmployeeIdAndEffectiveDate(tenantId, req.getTargetEmployeeId(), req.getSwapDate())
                .orElseThrow(() -> new BadRequestException("Target peer employee has no shift assigned on " + req.getSwapDate()));

        if (reqRoster.getShift().getId().equals(targetRoster.getShift().getId())) {
            throw new BadRequestException("Both employees are already scheduled for the same shift (" + reqRoster.getShift().getName() + ")");
        }

        ShiftSwapRequest swap = ShiftSwapRequest.builder()
                .requesterEmployee(requester)
                .targetEmployee(target)
                .requesterRoster(reqRoster)
                .targetRoster(targetRoster)
                .swapDate(req.getSwapDate())
                .reason(req.getReason())
                .peerStatus("PENDING_PEER")
                .managerStatus("PENDING_MANAGER")
                .status("PENDING")
                .build();
        swap.setTenantId(tenantId);
        swap = shiftSwapRequestRepository.save(swap);

        log.info("Shift swap request logged: id={}, from Emp {} to Emp {} on {}",
                swap.getId(), requester.getId(), target.getId(), req.getSwapDate());

        return toSwapDto(swap);
    }

    public ShiftSwapDto peerRespondSwap(Long swapId, Long peerEmployeeId, ShiftSwapReviewRequest req) {
        String tenantId = TenantContext.getTenantId();
        ShiftSwapRequest swap = shiftSwapRequestRepository.findById(swapId)
                .orElseThrow(() -> new ResourceNotFoundException("ShiftSwapRequest", "id", swapId));

        if (!swap.getTargetEmployee().getId().equals(peerEmployeeId)) {
            throw new BadRequestException("Only the targeted peer employee can respond to this swap request");
        }

        if (!"PENDING_PEER".equals(swap.getPeerStatus())) {
            throw new BadRequestException("This swap request is no longer pending peer response (status: " + swap.getPeerStatus() + ")");
        }

        String action = req.getAction().toUpperCase();
        if ("ACCEPT".equals(action)) {
            swap.setPeerStatus("PEER_ACCEPTED");
            log.info("Shift swap {} accepted by peer employee {}", swapId, peerEmployeeId);
        } else if ("DECLINE".equals(action)) {
            swap.setPeerStatus("PEER_REJECTED");
            swap.setStatus("REJECTED");
            log.info("Shift swap {} declined by peer employee {}", swapId, peerEmployeeId);
        } else {
            throw new BadRequestException("Invalid action for peer response: " + req.getAction());
        }

        swap = shiftSwapRequestRepository.save(swap);
        return toSwapDto(swap);
    }

    public ShiftSwapDto managerReviewSwap(Long swapId, User manager, ShiftSwapReviewRequest req) {
        String tenantId = TenantContext.getTenantId();
        ShiftSwapRequest swap = shiftSwapRequestRepository.findById(swapId)
                .orElseThrow(() -> new ResourceNotFoundException("ShiftSwapRequest", "id", swapId));

        if (!"PEER_ACCEPTED".equals(swap.getPeerStatus())) {
            throw new BadRequestException("Cannot approve swap before peer employee has accepted it");
        }

        String action = req.getAction().toUpperCase();
        if ("APPROVE".equals(action)) {
            swap.setManagerStatus("APPROVED");
            swap.setStatus("APPROVED");
            swap.setReviewedByUser(manager);
            swap.setManagerRemarks(req.getRemarks());

            // Automated schedule mutation: Swap the shift references
            RosterAssignment reqRoster = swap.getRequesterRoster();
            RosterAssignment targetRoster = swap.getTargetRoster();

            Shift originalReqShift = reqRoster.getShift();
            Shift originalTargetShift = targetRoster.getShift();

            reqRoster.setShift(originalTargetShift);
            reqRoster.setStatus("SWAPPED");

            targetRoster.setShift(originalReqShift);
            targetRoster.setStatus("SWAPPED");

            rosterAssignmentRepository.save(reqRoster);
            rosterAssignmentRepository.save(targetRoster);

            log.info("Shift swap {} approved by manager {}. Schedules mutated: Emp {} now on {}, Emp {} now on {}",
                    swapId, manager.getEmail(),
                    swap.getRequesterEmployee().getId(), originalTargetShift.getName(),
                    swap.getTargetEmployee().getId(), originalReqShift.getName());
        } else if ("REJECT".equals(action)) {
            swap.setManagerStatus("REJECTED");
            swap.setStatus("REJECTED");
            swap.setReviewedByUser(manager);
            swap.setManagerRemarks(req.getRemarks());
            log.info("Shift swap {} rejected by manager {}", swapId, manager.getEmail());
        } else {
            throw new BadRequestException("Invalid action for manager review: " + req.getAction());
        }

        swap = shiftSwapRequestRepository.save(swap);
        return toSwapDto(swap);
    }

    @Transactional(readOnly = true)
    public List<ShiftSwapDto> getIncomingSwaps(Long employeeId) {
        String tenantId = TenantContext.getTenantId();
        return shiftSwapRequestRepository.findIncomingSwaps(tenantId, employeeId).stream()
                .map(this::toSwapDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftSwapDto> getOutgoingSwaps(Long employeeId) {
        String tenantId = TenantContext.getTenantId();
        return shiftSwapRequestRepository.findOutgoingSwaps(tenantId, employeeId).stream()
                .map(this::toSwapDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftSwapDto> getPendingManagerSwaps() {
        String tenantId = TenantContext.getTenantId();
        return shiftSwapRequestRepository.findPendingManagerApprovals(tenantId).stream()
                .map(this::toSwapDto)
                .collect(Collectors.toList());
    }

    private ShiftDto toShiftDto(Shift s) {
        return ShiftDto.builder()
                .id(s.getId())
                .name(s.getName())
                .shiftCode(s.getShiftCode())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .gracePeriodMins(s.getGracePeriodMins())
                .breakDurationMins(s.getBreakDurationMins())
                .isNightShift(s.getIsNightShift())
                .nightAllowanceRate(s.getNightAllowanceRate())
                .isActive(s.getIsActive())
                .build();
    }

    private RosterAssignmentDto toRosterDto(RosterAssignment ra) {
        Employee emp = ra.getEmployee();
        Shift s = ra.getShift();
        return RosterAssignmentDto.builder()
                .id(ra.getId())
                .employeeId(emp != null ? emp.getId() : null)
                .employeeName(emp != null ? emp.getFullName() : null)
                .employeeNumber(emp != null ? emp.getEmployeeNumber() : null)
                .departmentName(emp != null && emp.getDepartment() != null ? emp.getDepartment().getName() : null)
                .shiftId(s != null ? s.getId() : null)
                .shiftName(s != null ? s.getName() : null)
                .shiftCode(s != null ? s.getShiftCode() : null)
                .startTime(s != null ? s.getStartTime() : null)
                .endTime(s != null ? s.getEndTime() : null)
                .isNightShift(s != null ? s.getIsNightShift() : false)
                .effectiveDate(ra.getEffectiveDate())
                .rotationPattern(ra.getRotationPattern())
                .notes(ra.getNotes())
                .status(ra.getStatus())
                .build();
    }

    private ShiftSwapDto toSwapDto(ShiftSwapRequest s) {
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");
        String reqTime = s.getRequesterRoster() != null && s.getRequesterRoster().getShift() != null
                ? s.getRequesterRoster().getShift().getStartTime().format(timeFmt) + " - " + s.getRequesterRoster().getShift().getEndTime().format(timeFmt)
                : "";
        String targetTime = s.getTargetRoster() != null && s.getTargetRoster().getShift() != null
                ? s.getTargetRoster().getShift().getStartTime().format(timeFmt) + " - " + s.getTargetRoster().getShift().getEndTime().format(timeFmt)
                : "";

        return ShiftSwapDto.builder()
                .id(s.getId())
                .requesterEmployeeId(s.getRequesterEmployee().getId())
                .requesterEmployeeName(s.getRequesterEmployee().getFullName())
                .requesterShiftName(s.getRequesterRoster() != null && s.getRequesterRoster().getShift() != null ? s.getRequesterRoster().getShift().getName() : null)
                .requesterShiftTime(reqTime)
                .targetEmployeeId(s.getTargetEmployee().getId())
                .targetEmployeeName(s.getTargetEmployee().getFullName())
                .targetShiftName(s.getTargetRoster() != null && s.getTargetRoster().getShift() != null ? s.getTargetRoster().getShift().getName() : null)
                .targetShiftTime(targetTime)
                .swapDate(s.getSwapDate())
                .reason(s.getReason())
                .peerStatus(s.getPeerStatus())
                .managerStatus(s.getManagerStatus())
                .status(s.getStatus())
                .managerRemarks(s.getManagerRemarks())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
