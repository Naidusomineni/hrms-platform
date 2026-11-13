package com.hrms.modules.performance.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.modules.performance.dto.AppraisalCycleDto;
import com.hrms.modules.performance.dto.EmployeeGoalDto;
import com.hrms.modules.performance.dto.PerformanceReviewDto;
import com.hrms.modules.performance.service.PerformanceService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/performance")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Performance Management, Appraisals & OKRs")
public class PerformanceController {

    private final PerformanceService performanceService;

    @GetMapping("/cycles")
    public ResponseEntity<ApiResponse<List<AppraisalCycleDto>>> getCycles() {
        return ResponseEntity.ok(ApiResponse.success(performanceService.getCycles()));
    }

    @PostMapping("/cycles")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AppraisalCycleDto>> createCycle(@Valid @RequestBody AppraisalCycleDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appraisal cycle created", performanceService.createCycle(dto)));
    }

    @GetMapping("/goals/employee/{empId}")
    public ResponseEntity<ApiResponse<List<EmployeeGoalDto>>> getGoals(
            @PathVariable("empId") Long empId,
            @RequestParam(name = "cycleId", required = false) Long cycleId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(performanceService.getGoalsForEmployee(empId, cycleId, userDetails)));
    }

    @PostMapping("/goals")
    public ResponseEntity<ApiResponse<EmployeeGoalDto>> createGoal(
            @Valid @RequestBody EmployeeGoalDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Goal created successfully", performanceService.createGoal(dto, userDetails)));
    }

    @PatchMapping("/goals/{id}/progress")
    public ResponseEntity<ApiResponse<EmployeeGoalDto>> updateProgress(
            @PathVariable("id") Long id,
            @RequestParam(name = "progress", required = false) Integer progress,
            @RequestParam(name = "status", required = false) String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Goal progress updated",
                performanceService.updateGoalProgress(id, progress, status, userDetails)));
    }

    @GetMapping("/reviews")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<PerformanceReviewDto>>> getAllReviews() {
        return ResponseEntity.ok(ApiResponse.success(performanceService.getAllReviews()));
    }

    @GetMapping("/reviews/employee/{empId}")
    public ResponseEntity<ApiResponse<List<PerformanceReviewDto>>> getReviews(
            @PathVariable("empId") Long empId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(performanceService.getReviewsForEmployee(empId, userDetails)));
    }

    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<PerformanceReviewDto>> submitReview(
            @Valid @RequestBody PerformanceReviewDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Performance review submitted", performanceService.submitReview(dto, userDetails)));
    }
}
