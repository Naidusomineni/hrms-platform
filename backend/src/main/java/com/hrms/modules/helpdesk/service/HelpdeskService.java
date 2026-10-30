package com.hrms.modules.helpdesk.service;

import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.enums.NotificationType;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.asset.entity.Asset;
import com.hrms.modules.asset.repository.AssetRepository;
import com.hrms.modules.helpdesk.dto.*;
import com.hrms.modules.helpdesk.entity.SupportTicket;
import com.hrms.modules.helpdesk.entity.TicketComment;
import com.hrms.modules.helpdesk.repository.SupportTicketRepository;
import com.hrms.modules.helpdesk.repository.TicketCommentRepository;
import com.hrms.modules.notification.service.NotificationService;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class HelpdeskService {

    private final SupportTicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final EmployeeRepository employeeRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketResponse createTicket(TicketCreateRequest req) {
        String tenantId = TenantContext.getTenantId();
        Employee emp = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", req.getEmployeeId()));

        Asset asset = null;
        if (req.getAssetId() != null) {
            asset = assetRepository.findById(req.getAssetId()).orElse(null);
        }

        // SLA calculation based on priority
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sla;
        String priority = req.getPriority() != null ? req.getPriority().toUpperCase() : "MEDIUM";
        switch (priority) {
            case "CRITICAL": sla = now.plusHours(4); break;
            case "HIGH": sla = now.plusHours(8); break;
            case "LOW": sla = now.plusHours(48); break;
            default: sla = now.plusHours(24); break;
        }

        String ticketNumber = "TKT-" + now.format(DateTimeFormatter.ofPattern("yyyyMM")) + "-" + String.format("%04d", new Random().nextInt(9000) + 1000);

        SupportTicket ticket = SupportTicket.builder()
                .ticketNumber(ticketNumber)
                .employee(emp)
                .category(req.getCategory().toUpperCase())
                .priority(priority)
                .status("OPEN")
                .title(req.getTitle())
                .description(req.getDescription())
                .asset(asset)
                .slaDeadline(sla)
                .build();
        ticket.setTenantId(tenantId);
        ticket = ticketRepository.save(ticket);

        // Notify employee
        try {
            if (emp.getUser() != null) {
                notificationService.send(
                        emp.getUser().getId(),
                        "Ticket Created: " + ticketNumber,
                        "Your support ticket '" + ticket.getTitle() + "' has been logged. SLA Target: " + sla.format(DateTimeFormatter.ofPattern("dd-MMM HH:mm")),
                        NotificationType.SYSTEM,
                        "/helpdesk"
                );
            }
        } catch (Exception e) {
            log.warn("Failed to notify user on ticket creation: {}", e.getMessage());
        }

        log.info("Support ticket created: number={}, empId={}", ticketNumber, emp.getId());
        return toDto(ticket);
    }

    @Transactional(readOnly = true)
    public Page<TicketResponse> getAllTickets(String status, Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        Page<SupportTicket> page;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            page = ticketRepository.findByTenantIdAndStatusOrderByCreatedAtDesc(tenantId, status.toUpperCase(), pageable);
        } else {
            page = ticketRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
        }
        return page.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<TicketResponse> getMyTickets(Long employeeId, Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        return ticketRepository.findByTenantIdAndEmployeeIdOrderByCreatedAtDesc(tenantId, employeeId, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SupportTicket", "id", id));
        return toDto(ticket);
    }

    public TicketResponse updateTicket(Long id, TicketUpdateRequest req, String updatedByEmail) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SupportTicket", "id", id));

        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            ticket.setStatus(req.getStatus().toUpperCase());
            if ("RESOLVED".equalsIgnoreCase(ticket.getStatus()) || "CLOSED".equalsIgnoreCase(ticket.getStatus())) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
        }

        if (req.getPriority() != null && !req.getPriority().isBlank()) {
            ticket.setPriority(req.getPriority().toUpperCase());
        }

        if (req.getAssignedToUserId() != null) {
            User assignee = userRepository.findById(req.getAssignedToUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", req.getAssignedToUserId()));
            ticket.setAssignedTo(assignee);
        }

        if (req.getResolutionNotes() != null) {
            ticket.setResolutionNotes(req.getResolutionNotes());
        }

        ticket = ticketRepository.save(ticket);

        // Notify employee of ticket update
        try {
            if (ticket.getEmployee() != null && ticket.getEmployee().getUser() != null) {
                notificationService.send(
                        ticket.getEmployee().getUser().getId(),
                        "Ticket Update: " + ticket.getTicketNumber(),
                        "Your ticket '" + ticket.getTitle() + "' is now " + ticket.getStatus() + ".",
                        NotificationType.SYSTEM,
                        "/helpdesk"
                );
            }
        } catch (Exception e) {
            log.warn("Failed to notify user on ticket update: {}", e.getMessage());
        }

        return toDto(ticket);
    }

    public TicketResponse.CommentDto addComment(Long ticketId, TicketCommentRequest req, String authorEmail) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("SupportTicket", "id", ticketId));
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", authorEmail));

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .author(author)
                .commentText(req.getCommentText())
                .isInternal(Boolean.TRUE.equals(req.getIsInternal()))
                .build();
        comment.setTenantId(TenantContext.getTenantId());
        comment = commentRepository.save(comment);

        return TicketResponse.CommentDto.builder()
                .id(comment.getId())
                .authorId(author.getId())
                .authorName(author.getEmail())
                .commentText(comment.getCommentText())
                .isInternal(comment.getIsInternal())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public TicketStatsDto getStats() {
        String tenantId = TenantContext.getTenantId();
        return TicketStatsDto.builder()
                .totalOpen(ticketRepository.countByTenantIdAndStatus(tenantId, "OPEN"))
                .inProgress(ticketRepository.countByTenantIdAndStatus(tenantId, "IN_PROGRESS"))
                .resolved(ticketRepository.countByTenantIdAndStatus(tenantId, "RESOLVED"))
                .criticalCount(ticketRepository.countByTenantIdAndPriority(tenantId, "CRITICAL"))
                .build();
    }

    private TicketResponse toDto(SupportTicket ticket) {
        Employee emp = ticket.getEmployee();
        List<TicketComment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId());

        List<TicketResponse.CommentDto> commentDtos = comments.stream().map(c -> TicketResponse.CommentDto.builder()
                .id(c.getId())
                .authorId(c.getAuthor() != null ? c.getAuthor().getId() : null)
                .authorName(c.getAuthor() != null ? c.getAuthor().getEmail() : "Support")
                .commentText(c.getCommentText())
                .isInternal(c.getIsInternal())
                .createdAt(c.getCreatedAt())
                .build()).collect(Collectors.toList());

        return TicketResponse.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .employeeId(emp != null ? emp.getId() : null)
                .employeeName(emp != null ? emp.getFullName() : null)
                .employeeNumber(emp != null ? emp.getEmployeeNumber() : null)
                .departmentName(emp != null && emp.getDepartment() != null ? emp.getDepartment().getName() : null)
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .assetId(ticket.getAsset() != null ? ticket.getAsset().getId() : null)
                .assetName(ticket.getAsset() != null ? (ticket.getAsset().getBrand() != null ? ticket.getAsset().getBrand() + " " + ticket.getAsset().getModel() : ticket.getAsset().getAssetTag()) : null)
                .assetSerialNumber(ticket.getAsset() != null ? ticket.getAsset().getSerialNumber() : null)
                .assignedToUserId(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getId() : null)
                .assignedToName(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getEmail() : "Unassigned")
                .slaDeadline(ticket.getSlaDeadline())
                .resolutionNotes(ticket.getResolutionNotes())
                .resolvedAt(ticket.getResolvedAt())
                .createdAt(ticket.getCreatedAt())
                .comments(commentDtos)
                .build();
    }
}
