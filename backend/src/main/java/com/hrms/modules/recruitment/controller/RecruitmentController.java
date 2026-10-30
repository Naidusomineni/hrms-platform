package com.hrms.modules.recruitment.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.dto.response.EmployeeResponse;
import com.hrms.entity.Employee;
import com.hrms.modules.employee.service.EmployeeService;
import com.hrms.modules.recruitment.dto.*;
import com.hrms.modules.recruitment.service.RecruitmentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/recruitment")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Recruitment & Applicant Tracking System (ATS)")
public class RecruitmentController {

    private final RecruitmentService recruitmentService;
    private final EmployeeService employeeService;

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<List<JobPostingDto>>> getJobs() {
        return ResponseEntity.ok(ApiResponse.success(recruitmentService.getJobPostings()));
    }

    @PostMapping("/jobs")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<JobPostingDto>> createJob(@Valid @RequestBody JobPostingDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job posting created", recruitmentService.createJobPosting(dto)));
    }

    @GetMapping("/candidates")
    public ResponseEntity<ApiResponse<List<CandidateDto>>> getCandidates(
            @RequestParam(name = "jobId", required = false) Long jobId) {
        return ResponseEntity.ok(ApiResponse.success(recruitmentService.getCandidates(jobId)));
    }

    @PostMapping("/candidates")
    public ResponseEntity<ApiResponse<CandidateDto>> addCandidate(@Valid @RequestBody CandidateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Candidate added successfully", recruitmentService.createCandidate(dto)));
    }

    @PatchMapping("/candidates/{id}/stage")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<CandidateDto>> updateStage(
            @PathVariable("id") Long id,
            @RequestParam("stage") String stage) {
        return ResponseEntity.ok(ApiResponse.success("Candidate stage updated",
                recruitmentService.updateCandidateStage(id, stage)));
    }

    @PostMapping("/candidates/{id}/scorecards")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<InterviewScorecardDto>> addScorecard(
            @PathVariable("id") Long id,
            @Valid @RequestBody InterviewScorecardDto dto) {
        dto.setCandidateId(id);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Scorecard recorded", recruitmentService.addScorecard(dto)));
    }

    @GetMapping("/candidates/{id}/scorecards")
    public ResponseEntity<ApiResponse<List<InterviewScorecardDto>>> getScorecards(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(recruitmentService.getScorecards(id)));
    }

    @PostMapping("/candidates/{id}/convert-to-employee")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> convertToEmployee(
            @PathVariable("id") Long id,
            @Valid @RequestBody CandidateConvertDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Candidate converted to active Employee successfully",
                recruitmentService.convertCandidateToEmployee(id, dto)));
    }
}
