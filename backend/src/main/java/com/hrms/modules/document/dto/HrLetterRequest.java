package com.hrms.modules.document.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class HrLetterRequest {
    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotBlank(message = "Letter type is required (BONAFIDE, EMPLOYMENT_VERIFICATION, EXPERIENCE, RELIEVING)")
    private String letterType;

    private String purpose;
    private String addressedTo;
}
