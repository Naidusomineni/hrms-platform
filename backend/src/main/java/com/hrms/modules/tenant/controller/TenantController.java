package com.hrms.modules.tenant.controller;
import com.hrms.modules.tenant.service.TenantService;

import com.hrms.dto.response.ApiResponse;
import com.hrms.entity.Tenant;
import com.hrms.entity.TenantSetting;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/tenants")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Multi-Tenant Administration")
public class TenantController {

    private final TenantService tenantService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<Tenant>>> getAllTenants() {
        return ResponseEntity.ok(ApiResponse.success(tenantService.getAllTenants()));
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<Tenant>> getCurrentTenant() {
        return ResponseEntity.ok(ApiResponse.success(tenantService.getCurrentTenant()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Tenant>> getTenantById(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.success(tenantService.getTenantById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Tenant>> createTenant(@RequestBody Tenant tenant) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Tenant created successfully", tenantService.createTenant(tenant)));
    }

    @GetMapping("/{id}/settings")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<TenantSetting>>> getTenantSettings(@PathVariable("id") String id) {
        return ResponseEntity.ok(ApiResponse.success(tenantService.getSettingsForTenant(id)));
    }

    @PutMapping("/{id}/settings/{key}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<TenantSetting>> updateTenantSetting(
            @PathVariable("id") String id,
            @PathVariable("key") String key,
            @RequestBody String value) {
        return ResponseEntity.ok(ApiResponse.success(
            "Setting updated",
            tenantService.updateTenantSetting(id, key, value)));
    }

    @PutMapping("/{id}/branding")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Tenant>> updateTenantBranding(
            @PathVariable("id") String id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String logoUrl,
            @RequestParam(required = false) String primaryColor) {
        return ResponseEntity.ok(ApiResponse.success(
            "Branding updated successfully",
            tenantService.updateTenantBranding(id, name, logoUrl, primaryColor)));
    }
}
