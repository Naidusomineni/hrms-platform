package com.hrms.modules.performance.repository;

import com.hrms.modules.performance.entity.EmployeeGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeGoalRepository extends JpaRepository<EmployeeGoal, Long> {
    List<EmployeeGoal> findByTenantIdAndEmployeeId(String tenantId, Long employeeId);
    List<EmployeeGoal> findByTenantIdAndEmployeeIdAndCycleId(String tenantId, Long employeeId, Long cycleId);
}
