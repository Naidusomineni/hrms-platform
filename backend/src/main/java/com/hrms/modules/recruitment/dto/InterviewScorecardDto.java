package com.hrms.modules.recruitment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class InterviewScorecardDto {
    private Long id;

    @NotNull(message = "Candidate ID is required")
    private Long candidateId;

    private Long interviewerId;
    private String interviewerName;

    @NotBlank(message = "Round name is required")
    private String roundName;

    private Integer technicalRating;
    private Integer communicationRating;
    private Integer cultureFitRating;
    private String recommendation;
    private String feedback;
    private LocalDateTime createdAt;
}
