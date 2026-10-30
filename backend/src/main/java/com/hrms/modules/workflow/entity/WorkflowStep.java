package com.hrms.modules.workflow.entity;

import com.hrms.entity.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "workflow_steps",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"workflow_definition_id", "step_order"}, name = "uk_ws_def_order")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class WorkflowStep extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_definition_id", nullable = false)
    private WorkflowDefinition workflowDefinition;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(name = "step_name", nullable = false, length = 100)
    private String stepName;

    @Column(name = "approver_type", nullable = false, length = 30)
    private String approverType; // REPORTING_MANAGER, SPECIFIC_ROLE, SPECIFIC_USER

    @Column(name = "approver_role", length = 50)
    private String approverRole; // e.g. ROLE_HR, ROLE_ADMIN, ROLE_FINANCE

    @Column(name = "sla_hours")
    @Builder.Default
    private Integer slaHours = 48;

    @Column(name = "is_auto_approved")
    @Builder.Default
    private Boolean isAutoApproved = false;
}
