package com.hrms.modules.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ApprovalActionRequest {
    @NotBlank(message = "Decision is required (APPROVED, REJECTED, REQUEST_CHANGE)")
    private String decision; // APPROVED, REJECTED, REQUEST_CHANGE

    private String comments;
}
