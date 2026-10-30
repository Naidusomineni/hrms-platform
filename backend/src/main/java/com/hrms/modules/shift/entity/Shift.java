package com.hrms.modules.shift.entity;

import com.hrms.entity.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "shifts",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"tenant_id", "shift_code"}, name = "uk_shifts_tenant_code")},
    indexes = {@Index(name = "idx_shifts_tenant", columnList = "tenant_id, is_active")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Shift extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "shift_code", nullable = false, length = 50)
    private String shiftCode;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "grace_period_mins", nullable = false)
    @Builder.Default
    private Integer gracePeriodMins = 15;

    @Column(name = "break_duration_mins", nullable = false)
    @Builder.Default
    private Integer breakDurationMins = 60;

    @Column(name = "is_night_shift", nullable = false)
    @Builder.Default
    private Boolean isNightShift = false;

    @Column(name = "night_allowance_rate", precision = 10, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal nightAllowanceRate = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
