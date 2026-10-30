package com.hrms.modules.helpdesk.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TicketCommentRequest {

    @NotBlank(message = "Comment text is required")
    private String commentText;

    @Builder.Default
    private Boolean isInternal = false;
}
