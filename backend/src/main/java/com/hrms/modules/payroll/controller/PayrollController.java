package com.hrms.modules.payroll.controller;
import com.hrms.modules.payroll.service.PayrollService;

import com.hrms.dto.response.ApiResponse;
import com.hrms.entity.PayrollSlip;

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
            @RequestParam("employeeId") Long employeeId,
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Payroll processed", payrollService.process(employeeId, month, year)));
    }

    @PostMapping("/process-all")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> processAllPayroll(
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Batch payroll processing completed", payrollService.processAll(month, year)));
    }

    @GetMapping("/bank-batch-export")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<byte[]> exportBankBatch(
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        String csv = payrollService.generateBankBatchCsv(month, year);
        byte[] bytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"salary_batch_disbursement_" + month + "_" + year + ".csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(bytes);
    }

    @GetMapping("/bank-batch")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<java.util.List<com.hrms.modules.payroll.dto.BankDisbursementDto>>> getBankBatch(
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        return ResponseEntity.ok(ApiResponse.success(payrollService.getBankBatchDisbursements(month, year)));
    }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<ApiResponse<Page<PayrollSlip>>> getSlips(
            @PathVariable("empId") Long empId,
            @RequestParam(name = "page", defaultValue="0") int page,
            @RequestParam(name = "size", defaultValue="12") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            payrollService.getSlipsForEmployee(empId, PageRequest.of(page, size))));
    }

    @GetMapping("/employee/{empId}/slip")
    public ResponseEntity<ApiResponse<PayrollSlip>> getSlip(
            @PathVariable("empId") Long empId,
            @RequestParam("month") int month, @RequestParam("year") int year) {
        return payrollService.getSlip(empId, month, year)
            .map(s -> ResponseEntity.ok(ApiResponse.success(s)))
            .orElse(ResponseEntity.notFound().build());
    }
}
