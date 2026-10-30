package com.hrms.modules.communication.service;

import com.hrms.entity.Department;
import com.hrms.entity.User;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.communication.dto.AnnouncementRequest;
import com.hrms.modules.communication.dto.AnnouncementResponse;
import com.hrms.modules.communication.entity.AnnouncementAcknowledgment;
import com.hrms.modules.communication.entity.CompanyAnnouncement;
import com.hrms.modules.communication.repository.AnnouncementAcknowledgmentRepository;
import com.hrms.modules.communication.repository.CompanyAnnouncementRepository;
import com.hrms.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class CommunicationService {

    private final CompanyAnnouncementRepository announcementRepository;
    private final AnnouncementAcknowledgmentRepository acknowledgmentRepository;
    private final DepartmentRepository departmentRepository;

    public AnnouncementResponse createAnnouncement(AnnouncementRequest req, User author) {
        String tenantId = TenantContext.getTenantId();
        Department dept = null;
        if (req.getDepartmentId() != null) {
            dept = departmentRepository.findById(req.getDepartmentId()).orElse(null);
        }

        CompanyAnnouncement a = CompanyAnnouncement.builder()
                .title(req.getTitle())
                .content(req.getContent())
                .category(req.getCategory() != null ? req.getCategory().toUpperCase() : "GENERAL")
                .priority(req.getPriority() != null ? req.getPriority().toUpperCase() : "NORMAL")
                .targetAudience(req.getTargetAudience() != null ? req.getTargetAudience().toUpperCase() : "ALL")
                .department(dept)
                .pinned(Boolean.TRUE.equals(req.getPinned()))
                .author(author)
                .publishedAt(LocalDateTime.now())
                .expiresAt(req.getExpiresAt())
                .acknowledgmentRequired(Boolean.TRUE.equals(req.getAcknowledgmentRequired()))
                .build();
        a.setTenantId(tenantId);
        a = announcementRepository.save(a);

        log.info("Company announcement published: id={}, title='{}'", a.getId(), a.getTitle());
        return toDto(a, author.getId());
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getActiveAnnouncements(User currentUser) {
        String tenantId = TenantContext.getTenantId();
        List<CompanyAnnouncement> active = announcementRepository.findActiveAnnouncements(tenantId, LocalDateTime.now());
        Long userId = currentUser != null ? currentUser.getId() : null;
        return active.stream().map(a -> toDto(a, userId)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<AnnouncementResponse> getAllAnnouncements(Pageable pageable, User currentUser) {
        String tenantId = TenantContext.getTenantId();
        Long userId = currentUser != null ? currentUser.getId() : null;
        return announcementRepository.findByTenantIdOrderByPinnedDescPublishedAtDesc(tenantId, pageable)
                .map(a -> toDto(a, userId));
    }

    public void acknowledge(Long announcementId, User user) {
        String tenantId = TenantContext.getTenantId();
        CompanyAnnouncement a = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyAnnouncement", "id", announcementId));

        Optional<AnnouncementAcknowledgment> existing = acknowledgmentRepository
                .findByTenantIdAndAnnouncementIdAndUserId(tenantId, a.getId(), user.getId());

        if (existing.isEmpty()) {
            AnnouncementAcknowledgment ack = AnnouncementAcknowledgment.builder()
                    .announcement(a)
                    .user(user)
                    .acknowledgedAt(LocalDateTime.now())
                    .build();
            ack.setTenantId(tenantId);
            acknowledgmentRepository.save(ack);
            log.info("Announcement {} acknowledged by user {}", a.getId(), user.getId());
        }
    }

    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }

    private AnnouncementResponse toDto(CompanyAnnouncement a, Long currentUserId) {
        String tenantId = TenantContext.getTenantId();
        boolean acknowledged = false;
        if (currentUserId != null) {
            acknowledged = acknowledgmentRepository
                    .findByTenantIdAndAnnouncementIdAndUserId(tenantId, a.getId(), currentUserId).isPresent();
        }
        long ackCount = acknowledgmentRepository.countByAnnouncementId(a.getId());

        return AnnouncementResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .content(a.getContent())
                .category(a.getCategory())
                .priority(a.getPriority())
                .targetAudience(a.getTargetAudience())
                .departmentId(a.getDepartment() != null ? a.getDepartment().getId() : null)
                .departmentName(a.getDepartment() != null ? a.getDepartment().getName() : null)
                .pinned(a.getPinned())
                .authorId(a.getAuthor() != null ? a.getAuthor().getId() : null)
                .authorName(a.getAuthor() != null ? a.getAuthor().getEmail() : "Admin")
                .publishedAt(a.getPublishedAt())
                .expiresAt(a.getExpiresAt())
                .acknowledgmentRequired(a.getAcknowledgmentRequired())
                .isAcknowledgedByCurrentUser(acknowledged)
                .totalAcknowledgments(ackCount)
                .build();
    }
}
