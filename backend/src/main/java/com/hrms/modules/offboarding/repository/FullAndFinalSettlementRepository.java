package com.hrms.modules.offboarding.repository;

import com.hrms.modules.offboarding.entity.FullAndFinalSettlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FullAndFinalSettlementRepository extends JpaRepository<FullAndFinalSettlement, Long> {

    Optional<FullAndFinalSettlement> findBySeparationId(Long separationId);

    Optional<FullAndFinalSettlement> findByTenantIdAndEmployeeId(String tenantId, Long employeeId);
}
