package com.hrms.modules.leave.service;

import com.hrms.enums.LeaveType;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.leave.dto.LeaveBalanceDto;
import com.hrms.modules.leave.dto.LeavePolicyDto;
import com.hrms.modules.leave.entity.EmployeeLeaveBalance;
import com.hrms.modules.leave.entity.LeavePolicy;
import com.hrms.modules.leave.repository.EmployeeLeaveBalanceRepository;
import com.hrms.modules.leave.repository.LeavePolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service @Slf4j @RequiredArgsConstructor @Transactional
public class LeavePolicyService {

    private final LeavePolicyRepository policyRepository;
    private final EmployeeLeaveBalanceRepository balanceRepository;

    @Transactional(readOnly = true)
    public List<LeavePolicyDto> getPolicies() {
        String tenantId = TenantContext.getTenantId();
        return policyRepository.findByTenantIdAndIsActiveTrue(tenantId).stream()
                .map(this::toPolicyDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaveBalanceDto> getEmployeeBalances(Long empId) {
        int currentYear = LocalDate.now().getYear();
        List<EmployeeLeaveBalance> balances = balanceRepository.findByEmployeeIdAndYear(empId, currentYear);
        return balances.stream().map(this::toBalanceDto).collect(Collectors.toList());
    }

    public LeavePolicyDto savePolicy(LeavePolicyDto dto) {
        String tenantId = TenantContext.getTenantId();
        LeavePolicy policy = policyRepository.findByTenantIdAndLeaveType(tenantId, dto.getLeaveType())
                .orElse(LeavePolicy.builder().leaveType(dto.getLeaveType()).build());

        policy.setAnnualAllowance(dto.getAnnualAllowance());
        policy.setMonthlyAccrualRate(dto.getMonthlyAccrualRate());
        policy.setMaxCarryOver(dto.getMaxCarryOver());
        policy.setAllowsHalfDay(dto.getAllowsHalfDay() != null ? dto.getAllowsHalfDay() : true);
        policy.setRequiresAttachment(dto.getRequiresAttachment() != null ? dto.getRequiresAttachment() : false);
        policy.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        policy = policyRepository.save(policy);
        return toPolicyDto(policy);
    }

    private LeavePolicyDto toPolicyDto(LeavePolicy p) {
        return LeavePolicyDto.builder()
                .id(p.getId())
                .leaveType(p.getLeaveType())
                .annualAllowance(p.getAnnualAllowance())
                .monthlyAccrualRate(p.getMonthlyAccrualRate())
                .maxCarryOver(p.getMaxCarryOver())
                .allowsHalfDay(p.getAllowsHalfDay())
                .requiresAttachment(p.getRequiresAttachment())
                .isActive(p.getIsActive())
                .build();
    }

    private LeaveBalanceDto toBalanceDto(EmployeeLeaveBalance b) {
        return LeaveBalanceDto.builder()
                .id(b.getId())
                .employeeId(b.getEmployee().getId())
                .leaveType(b.getLeaveType())
                .allocatedDays(b.getAllocatedDays())
                .usedDays(b.getUsedDays())
                .pendingDays(b.getPendingDays())
                .balanceDays(b.getBalanceDays())
                .year(b.getYear())
                .build();
    }
}
