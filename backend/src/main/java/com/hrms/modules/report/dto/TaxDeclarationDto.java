package com.hrms.modules.report.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TaxDeclarationDto {
    private Long id;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    private String employeeName;

    @NotBlank(message = "Financial year is required")
    private String financialYear;

    private String regime; // OLD, NEW
    private BigDecimal declared80c;
    private BigDecimal declared80d;
    private BigDecimal declaredHra;
    private String status;
}
