package com.hrms.modules.attendance.controller;

import com.hrms.dto.request.AttendanceRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.AttendanceResponse;
import com.hrms.modules.attendance.dto.AttendancePunchRequest;
import com.hrms.modules.attendance.dto.BiometricDeviceDto;
import com.hrms.modules.attendance.dto.BiometricPunchDto;
import com.hrms.modules.attendance.dto.OfficeLocationDto;
import com.hrms.modules.attendance.dto.RegularizationRequestDto;
import com.hrms.modules.attendance.service.AttendanceService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/attendance")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Attendance Management & Geofenced Punch")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/punch")
    public ResponseEntity<ApiResponse<AttendanceResponse>> punch(@Valid @RequestBody AttendancePunchRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Attendance punch recorded", attendanceService.punch(req)));
    }

    @PostMapping("/auto-login-punch")
    public ResponseEntity<ApiResponse<AttendanceResponse>> autoLoginPunch(
            @RequestParam("employeeId") Long employeeId,
            @RequestParam(name = "workMode", defaultValue = "OFFICE") String workMode,
            HttpServletRequest request) {
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = request.getRemoteAddr();
        }
        AttendanceResponse resp = attendanceService.recordLoginPunch(employeeId, clientIp, workMode);
        return ResponseEntity.ok(ApiResponse.success("Auto login attendance verified", resp));
    }

    @PostMapping("/break-toggle")
    public ResponseEntity<ApiResponse<AttendanceResponse>> toggleBreak(@RequestParam("employeeId") Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success("Break status updated", attendanceService.toggleBreak(employeeId)));
    }

    @GetMapping("/today-status")
    public ResponseEntity<ApiResponse<AttendanceResponse>> getTodayStatus(@RequestParam("employeeId") Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getTodayStatus(employeeId)));
    }

    @PostMapping("/biometric-sync")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncBiometric(@Valid @RequestBody List<BiometricPunchDto> punches) {
        return ResponseEntity.ok(ApiResponse.success("Biometric sync completed", attendanceService.syncBiometricPunches(punches)));
    }

    @PostMapping("/biometric/simulate-punch")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> simulateBiometricPunch(@Valid @RequestBody BiometricPunchDto punch) {
        if (punch.getTimestamp() == null) {
            punch.setTimestamp(java.time.LocalDateTime.now());
        }
        Map<String, Object> result = attendanceService.syncBiometricPunches(List.of(punch));
        return ResponseEntity.ok(ApiResponse.success("Biometric punch simulated successfully", result));
    }

    @PostMapping(value = "/biometric-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadBiometricCsv(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Biometric CSV parsed and synced", attendanceService.uploadBiometricCsv(file)));
    }

    @GetMapping("/biometric-devices")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<List<BiometricDeviceDto>>> getBiometricDevices() {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getBiometricDevices()));
    }

    @PostMapping("/biometric-devices")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<BiometricDeviceDto>> saveBiometricDevice(@Valid @RequestBody BiometricDeviceDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Biometric device saved", attendanceService.saveBiometricDevice(dto)));
    }

    @PostMapping("/regularize")
    public ResponseEntity<ApiResponse<RegularizationRequestDto>> regularize(@Valid @RequestBody RegularizationRequestDto req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Regularization request submitted", attendanceService.submitRegularization(req)));
    }

    @PutMapping("/regularize/{id}/review")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<RegularizationRequestDto>> reviewRegularization(
            @PathVariable("id") Long id,
            @RequestParam("action") String action,
            @RequestParam(name = "comments", required = false, defaultValue = "") String comments) {
        String reviewerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ApiResponse.success("Regularization reviewed",
                attendanceService.reviewRegularization(id, action, comments, reviewerEmail)));
    }

    @GetMapping("/office-locations")
    public ResponseEntity<ApiResponse<List<OfficeLocationDto>>> getOfficeLocations() {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getOfficeLocations()));
    }

    @PostMapping("/office-locations")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<OfficeLocationDto>> saveOfficeLocation(@Valid @RequestBody OfficeLocationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Office location saved", attendanceService.saveOfficeLocation(dto)));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> mark(@Valid @RequestBody AttendanceRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attendance marked", attendanceService.mark(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody AttendanceRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Attendance updated", attendanceService.update(id, req)));
    }

    @GetMapping("/employee/{id}")
    public ResponseEntity<ApiResponse<Page<AttendanceResponse>>> getForEmployee(
            @PathVariable("id") Long id,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "31") int size) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getForEmployee(id, PageRequest.of(page, size))));
    }

    @GetMapping("/employee/{id}/monthly")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getMonthly(
            @PathVariable("id") Long id,
            @RequestParam("year") int year,
            @RequestParam("month") int month) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getMonthly(id, year, month)));
    }

    @GetMapping("/date")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getByDate(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getByDate(date)));
    }
}
