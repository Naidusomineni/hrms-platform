package com.hrms.modules.recruitment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CandidateConvertDto {
    @NotBlank(message = "Employee code is required")
    private String employeeNumber;

    @NotNull(message = "Joining date is required")
    private LocalDate dateOfJoining;

    private String designation;
    private Long departmentId;
    private BigDecimal salary;
    private String employmentType; // FULL_TIME, CONTRACT
}
