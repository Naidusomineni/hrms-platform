package com.hrms.modules.workflow.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_approvals",
    indexes = {@Index(name = "idx_wa_instance", columnList = "workflow_instance_id")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class WorkflowApproval extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_instance_id", nullable = false)
    private WorkflowInstance workflowInstance;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id", nullable = false)
    private User approver;

    @Column(nullable = false, length = 25)
    private String decision; // APPROVED, REJECTED, REQUEST_CHANGE

    @Column(length = 500)
    private String comments;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "decided_at", nullable = false)
    @Builder.Default
    private LocalDateTime decidedAt = LocalDateTime.now();
}
