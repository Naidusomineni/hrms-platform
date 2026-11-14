package com.hrms.modules.helpdesk.repository;

import com.hrms.modules.helpdesk.entity.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    Optional<SupportTicket> findByTenantIdAndTicketNumber(String tenantId, String ticketNumber);

    Page<SupportTicket> findByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);

    Page<SupportTicket> findByTenantIdAndEmployeeIdOrderByCreatedAtDesc(String tenantId, Long employeeId, Pageable pageable);

    Page<SupportTicket> findByTenantIdAndStatusOrderByCreatedAtDesc(String tenantId, String status, Pageable pageable);

    long countByTenantIdAndStatus(String tenantId, String status);

    long countByTenantIdAndPriority(String tenantId, String priority);

    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.tenantId = :tenantId AND t.status IN ('OPEN', 'IN_PROGRESS')")
    long countOpenTickets(@Param("tenantId") String tenantId);

    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.tenantId = :tenantId AND t.status IN ('OPEN', 'IN_PROGRESS') AND t.slaDeadline < :now")
    long countBreachedTickets(@Param("tenantId") String tenantId, @Param("now") java.time.LocalDateTime now);
}
