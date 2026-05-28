package com.hrms.entity;

import com.hrms.enums.PayrollStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_slips",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"employee_id","payroll_month","payroll_year"}, name = "uk_payroll")},
    indexes = {@Index(name = "idx_payroll_emp", columnList = "employee_id"),
               @Index(name = "idx_payroll_period", columnList = "payroll_year,payroll_month")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PayrollSlip extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payroll_month", nullable = false)
    private Integer month;

    @Column(name = "payroll_year", nullable = false)
    private Integer year;

    @Column(name = "basic_salary", precision = 12, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "hra", precision = 12, scale = 2)
    private BigDecimal hra;

    @Column(name = "special_allowance", precision = 12, scale = 2)
    private BigDecimal specialAllowance;

    @Column(name = "other_allowances", precision = 12, scale = 2)
    private BigDecimal otherAllowances;

    @Column(name = "gross_salary", precision = 12, scale = 2)
    private BigDecimal grossSalary;

    @Column(name = "pf_deduction", precision = 12, scale = 2)
    private BigDecimal pfDeduction;

    @Column(name = "professional_tax", precision = 12, scale = 2)
    private BigDecimal professionalTax;

    @Column(name = "income_tax", precision = 12, scale = 2)
    private BigDecimal incomeTax;

    @Column(name = "other_deductions", precision = 12, scale = 2)
    private BigDecimal otherDeductions;

    @Column(name = "total_deductions", precision = 12, scale = 2)
    private BigDecimal totalDeductions;

    @Column(name = "net_salary", precision = 12, scale = 2)
    private BigDecimal netSalary;

    @Column(name = "working_days")
    private Integer workingDays;

    @Column(name = "present_days")
    private Integer presentDays;

    @Column(name = "leave_days")
    private Integer leaveDays;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private PayrollStatus status = PayrollStatus.DRAFT;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "slip_url", length = 500)
    private String slipUrl;

    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
}
