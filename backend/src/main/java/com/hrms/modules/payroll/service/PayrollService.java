package com.hrms.modules.payroll.service;

import com.hrms.entity.*;
import com.hrms.enums.PayrollStatus;
import com.hrms.exception.*;
import com.hrms.modules.payroll.dto.BankDisbursementDto;
import com.hrms.modules.payroll.dto.PayrollAdjustmentRequest;
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

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class PayrollService {

    private final PayrollSlipRepository payrollSlipRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final EmailService emailService;
    private final com.hrms.modules.expense.service.ExpenseService expenseService;
    private final com.hrms.common.audit.AuditService auditService;
    private final TenantSettingRepository tenantSettingRepository;

    public PayrollSlip process(Long empId, int month, int year) {
        if (payrollSlipRepository.findByEmployeeIdAndMonthAndYear(empId, month, year).isPresent())
            throw new DuplicateResourceException("Payroll already calculated for this employee and period");

        Employee emp = employeeRepository.findById(empId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", empId));
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

        String tenantId = TenantContext.getTenantId();
        String currency = "INR";
        if (tenantId != null && tenantSettingRepository != null) {
            currency = tenantSettingRepository.findByTenantIdAndConfigKey(tenantId, "CURRENCY_CODE")
                    .map(TenantSetting::getConfigValue)
                    .orElse("INR");
        }

        // Initial creation in DRAFT state for HR review
        PayrollSlip slip = PayrollSlip.builder()
            .employee(emp).month(month).year(year)
            .currency(currency)
            .basicSalary(basic).hra(hra).specialAllowance(special)
            .grossSalary(earned).pfDeduction(pf).professionalTax(pt)
            .incomeTax(tds).totalDeductions(totalDeductions).netSalary(netSalary)
            .workingDays(workingDays).presentDays(effectivePresentDays).leaveDays(workingDays - effectivePresentDays)
            .bonus(BigDecimal.ZERO).overtimeAmount(BigDecimal.ZERO).deductionsAdjustment(BigDecimal.ZERO)
            .status(PayrollStatus.DRAFT).processedAt(LocalDateTime.now())
            .build();

        slip = payrollSlipRepository.save(slip);

        // Auto-sync approved pending expense claims into this payroll run
        BigDecimal reimbursements = expenseService.disburseClaimsForPayroll(empId, slip);
        if (reimbursements != null && reimbursements.compareTo(BigDecimal.ZERO) > 0) {
            netSalary = netSalary.add(reimbursements);
            slip.setReimbursements(reimbursements);
            slip.setNetSalary(netSalary);
            slip = payrollSlipRepository.save(slip);
            log.info("Attached ₹{} reimbursements to draft payroll slip #{}", reimbursements, slip.getId());
        }

        log.info("Draft payroll calculated: empId={}, month={}/{}, net={}", empId, month, year, netSalary);
        return slip;
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
                // If slip exists in DRAFT, delete and reprocess to ensure up-to-date calculation
                payrollSlipRepository.findByEmployeeIdAndMonthAndYear(emp.getId(), month, year)
                    .ifPresent(existing -> {
                        if (existing.getStatus() == PayrollStatus.DRAFT || existing.getStatus() == PayrollStatus.PROCESSED) {
                            payrollSlipRepository.delete(existing);
                        }
                    });
                process(emp.getId(), month, year);
                processed++;
            } catch (Exception e) {
                log.warn("Failed to process draft payroll for employee {}: {}", emp.getId(), e.getMessage());
                skipped++;
            }
        }

        BigDecimal totalDraftNet = payrollSlipRepository.findByTenantIdAndMonthAndYear(tenantId, month, year).stream()
            .map(PayrollSlip::getNetSalary)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new HashMap<>();
        result.put("totalActive", activeEmployees.size());
        result.put("processed", processed);
        result.put("processedCount", processed);
        result.put("skipped", skipped);
        result.put("totalNetDisbursed", totalDraftNet);
        result.put("month", month);
        result.put("year", year);
        log.info("Batch draft payroll calculated: {} processed, {} skipped, totalDraftNet={} for month={}/{}",
            processed, skipped, totalDraftNet, month, year);
        auditService.log("PAYROLL_GENERATED", "PAYROLL", null,
            "Generated payroll run for " + month + "/" + year + ": " + processed + " slips calculated (Total: ₹" + totalDraftNet + ")");
        return result;
    }

    public PayrollSlip adjust(Long slipId, PayrollAdjustmentRequest request, String hrEmail) {
        PayrollSlip slip = payrollSlipRepository.findById(slipId)
            .orElseThrow(() -> new ResourceNotFoundException("PayrollSlip", "id", slipId));

        if (slip.getStatus() == PayrollStatus.PAID) {
            throw new BadRequestException("Cannot adjust a payroll slip that has already been paid/disbursed");
        }

        if (request.getPresentDays() != null) {
            int workingDays = slip.getWorkingDays() != null ? slip.getWorkingDays() : 22;
            int present = Math.max(0, Math.min(workingDays, request.getPresentDays()));
            slip.setPresentDays(present);
            slip.setLeaveDays(workingDays - present);
        }

        if (request.getBonus() != null) {
            slip.setBonus(request.getBonus().max(BigDecimal.ZERO));
        }
        if (request.getOvertimeAmount() != null) {
            slip.setOvertimeAmount(request.getOvertimeAmount().max(BigDecimal.ZERO));
        }
        if (request.getDeductionsAdjustment() != null) {
            slip.setDeductionsAdjustment(request.getDeductionsAdjustment().max(BigDecimal.ZERO));
        }
        if (request.getBasicSalary() != null) {
            slip.setBasicSalary(request.getBasicSalary().max(BigDecimal.ZERO));
        }
        if (request.getHra() != null) {
            slip.setHra(request.getHra().max(BigDecimal.ZERO));
        }
        if (request.getSpecialAllowance() != null) {
            slip.setSpecialAllowance(request.getSpecialAllowance().max(BigDecimal.ZERO));
        }
        if (request.getPfDeduction() != null) {
            slip.setPfDeduction(request.getPfDeduction().max(BigDecimal.ZERO));
        }
        if (request.getIncomeTax() != null) {
            slip.setIncomeTax(request.getIncomeTax().max(BigDecimal.ZERO));
        }
        if (request.getHrRemarks() != null && !request.getHrRemarks().isBlank()) {
            slip.setHrRemarks(request.getHrRemarks().trim());
        }

        slip.setAdjustedBy(hrEmail);
        slip.setAdjustedAt(LocalDateTime.now());

        // Recalculate Gross Salary
        BigDecimal basic = slip.getBasicSalary() != null ? slip.getBasicSalary() : BigDecimal.ZERO;
        BigDecimal hra = slip.getHra() != null ? slip.getHra() : BigDecimal.ZERO;
        BigDecimal special = slip.getSpecialAllowance() != null ? slip.getSpecialAllowance() : BigDecimal.ZERO;
        BigDecimal otherAllowances = slip.getOtherAllowances() != null ? slip.getOtherAllowances() : BigDecimal.ZERO;
        BigDecimal bonus = slip.getBonus() != null ? slip.getBonus() : BigDecimal.ZERO;
        BigDecimal overtime = slip.getOvertimeAmount() != null ? slip.getOvertimeAmount() : BigDecimal.ZERO;

        BigDecimal gross = basic.add(hra).add(special).add(otherAllowances).add(bonus).add(overtime);
        slip.setGrossSalary(gross);

        // Recalculate Total Deductions
        BigDecimal pf = slip.getPfDeduction() != null ? slip.getPfDeduction() : BigDecimal.ZERO;
        BigDecimal pt = slip.getProfessionalTax() != null ? slip.getProfessionalTax() : BigDecimal.ZERO;
        BigDecimal it = slip.getIncomeTax() != null ? slip.getIncomeTax() : BigDecimal.ZERO;
        BigDecimal otherDed = slip.getOtherDeductions() != null ? slip.getOtherDeductions() : BigDecimal.ZERO;
        BigDecimal dedAdj = slip.getDeductionsAdjustment() != null ? slip.getDeductionsAdjustment() : BigDecimal.ZERO;

        BigDecimal totalDed = pf.add(pt).add(it).add(otherDed).add(dedAdj);
        slip.setTotalDeductions(totalDed);

        // Recalculate Net Salary
        BigDecimal reimbursements = slip.getReimbursements() != null ? slip.getReimbursements() : BigDecimal.ZERO;
        BigDecimal net = gross.subtract(totalDed).add(reimbursements);
        slip.setNetSalary(net.max(BigDecimal.ZERO));

        if (Boolean.TRUE.equals(request.getApproveImmediately())) {
            slip.setStatus(PayrollStatus.APPROVED);
            slip = payrollSlipRepository.save(slip);
            sendPayrollEmail(slip);
        } else {
            if (slip.getStatus() != PayrollStatus.APPROVED) {
                slip.setStatus(PayrollStatus.DRAFT);
            }
            slip = payrollSlipRepository.save(slip);
        }

        log.info("Payroll slip #{} adjusted by {}: netSalary={}, remarks={}",
            slip.getId(), hrEmail, slip.getNetSalary(), slip.getHrRemarks());
        auditService.log("PAYROLL_SLIP_ADJUSTED", "PAYROLL", slip.getId(),
            "Adjusted payroll for " + slip.getEmployee().getFullName() + " (Period: " + slip.getMonth() + "/" + slip.getYear() + ", Net: ₹" + slip.getNetSalary() + ", Remarks: " + slip.getHrRemarks() + ")");
        return slip;
    }

    public PayrollSlip approve(Long slipId, String approverEmail) {
        PayrollSlip slip = payrollSlipRepository.findById(slipId)
            .orElseThrow(() -> new ResourceNotFoundException("PayrollSlip", "id", slipId));
        if (slip.getStatus() == PayrollStatus.PAID) {
            return slip;
        }
        slip.setStatus(PayrollStatus.APPROVED);
        slip = payrollSlipRepository.save(slip);
        sendPayrollEmail(slip);
        log.info("Payroll slip #{} approved by {}", slipId, approverEmail);
        auditService.log("PAYROLL_SLIP_APPROVED", "PAYROLL", slip.getId(),
            "Approved payslip for " + slip.getEmployee().getFullName() + " (Period: " + slip.getMonth() + "/" + slip.getYear() + ", Net: ₹" + slip.getNetSalary() + ")");
        return slip;
    }

    public Map<String, Object> approveAll(int month, int year, String approverEmail) {
        String tenantId = TenantContext.getTenantId();
        List<PayrollSlip> slips = payrollSlipRepository.findByTenantIdAndMonthAndYear(tenantId, month, year);
        int approvedCount = 0;
        BigDecimal totalNet = BigDecimal.ZERO;

        for (PayrollSlip slip : slips) {
            if (slip.getStatus() == PayrollStatus.DRAFT || slip.getStatus() == PayrollStatus.PROCESSED) {
                slip.setStatus(PayrollStatus.APPROVED);
                payrollSlipRepository.save(slip);
                sendPayrollEmail(slip);
                approvedCount++;
            }
            if (slip.getNetSalary() != null) {
                totalNet = totalNet.add(slip.getNetSalary());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("approvedCount", approvedCount);
        result.put("totalNetDisbursed", totalNet);
        result.put("month", month);
        result.put("year", year);
        log.info("Batch payroll approved: {} slips finalized for month={}/{} by {}", approvedCount, month, year, approverEmail);
        auditService.log("PAYROLL_BATCH_APPROVED", "PAYROLL", null,
            "Approved " + approvedCount + " payroll slips for period " + month + "/" + year + " (Total: ₹" + totalNet + ")");
        return result;
    }

    public Map<String, Object> markBatchPaid(int month, int year, String paymentRef) {
        String tenantId = TenantContext.getTenantId();
        List<PayrollSlip> slips = payrollSlipRepository.findByTenantIdAndMonthAndYear(tenantId, month, year);
        int marked = 0;
        for (PayrollSlip slip : slips) {
            if (slip.getStatus() == PayrollStatus.APPROVED) {
                slip.setStatus(PayrollStatus.PAID);
                slip.setPaidAt(LocalDateTime.now());
                if (paymentRef != null && !paymentRef.isBlank()) {
                    slip.setPaymentReference(paymentRef);
                }
                payrollSlipRepository.save(slip);
                marked++;
            }
        }
        Map<String, Object> res = new HashMap<>();
        res.put("markedPaidCount", marked);
        res.put("month", month);
        res.put("year", year);
        auditService.log("PAYROLL_BATCH_PAID", "PAYROLL", null,
            "Marked " + marked + " payroll slips as PAID for period " + month + "/" + year + (paymentRef != null ? " (Ref: " + paymentRef + ")" : ""));
        return res;
    }

    @Transactional(readOnly = true)
    public Page<PayrollSlip> getPayrollRegister(int month, int year, PayrollStatus status, String search, Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        boolean hasSearch = (search != null && !search.trim().isEmpty());
        String q = hasSearch ? search.trim().toLowerCase() : "";

        if (status != null && hasSearch) {
            return payrollSlipRepository.findByTenantPeriodStatusAndSearch(tenantId, month, year, status, q, pageable);
        } else if (status != null) {
            return payrollSlipRepository.findByTenantIdAndMonthAndYearAndStatus(tenantId, month, year, status, pageable);
        } else if (hasSearch) {
            return payrollSlipRepository.findByTenantPeriodAndSearch(tenantId, month, year, q, pageable);
        } else {
            return payrollSlipRepository.findByTenantIdAndMonthAndYear(tenantId, month, year, pageable);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSummary(int month, int year) {
        String tenantId = TenantContext.getTenantId();
        List<PayrollSlip> slips = payrollSlipRepository.findByTenantIdAndMonthAndYear(tenantId, month, year);

        int totalCount = slips.size();
        int draftCount = 0;
        BigDecimal draftNet = BigDecimal.ZERO;
        int approvedCount = 0;
        BigDecimal approvedNet = BigDecimal.ZERO;
        int paidCount = 0;
        BigDecimal paidNet = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;

        for (PayrollSlip slip : slips) {
            BigDecimal net = slip.getNetSalary() != null ? slip.getNetSalary() : BigDecimal.ZERO;
            totalNet = totalNet.add(net);
            if (slip.getStatus() == PayrollStatus.DRAFT || slip.getStatus() == PayrollStatus.PROCESSED) {
                draftCount++;
                draftNet = draftNet.add(net);
            } else if (slip.getStatus() == PayrollStatus.APPROVED) {
                approvedCount++;
                approvedNet = approvedNet.add(net);
            } else if (slip.getStatus() == PayrollStatus.PAID) {
                paidCount++;
                paidNet = paidNet.add(net);
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("month", month);
        summary.put("year", year);
        summary.put("totalCount", totalCount);
        summary.put("draftCount", draftCount);
        summary.put("draftNet", draftNet);
        summary.put("approvedCount", approvedCount);
        summary.put("approvedNet", approvedNet);
        summary.put("paidCount", paidCount);
        summary.put("paidNet", paidNet);
        summary.put("totalNet", totalNet);
        return summary;
    }

    @Transactional(readOnly = true)
    public Page<PayrollSlip> getSlipsForEmployee(Long empId, Pageable pageable, boolean isHrOrAdmin) {
        if (!isHrOrAdmin) {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                Employee callerEmp = employeeRepository.findByEmail(auth.getName()).orElse(null);
                if (callerEmp == null || !callerEmp.getId().equals(empId)) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You can only view your own payslips.");
                }
            }
        }
        if (isHrOrAdmin) {
            return payrollSlipRepository.findByEmployeeIdOrderByYearDescMonthDesc(empId, pageable);
        } else {
            return payrollSlipRepository.findByEmployeeIdAndStatusInOrderByYearDescMonthDesc(
                empId, List.of(PayrollStatus.APPROVED, PayrollStatus.PAID), pageable);
        }
    }

    @Transactional(readOnly = true)
    public Optional<PayrollSlip> getSlip(Long empId, int month, int year) {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            boolean isHrOrAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_HR") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isHrOrAdmin) {
                Employee callerEmp = employeeRepository.findByEmail(auth.getName()).orElse(null);
                if (callerEmp == null || !callerEmp.getId().equals(empId)) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You can only view your own payslip.");
                }
            }
        }
        return payrollSlipRepository.findByEmployeeIdAndMonthAndYear(empId, month, year);
    }

    @Transactional(readOnly = true)
    public List<BankDisbursementDto> getBankBatchDisbursements(int month, int year) {
        String tenantId = TenantContext.getTenantId();
        String tenantCurrency = "INR";
        if (tenantId != null && tenantSettingRepository != null) {
            tenantCurrency = tenantSettingRepository.findByTenantIdAndConfigKey(tenantId, "CURRENCY_CODE")
                    .map(TenantSetting::getConfigValue)
                    .orElse("INR");
        }
        List<PayrollSlip> slips = payrollSlipRepository.findByTenantIdAndMonthAndYear(tenantId, month, year);
        List<BankDisbursementDto> list = new ArrayList<>();
        for (PayrollSlip slip : slips) {
            // Exclude failed slips
            if (slip.getStatus() == PayrollStatus.FAILED) {
                continue;
            }
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

            list.add(BankDisbursementDto.builder()
                .employeeNumber(emp.getEmployeeNumber())
                .employeeName(emp.getFullName())
                .bankAccountNumber(accNo)
                .bankName(bankName)
                .ifscCode(ifsc)
                .netSalary(slip.getNetSalary())
                .currency(slip.getCurrency() != null ? slip.getCurrency() : tenantCurrency)
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
        return generateBankBatchCsv(month, year, false);
    }

    @Transactional(readOnly = true)
    public String generateBankBatchCsv(int month, int year, boolean masked) {
        List<BankDisbursementDto> items = getBankBatchDisbursements(month, year);
        StringBuilder sb = new StringBuilder();
        sb.append("SrNo,EmployeeNumber,BeneficiaryName,AccountNumber,IFSCCode,BankName,Amount,Currency,PaymentType,Narration\n");
        int count = 1;
        for (BankDisbursementDto item : items) {
            String accNo = masked ? maskAccountNumber(item.getBankAccountNumber()) : item.getBankAccountNumber();
            String curr = item.getCurrency() != null ? item.getCurrency() : "INR";
            sb.append(count++).append(",")
              .append("\"").append(item.getEmployeeNumber()).append("\",")
              .append("\"").append(item.getEmployeeName()).append("\",")
              .append("\"").append(accNo).append("\",")
              .append("\"").append(item.getIfscCode()).append("\",")
              .append("\"").append(item.getBankName()).append("\",")
              .append(item.getNetSalary() != null ? item.getNetSalary().toPlainString() : "0.00").append(",")
              .append("\"").append(curr).append("\",")
              .append(item.getPaymentType()).append(",")
              .append("\"").append(item.getNarration()).append("\"\n");
        }
        auditService.log("PAYROLL_BANK_EXPORT", "PAYROLL", null,
            "Exported NEFT/RTGS bank disbursement batch CSV for period " + month + "/" + year + " (" + items.size() + " records, masked=" + masked + ")");
        return sb.toString();
    }

    private String maskAccountNumber(String acc) {
        if (acc == null || acc.isBlank() || "PENDING_UPDATE".equalsIgnoreCase(acc)) {
            return "PENDING_UPDATE";
        }
        if (acc.length() <= 4) {
            return "••••••••";
        }
        return "••••••••" + acc.substring(acc.length() - 4);
    }

    private void sendPayrollEmail(PayrollSlip slip) {
        try {
            Employee emp = slip.getEmployee();
            if (emp != null && emp.getEmail() != null) {
                String[] monthNames = {"","January","February","March","April","May","June",
                                       "July","August","September","October","November","December"};
                int m = (slip.getMonth() != null && slip.getMonth() >= 1 && slip.getMonth() <= 12) ? slip.getMonth() : 1;
                String netStr = (slip.getNetSalary() != null) ? "₹ " + slip.getNetSalary().toPlainString() : "₹ 0.00";
                emailService.sendPayrollProcessedEmail(
                    emp.getEmail(), emp.getFirstName(), monthNames[m], String.valueOf(slip.getYear()),
                    netStr
                );
            }
        } catch (Exception e) {
            log.warn("Failed to send payroll notification email for slip #{}: {}", slip.getId(), e.getMessage());
        }
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
        if (monthlySalary.compareTo(new BigDecimal("15000")) < 0) return BigDecimal.ZERO;
        if (monthlySalary.compareTo(new BigDecimal("20000")) < 0) return new BigDecimal("150");
        return new BigDecimal("200");
    }
}
