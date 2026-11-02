package com.hrms.modules.intelligence.repository;

import com.hrms.modules.intelligence.entity.FlightRiskEvaluation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRiskEvaluationRepository extends JpaRepository<FlightRiskEvaluation, Long> {

    List<FlightRiskEvaluation> findByTenantIdOrderByRiskScoreDesc(String tenantId);

    Page<FlightRiskEvaluation> findByTenantIdOrderByRiskScoreDesc(String tenantId, Pageable pageable);

    List<FlightRiskEvaluation> findByTenantIdAndRiskLevel(String tenantId, String riskLevel);

    Optional<FlightRiskEvaluation> findTopByTenantIdAndEmployeeIdOrderByEvaluatedAtDesc(String tenantId, Long employeeId);

    @Query("SELECT f FROM FlightRiskEvaluation f JOIN FETCH f.employee e LEFT JOIN FETCH e.department d " +
           "WHERE f.tenantId = :tenantId ORDER BY f.riskScore DESC")
    List<FlightRiskEvaluation> findAllWithEmployeeByTenant(@Param("tenantId") String tenantId);
}
