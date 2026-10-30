package com.hrms.modules.request.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EmployeeRequestCreateDto {
    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotBlank(message = "Request type is required (WORK_FROM_HOME, SHIFT_CHANGE, EXPENSE_CLAIM, TRAVEL_REQUEST, BONAFIDE_LETTER)")
    private String requestType;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal amount;
    private String attachmentUrl;
}
