package com.hrms.modules.recruitment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateInterviewRequest {

    @NotNull(message = "Candidate ID is required")
    private Long candidateId;

    private Long jobPostingId;

    @NotNull(message = "Interviewer ID is required")
    private Long interviewerId;

    @NotBlank(message = "Round name is required")
    private String roundName;

    @NotNull(message = "Scheduled start time is required")
    private LocalDateTime scheduledStart;

    @NotNull(message = "Scheduled end time is required")
    private LocalDateTime scheduledEnd;

    private String notes;

    private java.util.List<Long> panelistIds;
    private java.util.List<PanelistAssignmentRequest> panelists;
}
