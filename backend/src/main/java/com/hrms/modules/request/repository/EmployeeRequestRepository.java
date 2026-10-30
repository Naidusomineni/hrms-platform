package com.hrms.modules.request.repository;

import com.hrms.modules.request.entity.EmployeeRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRequestRepository extends JpaRepository<EmployeeRequest, Long> {
    Page<EmployeeRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId, Pageable pageable);
    Page<EmployeeRequest> findByTenantIdAndStatusOrderByCreatedAtDesc(String tenantId, String status, Pageable pageable);
    List<EmployeeRequest> findByEmployeeIdAndRequestType(Long employeeId, String requestType);
}
