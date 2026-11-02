package com.hrms.modules.intelligence.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightRiskAnalysisDto {

    private Long id;
    private Long employeeId;
    private String employeeNumber;
    private String employeeName;
    private String department;
    private String designation;
    private Integer riskScore; // 0 - 100
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private String primaryDriver;
    private String driverBreakdown;
    private String retentionRecommendation;
    private LocalDateTime evaluatedAt;
}
