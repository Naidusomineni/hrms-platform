package com.hrms.modules.tenant.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.modules.tenant.dto.TenantModuleManifestDto;
import com.hrms.modules.tenant.service.TenantModuleService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/tenant/modules")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Tenant Module Manifests & Feature Flags")
public class TenantModuleController {

    private final TenantModuleService moduleService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<TenantModuleManifestDto>>> getTenantModules() {
        return ResponseEntity.ok(ApiResponse.success(moduleService.getTenantModules()));
    }

    @GetMapping("/enabled")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<String>>> getEnabledModuleKeys() {
        return ResponseEntity.ok(ApiResponse.success(moduleService.getEnabledModuleKeys()));
    }

    @PutMapping("/{moduleKey}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<TenantModuleManifestDto>> toggleModule(
            @PathVariable("moduleKey") String moduleKey,
            @RequestBody Map<String, Boolean> payload) {
        boolean enabled = payload.getOrDefault("enabled", true);
        TenantModuleManifestDto updated = moduleService.toggleModule(moduleKey, enabled);
        return ResponseEntity.ok(ApiResponse.success("Module " + moduleKey + " updated", updated));
    }

    @PutMapping("/batch")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<TenantModuleManifestDto>>> batchUpdateModules(
            @RequestBody Map<String, Boolean> moduleMap) {
        List<TenantModuleManifestDto> updated = moduleService.updateAllModules(moduleMap);
        return ResponseEntity.ok(ApiResponse.success("Tenant module subscription updated successfully", updated));
    }
}

