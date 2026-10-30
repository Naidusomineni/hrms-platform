package com.hrms.modules.attendance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AttendancePunchRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Time is required")
    private LocalTime time;

    @NotNull(message = "Punch type is required (CHECK_IN or CHECK_OUT)")
    private String punchType; // CHECK_IN, CHECK_OUT

    private BigDecimal latitude;
    private BigDecimal longitude;
    private String ipAddress;
    private Long officeLocationId;
    private String selfieUrl;
    private String remarks;
    private String lateArrivalReason;
    private String punchSource; // WEB_MANUAL, AUTO_LOGIN, BIOMETRIC_DEVICE, GEOFENCE_GPS
    private String deviceId;
    private String workMode; // OFFICE, REMOTE_WFH
}
