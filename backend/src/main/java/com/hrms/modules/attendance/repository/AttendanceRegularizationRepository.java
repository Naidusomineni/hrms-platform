package com.hrms.modules.attendance.repository;

import com.hrms.modules.attendance.entity.AttendanceRegularization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRegularizationRepository extends JpaRepository<AttendanceRegularization, Long> {
    Page<AttendanceRegularization> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId, Pageable pageable);
    Page<AttendanceRegularization> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    List<AttendanceRegularization> findByTenantIdAndStatus(String tenantId, String status);

    @Query("SELECT COUNT(ar) FROM AttendanceRegularization ar WHERE ar.employee.id = :empId " +
           "AND ar.date >= :startDate AND ar.date <= :endDate AND ar.status != 'REJECTED'")
    long countByEmployeeIdAndDateBetweenAndNotRejected(
            @Param("empId") Long empId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
