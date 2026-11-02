package com.hrms.modules.payroll.service;

import com.hrms.entity.*;
import com.hrms.enums.PayrollStatus;
import com.hrms.exception.*;
import com.hrms.repository.*;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service @Slf4j @RequiredArgsConstructor @Transactional
public class PayrollService {

    private final PayrollSlipRepository payrollSlipRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final EmailService emailService;
    private final com.hrms.modules.expense.service.ExpenseService expenseService;

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

        // In standard MNC corporate payroll, salaried employees receive full contractual monthly salary
        // unless unapproved Loss of Pay (LOP) is recorded. When attendance logs have not been registered yet,
        // it defaults to standard monthly payable days.
        int effectivePresentDays = (presentDays > 0) ? Math.min(workingDays, presentDays) : workingDays;

        BigDecimal gross = emp.getSalary() != null && emp.getSalary().compareTo(BigDecimal.ZERO) > 0 
                ? emp.getSalary() : new BigDecimal("65000.00");
        BigDecimal perDay = gross.divide(BigDecimal.valueOf(workingDays), 2, RoundingMode.HALF_UP);
        BigDecimal earned = perDay.multiply(BigDecimal.valueOf(effectivePresentDays));

        // Salary components (MNC breakdown)
        BigDecimal basic = earned.multiply(new BigDecimal("0.50")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal hra   = earned.multiply(new BigDecimal("0.20")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal special = earned.subtract(basic).subtract(hra).setScale(2, RoundingMode.HALF_UP);

        // Statutory deductions
        BigDecimal pf  = basic.multiply(new BigDecimal("0.12")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal pt  = getProfessionalTax(earned);
        BigDecimal tds = BigDecimal.ZERO;
        if (earned.compareTo(new BigDecimal("50000")) > 0) {
            tds = earned.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal totalDeductions = pf.add(pt).add(tds);
        BigDecimal netSalary = earned.subtract(totalDeductions);

        PayrollSlip slip = PayrollSlip.builder()
            .employee(emp).month(month).year(year)
            .basicSalary(basic).hra(hra).specialAllowance(special)
            .grossSalary(earned).pfDeduction(pf).professionalTax(pt)
            .incomeTax(tds).totalDeductions(totalDeductions).netSalary(netSalary)
            .workingDays(workingDays).presentDays(effectivePresentDays).leaveDays(workingDays - effectivePresentDays)
            .status(PayrollStatus.PROCESSED).processedAt(LocalDateTime.now())
            .build();

        slip = payrollSlipRepository.save(slip);

        // Auto-sync approved pending expense claims into this payroll run
        BigDecimal reimbursements = expenseService.disburseClaimsForPayroll(empId, slip);
        if (reimbursements != null && reimbursements.compareTo(BigDecimal.ZERO) > 0) {
            netSalary = netSalary.add(reimbursements);
            slip.setReimbursements(reimbursements);
            slip.setNetSalary(netSalary);
            slip = payrollSlipRepository.save(slip);
            log.info("Attached ₹{} reimbursements to payroll slip #{}", reimbursements, slip.getId());
        }

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

    public Map<String, Object> processAll(int month, int year) {
        String tenantId = TenantContext.getTenantId();
        List<Employee> activeEmployees = employeeRepository.findByTenantId(tenantId).stream()
            .filter(e -> e.getSalary() != null && e.getSalary().compareTo(BigDecimal.ZERO) > 0)
            .collect(Collectors.toList());

        int processed = 0;
        int skipped = 0;
        for (Employee emp : activeEmployees) {
            try {
                // If slip exists, delete and reprocess to ensure up-to-date calculation
                payrollSlipRepository.findByEmployeeIdAndMonthAndYear(emp.getId(), month, year)
                    .ifPresent(payrollSlipRepository::delete);
                process(emp.getId(), month, year);
                processed++;
            } catch (Exception e) {
                log.warn("Failed to process payroll for employee {}: {}", emp.getId(), e.getMessage());
                skipped++;
            }
        }

        BigDecimal totalNetDisbursed = payrollSlipRepository.findByTenantIdAndMonthAndYear(tenantId, month, year).stream()
            .map(PayrollSlip::getNetSalary)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new HashMap<>();
        result.put("totalActive", activeEmployees.size());
        result.put("processed", processed);
        result.put("processedCount", processed);
        result.put("skipped", skipped);
        result.put("totalNetDisbursed", totalNetDisbursed);
        result.put("month", month);
        result.put("year", year);
        log.info("Batch payroll completed: {} processed, {} skipped, totalNet={} for month={}/{}",
            processed, skipped, totalNetDisbursed, month, year);
        return result;
    }

    @Transactional(readOnly = true)
    public List<com.hrms.modules.payroll.dto.BankDisbursementDto> getBankBatchDisbursements(int month, int year) {
        String tenantId = TenantContext.getTenantId();
        List<PayrollSlip> slips = payrollSlipRepository.findByTenantIdAndMonthAndYear(tenantId, month, year);
        List<com.hrms.modules.payroll.dto.BankDisbursementDto> list = new ArrayList<>();
        for (PayrollSlip slip : slips) {
            Employee emp = slip.getEmployee();
            String accNo = emp.getBankAccountNumber() != null && !emp.getBankAccountNumber().isBlank()
                ? emp.getBankAccountNumber()
                : "PENDING_UPDATE";
            String ifsc = emp.getIfscCode() != null && !emp.getIfscCode().isBlank()
                ? emp.getIfscCode()
                : "HDFC0000001";
            String bankName = emp.getBankName() != null && !emp.getBankName().isBlank()
                ? emp.getBankName()
                : "HDFC Bank";
            String pType = (slip.getNetSalary() != null && slip.getNetSalary().compareTo(new BigDecimal("200000")) >= 0)
                ? "RTGS" : "NEFT";

            list.add(com.hrms.modules.payroll.dto.BankDisbursementDto.builder()
                .employeeNumber(emp.getEmployeeNumber())
                .employeeName(emp.getFullName())
                .bankAccountNumber(accNo)
                .bankName(bankName)
                .ifscCode(ifsc)
                .netSalary(slip.getNetSalary())
                .paymentType(pType)
                .narration("SALARY_" + month + "_" + year)
                .month(month)
                .year(year)
                .build());
        }
        return list;
    }

    @Transactional(readOnly = true)
    public String generateBankBatchCsv(int month, int year) {
        List<com.hrms.modules.payroll.dto.BankDisbursementDto> items = getBankBatchDisbursements(month, year);
        StringBuilder sb = new StringBuilder();
        sb.append("SrNo,EmployeeNumber,BeneficiaryName,AccountNumber,IFSCCode,BankName,Amount,PaymentType,Narration\n");
        int count = 1;
        for (com.hrms.modules.payroll.dto.BankDisbursementDto item : items) {
            sb.append(count++).append(",")
              .append("\"").append(item.getEmployeeNumber()).append("\",")
              .append("\"").append(item.getEmployeeName()).append("\",")
              .append("\"").append(item.getBankAccountNumber()).append("\",")
              .append("\"").append(item.getIfscCode()).append("\",")
              .append("\"").append(item.getBankName()).append("\",")
              .append(item.getNetSalary() != null ? item.getNetSalary().toPlainString() : "0.00").append(",")
              .append(item.getPaymentType()).append(",")
              .append("\"").append(item.getNarration()).append("\"\n");
        }
        return sb.toString();
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
