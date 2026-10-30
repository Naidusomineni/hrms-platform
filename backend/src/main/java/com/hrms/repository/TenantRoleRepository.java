package com.hrms.repository;

import com.hrms.entity.TenantRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantRoleRepository extends JpaRepository<TenantRole, Long> {
    List<TenantRole> findByTenantId(String tenantId);
    Optional<TenantRole> findByTenantIdAndName(String tenantId, String name);
    boolean existsByTenantIdAndName(String tenantId, String name);
}
