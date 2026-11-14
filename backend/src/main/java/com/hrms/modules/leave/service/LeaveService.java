package com.hrms.modules.leave.service;

import com.hrms.dto.request.*;
import com.hrms.dto.response.LeaveResponse;
import com.hrms.entity.*;
import com.hrms.enums.*;
import com.hrms.exception.*;
import com.hrms.repository.*;
import com.hrms.modules.leave.entity.EmployeeLeaveBalance;
import com.hrms.modules.leave.repository.EmployeeLeaveBalanceRepository;
import com.hrms.modules.workflow.service.WorkflowEngineService;
import com.hrms.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.*;
import java.util.List;
import java.util.Optional;

@Service @Slf4j @RequiredArgsConstructor @Transactional
public class LeaveService {
    private final LeaveRequestRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final EmployeeLeaveBalanceRepository balanceRepository;
    private final WorkflowEngineService workflowEngineService;
    private final com.hrms.common.audit.AuditService auditService;
    private final com.hrms.modules.notification.service.NotificationService notificationService;

    public LeaveResponse apply(Long empId, LeaveApplicationRequest req, org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails != null) {
            boolean isElevated = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isElevated) {
                Employee emp = employeeRepository.findById(empId)
                        .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", empId));
                if (emp.getEmail() == null || !emp.getEmail().equalsIgnoreCase(userDetails.getUsername())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You can only apply for leave on your own behalf.");
                }
            }
        }
        return apply(empId, req);
    }

    public LeaveResponse apply(Long empId, LeaveApplicationRequest req) {
        Employee emp = employeeRepository.findById(empId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee","id",empId));

        if (req.getEndDate().isBefore(req.getStartDate()))
            throw new BadRequestException("End date cannot be before start date");
        if (req.getStartDate().isBefore(LocalDate.now()))
            throw new BadRequestException("Cannot apply leave for past dates");

        List<LeaveRequest> overlapping = leaveRepository.findOverlapping(empId, req.getStartDate(), req.getEndDate());
        if (!overlapping.isEmpty())
            throw new BadRequestException("You already have a leave request overlapping these dates");

        int days = countWorkingDays(req.getStartDate(), req.getEndDate());
        if (days <= 0) {
            days = 1;
        }
        
        // Check granular leave balance if present
        Optional<EmployeeLeaveBalance> balOpt = balanceRepository.findByEmployeeIdAndLeaveTypeAndYear(
                empId, req.getLeaveType(), req.getStartDate().getYear());
        if (balOpt.isPresent()) {
            if (balOpt.get().getBalanceDays().compareTo(BigDecimal.valueOf(days)) < 0) {
                throw new BadRequestException("Insufficient " + req.getLeaveType() + " leave balance. Available: " 
                        + balOpt.get().getBalanceDays() + " days");
            }
        } else if (emp.getLeaveBalance() < days) {
            throw new BadRequestException("Insufficient leave balance. Available: " + emp.getLeaveBalance() + " days");
        }

        LeaveRequest leave = LeaveRequest.builder()
            .employee(emp).leaveType(req.getLeaveType())
            .startDate(req.getStartDate()).endDate(req.getEndDate())
            .numberOfDays(days).reason(req.getReason())
            .status(LeaveStatus.PENDING).build();

        leave = leaveRepository.save(leave);

        // Initiate Multi-Tier Workflow
        try {
            workflowEngineService.startWorkflow("LEAVE", leave.getId(), emp.getUser());
        } catch (Exception e) {
            log.warn("Could not initiate workflow for leave {}: {}", leave.getId(), e.getMessage());
        }

        // Dispatch in-app notification to Manager
        try {
            if (emp.getManager() != null) {
                Long managerUserId = emp.getManager().getUser() != null ? emp.getManager().getUser().getId() :
                        userRepository.findByEmail(emp.getManager().getEmail()).map(User::getId).orElse(null);
                if (managerUserId != null) {
                    notificationService.send(
                            managerUserId,
                            "Leave Request: " + emp.getFullName(),
                            emp.getFullName() + " requested " + days + " day(s) of " + req.getLeaveType() + " leave (" + req.getStartDate() + " to " + req.getEndDate() + ")",
                            NotificationType.LEAVE_APPLIED,
                            "/approvals"
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Failed to dispatch leave applied notification: {}", e.getMessage());
        }

        log.info("Leave applied: empId={}, days={}, type={}", empId, days, req.getLeaveType());
        auditService.log("LEAVE_APPLIED", "LEAVE_REQUEST", leave.getId(),
            "Applied " + req.getLeaveType() + " leave (" + days + " days) for " + emp.getFullName());
        return toResponse(leave);
    }

    public LeaveResponse review(Long leaveId, LeaveActionRequest req) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
            .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest","id",leaveId));

        if (leave.getStatus() != LeaveStatus.PENDING)
            throw new BadRequestException("This leave request has already been reviewed");

        LeaveStatus action = LeaveStatus.valueOf(req.getAction().toUpperCase());
        if (action != LeaveStatus.APPROVED && action != LeaveStatus.REJECTED)
            throw new BadRequestException("Action must be APPROVED or REJECTED");

        String reviewerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User reviewer = userRepository.findByEmail(reviewerEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User","email",reviewerEmail));

        leave.setStatus(action);
        leave.setApproverComments(req.getComments());
        leave.setReviewedBy(reviewer);
        leave.setReviewedAt(java.time.LocalDateTime.now());

        if (action == LeaveStatus.APPROVED) {
            Employee emp = leave.getEmployee();
            emp.setLeaveBalance(emp.getLeaveBalance() - leave.getNumberOfDays());
            employeeRepository.save(emp);
        }

        leave = leaveRepository.save(leave);

        // Send email notification
        Employee emp = leave.getEmployee();
        emailService.sendLeaveApprovalEmail(
            emp.getEmail(), emp.getFirstName(),
            leave.getLeaveType().name(),
            leave.getStartDate().toString(), leave.getEndDate().toString(),
            action.name(), req.getComments() != null ? req.getComments() : ""
        );

        // Dispatch in-app notification to Employee
        try {
            Long empUserId = emp.getUser() != null ? emp.getUser().getId() :
                    userRepository.findByEmail(emp.getEmail()).map(User::getId).orElse(null);
            if (empUserId != null) {
                notificationService.send(
                        empUserId,
                        "Leave Request " + action.name(),
                        "Your request for " + leave.getNumberOfDays() + " day(s) of " + leave.getLeaveType() + " leave has been " + action.name() + (req.getComments() != null && !req.getComments().isBlank() ? ": " + req.getComments() : "."),
                        action == LeaveStatus.APPROVED ? NotificationType.LEAVE_APPROVED : NotificationType.LEAVE_REJECTED,
                        "/leaves"
                );
            }
        } catch (Exception e) {
            log.warn("Failed to dispatch leave review notification: {}", e.getMessage());
        }

        auditService.log("LEAVE_" + action.name(), "LEAVE_REQUEST", leave.getId(),
            (action == LeaveStatus.APPROVED ? "Approved" : "Rejected") + " " + leave.getLeaveType() + " leave (" + leave.getNumberOfDays() + " days) for " + emp.getFullName() + " (Reviewer: " + reviewerEmail + ")");

        return toResponse(leave);
    }

    public LeaveResponse cancel(Long leaveId, Long empId, org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails != null) {
            boolean isElevated = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isElevated) {
                Employee emp = employeeRepository.findById(empId)
                        .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", empId));
                if (emp.getEmail() == null || !emp.getEmail().equalsIgnoreCase(userDetails.getUsername())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You can only cancel your own leave requests.");
                }
            }
        }
        return cancel(leaveId, empId);
    }

    public LeaveResponse cancel(Long leaveId, Long empId) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
            .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest","id",leaveId));
        if (!leave.getEmployee().getId().equals(empId))
            throw new BadRequestException("You can only cancel your own leave requests");
        if (leave.getStatus() != LeaveStatus.PENDING)
            throw new BadRequestException("Only pending leave requests can be cancelled");
        leave.setStatus(LeaveStatus.CANCELLED);
        auditService.log("LEAVE_CANCELLED", "LEAVE_REQUEST", leave.getId(),
            "Cancelled leave #" + leaveId + " for " + leave.getEmployee().getFullName());
        return toResponse(leaveRepository.save(leave));
    }

    @Transactional(readOnly = true)
    public Page<LeaveResponse> getForEmployee(Long empId, Pageable pageable, org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails != null) {
            boolean isElevated = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR") ||
                                   a.getAuthority().equals("ROLE_MANAGER") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isElevated) {
                Employee emp = employeeRepository.findById(empId)
                        .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", empId));
                if (emp.getEmail() == null || !emp.getEmail().equalsIgnoreCase(userDetails.getUsername())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You can only view your own leave history.");
                }
            }
        }
        return getForEmployee(empId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<LeaveResponse> getForEmployee(Long empId, Pageable pageable) {
        return leaveRepository.findByEmployeeIdOrderByCreatedAtDesc(empId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<LeaveResponse> getPending(Pageable pageable) {
        return leaveRepository.findByStatusOrderByCreatedAtAsc(LeaveStatus.PENDING, pageable).map(this::toResponse);
    }

    private int countWorkingDays(LocalDate start, LocalDate end) {
        int count = 0;
        LocalDate cur = start;
        while (!cur.isAfter(end)) {
            DayOfWeek day = cur.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) count++;
            cur = cur.plusDays(1);
        }
        return count;
    }

    private LeaveResponse toResponse(LeaveRequest lr) {
        return LeaveResponse.builder()
            .id(lr.getId()).employeeId(lr.getEmployee().getId())
            .employeeName(lr.getEmployee().getFullName())
            .employeeNumber(lr.getEmployee().getEmployeeNumber())
            .departmentName(lr.getEmployee().getDepartment() != null ? lr.getEmployee().getDepartment().getName() : null)
            .leaveType(lr.getLeaveType()).startDate(lr.getStartDate()).endDate(lr.getEndDate())
            .numberOfDays(lr.getNumberOfDays()).reason(lr.getReason()).status(lr.getStatus())
            .approverComments(lr.getApproverComments())
            .reviewedBy(lr.getReviewedBy() != null ? lr.getReviewedBy().getFullName() : null)
            .reviewedAt(lr.getReviewedAt()).appliedAt(lr.getCreatedAt()).build();
    }
}
