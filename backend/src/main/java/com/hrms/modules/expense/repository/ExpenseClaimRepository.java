package com.hrms.modules.expense.repository;

import com.hrms.modules.expense.entity.ExpenseClaim;
import com.hrms.modules.expense.enums.ExpenseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseClaimRepository extends JpaRepository<ExpenseClaim, Long> {

    Page<ExpenseClaim> findByTenantIdAndEmployeeIdOrderByExpenseDateDesc(String tenantId, Long employeeId, Pageable pageable);

    Page<ExpenseClaim> findByTenantIdAndStatusOrderByCreatedAtDesc(String tenantId, ExpenseStatus status, Pageable pageable);

    Page<ExpenseClaim> findByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);

    Optional<ExpenseClaim> findByTenantIdAndId(String tenantId, Long id);

    Optional<ExpenseClaim> findByTenantIdAndClaimNumber(String tenantId, String claimNumber);

    @Query("SELECT e FROM ExpenseClaim e WHERE e.tenantId = :tenantId AND e.employee.id = :employeeId AND e.status = :status")
    List<ExpenseClaim> findPendingClaimsForDisbursement(
            @Param("tenantId") String tenantId,
            @Param("employeeId") Long employeeId,
            @Param("status") ExpenseStatus status
    );

    @Query("SELECT COUNT(e) FROM ExpenseClaim e WHERE e.tenantId = :tenantId AND e.claimNumber LIKE :pattern")
    long countClaimsWithPrefix(@Param("tenantId") String tenantId, @Param("pattern") String pattern);
}
