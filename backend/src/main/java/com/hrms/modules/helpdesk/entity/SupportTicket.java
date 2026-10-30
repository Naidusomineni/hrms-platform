package com.hrms.modules.helpdesk.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.modules.asset.entity.Asset;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "support_tickets",
    indexes = {
        @Index(name = "idx_support_tickets_tenant_status", columnList = "tenant_id, status"),
        @Index(name = "idx_support_tickets_emp", columnList = "tenant_id, employee_id"),
        @Index(name = "idx_support_tickets_assigned", columnList = "tenant_id, assigned_to")
    }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class SupportTicket extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_number", nullable = false, length = 32)
    private String ticketNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, length = 32)
    private String category; // HARDWARE, SOFTWARE, ACCESS_VPN, PAYROLL_QUERY, HR_POLICY, FACILITY

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "OPEN"; // OPEN, IN_PROGRESS, WAITING_ON_EMPLOYEE, RESOLVED, CLOSED

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(name = "sla_deadline")
    private LocalDateTime slaDeadline;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TicketComment> comments = new ArrayList<>();
}
