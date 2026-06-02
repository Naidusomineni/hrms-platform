package com.hrms.controller.v1;

import com.hrms.dto.request.AdminRoleUpdateRequest;
import com.hrms.dto.request.AdminStatusUpdateRequest;
import com.hrms.dto.request.SystemSettingRequest;
import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.AuditLogResponse;
import com.hrms.dto.response.SystemSettingResponse;
import com.hrms.dto.response.UserResponse;
import com.hrms.entity.User;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.UserRepository;
import com.hrms.service.impl.AuditService;
import com.hrms.service.impl.SystemConfigService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Panel")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final AuditService auditService;
    private final SystemConfigService systemConfigService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<UserResponse> responsePage;
        if (q == null || q.isBlank()) {
            responsePage = userRepository.findAll(pageable).map(this::toResponse);
        } else {
            responsePage = userRepository.search(q.trim(), pageable).map(this::toResponse);
        }
        return ResponseEntity.ok(ApiResponse.success(responsePage));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminStatusUpdateRequest request) {
        userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        userRepository.updateActiveStatus(id, request.getIsActive());
        return ResponseEntity.ok(ApiResponse.success("User status updated"));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .role(user.getRole())
            .isActive(user.getIsActive())
            .emailVerified(user.getEmailVerified())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<Void>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody AdminRoleUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        String nextRole = request.getRole();
        user.setRole(com.hrms.enums.Role.valueOf(nextRole));
        userRepository.save(user);
        auditService.log("USER_ROLE_UPDATE", "USER", user.getId(), "Changed role to " + nextRole + " for " + user.getEmail());
        return ResponseEntity.ok(ApiResponse.success("User role updated"));
    }

    @GetMapping("/audit")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String performedBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("performedAt").descending());
        Page<AuditLogResponse> logs = auditService.getAll(pageable, q, action, entityType, performedBy).map(a -> AuditLogResponse.builder()
            .id(a.getId())
            .action(a.getAction())
            .entityType(a.getEntityType())
            .entityId(a.getEntityId())
            .description(a.getDescription())
            .performedBy(a.getPerformedBy())
            .performedAt(a.getPerformedAt())
            .build());
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<List<SystemSettingResponse>>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(systemConfigService.getAllSettings()));
    }

    @PutMapping("/settings/{key}")
    public ResponseEntity<ApiResponse<SystemSettingResponse>> updateSetting(
            @PathVariable String key,
            @Valid @RequestBody SystemSettingRequest request) {
        return ResponseEntity.ok(ApiResponse.success(systemConfigService.updateSetting(key, request.getValue())));
    }
}
