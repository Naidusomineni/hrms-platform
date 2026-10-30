package com.hrms.modules.document.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "policy_acknowledgements",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"tenant_id", "document_id", "employee_id"}, name = "uk_pa_doc_emp")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PolicyAcknowledgement extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private EmployeeDocument document;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "acknowledged_at", nullable = false)
    @Builder.Default
    private LocalDateTime acknowledgedAt = LocalDateTime.now();

    @Column(name = "ip_address", length = 50)
    private String ipAddress;
}
