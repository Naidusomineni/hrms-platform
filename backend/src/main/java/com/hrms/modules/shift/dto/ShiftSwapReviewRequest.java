package com.hrms.modules.shift.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ShiftSwapReviewRequest {

    @NotBlank(message = "Action is required (ACCEPT, DECLINE, APPROVE, REJECT)")
    private String action;

    private String remarks;
}
