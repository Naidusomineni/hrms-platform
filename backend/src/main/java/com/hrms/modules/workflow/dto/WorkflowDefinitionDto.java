package com.hrms.modules.workflow.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class WorkflowDefinitionDto {
    private Long id;
    private String moduleType;
    private String name;
    private String description;
    private Boolean isActive;
    private List<WorkflowStepDto> steps;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class WorkflowStepDto {
        private Long id;
        private Integer stepOrder;
        private String stepName;
        private String approverType; // REPORTING_MANAGER, SPECIFIC_ROLE, SPECIFIC_USER
        private String approverRole;
        private Integer slaHours;
    }
}
