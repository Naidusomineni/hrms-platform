package com.hrms.modules.attendance.entity;

import com.hrms.entity.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance_policies",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"tenant_id", "policy_code"}, name = "uk_att_policy_tenant_code")},
    indexes = {@Index(name = "idx_att_policy_tenant", columnList = "tenant_id, is_active")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AttendancePolicy extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "policy_name", nullable = false, length = 150)
    private String policyName;

    @Column(name = "policy_code", nullable = false, length = 50)
    private String policyCode;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    @Column(name = "effective_from", nullable = false)
    @Builder.Default
    private LocalDate effectiveFrom = LocalDate.now();

    @Column(name = "shift_start_time")
    @Builder.Default
    private LocalTime shiftStartTime = LocalTime.of(9, 0);

    @Column(name = "shift_end_time")
    @Builder.Default
    private LocalTime shiftEndTime = LocalTime.of(18, 0);

    @Column(name = "allowed_punch_methods", nullable = false, length = 255)
    @Builder.Default
    private String allowedPunchMethods = "BIOMETRIC,WEB,GEOFENCE"; // Comma-separated: BIOMETRIC, WEB, GEOFENCE, IP, QR

    @Column(name = "grace_period_minutes", nullable = false)
    @Builder.Default
    private Integer gracePeriodMinutes = 15;

    @Column(name = "max_late_allowed_per_month", nullable = false)
    @Builder.Default
    private Integer maxLateAllowedPerMonth = 3;

    @Column(name = "late_penalty_action", nullable = false, length = 32)
    @Builder.Default
    private String latePenaltyAction = "FLAG_ONLY"; // FLAG_ONLY, DEDUCT_HALF_DAY, DEDUCT_LEAVE, LOSS_OF_PAY

    @Column(name = "full_day_hours", precision = 4, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal fullDayHours = new BigDecimal("8.00");

    @Column(name = "half_day_hours", precision = 4, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal halfDayHours = new BigDecimal("4.00");

    @Column(name = "absent_threshold_hours", precision = 4, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal absentThresholdHours = new BigDecimal("3.00");

    @Column(name = "early_departure_minutes", nullable = false)
    @Builder.Default
    private Integer earlyDepartureMinutes = 30;

    @Column(name = "early_departure_penalty", length = 32)
    @Builder.Default
    private String earlyDeparturePenalty = "FLAG_ONLY";

    @Column(name = "overtime_enabled", nullable = false)
    @Builder.Default
    private Boolean overtimeEnabled = true;

    @Column(name = "min_overtime_threshold_minutes", nullable = false)
    @Builder.Default
    private Integer minOvertimeThresholdMinutes = 60;

    @Column(name = "overtime_requires_approval", nullable = false)
    @Builder.Default
    private Boolean overtimeRequiresApproval = true;

    @Column(name = "auto_deduct_break", nullable = false)
    @Builder.Default
    private Boolean autoDeductBreak = false;

    @Column(name = "break_deduction_minutes", nullable = false)
    @Builder.Default
    private Integer breakDeductionMinutes = 45;

    @Column(name = "max_regularizations_per_month", nullable = false)
    @Builder.Default
    private Integer maxRegularizationsPerMonth = 3;

    @Column(name = "regularization_filing_window_days", nullable = false)
    @Builder.Default
    private Integer regularizationFilingWindowDays = 5;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}

