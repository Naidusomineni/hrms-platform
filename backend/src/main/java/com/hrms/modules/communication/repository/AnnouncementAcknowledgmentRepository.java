package com.hrms.modules.communication.repository;

import com.hrms.modules.communication.entity.AnnouncementAcknowledgment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnnouncementAcknowledgmentRepository extends JpaRepository<AnnouncementAcknowledgment, Long> {

    Optional<AnnouncementAcknowledgment> findByTenantIdAndAnnouncementIdAndUserId(String tenantId, Long announcementId, Long userId);

    long countByAnnouncementId(Long announcementId);
}
