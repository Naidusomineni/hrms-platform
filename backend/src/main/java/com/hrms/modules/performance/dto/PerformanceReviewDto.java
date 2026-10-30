package com.hrms.modules.performance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PerformanceReviewDto {
    private Long id;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    private String employeeName;

    private Long reviewerId;
    private String reviewerName;

    private String reviewCycle;
    private LocalDate reviewPeriodStart;
    private LocalDate reviewPeriodEnd;

    private Integer selfRating;
    private Integer managerRating;
    private Double finalRating;

    private String selfComments;
    private String managerComments;
    private String strengths;
    private String areasOfImprovement;
    private String goalsNextCycle;
    private String status;
}
