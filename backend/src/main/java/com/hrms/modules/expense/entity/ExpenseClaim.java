package com.hrms.modules.expense.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import com.hrms.entity.PayrollSlip;
import com.hrms.modules.expense.enums.ExpenseCategory;
import com.hrms.modules.expense.enums.ExpenseStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expense_claims", indexes = {
    @Index(name = "idx_exp_tenant_emp", columnList = "tenant_id, employee_id"),
    @Index(name = "idx_exp_tenant_status", columnList = "tenant_id, status"),
    @Index(name = "idx_exp_date", columnList = "expense_date")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseClaim extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "claim_number", nullable = false, length = 32)
    private String claimNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ExpenseCategory category;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private ExpenseStatus status = ExpenseStatus.SUBMITTED;

    @Column(name = "receipt_url", length = 512)
    private String receiptUrl;

    @Column(name = "receipt_filename", length = 255)
    private String receiptFilename;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @Column(name = "manager_remarks", columnDefinition = "TEXT")
    private String managerRemarks;

    @Column(name = "manager_reviewed_at")
    private LocalDateTime managerReviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finance_reviewer_id")
    private Employee financeReviewer;

    @Column(name = "finance_remarks", columnDefinition = "TEXT")
    private String financeRemarks;

    @Column(name = "finance_reviewed_at")
    private LocalDateTime financeReviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_slip_id")
    private PayrollSlip payrollSlip;

    @Column(name = "disbursed_at")
    private LocalDateTime disbursedAt;
}
