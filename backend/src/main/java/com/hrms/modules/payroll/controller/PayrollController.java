package com.hrms.modules.payroll.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.entity.PayrollSlip;
import com.hrms.enums.PayrollStatus;
import com.hrms.modules.payroll.dto.BankDisbursementDto;
import com.hrms.modules.payroll.dto.PayrollAdjustmentRequest;
import com.hrms.modules.payroll.service.PayrollService;
import com.hrms.util.PaginationUtils;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/payroll")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Payroll & Enterprise Compensation")
public class PayrollController {

    private final PayrollService payrollService;

    @PostMapping("/process")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<PayrollSlip>> processPayroll(
            @RequestParam("employeeId") Long employeeId,
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Draft payroll calculated", payrollService.process(employeeId, month, year)));
    }

    @PostMapping("/process-all")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processAllPayroll(
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Batch draft payroll calculated", payrollService.processAll(month, year)));
    }

    @GetMapping("/register")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Page<PayrollSlip>>> getPayrollRegister(
            @RequestParam("month") int month,
            @RequestParam("year") int year,
            @RequestParam(value = "status", required = false) PayrollStatus status,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Pageable pr = PaginationUtils.of(page, size, Sort.by("id").ascending());
        return ResponseEntity.ok(ApiResponse.success(
            payrollService.getPayrollRegister(month, year, status, search, pr)));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPayrollSummary(
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        return ResponseEntity.ok(ApiResponse.success(payrollService.getSummary(month, year)));
    }

    @PutMapping("/{id}/adjust")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<PayrollSlip>> adjustPayroll(
            @PathVariable("id") Long id,
            @RequestBody PayrollAdjustmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String hrEmail = userDetails != null ? userDetails.getUsername() : "hr@hrms.com";
        return ResponseEntity.ok(ApiResponse.success(
            "Payroll adjustments applied successfully",
            payrollService.adjust(id, request, hrEmail)));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<PayrollSlip>> approvePayroll(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String approverEmail = userDetails != null ? userDetails.getUsername() : "hr@hrms.com";
        return ResponseEntity.ok(ApiResponse.success(
            "Payroll finalized and employee notified",
            payrollService.approve(id, approverEmail)));
    }

    @PostMapping("/approve-all")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> approveAllPayroll(
            @RequestParam("month") int month,
            @RequestParam("year") int year,
            @AuthenticationPrincipal UserDetails userDetails) {
        String approverEmail = userDetails != null ? userDetails.getUsername() : "hr@hrms.com";
        return ResponseEntity.ok(ApiResponse.success(
            "Monthly payroll batch approved and locked",
            payrollService.approveAll(month, year, approverEmail)));
    }

    @PostMapping("/mark-paid")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markBatchPaid(
            @RequestParam("month") int month,
            @RequestParam("year") int year,
            @RequestParam(value = "paymentRef", required = false) String paymentRef) {
        return ResponseEntity.ok(ApiResponse.success(
            "Payroll marked as disbursed",
            payrollService.markBatchPaid(month, year, paymentRef)));
    }

    @GetMapping("/bank-batch-export")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<byte[]> exportBankBatch(
            @RequestParam("month") int month,
            @RequestParam("year") int year,
            @RequestParam(name = "masked", required = false, defaultValue = "false") boolean masked) {
        String csv = payrollService.generateBankBatchCsv(month, year, masked);
        byte[] bytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        String filename = "salary_batch_disbursement_" + month + "_" + year + (masked ? "_masked" : "") + ".csv";
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(bytes);
    }

    @GetMapping("/bank-batch")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<List<BankDisbursementDto>>> getBankBatch(
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        return ResponseEntity.ok(ApiResponse.success(payrollService.getBankBatchDisbursements(month, year)));
    }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<ApiResponse<Page<PayrollSlip>>> getSlips(
            @PathVariable("empId") Long empId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "12") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean isHrOrAdmin = userDetails != null && userDetails.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_HR") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        return ResponseEntity.ok(ApiResponse.success(
            payrollService.getSlipsForEmployee(empId, PaginationUtils.of(page, size), isHrOrAdmin)));
    }

    @GetMapping("/employee/{empId}/slip")
    public ResponseEntity<ApiResponse<PayrollSlip>> getSlip(
            @PathVariable("empId") Long empId,
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        return payrollService.getSlip(empId, month, year)
            .map(s -> ResponseEntity.ok(ApiResponse.success(s)))
            .orElse(ResponseEntity.notFound().build());
    }
}
