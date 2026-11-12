package com.hrms.modules.attendance.repository;

import com.hrms.modules.attendance.entity.PolicyAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyAssignmentRepository extends JpaRepository<PolicyAssignment, Long> {
    
    List<PolicyAssignment> findByTenantIdAndPolicyType(String tenantId, String policyType);

    Optional<PolicyAssignment> findByTenantIdAndPolicyTypeAndEmployeeId(String tenantId, String policyType, Long employeeId);

    Optional<PolicyAssignment> findByTenantIdAndPolicyTypeAndDepartmentId(String tenantId, String policyType, Long departmentId);

    Optional<PolicyAssignment> findByTenantIdAndPolicyTypeAndOfficeLocationId(String tenantId, String policyType, Long officeLocationId);

    @Query("SELECT pa FROM PolicyAssignment pa WHERE pa.tenantId = :tenantId AND pa.policyType = :policyType AND pa.priorityLevel = 4")
    Optional<PolicyAssignment> findTenantDefault(@Param("tenantId") String tenantId, @Param("policyType") String policyType);

    void deleteByTenantIdAndPolicyTypeAndEmployeeId(String tenantId, String policyType, Long employeeId);
    void deleteByTenantIdAndPolicyTypeAndDepartmentId(String tenantId, String policyType, Long departmentId);
    void deleteByTenantIdAndPolicyTypeAndOfficeLocationId(String tenantId, String policyType, Long officeLocationId);
}

