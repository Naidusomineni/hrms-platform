package com.hrms.modules.workflow.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.entity.User;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.modules.workflow.dto.ApprovalActionRequest;
import com.hrms.modules.workflow.dto.ApprovalDelegationDto;
import com.hrms.modules.workflow.dto.WorkflowDefinitionDto;
import com.hrms.modules.workflow.dto.WorkflowTaskResponse;
import com.hrms.modules.workflow.service.WorkflowEngineService;
import com.hrms.repository.UserRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/workflows")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Workflow Approvals Engine")
public class WorkflowController {

    private final WorkflowEngineService workflowService;
    private final UserRepository userRepository;

    @GetMapping("/inbox")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<WorkflowTaskResponse>>> getInbox() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        return ResponseEntity.ok(ApiResponse.success(workflowService.getPendingTasksForUser(user)));
    }

    @PostMapping("/tasks/{instanceId}/decision")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<WorkflowTaskResponse>> recordDecision(
            @PathVariable("instanceId") Long instanceId,
            @Valid @RequestBody ApprovalActionRequest req,
            HttpServletRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User approver = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String ip = request.getRemoteAddr();
        WorkflowTaskResponse res = workflowService.processApproval(instanceId, req, approver, ip);
        return ResponseEntity.ok(ApiResponse.success("Workflow decision processed successfully", res));
    }

    @GetMapping("/definitions")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<List<WorkflowDefinitionDto>>> getDefinitions() {
        return ResponseEntity.ok(ApiResponse.success(workflowService.getWorkflowDefinitions()));
    }

    @GetMapping("/delegations")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<List<ApprovalDelegationDto>>> getDelegations() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return ResponseEntity.ok(ApiResponse.success(workflowService.getMyDelegations(user)));
    }

    @PostMapping("/delegations")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<ApprovalDelegationDto>> createDelegation(@Valid @RequestBody ApprovalDelegationDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return ResponseEntity.ok(ApiResponse.success("Delegation created successfully", workflowService.createDelegation(dto, user)));
    }

    @DeleteMapping("/delegations/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> cancelDelegation(@PathVariable("id") Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        workflowService.cancelDelegation(id, user);
        return ResponseEntity.ok(ApiResponse.success("Delegation cancelled successfully", null));
    }
}
