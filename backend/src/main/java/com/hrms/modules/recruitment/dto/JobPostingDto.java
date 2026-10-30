package com.hrms.modules.recruitment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class JobPostingDto {
    private Long id;

    @NotBlank(message = "Job title is required")
    private String title;

    private Long departmentId;
    private String departmentName;

    private String description;
    private String requirements;
    private Integer experienceMin;
    private Integer experienceMax;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String location;
    private String status;
    private Integer openings;
    private LocalDate closesAt;
    private Integer candidateCount;
}
