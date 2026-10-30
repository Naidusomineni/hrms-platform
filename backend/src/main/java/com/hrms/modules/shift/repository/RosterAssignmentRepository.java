package com.hrms.modules.shift.repository;

import com.hrms.modules.shift.entity.RosterAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RosterAssignmentRepository extends JpaRepository<RosterAssignment, Long> {

    @Query("SELECT ra FROM RosterAssignment ra JOIN FETCH ra.shift JOIN FETCH ra.employee e LEFT JOIN FETCH e.department WHERE ra.tenantId = :tenantId AND ra.effectiveDate BETWEEN :startDate AND :endDate ORDER BY ra.effectiveDate ASC, e.firstName ASC")
    List<RosterAssignment> findRosterScheduleRange(
            @Param("tenantId") String tenantId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT ra FROM RosterAssignment ra JOIN FETCH ra.shift WHERE ra.tenantId = :tenantId AND ra.employee.id = :empId AND ra.effectiveDate BETWEEN :startDate AND :endDate ORDER BY ra.effectiveDate ASC")
    List<RosterAssignment> findEmployeeRosterRange(
            @Param("tenantId") String tenantId,
            @Param("empId") Long empId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    Optional<RosterAssignment> findByTenantIdAndEmployeeIdAndEffectiveDate(String tenantId, Long employeeId, LocalDate effectiveDate);

    Page<RosterAssignment> findByTenantIdOrderByEffectiveDateDesc(String tenantId, Pageable pageable);
}
