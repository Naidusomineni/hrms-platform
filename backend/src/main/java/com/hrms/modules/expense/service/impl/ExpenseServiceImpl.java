package com.hrms.modules.expense.service.impl;

import com.hrms.entity.Employee;
import com.hrms.entity.PayrollSlip;
import com.hrms.entity.User;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.expense.dto.CreateExpenseClaimRequest;
import com.hrms.modules.expense.dto.ExpenseClaimDto;
import com.hrms.modules.expense.dto.ExpenseReviewRequest;
import com.hrms.modules.expense.entity.ExpenseClaim;
import com.hrms.modules.expense.enums.ExpenseStatus;
import com.hrms.modules.expense.repository.ExpenseClaimRepository;
import com.hrms.modules.expense.service.ExpenseService;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.UserRepository;
import com.hrms.enums.NotificationType;
import com.hrms.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseClaimRepository expenseClaimRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final com.hrms.common.audit.AuditService auditService;
    private final NotificationService notificationService;

    @Override
    public ExpenseClaimDto submitClaim(Long employeeId, CreateExpenseClaimRequest request, org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails != null) {
            boolean isElevated = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isElevated) {
                Employee employee = employeeRepository.findById(employeeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
                if (employee.getEmail() == null || !employee.getEmail().equalsIgnoreCase(userDetails.getUsername())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You can only submit expense claims for your own profile.");
                }
            }
        }
        return submitClaim(employeeId, request);
    }

    @Override
    public ExpenseClaimDto submitClaim(Long employeeId, CreateExpenseClaimRequest request) {
        String tenantId = TenantContext.getTenantId();
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        if (!tenantId.equals(employee.getTenantId())) {
            throw new BadRequestException("Cross-tenant employee claim submission is not permitted");
        }

        int year = LocalDate.now().getYear();
        String prefix = "EXP-" + year + "-";
        long count = expenseClaimRepository.countClaimsWithPrefix(tenantId, prefix + "%") + 1;
        String claimNumber = String.format("%s%04d", prefix, count);

        ExpenseClaim claim = ExpenseClaim.builder()
                .employee(employee)
                .claimNumber(claimNumber)
                .category(request.getCategory())
                .title(request.getTitle())
                .description(request.getDescription())
                .amount(request.getAmount())
                .expenseDate(request.getExpenseDate())
                .status(ExpenseStatus.SUBMITTED)
                .receiptUrl(request.getReceiptUrl())
                .receiptFilename(request.getReceiptFilename())
                .manager(employee.getManager())
                .build();
        claim.setTenantId(tenantId);

        ExpenseClaim saved = expenseClaimRepository.save(claim);

        // Dispatch in-app notification to Manager
        try {
            if (employee.getManager() != null) {
                Long managerUserId = employee.getManager().getUser() != null ? employee.getManager().getUser().getId() :
                        userRepository.findByEmail(employee.getManager().getEmail()).map(User::getId).orElse(null);
                if (managerUserId != null) {
                    notificationService.send(
                            managerUserId,
                            "Expense Claim Submitted: " + employee.getFullName(),
                            employee.getFullName() + " submitted expense claim " + claimNumber + " for ₹" + request.getAmount() + " (" + request.getTitle() + ")",
                            NotificationType.EXPENSE_SUBMITTED,
                            "/expenses"
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Failed to dispatch expense submitted notification: {}", e.getMessage());
        }

        log.info("Expense claim created: {} by employee {} (amount: ₹{})", claimNumber, employee.getEmployeeNumber(), request.getAmount());
        auditService.log("EXPENSE_SUBMITTED", "EXPENSE_CLAIM", saved.getId(),
            "Submitted claim " + claimNumber + " (₹" + request.getAmount() + " - " + request.getTitle() + ") by " + employee.getFullName());
        return mapToDto(saved);
    }

    @Override
    public ExpenseClaimDto managerReview(Long claimId, Long managerEmployeeId, ExpenseReviewRequest request) {
        String tenantId = TenantContext.getTenantId();
        ExpenseClaim claim = expenseClaimRepository.findByTenantIdAndId(tenantId, claimId)
                .orElseThrow(() -> new ResourceNotFoundException("ExpenseClaim", "id", claimId));

        if (claim.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new BadRequestException("Claim is not in SUBMITTED state for manager review");
        }

        Employee manager = null;
        if (managerEmployeeId != null) {
            manager = employeeRepository.findById(managerEmployeeId).orElse(null);
        }

        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            claim.setStatus(ExpenseStatus.MANAGER_APPROVED);
        } else {
            claim.setStatus(ExpenseStatus.REJECTED);
        }
        claim.setManager(manager);
        claim.setManagerRemarks(request.getRemarks());
        claim.setManagerReviewedAt(LocalDateTime.now());

        ExpenseClaim saved = expenseClaimRepository.save(claim);

        // Dispatch in-app notification to Employee
        try {
            Employee emp = claim.getEmployee();
            if (emp != null) {
                Long empUserId = emp.getUser() != null ? emp.getUser().getId() :
                        userRepository.findByEmail(emp.getEmail()).map(User::getId).orElse(null);
                if (empUserId != null) {
                    boolean approved = "APPROVE".equalsIgnoreCase(request.getAction());
                    notificationService.send(
                            empUserId,
                            "Expense Claim " + (approved ? "Manager Approved" : "Rejected"),
                            "Your expense claim " + claim.getClaimNumber() + " (₹" + claim.getAmount() + ") has been " + (approved ? "approved by manager" : "rejected") + (request.getRemarks() != null && !request.getRemarks().isBlank() ? ": " + request.getRemarks() : "."),
                            approved ? NotificationType.EXPENSE_APPROVED : NotificationType.EXPENSE_REJECTED,
                            "/expenses"
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Failed to dispatch expense manager review notification: {}", e.getMessage());
        }

        log.info("Expense claim {} manager review action: {}", claim.getClaimNumber(), request.getAction());
        auditService.log("EXPENSE_MANAGER_REVIEW", "EXPENSE_CLAIM", saved.getId(),
            "Manager action " + request.getAction() + " for claim " + claim.getClaimNumber() + " (₹" + claim.getAmount() + ")");
        return mapToDto(saved);
    }

    @Override
    public ExpenseClaimDto financeReview(Long claimId, Long financeUserId, ExpenseReviewRequest request) {
        String tenantId = TenantContext.getTenantId();
        ExpenseClaim claim = expenseClaimRepository.findByTenantIdAndId(tenantId, claimId)
                .orElseThrow(() -> new ResourceNotFoundException("ExpenseClaim", "id", claimId));

        if (claim.getStatus() != ExpenseStatus.MANAGER_APPROVED) {
            throw new BadRequestException("Claim must be MANAGER_APPROVED before finance review");
        }

        Employee financeReviewer = null;
        if (financeUserId != null) {
            financeReviewer = employeeRepository.findByUserId(financeUserId).orElse(null);
        }

        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            claim.setStatus(ExpenseStatus.FINANCE_APPROVED);
        } else {
            claim.setStatus(ExpenseStatus.REJECTED);
        }
        claim.setFinanceReviewer(financeReviewer);
        claim.setFinanceRemarks(request.getRemarks());
        claim.setFinanceReviewedAt(LocalDateTime.now());

        ExpenseClaim saved = expenseClaimRepository.save(claim);

        // Dispatch in-app notification to Employee
        try {
            Employee emp = claim.getEmployee();
            if (emp != null) {
                Long empUserId = emp.getUser() != null ? emp.getUser().getId() :
                        userRepository.findByEmail(emp.getEmail()).map(User::getId).orElse(null);
                if (empUserId != null) {
                    boolean approved = "APPROVE".equalsIgnoreCase(request.getAction());
                    notificationService.send(
                            empUserId,
                            "Expense Claim " + (approved ? "Finance Approved" : "Rejected"),
                            "Your expense claim " + claim.getClaimNumber() + " (₹" + claim.getAmount() + ") has been " + (approved ? "approved by Finance for payout" : "rejected") + (request.getRemarks() != null && !request.getRemarks().isBlank() ? ": " + request.getRemarks() : "."),
                            approved ? NotificationType.EXPENSE_APPROVED : NotificationType.EXPENSE_REJECTED,
                            "/expenses"
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Failed to dispatch expense finance review notification: {}", e.getMessage());
        }

        log.info("Expense claim {} finance review action: {}", claim.getClaimNumber(), request.getAction());
        auditService.log("EXPENSE_FINANCE_REVIEW", "EXPENSE_CLAIM", saved.getId(),
            "Finance action " + request.getAction() + " for claim " + claim.getClaimNumber() + " (₹" + claim.getAmount() + ")");
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ExpenseClaimDto> getMyClaims(Long employeeId, Pageable pageable, org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails != null) {
            boolean isElevated = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR") ||
                                   a.getAuthority().equals("ROLE_MANAGER") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isElevated) {
                Employee employee = employeeRepository.findById(employeeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
                if (employee.getEmail() == null || !employee.getEmail().equalsIgnoreCase(userDetails.getUsername())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You can only view your own expense claims.");
                }
            }
        }
        return getMyClaims(employeeId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ExpenseClaimDto> getMyClaims(Long employeeId, Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        return expenseClaimRepository.findByTenantIdAndEmployeeIdOrderByExpenseDateDesc(tenantId, employeeId, pageable)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ExpenseClaimDto> getClaimsByStatus(ExpenseStatus status, Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        return expenseClaimRepository.findByTenantIdAndStatusOrderByCreatedAtDesc(tenantId, status, pageable)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ExpenseClaimDto> getAllClaims(Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        return expenseClaimRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseClaimDto getClaimById(Long claimId, org.springframework.security.core.userdetails.UserDetails userDetails) {
        String tenantId = TenantContext.getTenantId();
        ExpenseClaim claim = expenseClaimRepository.findByTenantIdAndId(tenantId, claimId)
                .orElseThrow(() -> new ResourceNotFoundException("ExpenseClaim", "id", claimId));
        if (userDetails != null) {
            boolean isElevated = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR") ||
                                   a.getAuthority().equals("ROLE_MANAGER") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isElevated) {
                if (claim.getEmployee() == null || claim.getEmployee().getEmail() == null ||
                        !claim.getEmployee().getEmail().equalsIgnoreCase(userDetails.getUsername())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You do not have permission to view this expense claim.");
                }
            }
        }
        return mapToDto(claim);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseClaimDto getClaimById(Long claimId) {
        return getClaimById(claimId, null);
    }

    @Override
    public BigDecimal disburseClaimsForPayroll(Long employeeId, PayrollSlip slip) {
        String tenantId = TenantContext.getTenantId();
        List<ExpenseClaim> approvedClaims = expenseClaimRepository.findPendingClaimsForDisbursement(
                tenantId, employeeId, ExpenseStatus.FINANCE_APPROVED
        );

        if (approvedClaims.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal total = BigDecimal.ZERO;
        LocalDateTime now = LocalDateTime.now();
        for (ExpenseClaim claim : approvedClaims) {
            total = total.add(claim.getAmount());
            claim.setStatus(ExpenseStatus.DISBURSED);
            claim.setPayrollSlip(slip);
            claim.setDisbursedAt(now);
        }
        expenseClaimRepository.saveAll(approvedClaims);
        log.info("Auto-disbursed {} expense claims totaling ₹{} for employee {} into payroll slip #{}",
                approvedClaims.size(), total, employeeId, slip.getId());
        auditService.log("EXPENSE_DISBURSED_PAYROLL", "EXPENSE_CLAIM", null,
            "Auto-disbursed " + approvedClaims.size() + " claims totaling ₹" + total + " into payroll slip #" + slip.getId());
        return total;
    }

    private ExpenseClaimDto mapToDto(ExpenseClaim claim) {
        String empName = "";
        String empNumber = "";
        String deptName = "";
        if (claim.getEmployee() != null) {
            empName = claim.getEmployee().getFirstName() + " " + claim.getEmployee().getLastName();
            empNumber = claim.getEmployee().getEmployeeNumber();
            if (claim.getEmployee().getDepartment() != null) {
                deptName = claim.getEmployee().getDepartment().getName();
            }
        }

        String mgrName = null;
        if (claim.getManager() != null) {
            mgrName = claim.getManager().getFirstName() + " " + claim.getManager().getLastName();
        }

        String finName = null;
        if (claim.getFinanceReviewer() != null) {
            finName = claim.getFinanceReviewer().getFirstName() + " " + claim.getFinanceReviewer().getLastName();
        }

        return ExpenseClaimDto.builder()
                .id(claim.getId())
                .employeeId(claim.getEmployee() != null ? claim.getEmployee().getId() : null)
                .employeeName(empName)
                .employeeNumber(empNumber)
                .departmentName(deptName)
                .claimNumber(claim.getClaimNumber())
                .category(claim.getCategory())
                .title(claim.getTitle())
                .description(claim.getDescription())
                .amount(claim.getAmount())
                .expenseDate(claim.getExpenseDate())
                .status(claim.getStatus())
                .receiptUrl(claim.getReceiptUrl())
                .receiptFilename(claim.getReceiptFilename())
                .managerId(claim.getManager() != null ? claim.getManager().getId() : null)
                .managerName(mgrName)
                .managerRemarks(claim.getManagerRemarks())
                .managerReviewedAt(claim.getManagerReviewedAt())
                .financeReviewerId(claim.getFinanceReviewer() != null ? claim.getFinanceReviewer().getId() : null)
                .financeReviewerName(finName)
                .financeRemarks(claim.getFinanceRemarks())
                .financeReviewedAt(claim.getFinanceReviewedAt())
                .payrollSlipId(claim.getPayrollSlip() != null ? claim.getPayrollSlip().getId() : null)
                .disbursedAt(claim.getDisbursedAt())
                .createdAt(claim.getCreatedAt())
                .build();
    }
}
