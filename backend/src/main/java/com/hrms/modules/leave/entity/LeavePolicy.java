package com.hrms.modules.leave.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.enums.LeaveType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "leave_policies",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"tenant_id", "leave_type"}, name = "uk_lp_tenant_type")},
    indexes = {@Index(name = "idx_lp_tenant", columnList = "tenant_id")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class LeavePolicy extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", nullable = false, length = 30)
    private LeaveType leaveType;

    @Column(name = "annual_allowance", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal annualAllowance = BigDecimal.valueOf(12.0);

    @Column(name = "monthly_accrual_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal monthlyAccrualRate = BigDecimal.valueOf(1.0);

    @Column(name = "max_carry_over", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal maxCarryOver = BigDecimal.valueOf(5.0);

    @Column(name = "allows_half_day", nullable = false)
    @Builder.Default
    private Boolean allowsHalfDay = true;

    @Column(name = "requires_attachment", nullable = false)
    @Builder.Default
    private Boolean requiresAttachment = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
