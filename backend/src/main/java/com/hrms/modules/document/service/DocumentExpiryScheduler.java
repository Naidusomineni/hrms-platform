package com.hrms.modules.document.service;

import com.hrms.entity.Tenant;
import com.hrms.enums.NotificationType;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.document.entity.EmployeeDocument;
import com.hrms.modules.document.repository.EmployeeDocumentRepository;
import com.hrms.repository.TenantRepository;
import com.hrms.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service @Slf4j @RequiredArgsConstructor
public class DocumentExpiryScheduler {

    private final TenantRepository tenantRepository;
    private final EmployeeDocumentRepository documentRepository;
    private final NotificationService notificationService;

    /**
     * Daily document expiry check running at 8:00 AM.
     */
    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void checkDocumentExpirations() {
        log.info("Running daily document expiry check scheduler...");
        List<Tenant> tenants = tenantRepository.findAll();
        LocalDate today = LocalDate.now();
        LocalDate in30Days = today.plusDays(30);

        for (Tenant tenant : tenants) {
            TenantContext.runWithTenant(tenant.getId(), () -> {
                List<EmployeeDocument> expiringDocs = documentRepository.findExpiringBetween(tenant.getId(), today, in30Days);
                for (EmployeeDocument doc : expiringDocs) {
                    try {
                        notificationService.send(
                                doc.getEmployee().getUser().getId(),
                                "Document Expiration Warning",
                                "Your " + doc.getTitle() + " (" + doc.getCategory() + ") is set to expire on " + doc.getExpiryDate() + ". Please upload a renewed copy.",
                                NotificationType.SYSTEM,
                                "/documents"
                        );
                    } catch (Exception e) {
                        log.warn("Failed to notify user for document {}: {}", doc.getId(), e.getMessage());
                    }
                }
            });
        }
    }
}
