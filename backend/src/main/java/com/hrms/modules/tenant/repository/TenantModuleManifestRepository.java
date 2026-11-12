package com.hrms.modules.tenant.repository;

import com.hrms.modules.tenant.entity.TenantModuleManifest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantModuleManifestRepository extends JpaRepository<TenantModuleManifest, Long> {
    List<TenantModuleManifest> findByTenantId(String tenantId);
    List<TenantModuleManifest> findByTenantIdAndIsEnabledTrue(String tenantId);
    Optional<TenantModuleManifest> findByTenantIdAndModuleKey(String tenantId, String moduleKey);
}

