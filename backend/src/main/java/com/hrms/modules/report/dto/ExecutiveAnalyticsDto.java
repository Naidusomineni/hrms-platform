package com.hrms.modules.report.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ExecutiveAnalyticsDto {
    private long totalEmployees;
    private long activeJobPostings;
    private long totalCandidates;
    private long totalAssets;
    private long allocatedAssets;
    private long activeAppraisalCycles;
    private BigDecimal monthlyPayrollExpense;
    private Map<String, Long> departmentDistribution;
    private Map<String, Long> employmentTypeDistribution;
    private Map<String, Long> candidateStageDistribution;
    private Map<String, Long> assetCategoryDistribution;
}
