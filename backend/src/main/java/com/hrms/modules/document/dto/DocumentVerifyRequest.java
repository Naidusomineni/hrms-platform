package com.hrms.modules.document.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DocumentVerifyRequest {
    @NotBlank(message = "Status is required (VERIFIED, REJECTED)")
    private String status; // VERIFIED, REJECTED

    private String remarks;
}
