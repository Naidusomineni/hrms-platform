package com.hrms.modules.leave.repository;

import com.hrms.enums.LeaveType;
import com.hrms.modules.leave.entity.LeavePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeavePolicyRepository extends JpaRepository<LeavePolicy, Long> {
    List<LeavePolicy> findByTenantIdAndIsActiveTrue(String tenantId);
    Optional<LeavePolicy> findByTenantIdAndLeaveType(String tenantId, LeaveType leaveType);
}
