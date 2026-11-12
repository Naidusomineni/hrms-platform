package com.hrms.modules.tenant.service;

import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.tenant.dto.TenantModuleManifestDto;
import com.hrms.modules.tenant.entity.TenantModuleManifest;
import com.hrms.modules.tenant.repository.TenantModuleManifestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class TenantModuleService {

    private final TenantModuleManifestRepository manifestRepository;

    private static final List<String> ALL_AVAILABLE_MODULES = List.of(
            "DASHBOARD", "EMPLOYEES", "DEPARTMENTS", "ATTENDANCE", "SHIFTS",
            "LEAVES", "REQUESTS", "APPROVALS", "PAYROLL", "EXPENSES",
            "RECRUITMENT", "DOCUMENTS", "ASSETS", "HELPDESK", "PERFORMANCE",
            "INTELLIGENCE", "COMMUNICATION", "REPORTS", "OFFBOARDING", "SETTINGS"
    );

    @Transactional(readOnly = true)
    public List<TenantModuleManifestDto> getTenantModules() {
        String tenantId = TenantContext.getTenantId();
        List<TenantModuleManifest> existing = manifestRepository.findByTenantId(tenantId);
        
        Set<String> existingKeys = existing.stream()
                .map(TenantModuleManifest::getModuleKey)
                .collect(Collectors.toSet());

        List<TenantModuleManifestDto> result = new ArrayList<>(existing.stream()
                .map(m -> new TenantModuleManifestDto(m.getId(), m.getModuleKey(), m.getIsEnabled()))
                .collect(Collectors.toList()));

        // Add any missing modules as enabled by default
        for (String mod : ALL_AVAILABLE_MODULES) {
            if (!existingKeys.contains(mod)) {
                result.add(new TenantModuleManifestDto(null, mod, true));
            }
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<String> getEnabledModuleKeys() {
        String tenantId = TenantContext.getTenantId();
        List<TenantModuleManifest> enabled = manifestRepository.findByTenantIdAndIsEnabledTrue(tenantId);
        if (enabled.isEmpty()) {
            return ALL_AVAILABLE_MODULES; // Fallback: all enabled
        }
        return enabled.stream().map(TenantModuleManifest::getModuleKey).collect(Collectors.toList());
    }

    public TenantModuleManifestDto toggleModule(String moduleKey, boolean enabled) {
        String tenantId = TenantContext.getTenantId();
        String upperKey = moduleKey.toUpperCase().trim();

        TenantModuleManifest manifest = manifestRepository.findByTenantIdAndModuleKey(tenantId, upperKey)
                .orElse(TenantModuleManifest.builder()
                        .moduleKey(upperKey)
                        .isEnabled(enabled)
                        .build());

        manifest.setIsEnabled(enabled);
        manifest = manifestRepository.save(manifest);

        log.info("Tenant {} module {} set to {}", tenantId, upperKey, enabled);
        return new TenantModuleManifestDto(manifest.getId(), manifest.getModuleKey(), manifest.getIsEnabled());
    }

    public List<TenantModuleManifestDto> updateAllModules(Map<String, Boolean> moduleMap) {
        String tenantId = TenantContext.getTenantId();
        List<TenantModuleManifestDto> updated = new ArrayList<>();

        for (Map.Entry<String, Boolean> entry : moduleMap.entrySet()) {
            String modKey = entry.getKey().toUpperCase().trim();
            TenantModuleManifest manifest = manifestRepository.findByTenantIdAndModuleKey(tenantId, modKey)
                    .orElse(TenantModuleManifest.builder()
                            .moduleKey(modKey)
                            .isEnabled(entry.getValue())
                            .build());
            manifest.setIsEnabled(entry.getValue());
            manifest = manifestRepository.save(manifest);
            updated.add(new TenantModuleManifestDto(manifest.getId(), manifest.getModuleKey(), manifest.getIsEnabled()));
        }

        return updated;
    }

    @Transactional(readOnly = true)
    public boolean isModuleEnabled(String moduleKey) {
        String tenantId = TenantContext.getTenantId();
        return manifestRepository.findByTenantIdAndModuleKey(tenantId, moduleKey.toUpperCase().trim())
                .map(TenantModuleManifest::getIsEnabled)
                .orElse(true);
    }
}

