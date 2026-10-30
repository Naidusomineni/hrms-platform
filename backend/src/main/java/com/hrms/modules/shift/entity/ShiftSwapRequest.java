package com.hrms.modules.shift.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "shift_swap_requests",
    indexes = {
        @Index(name = "idx_swap_tenant_status", columnList = "tenant_id, status"),
        @Index(name = "idx_swap_requester", columnList = "tenant_id, requester_employee_id"),
        @Index(name = "idx_swap_target", columnList = "tenant_id, target_employee_id")
    })
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ShiftSwapRequest extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_employee_id", nullable = false)
    private Employee requesterEmployee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_employee_id", nullable = false)
    private Employee targetEmployee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_roster_id", nullable = false)
    private RosterAssignment requesterRoster;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_roster_id", nullable = false)
    private RosterAssignment targetRoster;

    @Column(name = "swap_date", nullable = false)
    private LocalDate swapDate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "peer_status", nullable = false, length = 50)
    @Builder.Default
    private String peerStatus = "PENDING_PEER"; // PENDING_PEER, PEER_ACCEPTED, PEER_REJECTED

    @Column(name = "manager_status", nullable = false, length = 50)
    @Builder.Default
    private String managerStatus = "PENDING_MANAGER"; // PENDING_MANAGER, APPROVED, REJECTED

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, CANCELLED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_user_id")
    private User reviewedByUser;

    @Column(name = "manager_remarks", columnDefinition = "TEXT")
    private String managerRemarks;
}
