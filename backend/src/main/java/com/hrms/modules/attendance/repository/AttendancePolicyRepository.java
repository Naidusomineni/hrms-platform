package com.hrms.modules.attendance.repository;

import com.hrms.modules.attendance.entity.AttendancePolicy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendancePolicyRepository extends JpaRepository<AttendancePolicy, Long> {
    List<AttendancePolicy> findByTenantIdAndIsActiveTrue(String tenantId);
    Page<AttendancePolicy> findByTenantId(String tenantId, Pageable pageable);
    Optional<AttendancePolicy> findByTenantIdAndPolicyCode(String tenantId, String policyCode);
    Optional<AttendancePolicy> findByTenantIdAndIsDefaultTrue(String tenantId);
}

