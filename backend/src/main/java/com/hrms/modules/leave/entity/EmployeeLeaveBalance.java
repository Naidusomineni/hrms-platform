package com.hrms.modules.leave.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import com.hrms.enums.LeaveType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "employee_leave_balances",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"tenant_id", "employee_id", "leave_type", "year"}, name = "uk_elb_emp_type_yr")},
    indexes = {@Index(name = "idx_elb_tenant_emp", columnList = "tenant_id,employee_id,year")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EmployeeLeaveBalance extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false, length = 30)
    private LeaveType leaveType;

    @Column(name = "allocated_days", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal allocatedDays = BigDecimal.ZERO;

    @Column(name = "used_days", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal usedDays = BigDecimal.ZERO;

    @Column(name = "pending_days", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal pendingDays = BigDecimal.ZERO;

    @Column(name = "balance_days", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal balanceDays = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private Integer year = 2026;
}
