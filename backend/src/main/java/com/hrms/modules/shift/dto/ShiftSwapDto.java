package com.hrms.modules.shift.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ShiftSwapDto {

    private Long id;

    private Long requesterEmployeeId;
    private String requesterEmployeeName;
    private String requesterShiftName;
    private String requesterShiftTime;

    private Long targetEmployeeId;
    private String targetEmployeeName;
    private String targetShiftName;
    private String targetShiftTime;

    private LocalDate swapDate;
    private String reason;
    private String peerStatus;
    private String managerStatus;
    private String status;
    private String managerRemarks;
    private LocalDateTime createdAt;
}
