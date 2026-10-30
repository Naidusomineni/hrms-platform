package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tenant_subscriptions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false, length = 64)
    private String tenantId;

    @Builder.Default
    @Column(name = "plan_name", nullable = false, length = 50)
    private String planName = "ENTERPRISE";

    @Builder.Default
    @Column(name = "max_employees", nullable = false)
    private Integer maxEmployees = 1000;

    @Builder.Default
    @Column(name = "starts_at", nullable = false)
    private LocalDateTime startsAt = LocalDateTime.now();

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, EXPIRED, CANCELLED

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
