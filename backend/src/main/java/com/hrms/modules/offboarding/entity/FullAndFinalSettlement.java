package com.hrms.modules.offboarding.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "full_and_final_settlements",
    indexes = {
        @Index(name = "idx_fnf_settlements_tenant_emp", columnList = "tenant_id, employee_id")
    }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class FullAndFinalSettlement extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "separation_id", nullable = false, unique = true)
    private EmployeeSeparation separation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "settlement_date", nullable = false)
    private LocalDate settlementDate;

    @Column(name = "last_drawn_basic", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal lastDrawnBasic = BigDecimal.ZERO;

    @Column(name = "tenure_years", precision = 4, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal tenureYears = BigDecimal.ZERO;

    @Column(name = "earned_leave_balance")
    @Builder.Default
    private Integer earnedLeaveBalance = 0;

    @Column(name = "leave_encashment_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal leaveEncashmentAmount = BigDecimal.ZERO;

    @Column(name = "gratuity_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal gratuityAmount = BigDecimal.ZERO;

    @Column(name = "bonus_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal bonusAmount = BigDecimal.ZERO;

    @Column(name = "prorated_salary_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal proratedSalaryAmount = BigDecimal.ZERO;

    @Column(name = "notice_pay_recovery", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal noticePayRecovery = BigDecimal.ZERO;

    @Column(name = "asset_recovery_deduction", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal assetRecoveryDuction = BigDecimal.ZERO;

    @Column(name = "statutory_deductions", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal statutoryDeductions = BigDecimal.ZERO;

    @Column(name = "net_payable_amount", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal netPayableAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "DRAFT"; // DRAFT, APPROVED, DISBURSED

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "disbursed_at")
    private LocalDateTime disbursedAt;

    @Column(name = "transaction_reference", length = 100)
    private String transactionReference;
}
