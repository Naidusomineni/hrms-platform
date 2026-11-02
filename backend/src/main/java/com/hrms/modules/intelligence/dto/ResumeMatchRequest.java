package com.hrms.modules.intelligence.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeMatchRequest {

    @NotNull(message = "Job posting ID is required")
    private Long jobPostingId;

    @NotNull(message = "Candidate ID is required")
    private Long candidateId;
}
