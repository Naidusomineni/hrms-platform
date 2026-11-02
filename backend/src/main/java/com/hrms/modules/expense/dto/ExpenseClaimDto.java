package com.hrms.modules.expense.dto;

import com.hrms.modules.expense.enums.ExpenseCategory;
import com.hrms.modules.expense.enums.ExpenseStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseClaimDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private String departmentName;
    private String claimNumber;
    private ExpenseCategory category;
    private String title;
    private String description;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private ExpenseStatus status;
    private String receiptUrl;
    private String receiptFilename;
    private Long managerId;
    private String managerName;
    private String managerRemarks;
    private LocalDateTime managerReviewedAt;
    private Long financeReviewerId;
    private String financeReviewerName;
    private String financeRemarks;
    private LocalDateTime financeReviewedAt;
    private Long payrollSlipId;
    private LocalDateTime disbursedAt;
    private LocalDateTime createdAt;
}
