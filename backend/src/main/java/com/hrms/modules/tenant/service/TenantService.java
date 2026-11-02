package com.hrms.modules.tenant.service;

import com.hrms.entity.Tenant;
import com.hrms.entity.TenantSetting;
import com.hrms.entity.TenantSubscription;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.DuplicateResourceException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.repository.TenantRepository;
import com.hrms.repository.TenantRoleRepository;
import com.hrms.repository.TenantSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class TenantService {

    private final TenantRepository tenantRepository;
    private final TenantSettingRepository tenantSettingRepository;

    @Value("${file.upload.base-dir:uploads}")
    private String uploadBaseDir;

    @Value("${server.servlet.context-path:/api}")
    private String contextPath;

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
    public Tenant getTenantByIdOrCurrent(String id) {
        if (id == null || id.isBlank() || "current".equalsIgnoreCase(id)) {
            return getCurrentTenant();
        }
        return getTenantById(id);
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

    public Tenant updateTenantBranding(String tenantId, String name, String logoUrl, String primaryColor, String domain) {
        Tenant tenant = getTenantByIdOrCurrent(tenantId);
        if (name != null && !name.isBlank()) tenant.setName(name.trim());
        if (logoUrl != null) {
            tenant.setLogoUrl(logoUrl.trim().isEmpty() ? null : logoUrl.trim());
        }
        if (primaryColor != null && !primaryColor.isBlank()) {
            tenant.setPrimaryColor(primaryColor.trim());
        }
        if (domain != null) {
            tenant.setDomain(domain.trim().isEmpty() ? null : domain.trim());
        }
        log.info("Updated branding for tenant {}: name={}, primaryColor={}, domain={}", tenant.getId(), tenant.getName(), tenant.getPrimaryColor(), tenant.getDomain());
        return tenantRepository.save(tenant);
    }

    public Tenant updateTenantBranding(String tenantId, String name, String logoUrl, String primaryColor) {
        return updateTenantBranding(tenantId, name, logoUrl, primaryColor, null);
    }

    public Tenant uploadLogo(String tenantId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Logo file is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("image/svg+xml"))) {
            throw new BadRequestException("Only image files (PNG, JPG, WebP, SVG) are allowed");
        }
        String originalFilename = file.getOriginalFilename();
        String safeName = (originalFilename != null) ? originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_") : "logo.png";
        String filename = "logo-" + UUID.randomUUID().toString().substring(0, 8) + "-" + safeName;

        Path folder = Paths.get(uploadBaseDir).resolve("logos").toAbsolutePath().normalize();
        try {
            Files.createDirectories(folder);
            Path targetPath = folder.resolve(filename).normalize();
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save logo file", e);
        }

        String base = (contextPath != null && contextPath.endsWith("/")) ? contextPath.substring(0, contextPath.length() - 1) : contextPath;
        if (!StringUtils.hasText(base)) {
            base = "";
        }
        String logoUrl = base + "/uploads/logos/" + filename;
        return updateTenantBranding(tenantId, null, logoUrl, null, null);
    }
}
