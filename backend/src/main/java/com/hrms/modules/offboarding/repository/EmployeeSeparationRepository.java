package com.hrms.modules.offboarding.repository;

import com.hrms.modules.offboarding.entity.EmployeeSeparation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeSeparationRepository extends JpaRepository<EmployeeSeparation, Long> {

    List<EmployeeSeparation> findByTenantIdAndEmployeeIdOrderByCreatedAtDesc(String tenantId, Long employeeId);

    Optional<EmployeeSeparation> findFirstByTenantIdAndEmployeeIdAndStatusNotInOrderByCreatedAtDesc(
            String tenantId, Long employeeId, List<String> terminalStatuses);

    Page<EmployeeSeparation> findByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);

    @Query("SELECT s FROM EmployeeSeparation s WHERE s.tenantId = :tenantId AND (:status IS NULL OR s.status = :status) ORDER BY s.createdAt DESC")
    Page<EmployeeSeparation> findByTenantIdAndStatusFilter(
            @Param("tenantId") String tenantId,
            @Param("status") String status,
            Pageable pageable);
}
