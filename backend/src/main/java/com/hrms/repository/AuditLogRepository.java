package com.hrms.repository;
import com.hrms.entity.AuditLog;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByPerformedByOrderByPerformedAtDesc(String performedBy, Pageable pageable);
    Page<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId, Pageable pageable);
    
    @Query("""
        SELECT a FROM AuditLog a
        WHERE (:q IS NULL OR :q = '' OR (
            LOWER(a.action) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(a.entityType) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(a.description) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(a.performedBy) LIKE LOWER(CONCAT('%', :q, '%'))
        ))
          AND (:action IS NULL OR :action = '' OR a.action = :action)
          AND (:entityType IS NULL OR :entityType = '' OR a.entityType = :entityType)
          AND (:performedBy IS NULL OR :performedBy = '' OR LOWER(a.performedBy) LIKE LOWER(CONCAT('%', :performedBy, '%')))
        """)
    Page<AuditLog> search(
        @Param("q") String query,
        @Param("action") String action,
        @Param("entityType") String entityType,
        @Param("performedBy") String performedBy,
        Pageable pageable);

    Page<AuditLog> findAllByOrderByPerformedAtDesc(Pageable pageable);
}
