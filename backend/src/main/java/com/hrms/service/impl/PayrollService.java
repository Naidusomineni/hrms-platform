package com.hrms.service.impl;

import com.hrms.entity.*;
import com.hrms.enums.PayrollStatus;
import com.hrms.exception.*;
import com.hrms.repository.*;
import com.hrms.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.time.*;
import java.util.*;

@Service @Slf4j @RequiredArgsConstructor @Transactional
public class PayrollService {

    private final PayrollSlipRepository payrollSlipRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final EmailService emailService;

    public PayrollSlip process(Long empId, int month, int year) {
        if (payrollSlipRepository.findByEmployeeIdAndMonthAndYear(empId, month, year).isPresent())
            throw new DuplicateResourceException("Payroll already processed for this employee and period");

        Employee emp = employeeRepository.findById(empId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee","id",empId));
        if (emp.getSalary() == null)
            throw new BadRequestException("Employee salary not configured");

        int workingDays = getWorkingDays(year, month);
        Integer presentDays = attendanceRepository.countPresentDays(empId, year, month);
        if (presentDays == null) presentDays = 0;

        BigDecimal gross = emp.getSalary();
        BigDecimal perDay = gross.divide(BigDecimal.valueOf(workingDays), 2, RoundingMode.HALF_UP);
        BigDecimal earned = perDay.multiply(BigDecimal.valueOf(presentDays));

        // Salary components (standard breakdown)
        BigDecimal basic = earned.multiply(new BigDecimal("0.50"));
        BigDecimal hra   = earned.multiply(new BigDecimal("0.20"));
        BigDecimal special = earned.subtract(basic).subtract(hra);

        // Statutory deductions
        BigDecimal pf  = basic.multiply(new BigDecimal("0.12")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal pt  = getProfessionalTax(earned);
        BigDecimal tds = BigDecimal.ZERO; // simplified — real implementation uses slab rates

        BigDecimal totalDeductions = pf.add(pt).add(tds);
        BigDecimal netSalary = earned.subtract(totalDeductions);

        PayrollSlip slip = PayrollSlip.builder()
            .employee(emp).month(month).year(year)
            .basicSalary(basic).hra(hra).specialAllowance(special)
            .grossSalary(earned).pfDeduction(pf).professionalTax(pt)
            .incomeTax(tds).totalDeductions(totalDeductions).netSalary(netSalary)
            .workingDays(workingDays).presentDays(presentDays).leaveDays(workingDays - presentDays)
            .status(PayrollStatus.PROCESSED).processedAt(LocalDateTime.now())
            .build();

        slip = payrollSlipRepository.save(slip);

        // Send email notification
        String[] monthNames = {"","January","February","March","April","May","June",
                               "July","August","September","October","November","December"};
        emailService.sendPayrollProcessedEmail(
            emp.getEmail(), emp.getFirstName(), monthNames[month], String.valueOf(year),
            "₹ " + netSalary.toPlainString()
        );

        log.info("Payroll processed: empId={}, month={}/{}, net={}", empId, month, year, netSalary);
        return slip;
    }

    @Transactional(readOnly = true)
    public Page<PayrollSlip> getSlipsForEmployee(Long empId, Pageable pageable) {
        return payrollSlipRepository.findByEmployeeIdOrderByYearDescMonthDesc(empId, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<PayrollSlip> getSlip(Long empId, int month, int year) {
        return payrollSlipRepository.findByEmployeeIdAndMonthAndYear(empId, month, year);
    }

    private int getWorkingDays(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        int count = 0;
        for (int d = 1; d <= ym.lengthOfMonth(); d++) {
            DayOfWeek dow = LocalDate.of(year, month, d).getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) count++;
        }
        return count;
    }

    private BigDecimal getProfessionalTax(BigDecimal monthlySalary) {
        // Simplified PT slab (varies by state)
        if (monthlySalary.compareTo(new BigDecimal("15000")) < 0) return BigDecimal.ZERO;
        if (monthlySalary.compareTo(new BigDecimal("20000")) < 0) return new BigDecimal("150");
        return new BigDecimal("200");
    }
}
