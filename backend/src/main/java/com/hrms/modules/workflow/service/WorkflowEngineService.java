package com.hrms.modules.workflow.service;

import com.hrms.entity.Employee;
import com.hrms.entity.LeaveRequest;
import com.hrms.entity.User;
import com.hrms.enums.LeaveStatus;
import com.hrms.enums.NotificationType;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.leave.entity.EmployeeLeaveBalance;
import com.hrms.modules.leave.repository.EmployeeLeaveBalanceRepository;
import com.hrms.modules.request.entity.EmployeeRequest;
import com.hrms.modules.request.repository.EmployeeRequestRepository;
import com.hrms.modules.workflow.dto.ApprovalActionRequest;
import com.hrms.modules.workflow.dto.WorkflowDefinitionDto;
import com.hrms.modules.workflow.dto.WorkflowTaskResponse;
import com.hrms.modules.workflow.entity.WorkflowApproval;
import com.hrms.modules.workflow.entity.WorkflowDefinition;
import com.hrms.modules.workflow.entity.WorkflowInstance;
import com.hrms.modules.workflow.entity.WorkflowStep;
import com.hrms.modules.workflow.repository.WorkflowApprovalRepository;
import com.hrms.modules.workflow.repository.WorkflowDefinitionRepository;
import com.hrms.modules.workflow.repository.WorkflowInstanceRepository;
import com.hrms.modules.workflow.repository.WorkflowStepRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.LeaveRequestRepository;
import com.hrms.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
        } else if ("WORK_FROM_HOME".equalsIgnoreCase(instance.getEntityType()) || "EXPENSE".equalsIgnoreCase(instance.getEntityType())) {
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
}
