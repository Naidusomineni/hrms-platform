package com.hrms.modules.offboarding.entity;

import com.hrms.entity.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "separation_clearances",
    indexes = {
        @Index(name = "idx_separation_clearances_sep", columnList = "separation_id")
    }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class SeparationClearance extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "separation_id", nullable = false)
    private EmployeeSeparation separation;

    @Column(name = "department_type", nullable = false, length = 32)
    private String departmentType; // IT_ASSETS, FINANCE, HR_ADMIN, MANAGER

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "PENDING"; // PENDING, CLEARED, REJECTED

    @Column(name = "cleared_by", length = 120)
    private String clearedBy;

    @Column(name = "cleared_at")
    private LocalDateTime clearedAt;

    @Column(name = "pending_dues", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal pendingDues = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String remarks;
}
