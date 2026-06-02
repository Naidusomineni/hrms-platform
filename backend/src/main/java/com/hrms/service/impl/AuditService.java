package com.hrms.service.impl;

import com.hrms.entity.AuditLog;
import com.hrms.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Slf4j @RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    @Transactional
    public void log(String action, String entityType, Long entityId, String description) {
        try {
            String performer = "SYSTEM";
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                performer = auth.getName();
            }
            AuditLog entry = AuditLog.builder()
                .action(action).entityType(entityType).entityId(entityId)
                .description(description).performedBy(performer)
                .requestId(MDC.get("requestId")).module(entityType)
                .build();
            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage());
        }
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
}
