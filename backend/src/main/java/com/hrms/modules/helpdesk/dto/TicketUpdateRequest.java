package com.hrms.modules.helpdesk.dto;

import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TicketUpdateRequest {

    private String status; // OPEN, IN_PROGRESS, WAITING_ON_EMPLOYEE, RESOLVED, CLOSED
    private String priority;
    private Long assignedToUserId;
    private String resolutionNotes;
}
