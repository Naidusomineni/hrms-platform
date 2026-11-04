package com.hrms.modules.recruitment.service;

import com.hrms.exception.BadRequestException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.entity.Candidate;
import com.hrms.entity.Employee;
import com.hrms.entity.JobPosting;
import com.hrms.enums.CandidateStage;
import com.hrms.enums.InterviewSessionStatus;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.repository.EmployeeRepository;
import com.hrms.modules.recruitment.dto.*;
import com.hrms.modules.recruitment.entity.InterviewScorecard;
import com.hrms.modules.recruitment.entity.InterviewSession;
import com.hrms.modules.recruitment.repository.CandidateRepository;
import com.hrms.modules.recruitment.repository.InterviewScorecardRepository;
import com.hrms.modules.recruitment.repository.InterviewSessionRepository;
import com.hrms.repository.JobPostingRepository;
import com.hrms.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final CandidateRepository candidateRepository;
    private final EmployeeRepository employeeRepository;
    private final JobPostingRepository jobPostingRepository;
    private final InterviewScorecardRepository scorecardRepository;
    private final LiveKitTokenService liveKitTokenService;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public InterviewSessionDto scheduleInterview(CreateInterviewRequest request) {
        String tenantId = TenantContext.getTenantId();

        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", request.getCandidateId()));

        Employee interviewer = employeeRepository.findById(request.getInterviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getInterviewerId()));

        JobPosting jobPosting = null;
        if (request.getJobPostingId() != null) {
            jobPosting = jobPostingRepository.findById(request.getJobPostingId()).orElse(null);
        } else if (candidate.getJobPosting() != null) {
            jobPosting = candidate.getJobPosting();
        }

        String roomName = "room_" + tenantId.toLowerCase() + "_c" + candidate.getId() + "_" + UUID.randomUUID().toString().substring(0, 8);
        String guestToken = UUID.randomUUID().toString().replace("-", "") + System.currentTimeMillis();
        LocalDateTime guestTokenExpiry = (request.getScheduledEnd() != null ? request.getScheduledEnd() : LocalDateTime.now()).plusDays(2); // 48-hour access window
        String meetingLink = frontendUrl + "/interview/guest/" + guestToken;

        InterviewSession session = InterviewSession.builder()
                .candidate(candidate)
                .jobPosting(jobPosting)
                .interviewer(interviewer)
                .roundName(request.getRoundName())
                .scheduledStart(request.getScheduledStart())
                .scheduledEnd(request.getScheduledEnd())
                .status(InterviewSessionStatus.SCHEDULED)
                .roomName(roomName)
                .guestAccessToken(guestToken)
                .guestTokenExpiry(guestTokenExpiry)
                .meetingLink(meetingLink)
                .interviewNotes(request.getNotes())
                .integrityStatus("CLEAN")
                .integrityDetails("{\"tabSwitches\":0,\"blurEvents\":0,\"deviceVerified\":false}")
                .build();
        session.setTenantId(tenantId);

        session = sessionRepository.save(session);

        // Advance candidate stage to interview round if currently in APPLIED or SCREENING
        if (candidate.getStage() == CandidateStage.APPLIED || candidate.getStage() == CandidateStage.SCREENING) {
            boolean isRound2 = request.getRoundName().toLowerCase().contains("round 2") ||
                               request.getRoundName().toLowerCase().contains("final");
            candidate.setStage(isRound2 ? CandidateStage.INTERVIEW_ROUND_2 : CandidateStage.INTERVIEW_ROUND_1);
            candidateRepository.save(candidate);
        }

        // Email dispatch to candidate
        String formattedTime = request.getScheduledStart().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
        String jobTitle = jobPosting != null ? jobPosting.getTitle() : "Position";
        if (candidate.getEmail() != null && !candidate.getEmail().isBlank()) {
            emailService.sendInterviewInvitationEmail(
                    candidate.getEmail(),
                    candidate.getName(),
                    jobTitle,
                    request.getRoundName(),
                    formattedTime,
                    meetingLink
            );
        }

        log.info("Scheduled interview session #{} in room '{}' for candidate '{}'", session.getId(), roomName, candidate.getName());
        return mapToDto(session);
    }

    @Transactional(readOnly = true)
    public List<InterviewSessionDto> getAllInterviews() {
        String tenantId = TenantContext.getTenantId();
        return sessionRepository.findAllByTenantIdWithDetails(tenantId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewSessionDto> getInterviewsForCandidate(Long candidateId) {
        String tenantId = TenantContext.getTenantId();
        return sessionRepository.findByTenantIdAndCandidateId(tenantId, candidateId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InterviewSessionDto getInterview(Long id) {
        InterviewSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewSession", "id", id));
        return mapToDto(session);
    }

    @Transactional
    public LiveKitTokenResponse getInterviewerJoinToken(Long id, String employeeEmail) {
        InterviewSession session = sessionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewSession", "id", id));

        if (session.getInterviewerJoinedAt() == null) {
            session.setInterviewerJoinedAt(LocalDateTime.now());
        }
        if (session.getStatus() == InterviewSessionStatus.SCHEDULED) {
            session.setStatus(InterviewSessionStatus.IN_PROGRESS);
        }
        sessionRepository.save(session);

        String identity = "emp-" + session.getInterviewer().getId();
        String displayName = session.getInterviewer().getFullName() + " (Interviewer)";
        long tokenDuration = 4 * 3600 * 1000L; // 4 hours

        String token = liveKitTokenService.createToken(
                session.getRoomName(),
                identity,
                displayName,
                true,
                tokenDuration
        );

        return LiveKitTokenResponse.builder()
                .token(token)
                .serverUrl(liveKitTokenService.getServerUrl())
                .roomName(session.getRoomName())
                .participantIdentity(identity)
                .participantName(displayName)
                .isInterviewer(true)
                .session(mapToDto(session))
                .build();
    }

    @Transactional(readOnly = true)
    public InterviewSessionDto getCandidateGuestSession(String guestToken) {
        InterviewSession session = sessionRepository.findByGuestAccessTokenWithDetails(guestToken)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewSession", "guestToken", guestToken));

        if (session.getGuestTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Interview session link has expired. Please contact HR for a new invitation.");
        }

        return mapToDto(session);
    }

    @Transactional
    public LiveKitTokenResponse candidateJoinRoom(String guestToken, IntegrityTelemetryDto telemetry) {
        InterviewSession session = sessionRepository.findByGuestAccessTokenWithDetails(guestToken)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewSession", "guestToken", guestToken));

        if (session.getGuestTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Interview session link has expired.");
        }

        // Integrity check: proxy / virtual camera detection
        if (telemetry != null) {
            if (Boolean.TRUE.equals(telemetry.getVirtualCameraDetected()) || Boolean.TRUE.equals(telemetry.getVirtualAudioDetected())) {
                session.setIntegrityStatus("PROXY_SUSPECT");
                log.warn("Proxy suspicion on interview #{}: virtual camera/audio detected. Camera='{}', Audio='{}'",
                        session.getId(), telemetry.getCameraLabel(), telemetry.getAudioDeviceLabel());
            }
            session.setIntegrityDetails(
                    String.format("{\"tabSwitches\":0,\"blurEvents\":0,\"deviceVerified\":true,\"camera\":\"%s\",\"audio\":\"%s\",\"clientIp\":\"%s\"}",
                            escapeJson(telemetry.getCameraLabel()),
                            escapeJson(telemetry.getAudioDeviceLabel()),
                            escapeJson(telemetry.getClientIp())));
        }

        if (session.getCandidateJoinedAt() == null) {
            session.setCandidateJoinedAt(LocalDateTime.now());
        }
        if (session.getStatus() == InterviewSessionStatus.SCHEDULED) {
            session.setStatus(InterviewSessionStatus.IN_PROGRESS);
        }
        sessionRepository.save(session);

        String identity = "cand-" + session.getCandidate().getId();
        String displayName = session.getCandidate().getName() + " (Candidate)";
        long tokenDuration = 4 * 3600 * 1000L;

        String token = liveKitTokenService.createToken(
                session.getRoomName(),
                identity,
                displayName,
                false,
                tokenDuration
        );

        return LiveKitTokenResponse.builder()
                .token(token)
                .serverUrl(liveKitTokenService.getServerUrl())
                .roomName(session.getRoomName())
                .participantIdentity(identity)
                .participantName(displayName)
                .isInterviewer(false)
                .session(mapToDto(session))
                .build();
    }

    public void reportTelemetry(String guestToken, IntegrityTelemetryDto telemetry) {
        sessionRepository.findByGuestAccessToken(guestToken).ifPresent(session -> {
            int tabSwitches = telemetry.getTabSwitchCount() != null ? telemetry.getTabSwitchCount() : 0;
            int blurEvents = telemetry.getWindowBlurCount() != null ? telemetry.getWindowBlurCount() : 0;

            if (tabSwitches >= 3 || blurEvents >= 5) {
                if (!"PROXY_SUSPECT".equals(session.getIntegrityStatus())) {
                    session.setIntegrityStatus("FLAGGED");
                }
            }

            session.setIntegrityDetails(
                    String.format("{\"tabSwitches\":%d,\"blurEvents\":%d,\"camera\":\"%s\",\"audio\":\"%s\",\"notes\":\"%s\"}",
                            tabSwitches, blurEvents,
                            escapeJson(telemetry.getCameraLabel()),
                            escapeJson(telemetry.getAudioDeviceLabel()),
                            escapeJson(telemetry.getNotes())));
            sessionRepository.save(session);
        });
    }

    public InterviewScorecardDto saveLiveScorecard(Long sessionId, InterviewScorecardDto dto, String hrEmail) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewSession", "id", sessionId));

        Employee interviewer = session.getInterviewer();

        List<InterviewScorecard> existing = scorecardRepository.findByTenantIdAndCandidateId(session.getTenantId(), session.getCandidate().getId());
        InterviewScorecard scorecard = existing.stream()
                .filter(s -> sessionId.equals(s.getInterviewSessionId()))
                .findFirst()
                .orElse(null);

        if (scorecard == null) {
            scorecard = InterviewScorecard.builder()
                    .candidate(session.getCandidate())
                    .interviewer(interviewer)
                    .roundName(session.getRoundName())
                    .technicalRating(dto.getTechnicalRating() != null ? dto.getTechnicalRating() : 3)
                    .communicationRating(dto.getCommunicationRating() != null ? dto.getCommunicationRating() : 3)
                    .cultureFitRating(dto.getCultureFitRating() != null ? dto.getCultureFitRating() : 3)
                    .recommendation(dto.getRecommendation() != null ? dto.getRecommendation() : "HIRE")
                    .feedback(dto.getFeedback())
                    .interviewSessionId(sessionId)
                    .integrityScore(dto.getIntegrityScore() != null ? dto.getIntegrityScore() : ("CLEAN".equals(session.getIntegrityStatus()) ? 100 : 70))
                    .integritySummary(session.getIntegrityDetails())
                    .build();
            scorecard.setTenantId(session.getTenantId());
        } else {
            if (dto.getTechnicalRating() != null) scorecard.setTechnicalRating(dto.getTechnicalRating());
            if (dto.getCommunicationRating() != null) scorecard.setCommunicationRating(dto.getCommunicationRating());
            if (dto.getCultureFitRating() != null) scorecard.setCultureFitRating(dto.getCultureFitRating());
            if (dto.getRecommendation() != null) scorecard.setRecommendation(dto.getRecommendation());
            if (dto.getFeedback() != null) scorecard.setFeedback(dto.getFeedback());
            if (dto.getIntegrityScore() != null) scorecard.setIntegrityScore(dto.getIntegrityScore());
            scorecard.setIntegritySummary(session.getIntegrityDetails());
        }

        scorecard = scorecardRepository.save(scorecard);
        log.info("Saved live scorecard #{} for interview session #{}", scorecard.getId(), sessionId);

        dto.setId(scorecard.getId());
        dto.setCandidateId(session.getCandidate().getId());
        dto.setInterviewerId(interviewer.getId());
        dto.setInterviewerName(interviewer.getFullName());
        dto.setInterviewSessionId(sessionId);
        dto.setIntegrityScore(scorecard.getIntegrityScore());
        dto.setIntegritySummary(scorecard.getIntegritySummary());
        return dto;
    }

    public InterviewSessionDto completeInterview(Long sessionId, String nextStage, String hrEmail) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewSession", "id", sessionId));

        session.setStatus(InterviewSessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());

        if (nextStage != null && !nextStage.isBlank()) {
            try {
                CandidateStage targetStage = CandidateStage.valueOf(nextStage);
                session.getCandidate().setStage(targetStage);
                candidateRepository.save(session.getCandidate());
                log.info("Candidate #{} advanced to stage '{}' following interview #{}",
                        session.getCandidate().getId(), targetStage, sessionId);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid next stage '{}' ignored", nextStage);
            }
        }

        session = sessionRepository.save(session);
        return mapToDto(session);
    }

    public InterviewSessionDto cancelInterview(Long sessionId, String hrEmail) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewSession", "id", sessionId));

        session.setStatus(InterviewSessionStatus.CANCELLED);
        session = sessionRepository.save(session);
        return mapToDto(session);
    }

    private InterviewSessionDto mapToDto(InterviewSession s) {
        return InterviewSessionDto.builder()
                .id(s.getId())
                .candidateId(s.getCandidateId())
                .candidateName(s.getCandidateName())
                .candidateEmail(s.getCandidateEmail())
                .candidatePhone(s.getCandidatePhone())
                .candidateResumeUrl(s.getCandidate() != null ? s.getCandidate().getResumeUrl() : null)
                .jobPostingId(s.getJobPostingId())
                .jobTitle(s.getJobTitle())
                .interviewerId(s.getInterviewerId())
                .interviewerName(s.getInterviewerName())
                .interviewerEmail(s.getInterviewerEmail())
                .roundName(s.getRoundName())
                .scheduledStart(s.getScheduledStart())
                .scheduledEnd(s.getScheduledEnd())
                .status(s.getStatus())
                .roomName(s.getRoomName())
                .guestAccessToken(s.getGuestAccessToken())
                .guestTokenExpiry(s.getGuestTokenExpiry())
                .meetingLink(s.getMeetingLink())
                .interviewerJoinedAt(s.getInterviewerJoinedAt())
                .candidateJoinedAt(s.getCandidateJoinedAt())
                .completedAt(s.getCompletedAt())
                .interviewNotes(s.getInterviewNotes())
                .integrityStatus(s.getIntegrityStatus())
                .integrityDetails(s.getIntegrityDetails())
                .createdAt(s.getCreatedAt())
                .build();
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"").replace("\n", " ").replace("\r", "");
    }
}
