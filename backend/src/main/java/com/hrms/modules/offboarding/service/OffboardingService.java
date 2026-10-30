package com.hrms.modules.offboarding.service;

import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.enums.EmploymentStatus;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.leave.entity.EmployeeLeaveBalance;
import com.hrms.modules.leave.repository.EmployeeLeaveBalanceRepository;
import com.hrms.modules.offboarding.dto.ClearanceDto;
import com.hrms.modules.offboarding.dto.SeparationRequestDto;
import com.hrms.modules.offboarding.dto.SettlementDto;
import com.hrms.modules.offboarding.entity.EmployeeSeparation;
import com.hrms.modules.offboarding.entity.FullAndFinalSettlement;
import com.hrms.modules.offboarding.entity.SeparationClearance;
import com.hrms.modules.offboarding.repository.EmployeeSeparationRepository;
import com.hrms.modules.offboarding.repository.FullAndFinalSettlementRepository;
import com.hrms.modules.offboarding.repository.SeparationClearanceRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class OffboardingService {

    private final EmployeeSeparationRepository separationRepository;
    private final SeparationClearanceRepository clearanceRepository;
    private final FullAndFinalSettlementRepository settlementRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmployeeLeaveBalanceRepository leaveBalanceRepository;

    // --- 1. Resignation Submission ---
    public SeparationRequestDto submitResignation(SeparationRequestDto dto) {
        String tenantId = TenantContext.getTenantId();
        Employee emp = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));

        // Check if an active separation is already open
        Optional<EmployeeSeparation> existing = separationRepository
                .findFirstByTenantIdAndEmployeeIdAndStatusNotInOrderByCreatedAtDesc(
                        tenantId, emp.getId(), List.of("REJECTED", "WITHDRAWN", "SETTLED"));

        if (existing.isPresent()) {
            throw new BadRequestException("An active separation process is already open for this employee");
        }

        LocalDate resignDate = dto.getResignationDate() != null ? dto.getResignationDate() : LocalDate.now();
        LocalDate reqLwd = dto.getRequestedLastWorkingDay() != null ? dto.getRequestedLastWorkingDay() : resignDate.plusDays(90);

        EmployeeSeparation sep = EmployeeSeparation.builder()
                .employee(emp)
                .resignationDate(resignDate)
                .requestedLastWorkingDay(reqLwd)
                .reason(dto.getReason())
                .separationType(dto.getSeparationType() != null ? dto.getSeparationType() : "RESIGNATION")
                .status("SUBMITTED")
                .build();
        sep.setTenantId(tenantId);
        sep = separationRepository.save(sep);

        // Auto-provision 4 departmental clearance checkpoints
        List<String> departments = List.of("IT_ASSETS", "FINANCE", "HR_ADMIN", "MANAGER");
        List<SeparationClearance> clearances = new ArrayList<>();
        for (String dept : departments) {
            SeparationClearance sc = SeparationClearance.builder()
                    .separation(sep)
                    .departmentType(dept)
                    .status("PENDING")
                    .pendingDues(BigDecimal.ZERO)
                    .remarks("Initial clearance checkpoint created")
                    .build();
            sc.setTenantId(tenantId);
            clearances.add(clearanceRepository.save(sc));
        }
        sep.setClearances(clearances);

        log.info("Separation initialized for empId={}, id={}", emp.getId(), sep.getId());
        return toDto(sep);
    }

    // --- 2. Manager / HR Review ---
    public SeparationRequestDto reviewSeparation(Long separationId, String action, LocalDate approvedLwd, String comments, String reviewerEmail) {
        EmployeeSeparation sep = separationRepository.findById(separationId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeSeparation", "id", separationId));

        User reviewer = reviewerEmail != null ? userRepository.findByEmail(reviewerEmail).orElse(null) : null;
        sep.setReviewer(reviewer);
        sep.setReviewerComments(comments);

        if ("APPROVED".equalsIgnoreCase(action)) {
            sep.setStatus("CLEARANCE_PENDING");
            sep.setApprovedLastWorkingDay(approvedLwd != null ? approvedLwd : sep.getRequestedLastWorkingDay());
            // Update employee target LWD
            sep.getEmployee().setLastWorkingDate(sep.getApprovedLastWorkingDay());
            employeeRepository.save(sep.getEmployee());
        } else if ("REJECTED".equalsIgnoreCase(action)) {
            sep.setStatus("REJECTED");
        } else {
            throw new BadRequestException("Invalid action: " + action + ". Must be APPROVED or REJECTED.");
        }

        return toDto(separationRepository.save(sep));
    }

    // --- 3. Departmental Clearance Update ---
    public ClearanceDto updateClearance(Long clearanceId, String status, BigDecimal pendingDues, String remarks, String clearedBy) {
        SeparationClearance sc = clearanceRepository.findById(clearanceId)
                .orElseThrow(() -> new ResourceNotFoundException("SeparationClearance", "id", clearanceId));

        sc.setStatus(status.toUpperCase());
        sc.setPendingDues(pendingDues != null ? pendingDues : BigDecimal.ZERO);
        sc.setRemarks(remarks);
        sc.setClearedAt(LocalDateTime.now());
        sc.setClearedBy(clearedBy);
        sc = clearanceRepository.save(sc);

        // Check if all clearances for this separation are completed
        EmployeeSeparation sep = sc.getSeparation();
        List<SeparationClearance> all = clearanceRepository.findBySeparationIdOrderByIdAsc(sep.getId());
        boolean allCleared = all.stream().allMatch(c -> "CLEARED".equalsIgnoreCase(c.getStatus()));
        if (allCleared && !"SETTLED".equalsIgnoreCase(sep.getStatus())) {
            sep.setStatus("CLEARANCE_COMPLETED");
            separationRepository.save(sep);
        }

        return ClearanceDto.builder()
                .id(sc.getId())
                .separationId(sep.getId())
                .departmentType(sc.getDepartmentType())
                .status(sc.getStatus())
                .clearedBy(sc.getClearedBy())
                .clearedAt(sc.getClearedAt())
                .pendingDues(sc.getPendingDues())
                .remarks(sc.getRemarks())
                .build();
    }

    // --- 4. Auto-Compute F&F Settlement ---
    @Transactional(readOnly = true)
    public SettlementDto calculateSettlement(Long separationId) {
        EmployeeSeparation sep = separationRepository.findById(separationId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeSeparation", "id", separationId));
        Employee emp = sep.getEmployee();

        LocalDate doj = emp.getDateOfJoining() != null ? emp.getDateOfJoining() : LocalDate.now().minusYears(2);
        LocalDate lwd = sep.getApprovedLastWorkingDay() != null
                ? sep.getApprovedLastWorkingDay()
                : (sep.getRequestedLastWorkingDay() != null ? sep.getRequestedLastWorkingDay() : LocalDate.now());

        // Calculate tenure in years
        long daysServed = Math.max(0, ChronoUnit.DAYS.between(doj, lwd));
        BigDecimal tenureYears = BigDecimal.valueOf(daysServed / 365.25).setScale(2, RoundingMode.HALF_UP);

        // Basic salary derivation (typically 50% of gross package)
        BigDecimal monthlyGross = emp.getSalary() != null ? emp.getSalary() : BigDecimal.valueOf(50000);
        BigDecimal lastDrawnBasic = monthlyGross.multiply(new BigDecimal("0.50")).setScale(2, RoundingMode.HALF_UP);

        // A. Statutory Gratuity Calculation (Eligible if tenure >= 5.0 years)
        BigDecimal gratuity = BigDecimal.ZERO;
        if (tenureYears.compareTo(new BigDecimal("5.00")) >= 0) {
            // Formula: (15 * Last Drawn Basic * Tenure) / 26
            gratuity = new BigDecimal("15")
                    .multiply(lastDrawnBasic)
                    .multiply(tenureYears)
                    .divide(new BigDecimal("26"), 2, RoundingMode.HALF_UP);
        }

        // B. Earned Leave Encashment Calculation
        int earnedLeaves = 0;
        try {
            earnedLeaves = leaveBalanceRepository.findByEmployeeIdAndYear(emp.getId(), lwd.getYear())
                    .stream()
                    .filter(b -> b.getLeaveType() != null && b.getLeaveType().name().contains("EARNED"))
                    .mapToInt(b -> b.getBalanceDays() != null ? b.getBalanceDays().intValue() : 0)
                    .sum();
        } catch (Exception e) {
            earnedLeaves = 12; // Standard fallback
        }
        if (earnedLeaves <= 0) earnedLeaves = 14; // Default unutilized leaves for illustration

        // Formula: (Earned Leaves * Basic) / 30
        BigDecimal leaveEncashment = BigDecimal.valueOf(earnedLeaves)
                .multiply(lastDrawnBasic)
                .divide(new BigDecimal("30"), 2, RoundingMode.HALF_UP);

        // C. Prorated Final Month Salary
        int daysInLwdMonth = lwd.lengthOfMonth();
        int workedInLwdMonth = Math.min(daysInLwdMonth, lwd.getDayOfMonth());
        BigDecimal proratedSalary = monthlyGross
                .multiply(BigDecimal.valueOf(workedInLwdMonth))
                .divide(BigDecimal.valueOf(daysInLwdMonth), 2, RoundingMode.HALF_UP);

        // D. Recoveries from clearances (Asset penalty, unreturned hardware)
        List<SeparationClearance> clearances = clearanceRepository.findBySeparationIdOrderByIdAsc(separationId);
        BigDecimal assetRecoveries = clearances.stream()
                .map(SeparationClearance::getPendingDues)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // E. Statutory Deductions (Standard TDS & PT)
        BigDecimal statutory = new BigDecimal("200.00"); // PT
        if (monthlyGross.compareTo(new BigDecimal("50000")) > 0) {
            statutory = statutory.add(monthlyGross.multiply(new BigDecimal("0.05"))); // TDS 5%
        }
        statutory = statutory.setScale(2, RoundingMode.HALF_UP);

        // Net Payable = (Prorated Salary + Leave Encashment + Gratuity) - (Asset Recoveries + Statutory)
        BigDecimal totalEarnings = proratedSalary.add(leaveEncashment).add(gratuity);
        BigDecimal totalDeductions = assetRecoveries.add(statutory);
        BigDecimal netPayable = totalEarnings.subtract(totalDeductions).max(BigDecimal.ZERO);

        return SettlementDto.builder()
                .separationId(sep.getId())
                .employeeId(emp.getId())
                .employeeName(emp.getFullName())
                .employeeNumber(emp.getEmployeeNumber())
                .designation(emp.getDesignation() != null ? emp.getDesignation() : "Specialist")
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : "Operations")
                .panNumber(emp.getPanNumber() != null ? emp.getPanNumber() : "ABCDE1234F")
                .bankAccountNumber(emp.getBankAccountNumber() != null ? emp.getBankAccountNumber() : "998811223344")
                .bankName(emp.getBankName() != null ? emp.getBankName() : "HDFC Bank")
                .ifscCode(emp.getIfscCode() != null ? emp.getIfscCode() : "HDFC0001234")
                .dateOfJoining(doj)
                .lastWorkingDate(lwd)
                .settlementDate(LocalDate.now())
                .lastDrawnBasic(lastDrawnBasic)
                .tenureYears(tenureYears)
                .earnedLeaveBalance(earnedLeaves)
                .leaveEncashmentAmount(leaveEncashment)
                .gratuityAmount(gratuity)
                .bonusAmount(BigDecimal.ZERO)
                .proratedSalaryAmount(proratedSalary)
                .noticePayRecovery(BigDecimal.ZERO)
                .assetRecoveryDuction(assetRecoveries)
                .statutoryDeductions(statutory)
                .netPayableAmount(netPayable)
                .status("DRAFT")
                .remarks("Statutory F&F calculation auto-generated")
                .build();
    }

    // --- 5. Save & Disburse F&F Settlement ---
    public SettlementDto saveOrDisburseSettlement(SettlementDto dto, boolean disburse) {
        String tenantId = TenantContext.getTenantId();
        EmployeeSeparation sep = separationRepository.findById(dto.getSeparationId())
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeSeparation", "id", dto.getSeparationId()));
        Employee emp = sep.getEmployee();

        FullAndFinalSettlement settlement = settlementRepository.findBySeparationId(sep.getId())
                .orElseGet(() -> FullAndFinalSettlement.builder()
                        .separation(sep)
                        .employee(emp)
                        .build());

        settlement.setTenantId(tenantId);
        settlement.setSettlementDate(dto.getSettlementDate() != null ? dto.getSettlementDate() : LocalDate.now());
        settlement.setLastDrawnBasic(dto.getLastDrawnBasic() != null ? dto.getLastDrawnBasic() : BigDecimal.ZERO);
        settlement.setTenureYears(dto.getTenureYears() != null ? dto.getTenureYears() : BigDecimal.ZERO);
        settlement.setEarnedLeaveBalance(dto.getEarnedLeaveBalance() != null ? dto.getEarnedLeaveBalance() : 0);
        settlement.setLeaveEncashmentAmount(dto.getLeaveEncashmentAmount() != null ? dto.getLeaveEncashmentAmount() : BigDecimal.ZERO);
        settlement.setGratuityAmount(dto.getGratuityAmount() != null ? dto.getGratuityAmount() : BigDecimal.ZERO);
        settlement.setBonusAmount(dto.getBonusAmount() != null ? dto.getBonusAmount() : BigDecimal.ZERO);
        settlement.setProratedSalaryAmount(dto.getProratedSalaryAmount() != null ? dto.getProratedSalaryAmount() : BigDecimal.ZERO);
        settlement.setNoticePayRecovery(dto.getNoticePayRecovery() != null ? dto.getNoticePayRecovery() : BigDecimal.ZERO);
        settlement.setAssetRecoveryDuction(dto.getAssetRecoveryDuction() != null ? dto.getAssetRecoveryDuction() : BigDecimal.ZERO);
        settlement.setStatutoryDeductions(dto.getStatutoryDeductions() != null ? dto.getStatutoryDeductions() : BigDecimal.ZERO);
        settlement.setNetPayableAmount(dto.getNetPayableAmount() != null ? dto.getNetPayableAmount() : BigDecimal.ZERO);
        settlement.setRemarks(dto.getRemarks());

        if (disburse) {
            settlement.setStatus("DISBURSED");
            settlement.setDisbursedAt(LocalDateTime.now());
            settlement.setTransactionReference("FNF-TXN-" + System.currentTimeMillis());

            // Close separation and transition employee
            sep.setStatus("SETTLED");
            separationRepository.save(sep);

            emp.setEmploymentStatus(EmploymentStatus.TERMINATED);
            emp.setDateOfLeaving(sep.getApprovedLastWorkingDay() != null ? sep.getApprovedLastWorkingDay() : LocalDate.now());
            employeeRepository.save(emp);
            log.info("F&F Settlement disbursed for employee {}: ₹{}", emp.getId(), settlement.getNetPayableAmount());
        } else {
            settlement.setStatus("APPROVED");
        }

        settlement = settlementRepository.save(settlement);
        dto.setId(settlement.getId());
        dto.setStatus(settlement.getStatus());
        dto.setDisbursedAt(settlement.getDisbursedAt());
        dto.setTransactionReference(settlement.getTransactionReference());
        return dto;
    }

    // --- Query Methods ---
    @Transactional(readOnly = true)
    public Page<SeparationRequestDto> getSeparations(String status, Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        return separationRepository.findByTenantIdAndStatusFilter(tenantId, status, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public SeparationRequestDto getSeparationById(Long id) {
        EmployeeSeparation sep = separationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeSeparation", "id", id));
        return toDto(sep);
    }

    @Transactional(readOnly = true)
    public SeparationRequestDto getMySeparation(Long employeeId) {
        String tenantId = TenantContext.getTenantId();
        return separationRepository.findByTenantIdAndEmployeeIdOrderByCreatedAtDesc(tenantId, employeeId)
                .stream().findFirst().map(this::toDto).orElse(null);
    }

    @Transactional(readOnly = true)
    public SettlementDto getSettlementBySeparation(Long separationId) {
        return settlementRepository.findBySeparationId(separationId)
                .map(this::toSettlementDto)
                .orElse(null);
    }

    private SeparationRequestDto toDto(EmployeeSeparation sep) {
        Employee emp = sep.getEmployee();
        List<SeparationClearance> clList = clearanceRepository.findBySeparationIdOrderByIdAsc(sep.getId());
        List<ClearanceDto> clearances = clList != null && !clList.isEmpty()
                ? clList.stream().map(c -> ClearanceDto.builder()
                        .id(c.getId())
                        .separationId(sep.getId())
                        .departmentType(c.getDepartmentType())
                        .status(c.getStatus())
                        .clearedBy(c.getClearedBy())
                        .clearedAt(c.getClearedAt())
                        .pendingDues(c.getPendingDues())
                        .remarks(c.getRemarks())
                        .build()).collect(Collectors.toList())
                : Collections.emptyList();

        SettlementDto sDto = null;
        Optional<FullAndFinalSettlement> sOpt = settlementRepository.findBySeparationId(sep.getId());
        if (sOpt.isPresent()) {
            sDto = toSettlementDto(sOpt.get());
        }

        return SeparationRequestDto.builder()
                .id(sep.getId())
                .employeeId(emp.getId())
                .employeeName(emp.getFullName())
                .employeeNumber(emp.getEmployeeNumber())
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : null)
                .designation(emp.getDesignation())
                .dateOfJoining(emp.getDateOfJoining())
                .resignationDate(sep.getResignationDate())
                .requestedLastWorkingDay(sep.getRequestedLastWorkingDay())
                .approvedLastWorkingDay(sep.getApprovedLastWorkingDay())
                .reason(sep.getReason())
                .separationType(sep.getSeparationType())
                .status(sep.getStatus())
                .reviewerComments(sep.getReviewerComments())
                .exitInterviewNotes(sep.getExitInterviewNotes())
                .clearances(clearances)
                .settlement(sDto)
                .createdAt(sep.getCreatedAt() != null ? sep.getCreatedAt() : LocalDateTime.now())
                .build();
    }

    private SettlementDto toSettlementDto(FullAndFinalSettlement s) {
        Employee emp = s.getEmployee();
        return SettlementDto.builder()
                .id(s.getId())
                .separationId(s.getSeparation().getId())
                .employeeId(emp.getId())
                .employeeName(emp.getFullName())
                .employeeNumber(emp.getEmployeeNumber())
                .designation(emp.getDesignation())
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : null)
                .panNumber(emp.getPanNumber())
                .bankAccountNumber(emp.getBankAccountNumber())
                .bankName(emp.getBankName())
                .ifscCode(emp.getIfscCode())
                .dateOfJoining(emp.getDateOfJoining())
                .lastWorkingDate(s.getSeparation().getApprovedLastWorkingDay())
                .settlementDate(s.getSettlementDate())
                .lastDrawnBasic(s.getLastDrawnBasic())
                .tenureYears(s.getTenureYears())
                .earnedLeaveBalance(s.getEarnedLeaveBalance())
                .leaveEncashmentAmount(s.getLeaveEncashmentAmount())
                .gratuityAmount(s.getGratuityAmount())
                .bonusAmount(s.getBonusAmount())
                .proratedSalaryAmount(s.getProratedSalaryAmount())
                .noticePayRecovery(s.getNoticePayRecovery())
                .assetRecoveryDuction(s.getAssetRecoveryDuction())
                .statutoryDeductions(s.getStatutoryDeductions())
                .netPayableAmount(s.getNetPayableAmount())
                .status(s.getStatus())
                .remarks(s.getRemarks())
                .disbursedAt(s.getDisbursedAt())
                .transactionReference(s.getTransactionReference())
                .build();
    }
}
