package com.hrms.entity;

import com.hrms.infrastructure.multitenancy.context.TenantContext;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;

/**
 * Base mapped superclass for all multi-tenant entities.
 * Automatically enforces tenant isolation and binds entities to the active TenantContext.
 */
@Getter
@Setter
@MappedSuperclass
public abstract class BaseTenantEntity extends BaseEntity {

    @Column(name = "tenant_id", nullable = false, updatable = false, length = 64)
    private String tenantId;

    @PrePersist
    protected void ensureTenantId() {
        if (this.tenantId == null || this.tenantId.isBlank()) {
            this.tenantId = TenantContext.getTenantId();
        }
    }
}
