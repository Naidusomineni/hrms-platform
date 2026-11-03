package com.hrms.modules.recruitment.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.modules.recruitment.dto.*;
import com.hrms.modules.recruitment.service.InterviewService;
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
@RequestMapping("/v1/recruitment/interviews")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Candidate Interview & Native Live Video Calling")
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<InterviewSessionDto>> scheduleInterview(
            @Valid @RequestBody CreateInterviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Interview scheduled successfully", interviewService.scheduleInterview(request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<List<InterviewSessionDto>>> getAllInterviews() {
        return ResponseEntity.ok(ApiResponse.success(interviewService.getAllInterviews()));
    }

    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<List<InterviewSessionDto>>> getInterviewsForCandidate(
            @PathVariable("candidateId") Long candidateId) {
        return ResponseEntity.ok(ApiResponse.success(interviewService.getInterviewsForCandidate(candidateId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<InterviewSessionDto>> getInterview(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(interviewService.getInterview(id)));
    }

    @GetMapping("/{id}/join-token")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<LiveKitTokenResponse>> getInterviewerJoinToken(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "hr@hrms.com";
        return ResponseEntity.ok(ApiResponse.success(interviewService.getInterviewerJoinToken(id, email)));
    }

    // ── Public Candidate Guest Endpoints (Zero Login Required) ────────

    @GetMapping("/guest/{guestToken}")
    public ResponseEntity<ApiResponse<InterviewSessionDto>> getCandidateGuestSession(
            @PathVariable("guestToken") String guestToken) {
        return ResponseEntity.ok(ApiResponse.success(interviewService.getCandidateGuestSession(guestToken)));
    }

    @PostMapping("/guest/{guestToken}/join")
    public ResponseEntity<ApiResponse<LiveKitTokenResponse>> candidateJoinRoom(
            @PathVariable("guestToken") String guestToken,
            @RequestBody(required = false) IntegrityTelemetryDto telemetry) {
        return ResponseEntity.ok(ApiResponse.success("Candidate room access granted",
                interviewService.candidateJoinRoom(guestToken, telemetry)));
    }

    @PostMapping("/guest/{guestToken}/telemetry")
    public ResponseEntity<ApiResponse<Void>> reportTelemetry(
            @PathVariable("guestToken") String guestToken,
            @RequestBody IntegrityTelemetryDto telemetry) {
        interviewService.reportTelemetry(guestToken, telemetry);
        return ResponseEntity.ok(ApiResponse.success("Telemetry logged", null));
    }

    // ── In-Call Live Scorecard & Lifecycle ────────────────────────────

    @PutMapping("/{id}/scorecard")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<InterviewScorecardDto>> saveLiveScorecard(
            @PathVariable("id") Long id,
            @RequestBody InterviewScorecardDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "hr@hrms.com";
        return ResponseEntity.ok(ApiResponse.success("Scorecard updated",
                interviewService.saveLiveScorecard(id, dto, email)));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<InterviewSessionDto>> completeInterview(
            @PathVariable("id") Long id,
            @RequestParam(name = "nextStage", required = false) String nextStage,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "hr@hrms.com";
        return ResponseEntity.ok(ApiResponse.success("Interview completed successfully",
                interviewService.completeInterview(id, nextStage, email)));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<InterviewSessionDto>> cancelInterview(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "hr@hrms.com";
        return ResponseEntity.ok(ApiResponse.success("Interview cancelled",
                interviewService.cancelInterview(id, email)));
    }
}
