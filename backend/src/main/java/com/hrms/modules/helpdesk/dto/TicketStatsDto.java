package com.hrms.modules.helpdesk.dto;

import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TicketStatsDto {
    private long totalOpen;
    private long inProgress;
    private long resolved;
    private long criticalCount;
    private long slaBreachedCount;
}
