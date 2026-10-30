package com.hrms.modules.shift.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ShiftSwapCreateRequest {

    @NotNull(message = "Requester employee ID is required")
    private Long requesterEmployeeId;

    @NotNull(message = "Target peer employee ID is required")
    private Long targetEmployeeId;

    @NotNull(message = "Swap date is required")
    private LocalDate swapDate;

    @NotBlank(message = "Reason for swap is required")
    private String reason;
}
