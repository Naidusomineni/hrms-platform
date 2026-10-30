package com.hrms.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuditLogResponse {
    private Long id;
    private String action;
    private String entityType;
    private Long entityId;
    private String description;
    private String performedBy;
    private LocalDateTime performedAt;
}
