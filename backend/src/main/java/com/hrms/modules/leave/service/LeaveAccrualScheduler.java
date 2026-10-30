package com.hrms.modules.leave.service;

import com.hrms.entity.Employee;
import com.hrms.entity.Tenant;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.leave.entity.EmployeeLeaveBalance;
import com.hrms.modules.leave.entity.LeavePolicy;
import com.hrms.modules.leave.repository.EmployeeLeaveBalanceRepository;
import com.hrms.modules.leave.repository.LeavePolicyRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service @Slf4j @RequiredArgsConstructor
public class LeaveAccrualScheduler {

    private final TenantRepository tenantRepository;
    private final EmployeeRepository employeeRepository;
    private final LeavePolicyRepository policyRepository;
    private final EmployeeLeaveBalanceRepository balanceRepository;

    /**
     * Automated monthly leave accrual runs at 1:00 AM on the 1st day of every month.
     */
    @Scheduled(cron = "0 0 1 1 * ?")
    @Transactional
    public void runMonthlyAccrual() {
        log.info("Starting automated monthly leave accrual scheduler...");
        List<Tenant> tenants = tenantRepository.findAll();
        int currentYear = LocalDate.now().getYear();

        for (Tenant tenant : tenants) {
            TenantContext.runWithTenant(tenant.getId(), () -> {
                accrueForTenant(tenant.getId(), currentYear);
            });
        }
        log.info("Automated monthly leave accrual completed for {} tenants.", tenants.size());
    }

    /**
     * Manual trigger for tenant administrators.
     */
    @Transactional
    public int triggerMonthlyAccrualManual(String tenantId) {
        int currentYear = LocalDate.now().getYear();
        return accrueForTenant(tenantId, currentYear);
    }

    private int accrueForTenant(String tenantId, int year) {
        List<LeavePolicy> policies = policyRepository.findByTenantIdAndIsActiveTrue(tenantId);
        List<Employee> employees = employeeRepository.findByTenantId(tenantId);

        int count = 0;
        for (Employee emp : employees) {
            for (LeavePolicy policy : policies) {
                if (policy.getMonthlyAccrualRate().compareTo(BigDecimal.ZERO) > 0) {
                    EmployeeLeaveBalance balance = balanceRepository
                            .findByEmployeeIdAndLeaveTypeAndYear(emp.getId(), policy.getLeaveType(), year)
                            .orElse(EmployeeLeaveBalance.builder()
                                    .employee(emp)
                                    .leaveType(policy.getLeaveType())
                                    .allocatedDays(BigDecimal.ZERO)
                                    .usedDays(BigDecimal.ZERO)
                                    .pendingDays(BigDecimal.ZERO)
                                    .balanceDays(BigDecimal.ZERO)
                                    .year(year)
                                    .build());

                    BigDecimal newAllocated = balance.getAllocatedDays().add(policy.getMonthlyAccrualRate());
                    BigDecimal newBalance = balance.getBalanceDays().add(policy.getMonthlyAccrualRate());

                    balance.setAllocatedDays(newAllocated);
                    balance.setBalanceDays(newBalance);
                    balanceRepository.save(balance);
                    count++;
                }
            }
        }
        log.info("Monthly accrual processed: tenantId={}, balanceRecordsUpdated={}", tenantId, count);
        return count;
    }

    /**
     * Year-end rollover scheduler runs at midnight on January 1st.
     * Evaluates previous year unused balances and applies maximum carry-over limits.
     */
    @Scheduled(cron = "0 0 0 1 1 ?")
    @Transactional
    public void runYearEndRollover() {
        log.info("Starting automated year-end leave balance rollover...");
        int prevYear = LocalDate.now().getYear() - 1;
        int newYear = LocalDate.now().getYear();

        List<Tenant> tenants = tenantRepository.findAll();
        for (Tenant tenant : tenants) {
            TenantContext.runWithTenant(tenant.getId(), () -> {
                List<LeavePolicy> policies = policyRepository.findByTenantIdAndIsActiveTrue(tenant.getId());
                List<Employee> employees = employeeRepository.findByTenantId(tenant.getId());

                for (Employee emp : employees) {
                    for (LeavePolicy policy : policies) {
                        balanceRepository.findByEmployeeIdAndLeaveTypeAndYear(emp.getId(), policy.getLeaveType(), prevYear)
                                .ifPresent(oldBal -> {
                                    BigDecimal carryOver = oldBal.getBalanceDays().min(policy.getMaxCarryOver());
                                    if (carryOver.compareTo(BigDecimal.ZERO) < 0) carryOver = BigDecimal.ZERO;

                                    EmployeeLeaveBalance newBal = EmployeeLeaveBalance.builder()
                                            .employee(emp)
                                            .leaveType(policy.getLeaveType())
                                            .allocatedDays(policy.getAnnualAllowance().add(carryOver))
                                            .usedDays(BigDecimal.ZERO)
                                            .pendingDays(BigDecimal.ZERO)
                                            .balanceDays(policy.getAnnualAllowance().add(carryOver))
                                            .year(newYear)
                                            .build();
                                    balanceRepository.save(newBal);
                                });
                    }
                }
            });
        }
        log.info("Year-end rollover complete.");
    }
}
