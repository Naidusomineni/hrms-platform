package com.hrms.modules.request.service;

import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.request.dto.EmployeeRequestCreateDto;
import com.hrms.modules.request.dto.EmployeeRequestResponseDto;
import com.hrms.modules.request.entity.EmployeeRequest;
import com.hrms.modules.request.repository.EmployeeRequestRepository;
import com.hrms.modules.workflow.service.WorkflowEngineService;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service @Slf4j @RequiredArgsConstructor @Transactional
public class EmployeeRequestService {

    private final EmployeeRequestRepository requestRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final WorkflowEngineService workflowEngineService;

    public EmployeeRequestResponseDto createRequest(EmployeeRequestCreateDto dto) {
        Employee emp = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));

        EmployeeRequest req = EmployeeRequest.builder()
                .employee(emp)
                .requestType(dto.getRequestType().toUpperCase())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .amount(dto.getAmount())
                .attachmentUrl(dto.getAttachmentUrl())
                .status("PENDING")
                .currentStep(1)
                .build();

        req = requestRepository.save(req);

        // Initiate Workflow
        try {
            workflowEngineService.startWorkflow(req.getRequestType(), req.getId(), emp.getUser());
        } catch (Exception e) {
            log.info("Direct workflow not configured for {}; manual review enabled", req.getRequestType());
        }

        log.info("Employee request created: id={}, type={}, empId={}", req.getId(), req.getRequestType(), emp.getId());
        return toResponse(req);
    }

    public EmployeeRequestResponseDto reviewRequest(Long requestId, String action, String comments, String reviewerEmail) {
        EmployeeRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeRequest", "id", requestId));

        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", reviewerEmail));

        req.setStatus(action.toUpperCase());
        req.setApproverComments(comments);
        req.setReviewedBy(reviewer);
        req.setReviewedAt(LocalDateTime.now());
        req = requestRepository.save(req);

        return toResponse(req);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeRequestResponseDto> getForEmployee(Long empId, Pageable pageable) {
        return requestRepository.findByEmployeeIdOrderByCreatedAtDesc(empId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeRequestResponseDto> getPending(Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        return requestRepository.findByTenantIdAndStatusOrderByCreatedAtDesc(tenantId, "PENDING", pageable).map(this::toResponse);
    }

    private EmployeeRequestResponseDto toResponse(EmployeeRequest r) {
        return EmployeeRequestResponseDto.builder()
                .id(r.getId())
                .employeeId(r.getEmployee().getId())
                .employeeName(r.getEmployee().getFullName())
                .requestType(r.getRequestType())
                .title(r.getTitle())
                .description(r.getDescription())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .amount(r.getAmount())
                .attachmentUrl(r.getAttachmentUrl())
                .status(r.getStatus())
                .currentStep(r.getCurrentStep())
                .approverComments(r.getApproverComments())
                .reviewerEmail(r.getReviewedBy() != null ? r.getReviewedBy().getEmail() : null)
                .reviewedAt(r.getReviewedAt())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
