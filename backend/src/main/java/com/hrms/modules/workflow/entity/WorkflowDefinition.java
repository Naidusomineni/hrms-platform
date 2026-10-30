package com.hrms.modules.workflow.entity;

import com.hrms.entity.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workflow_definitions",
    indexes = {@Index(name = "idx_wd_tenant_mod", columnList = "tenant_id,module_type")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class WorkflowDefinition extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "module_type", nullable = false, length = 30)
    private String moduleType; // LEAVE, DOCUMENT, EXPENSE, REGULARIZATION, WORK_FROM_HOME

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "workflowDefinition", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("stepOrder ASC")
    @Builder.Default
    private List<WorkflowStep> steps = new ArrayList<>();
}
