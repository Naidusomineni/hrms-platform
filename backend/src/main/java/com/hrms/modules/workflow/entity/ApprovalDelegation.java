package com.hrms.modules.workflow.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "approval_delegations",
    indexes = {@Index(name = "idx_ad_delegator", columnList = "tenant_id, delegator_id, is_active, start_date, end_date")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ApprovalDelegation extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delegator_id", nullable = false)
    private User delegator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delegatee_id", nullable = false)
    private User delegatee;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "request_types", nullable = false, length = 255)
    @Builder.Default
    private String requestTypes = "ALL"; // ALL, or comma-separated e.g. "LEAVE,ATTENDANCE_REGULARIZATION"

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}

