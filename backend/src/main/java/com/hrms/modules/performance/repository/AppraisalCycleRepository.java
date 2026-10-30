package com.hrms.modules.performance.repository;

import com.hrms.modules.performance.entity.AppraisalCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppraisalCycleRepository extends JpaRepository<AppraisalCycle, Long> {
    List<AppraisalCycle> findByTenantIdOrderByYearDesc(String tenantId);
    Optional<AppraisalCycle> findByIdAndTenantId(Long id, String tenantId);
}
