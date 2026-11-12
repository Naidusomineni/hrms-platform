package com.hrms.modules.offboarding.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.modules.offboarding.dto.ClearanceDto;
import com.hrms.modules.offboarding.dto.SeparationRequestDto;
import com.hrms.modules.offboarding.dto.SettlementDto;
import com.hrms.modules.offboarding.service.OffboardingService;
import com.hrms.util.PaginationUtils;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/v1/offboarding")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Employee Offboarding & F&F Settlement")
public class OffboardingController {

    private final OffboardingService offboardingService;

    @PostMapping("/separations")
    public ResponseEntity<ApiResponse<SeparationRequestDto>> submitSeparation(@Valid @RequestBody SeparationRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resignation/Separation submitted successfully", offboardingService.submitResignation(dto)));
    }

    @GetMapping("/separations")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<Page<SeparationRequestDto>>> getSeparations(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(offboardingService.getSeparations(status, PaginationUtils.of(page, size))));
    }

    @GetMapping("/separations/{id}")
    public ResponseEntity<ApiResponse<SeparationRequestDto>> getSeparationById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(offboardingService.getSeparationById(id)));
    }

    @GetMapping("/separations/my")
    public ResponseEntity<ApiResponse<SeparationRequestDto>> getMySeparation(@RequestParam("employeeId") Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success(offboardingService.getMySeparation(employeeId)));
    }

    @PutMapping("/separations/{id}/review")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<SeparationRequestDto>> reviewSeparation(
            @PathVariable("id") Long id,
            @RequestParam("action") String action,
            @RequestParam(name = "approvedLwd", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate approvedLwd,
            @RequestParam(name = "comments", required = false, defaultValue = "") String comments) {
        String reviewerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ApiResponse.success("Separation reviewed successfully",
                offboardingService.reviewSeparation(id, action, approvedLwd, comments, reviewerEmail)));
    }

    @PutMapping("/clearances/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<ClearanceDto>> updateClearance(
            @PathVariable("id") Long id,
            @RequestParam("status") String status,
            @RequestParam(name = "pendingDues", required = false, defaultValue = "0") BigDecimal pendingDues,
            @RequestParam(name = "remarks", required = false, defaultValue = "") String remarks) {
        String clearedBy = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ApiResponse.success("Clearance checkpoint updated",
                offboardingService.updateClearance(id, status, pendingDues, remarks, clearedBy)));
    }

    @PostMapping("/settlements/calculate")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<SettlementDto>> calculateSettlement(@RequestParam("separationId") Long separationId) {
        return ResponseEntity.ok(ApiResponse.success("F&F Settlement computed", offboardingService.calculateSettlement(separationId)));
    }

    @PostMapping("/settlements")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<SettlementDto>> saveSettlement(
            @RequestParam(name = "disburse", defaultValue = "false") boolean disburse,
            @Valid @RequestBody SettlementDto dto) {
        return ResponseEntity.ok(ApiResponse.success(
                disburse ? "F&F Settlement finalized and disbursed" : "F&F Settlement saved as draft",
                offboardingService.saveOrDisburseSettlement(dto, disburse)));
    }

    @GetMapping("/settlements/separation/{separationId}")
    public ResponseEntity<ApiResponse<SettlementDto>> getSettlementBySeparation(@PathVariable("separationId") Long separationId) {
        return ResponseEntity.ok(ApiResponse.success(offboardingService.getSettlementBySeparation(separationId)));
    }
}
