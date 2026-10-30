package com.hrms.modules.offboarding.repository;

import com.hrms.modules.offboarding.entity.SeparationClearance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeparationClearanceRepository extends JpaRepository<SeparationClearance, Long> {

    List<SeparationClearance> findBySeparationIdOrderByIdAsc(Long separationId);

    Optional<SeparationClearance> findBySeparationIdAndDepartmentType(Long separationId, String departmentType);
}
