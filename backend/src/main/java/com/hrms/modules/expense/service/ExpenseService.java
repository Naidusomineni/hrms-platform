package com.hrms.modules.expense.service;

import com.hrms.entity.PayrollSlip;
import com.hrms.modules.expense.dto.CreateExpenseClaimRequest;
import com.hrms.modules.expense.dto.ExpenseClaimDto;
import com.hrms.modules.expense.dto.ExpenseReviewRequest;
import com.hrms.modules.expense.enums.ExpenseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface ExpenseService {

    ExpenseClaimDto submitClaim(Long employeeId, CreateExpenseClaimRequest request);

    ExpenseClaimDto managerReview(Long claimId, Long managerEmployeeId, ExpenseReviewRequest request);

    ExpenseClaimDto financeReview(Long claimId, Long financeUserId, ExpenseReviewRequest request);

    Page<ExpenseClaimDto> getMyClaims(Long employeeId, Pageable pageable);

    Page<ExpenseClaimDto> getClaimsByStatus(ExpenseStatus status, Pageable pageable);

    Page<ExpenseClaimDto> getAllClaims(Pageable pageable);

    ExpenseClaimDto getClaimById(Long claimId);

    default ExpenseClaimDto submitClaim(Long employeeId, CreateExpenseClaimRequest request, org.springframework.security.core.userdetails.UserDetails userDetails) {
        return submitClaim(employeeId, request);
    }

    default Page<ExpenseClaimDto> getMyClaims(Long employeeId, Pageable pageable, org.springframework.security.core.userdetails.UserDetails userDetails) {
        return getMyClaims(employeeId, pageable);
    }

    default ExpenseClaimDto getClaimById(Long claimId, org.springframework.security.core.userdetails.UserDetails userDetails) {
        return getClaimById(claimId);
    }

    BigDecimal disburseClaimsForPayroll(Long employeeId, PayrollSlip slip);
}
