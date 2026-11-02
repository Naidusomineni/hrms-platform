package com.hrms.modules.tenant.service;

import com.hrms.entity.Tenant;
import com.hrms.entity.TenantSetting;
import com.hrms.entity.TenantSubscription;
import com.hrms.exception.DuplicateResourceException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.repository.TenantRepository;
import com.hrms.repository.TenantRoleRepository;
import com.hrms.repository.TenantSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class TenantService {

    private final TenantRepository tenantRepository;
    private final TenantSettingRepository tenantSettingRepository;

    @Transactional(readOnly = true)
    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Tenant getTenantById(String id) {
        return tenantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant", "id", id));
    }

    @Transactional(readOnly = true)
    public Tenant getCurrentTenant() {
        String currentId = TenantContext.getTenantId();
        return tenantRepository.findById(currentId)
            .orElseGet(() -> tenantRepository.findById(TenantContext.DEFAULT_TENANT_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "id", currentId)));
    }

    public Tenant createTenant(Tenant tenant) {
        if (tenantRepository.existsById(tenant.getId())) {
            throw new DuplicateResourceException("Tenant", "id", tenant.getId());
        }
        if (tenantRepository.existsByCode(tenant.getCode())) {
            throw new DuplicateResourceException("Tenant", "code", tenant.getCode());
        }
        log.info("Creating new tenant: id={}, code={}, name={}", tenant.getId(), tenant.getCode(), tenant.getName());
        return tenantRepository.save(tenant);
    }

    @Transactional(readOnly = true)
    public List<TenantSetting> getSettingsForTenant(String tenantId) {
        return tenantSettingRepository.findByTenantId(tenantId);
    }

    public TenantSetting updateTenantSetting(String tenantId, String key, String value) {
        TenantSetting setting = tenantSettingRepository.findByTenantIdAndConfigKey(tenantId, key)
            .orElse(TenantSetting.builder()
                .tenantId(tenantId)
                .configKey(key)
                .build());
        setting.setConfigValue(value);
        return tenantSettingRepository.save(setting);
    }

    public Tenant updateTenantBranding(String tenantId, String name, String logoUrl, String primaryColor) {
        Tenant tenant = getTenantById(tenantId);
        if (name != null && !name.isBlank()) tenant.setName(name);
        if (logoUrl != null) tenant.setLogoUrl(logoUrl);
        if (primaryColor != null && !primaryColor.isBlank()) tenant.setPrimaryColor(primaryColor);
        log.info("Updated branding for tenant {}: name={}, primaryColor={}", tenantId, name, primaryColor);
        return tenantRepository.save(tenant);
    }
}
