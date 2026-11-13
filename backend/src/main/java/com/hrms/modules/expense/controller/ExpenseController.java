package com.hrms.modules.expense.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.modules.expense.dto.CreateExpenseClaimRequest;
import com.hrms.modules.expense.dto.ExpenseClaimDto;
import com.hrms.modules.expense.dto.ExpenseReviewRequest;
import com.hrms.modules.expense.enums.ExpenseStatus;
import com.hrms.modules.expense.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/expenses")
@RequiredArgsConstructor
@Tag(name = "Expense & Reimbursements", description = "Corporate expense claims, approval state machine & payroll integration")
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping("/claims")
    @Operation(summary = "Submit a new corporate expense claim with receipt")
    public ResponseEntity<ApiResponse<ExpenseClaimDto>> submitClaim(
            @RequestParam Long employeeId,
            @Valid @RequestBody CreateExpenseClaimRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ExpenseClaimDto claim = expenseService.submitClaim(employeeId, request, userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense claim submitted successfully", claim));
    }

    @GetMapping("/claims/my")
    @Operation(summary = "Retrieve current employee's submitted expense claims")
    public ResponseEntity<ApiResponse<Page<ExpenseClaimDto>>> getMyClaims(
            @RequestParam Long employeeId,
            @PageableDefault(size = 10, sort = "expenseDate", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        Page<ExpenseClaimDto> claims = expenseService.getMyClaims(employeeId, pageable, userDetails);
        return ResponseEntity.ok(ApiResponse.success(claims));
    }

    @GetMapping("/claims")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "List all expense claims with optional status filtering")
    public ResponseEntity<ApiResponse<Page<ExpenseClaimDto>>> getAllClaims(
            @RequestParam(required = false) ExpenseStatus status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ExpenseClaimDto> claims = (status != null)
                ? expenseService.getClaimsByStatus(status, pageable)
                : expenseService.getAllClaims(pageable);
        return ResponseEntity.ok(ApiResponse.success(claims));
    }

    @GetMapping("/claims/{id}")
    @Operation(summary = "Get single expense claim details")
    public ResponseEntity<ApiResponse<ExpenseClaimDto>> getClaimById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        ExpenseClaimDto claim = expenseService.getClaimById(id, userDetails);
        return ResponseEntity.ok(ApiResponse.success(claim));
    }

    @PutMapping("/claims/{id}/manager-review")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Manager sign-off on expense claim (APPROVE or REJECT)")
    public ResponseEntity<ApiResponse<ExpenseClaimDto>> managerReview(
            @PathVariable Long id,
            @RequestParam(required = false) Long managerEmployeeId,
            @Valid @RequestBody ExpenseReviewRequest request) {
        ExpenseClaimDto claim = expenseService.managerReview(id, managerEmployeeId, request);
        return ResponseEntity.ok(ApiResponse.success("Manager review recorded", claim));
    }

    @PutMapping("/claims/{id}/finance-review")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'HR')")
    @Operation(summary = "Finance department review on expense claim (APPROVE or REJECT)")
    public ResponseEntity<ApiResponse<ExpenseClaimDto>> financeReview(
            @PathVariable Long id,
            @RequestParam(required = false) Long financeEmployeeId,
            @Valid @RequestBody ExpenseReviewRequest request) {
        ExpenseClaimDto claim = expenseService.financeReview(id, financeEmployeeId, request);
        return ResponseEntity.ok(ApiResponse.success("Finance review completed", claim));
    }
}
