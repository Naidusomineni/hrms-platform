package com.hrms.modules.offboarding.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class SeparationRequestDto {

    private Long id;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private String employeeName;
    private String employeeNumber;
    private String departmentName;
    private String designation;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfJoining;

    @NotNull(message = "Resignation date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate resignationDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate requestedLastWorkingDay;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate approvedLastWorkingDay;

    private String reason;
    private String separationType; // RESIGNATION, TERMINATION, RETIREMENT, END_OF_CONTRACT
    private String status;         // SUBMITTED, MANAGER_APPROVED, HR_APPROVED, CLEARANCE_PENDING, SETTLED, REJECTED, WITHDRAWN
    private String reviewerComments;
    private String exitInterviewNotes;

    private List<ClearanceDto> clearances;
    private SettlementDto settlement;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
}
