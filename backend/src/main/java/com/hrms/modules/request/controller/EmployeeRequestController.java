package com.hrms.modules.request.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.modules.request.dto.EmployeeRequestCreateDto;
import com.hrms.modules.request.dto.EmployeeRequestResponseDto;
import com.hrms.modules.request.service.EmployeeRequestService;
import com.hrms.util.PaginationUtils;
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
@RequestMapping("/v1/requests")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Employee Self-Service Requests (WFH, Expenses, Travel)")
public class EmployeeRequestController {

    private final EmployeeRequestService requestService;

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeRequestResponseDto>> create(@Valid @RequestBody EmployeeRequestCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Request submitted successfully", requestService.createRequest(dto)));
    }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<ApiResponse<Page<EmployeeRequestResponseDto>>> getForEmployee(
            @PathVariable("empId") Long empId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(requestService.getForEmployee(empId, PaginationUtils.of(page, size))));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<Page<EmployeeRequestResponseDto>>> getPending(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(requestService.getPending(PaginationUtils.of(page, size))));
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<EmployeeRequestResponseDto>> review(
            @PathVariable("id") Long id,
            @RequestParam("action") String action,
            @RequestParam(name = "comments", required = false) String comments) {
        String reviewer = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ApiResponse.success("Request reviewed", requestService.reviewRequest(id, action, comments, reviewer)));
    }
}
