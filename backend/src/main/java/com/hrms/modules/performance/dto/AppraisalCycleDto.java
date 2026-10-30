package com.hrms.modules.performance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AppraisalCycleDto {
    private Long id;

    @NotBlank(message = "Cycle name is required")
    private String name;

    @NotNull(message = "Year is required")
    private Integer year;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private String status;
}
