package com.hrms.modules.document.repository;

import com.hrms.modules.document.entity.EmployeeDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, Long> {
    Page<EmployeeDocument> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId, Pageable pageable);
    List<EmployeeDocument> findByEmployeeIdAndCategory(Long employeeId, String category);
    Page<EmployeeDocument> findByTenantIdAndStatus(String tenantId, String status, Pageable pageable);

    @Query("SELECT d FROM EmployeeDocument d WHERE d.tenantId = :tenantId AND d.expiryDate BETWEEN :startDate AND :endDate")
    List<EmployeeDocument> findExpiringBetween(
            @Param("tenantId") String tenantId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
