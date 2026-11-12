package com.hrms.modules.workflow.service;

import com.hrms.entity.Attendance;
import com.hrms.entity.Employee;
import com.hrms.entity.LeaveRequest;
import com.hrms.entity.User;
import com.hrms.enums.AttendanceStatus;
import com.hrms.enums.LeaveStatus;
import com.hrms.enums.NotificationType;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.attendance.entity.AttendanceRegularization;
import com.hrms.modules.attendance.repository.AttendanceRegularizationRepository;
import com.hrms.modules.leave.entity.EmployeeLeaveBalance;
import com.hrms.modules.leave.repository.EmployeeLeaveBalanceRepository;
import com.hrms.modules.request.entity.EmployeeRequest;
import com.hrms.modules.request.repository.EmployeeRequestRepository;
import com.hrms.modules.workflow.dto.ApprovalActionRequest;
import com.hrms.modules.workflow.dto.ApprovalDelegationDto;
import com.hrms.modules.workflow.dto.WorkflowDefinitionDto;
import com.hrms.modules.workflow.dto.WorkflowTaskResponse;
import com.hrms.modules.workflow.entity.ApprovalDelegation;
import com.hrms.modules.workflow.entity.WorkflowApproval;
import com.hrms.modules.workflow.entity.WorkflowDefinition;
import com.hrms.modules.workflow.entity.WorkflowInstance;
import com.hrms.modules.workflow.entity.WorkflowStep;
import com.hrms.modules.workflow.repository.ApprovalDelegationRepository;
import com.hrms.modules.workflow.repository.WorkflowApprovalRepository;
import com.hrms.modules.workflow.repository.WorkflowDefinitionRepository;
import com.hrms.modules.workflow.repository.WorkflowInstanceRepository;
import com.hrms.modules.workflow.repository.WorkflowStepRepository;
import com.hrms.repository.AttendanceRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.LeaveRequestRepository;
import com.hrms.repository.UserRepository;
import com.hrms.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service @Slf4j @RequiredArgsConstructor @Transactional
public class WorkflowEngineService {

    private final WorkflowDefinitionRepository definitionRepository;
    private final WorkflowStepRepository stepRepository;
    private final WorkflowInstanceRepository instanceRepository;
    private final WorkflowApprovalRepository approvalRepository;
    private final LeaveRequestRepository leaveRepository;
    private final EmployeeRequestRepository employeeRequestRepository;
    private final EmployeeLeaveBalanceRepository balanceRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;
    private final AttendanceRegularizationRepository regularizationRepository;
    private final AttendanceRepository attendanceRepository;
    private final ApprovalDelegationRepository delegationRepository;
    private final UserRepository userRepository;

    public WorkflowInstance startWorkflow(String moduleType, Long entityId, User initiator) {
        String tenantId = TenantContext.getTenantId();
        WorkflowDefinition def = definitionRepository.findByTenantIdAndModuleTypeAndIsActiveTrue(tenantId, moduleType)
                .orElseThrow(() -> new ResourceNotFoundException("WorkflowDefinition for " + moduleType + " not found for tenant " + tenantId));

        List<WorkflowStep> steps = stepRepository.findByWorkflowDefinitionIdOrderByStepOrderAsc(def.getId());
        if (steps.isEmpty()) {
            throw new BadRequestException("Workflow definition has no configured steps");
        }

        WorkflowInstance instance = WorkflowInstance.builder()
                .workflowDefinition(def)
                .entityType(moduleType)
                .entityId(entityId)
                .currentStepOrder(1)
                .totalSteps(steps.size())
                .status("PENDING")
                .initiatedBy(initiator)
                .build();

        instance = instanceRepository.save(instance);
        log.info("Workflow started: instanceId={}, module={}, totalSteps={}", instance.getId(), moduleType, steps.size());

        notifyNextApprover(instance, steps.get(0));
        return instance;
    }

    public WorkflowTaskResponse processApproval(Long instanceId, ApprovalActionRequest req, User approver, String ipAddress) {
        WorkflowInstance instance = instanceRepository.findById(instanceId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkflowInstance", "id", instanceId));

        if (!"PENDING".equalsIgnoreCase(instance.getStatus())) {
            throw new BadRequestException("This workflow instance has already been completed (" + instance.getStatus() + ")");
        }

        WorkflowDefinition def = instance.getWorkflowDefinition();
        WorkflowStep currentStep = stepRepository.findByWorkflowDefinitionIdAndStepOrder(def.getId(), instance.getCurrentStepOrder())
                .orElseThrow(() -> new BadRequestException("Workflow step configuration missing"));

        // Multi-tenant isolation check
        String currentTenant = TenantContext.getTenantId();
        if (instance.getTenantId() != null && currentTenant != null && !instance.getTenantId().equalsIgnoreCase(currentTenant)) {
            throw new ResourceNotFoundException("WorkflowInstance", "id", instanceId);
        }

        // Approver Authorization Validation
        boolean isAuthorized = false;
        String roleName = approver.getRole() != null ? approver.getRole().name() : "";
        if ("ROLE_ADMIN".equals(roleName) || "ROLE_SUPER_ADMIN".equals(roleName)) {
            isAuthorized = true;
        } else if ("SPECIFIC_ROLE".equalsIgnoreCase(currentStep.getApproverType()) && currentStep.getApproverRole() != null) {
            isAuthorized = currentStep.getApproverRole().equalsIgnoreCase(roleName);
        } else if ("REPORTING_MANAGER".equalsIgnoreCase(currentStep.getApproverType())) {
            if (instance.getInitiatedBy() != null) {
                Employee submitter = employeeRepository.findByEmail(instance.getInitiatedBy().getEmail()).orElse(null);
                if (submitter != null && submitter.getManager() != null && submitter.getManager().getEmail() != null) {
                    isAuthorized = submitter.getManager().getEmail().equalsIgnoreCase(approver.getEmail());
                }
            }
        }

        // Check if there is an active delegation to this approver
        if (!isAuthorized) {
            LocalDate today = LocalDate.now();
            List<ApprovalDelegation> delegations = delegationRepository.findActiveDelegationsForDelegatee(
                    currentTenant != null ? currentTenant : "default", approver.getId(), today);
            if (!delegations.isEmpty()) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Access denied: You are not authorized to decide on this workflow approval step (" + currentStep.getStepName() + ")");
        }

        // Record Approval
        WorkflowApproval approval = WorkflowApproval.builder()
                .workflowInstance(instance)
                .stepOrder(instance.getCurrentStepOrder())
                .approver(approver)
                .decision(req.getDecision().toUpperCase())
                .comments(req.getComments())
                .ipAddress(ipAddress)
                .decidedAt(LocalDateTime.now())
                .build();
        approvalRepository.save(approval);

        String decision = req.getDecision().toUpperCase();

        if ("APPROVED".equals(decision)) {
            if (instance.getCurrentStepOrder() < instance.getTotalSteps()) {
                // Advance to next step
                instance.setCurrentStepOrder(instance.getCurrentStepOrder() + 1);
                instance = instanceRepository.save(instance);

                WorkflowStep nextStep = stepRepository.findByWorkflowDefinitionIdAndStepOrder(def.getId(), instance.getCurrentStepOrder())
                        .orElseThrow(() -> new BadRequestException("Next step not found"));
                notifyNextApprover(instance, nextStep);
            } else {
                // Fully approved!
                instance.setStatus("APPROVED");
                instance = instanceRepository.save(instance);
                onWorkflowCompleted(instance, true, req.getComments());
            }
        } else if ("REJECTED".equals(decision)) {
            instance.setStatus("REJECTED");
            instance = instanceRepository.save(instance);
            onWorkflowCompleted(instance, false, req.getComments());
        } else {
            throw new BadRequestException("Unsupported decision: " + decision);
        }

        return toTaskResponse(instance);
    }

    private void onWorkflowCompleted(WorkflowInstance instance, boolean approved, String comments) {
        log.info("Workflow instance {} finalized. Status: {}", instance.getId(), instance.getStatus());

        if ("LEAVE".equalsIgnoreCase(instance.getEntityType())) {
            leaveRepository.findById(instance.getEntityId()).ifPresent(leave -> {
                leave.setStatus(approved ? LeaveStatus.APPROVED : LeaveStatus.REJECTED);
                leave.setApproverComments(comments);
                leave.setReviewedAt(LocalDateTime.now());
                leaveRepository.save(leave);

                if (approved) {
                    // Deduct from EmployeeLeaveBalance
                    Employee emp = leave.getEmployee();
                    balanceRepository.findByEmployeeIdAndLeaveTypeAndYear(emp.getId(), leave.getLeaveType(), leave.getStartDate().getYear())
                            .ifPresent(bal -> {
                                BigDecimal days = BigDecimal.valueOf(leave.getNumberOfDays());
                                bal.setUsedDays(bal.getUsedDays().add(days));
                                bal.setBalanceDays(bal.getBalanceDays().subtract(days));
                                balanceRepository.save(bal);
                            });
                }

                // Notify employee with professional MNC wording
                int days = leave.getNumberOfDays() != null && leave.getNumberOfDays() > 0 ? leave.getNumberOfDays() : 1;
                String durationText = days == 1 ? "1 day" : days + " days";
                String formattedType = formatLeaveType(leave.getLeaveType());
                String details = approved 
                        ? "Your " + formattedType + " request for " + durationText + " has been approved."
                        : "Your " + formattedType + " request for " + durationText + " was rejected" 
                            + (comments != null && !comments.isBlank() ? ": " + comments : ".");

                notificationService.send(
                        leave.getEmployee().getUser().getId(),
                        "Leave Request " + (approved ? "Approved" : "Rejected"),
                        details,
                        approved ? NotificationType.LEAVE_APPROVED : NotificationType.LEAVE_REJECTED,
                        "/leaves"
                );
            });
        } else if ("ATTENDANCE_REGULARIZATION".equalsIgnoreCase(instance.getEntityType())) {
            regularizationRepository.findById(instance.getEntityId()).ifPresent(reg -> {
                reg.setStatus(approved ? "APPROVED" : "REJECTED");
                reg.setReviewerComments(comments);
                reg.setReviewedAt(LocalDateTime.now());
                regularizationRepository.save(reg);

                if (approved) {
                    Attendance att = reg.getAttendance();
                    if (att == null) {
                        att = attendanceRepository.findByEmployeeIdAndDate(reg.getEmployee().getId(), reg.getDate())
                                .orElse(Attendance.builder().employee(reg.getEmployee()).date(reg.getDate()).build());
                    }
                    if (reg.getRequestedCheckIn() != null) att.setCheckInTime(reg.getRequestedCheckIn());
                    if (reg.getRequestedCheckOut() != null) att.setCheckOutTime(reg.getRequestedCheckOut());
                    if (att.getCheckInTime() != null && att.getCheckOutTime() != null) {
                        double hours = java.time.Duration.between(att.getCheckInTime(), att.getCheckOutTime()).toMinutes() / 60.0;
                        att.setWorkingHours(Math.round(hours * 100.0) / 100.0);
                        att.setOvertimeHours(Math.round(Math.max(0.0, hours - 8.0) * 100.0) / 100.0);
                    }
                    att.setStatus(AttendanceStatus.PRESENT);
                    att.setRegularizationStatus("REGULARIZED");
                    attendanceRepository.save(att);
                }

                notificationService.send(
                        reg.getEmployee().getUser().getId(),
                        "Attendance Regularization " + (approved ? "Approved" : "Rejected"),
                        "Your regularization request for " + reg.getDate() + " has been " + (approved ? "approved." : "rejected: " + comments),
                        NotificationType.SYSTEM,
                        "/attendance"
                );
            });
        } else {
            // General Employee Requests (WFH, Overtime, On-Duty, Expense, etc.)
            employeeRequestRepository.findById(instance.getEntityId()).ifPresent(er -> {
                er.setStatus(approved ? "APPROVED" : "REJECTED");
                er.setApproverComments(comments);
                er.setReviewedAt(LocalDateTime.now());
                employeeRequestRepository.save(er);

                notificationService.send(
                        er.getEmployee().getUser().getId(),
                        er.getRequestType() + " Request " + (approved ? "Approved" : "Rejected"),
                        "Your request '" + er.getTitle() + "' was " + (approved ? "approved." : "rejected: " + comments),
                        NotificationType.SYSTEM,
                        "/requests"
                );
            });
        }
    }

    private String formatLeaveType(com.hrms.enums.LeaveType type) {
        if (type == null) return "Leave";
        switch (type) {
            case SICK: return "Sick Leave";
            case CASUAL: return "Casual Leave";
            case ANNUAL: return "Annual / Privilege Leave";
            case MATERNITY: return "Maternity Leave";
            case PATERNITY: return "Paternity Leave";
            case UNPAID: return "Loss of Pay (LOP)";
            default: return type.name().replace('_', ' ') + " Leave";
        }
    }

    private void notifyNextApprover(WorkflowInstance instance, WorkflowStep step) {
        try {
            // Push notification to manager or HR pool
            log.info("Notifying next approver for step: {} (role: {}, type: {})",
                    step.getStepName(), step.getApproverRole(), step.getApproverType());
        } catch (Exception e) {
            log.warn("Failed to notify next approver: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<WorkflowTaskResponse> getPendingTasksForUser(User user) {
        String tenantId = TenantContext.getTenantId();
        List<WorkflowInstance> pending = instanceRepository.findByTenantIdAndStatus(tenantId, "PENDING", org.springframework.data.domain.Pageable.unpaged()).getContent();

        List<WorkflowTaskResponse> tasks = new ArrayList<>();
        for (WorkflowInstance wi : pending) {
            tasks.add(toTaskResponse(wi));
        }
        return tasks;
    }

    @Transactional(readOnly = true)
    public List<WorkflowDefinitionDto> getWorkflowDefinitions() {
        String tenantId = TenantContext.getTenantId();
        return definitionRepository.findByTenantId(tenantId).stream().map(def -> {
            List<WorkflowStep> steps = stepRepository.findByWorkflowDefinitionIdOrderByStepOrderAsc(def.getId());
            return WorkflowDefinitionDto.builder()
                    .id(def.getId())
                    .moduleType(def.getModuleType())
                    .name(def.getName())
                    .description(def.getDescription())
                    .isActive(def.getIsActive())
                    .steps(steps.stream().map(s -> WorkflowDefinitionDto.WorkflowStepDto.builder()
                            .id(s.getId())
                            .stepOrder(s.getStepOrder())
                            .stepName(s.getStepName())
                            .approverType(s.getApproverType())
                            .approverRole(s.getApproverRole())
                            .slaHours(s.getSlaHours())
                            .build()).collect(Collectors.toList()))
                    .build();
        }).collect(Collectors.toList());
    }

    private WorkflowTaskResponse toTaskResponse(WorkflowInstance wi) {
        List<WorkflowApproval> history = approvalRepository.findByWorkflowInstanceIdOrderByStepOrderAsc(wi.getId());
        WorkflowStep step = stepRepository.findByWorkflowDefinitionIdAndStepOrder(wi.getWorkflowDefinition().getId(), wi.getCurrentStepOrder()).orElse(null);

        return WorkflowTaskResponse.builder()
                .instanceId(wi.getId())
                .workflowName(wi.getWorkflowDefinition().getName())
                .entityType(wi.getEntityType())
                .entityId(wi.getEntityId())
                .submitterName(wi.getInitiatedBy().getEmail())
                .submitterEmail(wi.getInitiatedBy().getEmail())
                .currentStepOrder(wi.getCurrentStepOrder())
                .totalSteps(wi.getTotalSteps())
                .currentStepName(step != null ? step.getStepName() : "Step " + wi.getCurrentStepOrder())
                .requiredRole(step != null ? step.getApproverRole() : null)
                .status(wi.getStatus())
                .initiatedAt(wi.getCreatedAt())
                .history(history.stream().map(h -> WorkflowTaskResponse.ApprovalHistoryDto.builder()
                        .stepOrder(h.getStepOrder())
                        .approverName(h.getApprover().getEmail())
                        .decision(h.getDecision())
                        .comments(h.getComments())
                        .decidedAt(h.getDecidedAt())
                        .build()).collect(Collectors.toList()))
                .build();
    }

    // --- Out-of-Office Delegation Management ---

    public ApprovalDelegationDto createDelegation(ApprovalDelegationDto dto, User delegator) {
        String tenantId = TenantContext.getTenantId();
        User delegatee = userRepository.findById(dto.getDelegateeId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dto.getDelegateeId()));

        if (delegator.getId().equals(delegatee.getId())) {
            throw new BadRequestException("Cannot delegate approvals to yourself");
        }

        ApprovalDelegation delegation = ApprovalDelegation.builder()
                .delegator(delegator)
                .delegatee(delegatee)
                .startDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDate.now())
                .endDate(dto.getEndDate() != null ? dto.getEndDate() : LocalDate.now().plusDays(7))
                .requestTypes(dto.getRequestTypes() != null ? dto.getRequestTypes() : "ALL")
                .notes(dto.getNotes())
                .isActive(true)
                .build();

        delegation = delegationRepository.save(delegation);
        log.info("Approval delegation created: delegator={}, delegatee={}, dates={} to {}",
                delegator.getEmail(), delegatee.getEmail(), delegation.getStartDate(), delegation.getEndDate());
        return toDelegationDto(delegation);
    }

    @Transactional(readOnly = true)
    public List<ApprovalDelegationDto> getMyDelegations(User user) {
        String tenantId = TenantContext.getTenantId();
        return delegationRepository.findByTenantIdAndDelegatorIdAndIsActiveTrue(tenantId, user.getId())
                .stream().map(this::toDelegationDto).collect(Collectors.toList());
    }

    public void cancelDelegation(Long id, User user) {
        ApprovalDelegation delegation = delegationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ApprovalDelegation", "id", id));
        if (!delegation.getDelegator().getId().equals(user.getId())) {
            throw new BadRequestException("You can only cancel your own delegations");
        }
        delegation.setIsActive(false);
        delegationRepository.save(delegation);
        log.info("Delegation {} cancelled by {}", id, user.getEmail());
    }

    private ApprovalDelegationDto toDelegationDto(ApprovalDelegation d) {
        return ApprovalDelegationDto.builder()
                .id(d.getId())
                .delegatorId(d.getDelegator().getId())
                .delegatorName(d.getDelegator().getEmail())
                .delegateeId(d.getDelegatee().getId())
                .delegateeName(d.getDelegatee().getEmail())
                .startDate(d.getStartDate())
                .endDate(d.getEndDate())
                .requestTypes(d.getRequestTypes())
                .notes(d.getNotes())
                .isActive(d.getIsActive())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
