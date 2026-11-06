package com.hrms.modules.helpdesk.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.modules.helpdesk.dto.*;
import com.hrms.modules.helpdesk.service.HelpdeskService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/helpdesk")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "IT Service Desk & Helpdesk SLA Ticketing")
public class HelpdeskController {

    private final HelpdeskService helpdeskService;

    @PostMapping("/tickets")
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(@Valid @RequestBody TicketCreateRequest req) {
        TicketResponse res = helpdeskService.createTicket(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Support ticket logged successfully", res));
    }

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<Page<TicketResponse>>> getAllTickets(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Page<TicketResponse> res = helpdeskService.getAllTickets(status, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping("/tickets/my")
    public ResponseEntity<ApiResponse<Page<TicketResponse>>> getMyTickets(
            @RequestParam("employeeId") Long employeeId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Page<TicketResponse> res = helpdeskService.getMyTickets(employeeId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(helpdeskService.getTicketById(id)));
    }

    @PutMapping("/tickets/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_IT_ADMIN','ROLE_IT_SUPPORT','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<TicketResponse>> updateTicket(
            @PathVariable("id") Long id,
            @RequestBody TicketUpdateRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "system";
        TicketResponse res = helpdeskService.updateTicket(id, req, email);
        return ResponseEntity.ok(ApiResponse.success("Ticket updated successfully", res));
    }

    @PostMapping("/tickets/{id}/comments")
    public ResponseEntity<ApiResponse<TicketResponse.CommentDto>> addComment(
            @PathVariable("id") Long id,
            @Valid @RequestBody TicketCommentRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "system";
        TicketResponse.CommentDto comment = helpdeskService.addComment(id, req, email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added", comment));
    }

    @GetMapping("/tickets/stats")
    public ResponseEntity<ApiResponse<TicketStatsDto>> getTicketStats() {
        return ResponseEntity.ok(ApiResponse.success(helpdeskService.getStats()));
    }
}
