package com.hrms.modules.asset.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "asset_allocations",
    indexes = {@Index(name = "idx_asset_allocations_tenant", columnList = "tenant_id, employee_id, allocation_status")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AssetAllocation extends BaseTenantEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "allocated_at", nullable = false)
    @Builder.Default
    private LocalDateTime allocatedAt = LocalDateTime.now();

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;

    @Column(name = "allocation_status", length = 50, nullable = false)
    @Builder.Default
    private String allocationStatus = "ACTIVE"; // ACTIVE, RETURNED, LOST

    @Column(columnDefinition = "TEXT")
    private String notes;
}
