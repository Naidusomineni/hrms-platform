package com.hrms.modules.workflow.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ApprovalDelegationDto {
    private Long id;
    private Long delegatorId;
    private String delegatorName;
    private Long delegateeId;
    private String delegateeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String requestTypes;
    private String notes;
    private Boolean isActive;
    private LocalDateTime createdAt;
}

