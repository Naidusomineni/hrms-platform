package com.hrms.controller.v1;

import com.hrms.dto.request.AttendanceRequest;
import com.hrms.dto.response.*;
import com.hrms.service.impl.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController @RequestMapping("/v1/attendance") @RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth") @Tag(name = "Attendance Management")
public class AttendanceController {
    private final AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> mark(@Valid @RequestBody AttendanceRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Attendance marked", attendanceService.mark(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> update(@PathVariable Long id, @Valid @RequestBody AttendanceRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Attendance updated", attendanceService.update(id, req)));
    }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<ApiResponse<Page<AttendanceResponse>>> getForEmployee(
            @PathVariable Long empId,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="20") int size) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getForEmployee(empId, PageRequest.of(page,size))));
    }

    @GetMapping("/employee/{empId}/monthly")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getMonthly(
            @PathVariable Long empId, @RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getMonthly(empId, year, month)));
    }

    @GetMapping("/date")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getByDate(date)));
    }
}
