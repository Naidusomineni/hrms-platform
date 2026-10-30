package com.hrms.modules.shift.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RosterAssignmentDto {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private String departmentName;

    private Long shiftId;
    private String shiftName;
    private String shiftCode;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isNightShift;

    private LocalDate effectiveDate;
    private String rotationPattern;
    private String notes;
    private String status;
}
