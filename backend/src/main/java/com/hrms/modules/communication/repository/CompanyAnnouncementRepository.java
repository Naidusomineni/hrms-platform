package com.hrms.modules.communication.repository;

import com.hrms.modules.communication.entity.CompanyAnnouncement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CompanyAnnouncementRepository extends JpaRepository<CompanyAnnouncement, Long> {

    Page<CompanyAnnouncement> findByTenantIdOrderByPinnedDescPublishedAtDesc(String tenantId, Pageable pageable);

    @Query("SELECT a FROM CompanyAnnouncement a WHERE a.tenantId = :tenantId AND (a.expiresAt IS NULL OR a.expiresAt > :now) ORDER BY a.pinned DESC, a.publishedAt DESC")
    List<CompanyAnnouncement> findActiveAnnouncements(@Param("tenantId") String tenantId, @Param("now") LocalDateTime now);

    @Query("SELECT a FROM CompanyAnnouncement a WHERE a.tenantId = :tenantId AND a.pinned = true AND (a.expiresAt IS NULL OR a.expiresAt > :now) ORDER BY a.publishedAt DESC")
    List<CompanyAnnouncement> findPinnedAnnouncements(@Param("tenantId") String tenantId, @Param("now") LocalDateTime now);
}
