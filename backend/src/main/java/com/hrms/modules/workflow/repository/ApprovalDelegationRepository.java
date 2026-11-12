package com.hrms.modules.workflow.repository;

import com.hrms.modules.workflow.entity.ApprovalDelegation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalDelegationRepository extends JpaRepository<ApprovalDelegation, Long> {

    List<ApprovalDelegation> findByTenantIdAndDelegatorIdAndIsActiveTrue(String tenantId, Long delegatorId);

    List<ApprovalDelegation> findByTenantIdAndDelegateeIdAndIsActiveTrue(String tenantId, Long delegateeId);

    @Query("SELECT ad FROM ApprovalDelegation ad WHERE ad.tenantId = :tenantId AND ad.delegator.id = :delegatorId " +
           "AND ad.isActive = true AND :currentDate BETWEEN ad.startDate AND ad.endDate")
    Optional<ApprovalDelegation> findActiveDelegation(
            @Param("tenantId") String tenantId,
            @Param("delegatorId") Long delegatorId,
            @Param("currentDate") LocalDate currentDate);

    @Query("SELECT ad FROM ApprovalDelegation ad WHERE ad.tenantId = :tenantId AND ad.delegatee.id = :delegateeId " +
           "AND ad.isActive = true AND :currentDate BETWEEN ad.startDate AND ad.endDate")
    List<ApprovalDelegation> findActiveDelegationsForDelegatee(
            @Param("tenantId") String tenantId,
            @Param("delegateeId") Long delegateeId,
            @Param("currentDate") LocalDate currentDate);

    List<ApprovalDelegation> findByTenantIdOrderByCreatedAtDesc(String tenantId);
}

