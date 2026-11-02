package com.hrms.modules.intelligence.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentFlightRiskSummaryDto {

    private String departmentName;
    private long totalEmployees;
    private long lowRiskCount;
    private long mediumRiskCount;
    private long highRiskCount;
    private long criticalRiskCount;
    private double averageRiskScore;
}
