package com.hrms.modules.attendance.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AttendancePolicyDto {
    private Long id;
    private String policyName;
    private String policyCode;
    private String description;
    private Boolean isDefault;
    private LocalDate effectiveFrom;
    private LocalTime shiftStartTime;
    private LocalTime shiftEndTime;
    private String allowedPunchMethods; // BIOMETRIC,WEB,GEOFENCE
    private Integer gracePeriodMinutes;
    private Integer maxLateAllowedPerMonth;
    private String latePenaltyAction; // FLAG_ONLY, DEDUCT_HALF_DAY, DEDUCT_LEAVE, LOSS_OF_PAY
    private BigDecimal fullDayHours;
    private BigDecimal halfDayHours;
    private BigDecimal absentThresholdHours;
    private Integer earlyDepartureMinutes;
    private String earlyDeparturePenalty;
    private Boolean overtimeEnabled;
    private Integer minOvertimeThresholdMinutes;
    private Boolean overtimeRequiresApproval;
    private Boolean autoDeductBreak;
    private Integer breakDeductionMinutes;
    private Integer maxRegularizationsPerMonth;
    private Integer regularizationFilingWindowDays;
    private Boolean isActive;
}

