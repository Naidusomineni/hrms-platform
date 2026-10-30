package com.hrms.modules.leave.repository;

import com.hrms.enums.LeaveType;
import com.hrms.modules.leave.entity.EmployeeLeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeLeaveBalanceRepository extends JpaRepository<EmployeeLeaveBalance, Long> {
    List<EmployeeLeaveBalance> findByEmployeeIdAndYear(Long employeeId, Integer year);
    Optional<EmployeeLeaveBalance> findByEmployeeIdAndLeaveTypeAndYear(Long employeeId, LeaveType leaveType, Integer year);
    List<EmployeeLeaveBalance> findByTenantIdAndYear(String tenantId, Integer year);
}
