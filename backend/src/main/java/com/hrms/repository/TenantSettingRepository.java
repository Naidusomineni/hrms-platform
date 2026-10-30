package com.hrms.repository;

import com.hrms.entity.TenantSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantSettingRepository extends JpaRepository<TenantSetting, Long> {
    List<TenantSetting> findByTenantId(String tenantId);
    Optional<TenantSetting> findByTenantIdAndConfigKey(String tenantId, String configKey);
}
