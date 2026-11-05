package com.hrms.modules.intelligence.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.modules.intelligence.dto.*;
import com.hrms.modules.intelligence.entity.HrPolicyArticle;
import com.hrms.modules.intelligence.service.WorkforceIntelligenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/v1/intelligence")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Workforce Intelligence & AI Assistant", description = "Smart HR knowledge copilot, predictive attrition risk radar, and candidate ATS matcher")
public class WorkforceIntelligenceController {

    private final WorkforceIntelligenceService intelligenceService;

    @Operation(summary = "Ask AI HR Copilot corporate policy question")
    @PostMapping("/assistant/ask")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AiAssistantResponse>> askAssistant(@Valid @RequestBody AiAssistantQueryRequest request) {
        AiAssistantResponse response = intelligenceService.askAssistant(request);
        return ResponseEntity.ok(ApiResponse.success("AI Assistant query processed successfully", response));
    }

    @Operation(summary = "Browse active corporate HR policies")
    @GetMapping("/policies")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<HrPolicyArticle>>> getActivePolicies(
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "false") boolean includeInactive) {
        List<HrPolicyArticle> policies = includeInactive
                ? intelligenceService.getAllPolicies(category)
                : intelligenceService.getActivePolicies(category);
        return ResponseEntity.ok(ApiResponse.success(policies));
    }

    @Operation(summary = "Get single corporate HR policy article by ID")
    @GetMapping("/policies/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<HrPolicyArticle>> getPolicyById(@PathVariable Long id) {
        HrPolicyArticle article = intelligenceService.getPolicyById(id);
        return ResponseEntity.ok(ApiResponse.success(article));
    }

    @Operation(summary = "Create corporate HR policy article")
    @PostMapping("/policies")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<HrPolicyArticle>> createPolicy(@Valid @RequestBody HrPolicyRequest request) {
        HrPolicyArticle created = intelligenceService.createPolicy(request);
        return ResponseEntity.ok(ApiResponse.success("HR Policy article created successfully", created));
    }

    @Operation(summary = "Upload and ingest corporate HR policy document (PDF/DOCX/TXT/MD)")
    @PostMapping(value = "/policies/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<HrPolicyArticle>> uploadPolicyDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "GENERAL") String category,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "actionLabel", required = false) String actionLabel,
            @RequestParam(value = "actionRoute", required = false) String actionRoute) {
        HrPolicyArticle created = intelligenceService.uploadPolicyDocument(file, category, title, actionLabel, actionRoute);
        return ResponseEntity.ok(ApiResponse.success("HR policy document ingested successfully into AI Copilot", created));
    }

    @Operation(summary = "Update corporate HR policy article")
    @PutMapping("/policies/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<HrPolicyArticle>> updatePolicy(@PathVariable Long id, @Valid @RequestBody HrPolicyRequest request) {
        HrPolicyArticle updated = intelligenceService.updatePolicy(id, request);
        return ResponseEntity.ok(ApiResponse.success("HR Policy article updated successfully", updated));
    }

    @Operation(summary = "Deactivate/delete corporate HR policy article")
    @DeleteMapping("/policies/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePolicy(@PathVariable Long id) {
        intelligenceService.deletePolicy(id);
        return ResponseEntity.ok(ApiResponse.success("HR Policy article deactivated successfully", null));
    }

    @Operation(summary = "Get workforce flight risk and attrition radar analysis")
    @GetMapping("/attrition/risk-analysis")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<FlightRiskAnalysisDto>>> getAttritionRiskAnalysis() {
        List<FlightRiskAnalysisDto> list = intelligenceService.getCachedFlightRiskEvaluations();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @Operation(summary = "Re-evaluate real-time predictive flight risk for all employees")
    @PostMapping("/attrition/re-evaluate")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<FlightRiskAnalysisDto>>> reEvaluateAttritionRisk() {
        List<FlightRiskAnalysisDto> list = intelligenceService.evaluateTenantFlightRisks();
        return ResponseEntity.ok(ApiResponse.success("Workforce flight risk re-evaluated successfully", list));
    }

    @Operation(summary = "Get departmental flight risk and attrition overview")
    @GetMapping("/attrition/department-overview")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<DepartmentFlightRiskSummaryDto>>> getDepartmentRiskOverview() {
        List<DepartmentFlightRiskSummaryDto> overview = intelligenceService.getDepartmentRiskOverview();
        return ResponseEntity.ok(ApiResponse.success(overview));
    }

    @Operation(summary = "Evaluate candidate resume match against job posting requirements")
    @PostMapping("/ats/evaluate-candidate")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ResumeMatchResultDto>> evaluateCandidateMatch(@Valid @RequestBody ResumeMatchRequest request) {
        ResumeMatchResultDto matchResult = intelligenceService.evaluateCandidateMatch(request);
        return ResponseEntity.ok(ApiResponse.success("Candidate evaluated successfully", matchResult));
    }
}
