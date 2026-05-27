package com.hrms.controller.v1;

import com.hrms.dto.response.ApiResponse;
import com.hrms.entity.PayrollSlip;
import com.hrms.service.impl.PayrollService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/v1/payroll") @RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth") @Tag(name = "Payroll")
public class PayrollController {
    private final PayrollService payrollService;

    @PostMapping("/process")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<PayrollSlip>> processPayroll(
            @RequestParam Long employeeId,
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Payroll processed", payrollService.process(employeeId, month, year)));
    }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<ApiResponse<Page<PayrollSlip>>> getSlips(
            @PathVariable Long empId,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="12") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            payrollService.getSlipsForEmployee(empId, PageRequest.of(page, size))));
    }

    @GetMapping("/employee/{empId}/slip")
    public ResponseEntity<ApiResponse<PayrollSlip>> getSlip(
            @PathVariable Long empId,
            @RequestParam int month, @RequestParam int year) {
        return payrollService.getSlip(empId, month, year)
            .map(s -> ResponseEntity.ok(ApiResponse.success(s)))
            .orElse(ResponseEntity.notFound().build());
    }
}
