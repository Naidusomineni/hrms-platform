package com.hrms.modules.report.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.modules.report.dto.ExecutiveAnalyticsDto;
import com.hrms.modules.report.dto.TaxDeclarationDto;
import com.hrms.modules.report.service.ReportService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/reports")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Executive BI Analytics & Statutory Tax Compliance")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<ExecutiveAnalyticsDto>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getExecutiveAnalytics()));
    }

    @GetMapping("/tax/employee/{empId}")
    public ResponseEntity<ApiResponse<List<TaxDeclarationDto>>> getTaxDeclarations(@PathVariable("empId") Long empId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getTaxDeclarations(empId)));
    }

    @PostMapping("/tax")
    public ResponseEntity<ApiResponse<TaxDeclarationDto>> saveTaxDeclaration(@Valid @RequestBody TaxDeclarationDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Tax declaration updated", reportService.saveTaxDeclaration(dto)));
    }
}
