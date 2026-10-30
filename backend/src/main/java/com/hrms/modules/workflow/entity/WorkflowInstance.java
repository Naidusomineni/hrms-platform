package com.hrms.modules.workflow.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workflow_instances",
    indexes = {@Index(name = "idx_wi_tenant_ent", columnList = "tenant_id,entity_type,entity_id"),
               @Index(name = "idx_wi_status", columnList = "tenant_id,status")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class WorkflowInstance extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_definition_id", nullable = false)
    private WorkflowDefinition workflowDefinition;

    @Column(name = "entity_type", nullable = false, length = 30)
    private String entityType; // LEAVE, DOCUMENT, EMPLOYEE_REQUEST, REGULARIZATION

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(name = "current_step_order", nullable = false)
    @Builder.Default
    private Integer currentStepOrder = 1;

    @Column(name = "total_steps", nullable = false)
    @Builder.Default
    private Integer totalSteps = 1;

    @Column(nullable = false, length = 25)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, CANCELLED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiated_by", nullable = false)
    private User initiatedBy;

    @OneToMany(mappedBy = "workflowInstance", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("stepOrder ASC, decidedAt ASC")
    @Builder.Default
    private List<WorkflowApproval> approvals = new ArrayList<>();
}
