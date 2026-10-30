package com.hrms.modules.attendance.repository;

import com.hrms.modules.attendance.entity.AttendanceRegularization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRegularizationRepository extends JpaRepository<AttendanceRegularization, Long> {
    Page<AttendanceRegularization> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId, Pageable pageable);
    Page<AttendanceRegularization> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    List<AttendanceRegularization> findByTenantIdAndStatus(String tenantId, String status);
}
