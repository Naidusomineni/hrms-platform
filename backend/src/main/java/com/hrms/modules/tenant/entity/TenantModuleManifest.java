package com.hrms.modules.tenant.entity;

import com.hrms.entity.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tenant_module_manifests",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"tenant_id", "module_key"}, name = "uk_tenant_module")},
    indexes = {@Index(name = "idx_tmm_tenant", columnList = "tenant_id, is_enabled")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TenantModuleManifest extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "module_key", nullable = false, length = 64)
    private String moduleKey;

    @Column(name = "is_enabled", nullable = false)
    @Builder.Default
    private Boolean isEnabled = true;
}

