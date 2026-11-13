package com.hrms.common.audit;

import com.hrms.entity.AuditLog;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

@Service @Slf4j @RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entityType, Long entityId, String description) {
        log(action, entityType, entityId, description, null, null, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entityType, Long entityId, String description, String oldValues, String newValues) {
        log(action, entityType, entityId, description, oldValues, newValues, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entityType, Long entityId, String description,
                    String oldValues, String newValues, String explicitPerformer, String explicitIp) {
        try {
            String performer = explicitPerformer;
            if (performer == null || performer.isBlank()) {
                performer = "SYSTEM";
                var auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                    performer = auth.getName();
                }
            }

            String ip = explicitIp;
            if (ip == null || ip.isBlank()) {
                ip = resolveClientIp();
            }

            String tenantId = TenantContext.getTenantId();
            if (tenantId == null || tenantId.isBlank()) {
                tenantId = "default";
            }

            AuditLog entry = AuditLog.builder()
                .tenantId(tenantId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .performedBy(performer)
                .ipAddress(ip)
                .oldValues(oldValues)
                .newValues(newValues)
                .requestId(MDC.get("requestId"))
                .module(entityType)
                .build();
            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage());
        }
    }

    private String resolveClientIp() {
        try {
            var attrs = RequestContextHolder.getRequestAttributes();
            if (attrs instanceof ServletRequestAttributes sra) {
                var req = sra.getRequest();
                String fwd = req.getHeader("X-Forwarded-For");
                if (fwd != null && !fwd.isBlank()) {
                    return fwd.split(",")[0].trim();
                }
                return req.getRemoteAddr();
            }
        } catch (Exception ignored) {}
        return "127.0.0.1";
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAll(Pageable pageable) {
        return auditLogRepository.findAllByOrderByPerformedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAll(Pageable pageable, String query, String action, String entityType, String performedBy) {
        return auditLogRepository.search(
            query == null || query.isBlank() ? null : query.trim(),
            action == null || action.isBlank() ? null : action.trim(),
            entityType == null || entityType.isBlank() ? null : entityType.trim(),
            performedBy == null || performedBy.isBlank() ? null : performedBy.trim(),
            pageable);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> exportLogs(String query, String action, String entityType, String performedBy) {
        Pageable pageable = PageRequest.of(0, 5000, Sort.by("performedAt").descending());
        return getAll(pageable, query, action, entityType, performedBy).getContent();
    }
}
