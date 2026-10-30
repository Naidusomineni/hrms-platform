package com.hrms.modules.shift.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ShiftDto {

    private Long id;

    @NotBlank(message = "Shift name is required")
    private String name;

    @NotBlank(message = "Shift code is required")
    private String shiftCode;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @Builder.Default
    private Integer gracePeriodMins = 15;

    @Builder.Default
    private Integer breakDurationMins = 60;

    @Builder.Default
    private Boolean isNightShift = false;

    @Builder.Default
    private BigDecimal nightAllowanceRate = BigDecimal.ZERO;

    @Builder.Default
    private Boolean isActive = true;
}
