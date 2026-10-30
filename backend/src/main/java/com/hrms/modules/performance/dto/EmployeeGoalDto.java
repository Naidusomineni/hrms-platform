package com.hrms.modules.performance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EmployeeGoalDto {
    private Long id;
    private Long cycleId;
    private String cycleName;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    private String employeeName;

    @NotBlank(message = "Goal title is required")
    private String title;

    private String description;
    private String metricTarget;
    private String metricCurrent;
    private Integer weightage;
    private Integer progress;
    private String status;
}
