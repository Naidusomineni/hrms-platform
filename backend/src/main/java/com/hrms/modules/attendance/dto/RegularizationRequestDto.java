package com.hrms.modules.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RegularizationRequestDto {
    private Long id;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private Long attendanceId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private LocalTime requestedCheckIn;
    private LocalTime requestedCheckOut;

    @NotBlank(message = "Reason for regularization is required")
    private String reason;

    private String status;
    private String reviewerComments;
}
