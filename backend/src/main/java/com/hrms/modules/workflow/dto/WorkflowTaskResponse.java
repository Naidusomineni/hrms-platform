package com.hrms.modules.workflow.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class WorkflowTaskResponse {
    private Long instanceId;
    private String workflowName;
    private String entityType;
    private Long entityId;
    private String entitySummary;
    private String submitterName;
    private String submitterEmail;
    private Integer currentStepOrder;
    private Integer totalSteps;
    private String currentStepName;
    private String requiredRole;
    private String status;
    private LocalDateTime initiatedAt;
    private List<ApprovalHistoryDto> history;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ApprovalHistoryDto {
        private Integer stepOrder;
        private String approverName;
        private String decision;
        private String comments;
        private LocalDateTime decidedAt;
    }
}
