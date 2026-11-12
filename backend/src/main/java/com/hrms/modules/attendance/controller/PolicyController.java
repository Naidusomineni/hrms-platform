package com.hrms.modules.attendance.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.modules.attendance.dto.AttendancePolicyDto;
import com.hrms.modules.attendance.dto.PolicyAssignmentDto;
import com.hrms.modules.attendance.entity.AttendancePolicy;
import com.hrms.modules.attendance.service.PolicyResolverService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/v1/policies")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Attendance Policies & Assignment Hierarchy")
public class PolicyController {

    private final PolicyResolverService policyResolverService;

    // --- Policy CRUD ---

    @GetMapping("/attendance")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<AttendancePolicyDto>>> getAllAttendancePolicies() {
        return ResponseEntity.ok(ApiResponse.success(policyResolverService.getAllPolicies()));
    }

    @GetMapping("/attendance/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<AttendancePolicyDto>> getPolicyById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(policyResolverService.getPolicyById(id)));
    }

    @PostMapping("/attendance")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<AttendancePolicyDto>> createPolicy(@Valid @RequestBody AttendancePolicyDto dto) {
        AttendancePolicyDto created = policyResolverService.createPolicy(dto);
        return ResponseEntity.ok(ApiResponse.success("Attendance policy created successfully", created));
    }

    @PutMapping("/attendance/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<AttendancePolicyDto>> updatePolicy(
            @PathVariable("id") Long id,
            @Valid @RequestBody AttendancePolicyDto dto) {
        AttendancePolicyDto updated = policyResolverService.updatePolicy(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Attendance policy updated successfully", updated));
    }

    @DeleteMapping("/attendance/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePolicy(@PathVariable("id") Long id) {
        policyResolverService.deletePolicy(id);
        return ResponseEntity.ok(ApiResponse.success("Attendance policy archived successfully", null));
    }

    // --- Effective Resolution Endpoint ---

    @GetMapping("/attendance/effective/{employeeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE')")
    public ResponseEntity<ApiResponse<AttendancePolicyDto>> getEffectivePolicy(
            @PathVariable("employeeId") Long employeeId,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        AttendancePolicy policy = policyResolverService.resolveAttendancePolicy(employeeId, targetDate);
        return ResponseEntity.ok(ApiResponse.success(policyResolverService.getPolicyById(policy.getId())));
    }

    // --- Assignments ---

    @GetMapping("/assignments")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<List<PolicyAssignmentDto>>> getAssignments(
            @RequestParam(value = "policyType", defaultValue = "ATTENDANCE") String policyType) {
        return ResponseEntity.ok(ApiResponse.success(policyResolverService.getAssignments(policyType)));
    }

    @PostMapping("/assignments")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<PolicyAssignmentDto>> assignPolicy(@Valid @RequestBody PolicyAssignmentDto dto) {
        PolicyAssignmentDto assigned = policyResolverService.assignPolicy(dto);
        return ResponseEntity.ok(ApiResponse.success("Policy assigned successfully", assigned));
    }

    @DeleteMapping("/assignments/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable("id") Long id) {
        policyResolverService.deleteAssignment(id);
        return ResponseEntity.ok(ApiResponse.success("Assignment removed successfully", null));
    }
}

