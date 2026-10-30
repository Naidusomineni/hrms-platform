package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "tenants",
    uniqueConstraints = {@UniqueConstraint(name = "uk_tenant_code", columnNames = "code")}
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tenant {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 255)
    private String domain;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, SUSPENDED, TRIAL, CANCELLED

    @Builder.Default
    @Column(name = "subscription_tier", nullable = false, length = 50)
    private String subscriptionTier = "ENTERPRISE";

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Builder.Default
    @Column(name = "primary_color", length = 20)
    private String primaryColor = "#2563eb";

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
