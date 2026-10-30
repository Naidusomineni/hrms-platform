package com.hrms.modules.leave.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.leave.dto.LeaveBalanceDto;
import com.hrms.modules.leave.dto.LeavePolicyDto;
import com.hrms.modules.leave.service.LeaveAccrualScheduler;
import com.hrms.modules.leave.service.LeavePolicyService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/leaves")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Leave Policies & Balances")
public class LeavePolicyController {

    private final LeavePolicyService policyService;
    private final LeaveAccrualScheduler accrualScheduler;

    @GetMapping("/policies")
    public ResponseEntity<ApiResponse<List<LeavePolicyDto>>> getPolicies() {
        return ResponseEntity.ok(ApiResponse.success(policyService.getPolicies()));
    }

    @PostMapping("/policies")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<LeavePolicyDto>> savePolicy(@Valid @RequestBody LeavePolicyDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Leave policy saved", policyService.savePolicy(dto)));
    }

    @GetMapping("/balances/employee/{empId}")
    public ResponseEntity<ApiResponse<List<LeaveBalanceDto>>> getEmployeeBalances(@PathVariable("empId") Long empId) {
        return ResponseEntity.ok(ApiResponse.success(policyService.getEmployeeBalances(empId)));
    }

    @PostMapping("/accrual/run")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<String>> triggerAccrual() {
        String tenantId = TenantContext.getTenantId();
        int updated = accrualScheduler.triggerMonthlyAccrualManual(tenantId);
        return ResponseEntity.ok(ApiResponse.success("Monthly leave accrual completed for tenant. Records updated: " + updated));
    }
}
