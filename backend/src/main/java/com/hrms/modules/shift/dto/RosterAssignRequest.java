package com.hrms.modules.shift.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RosterAssignRequest {

    @NotEmpty(message = "At least one employee must be selected")
    private List<Long> employeeIds;

    @NotNull(message = "Shift ID is required")
    private Long shiftId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @Builder.Default
    private String rotationPattern = "STANDARD";

    private String notes;
}
