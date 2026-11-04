package com.hrms.modules.recruitment.service;

import com.hrms.exception.BadRequestException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.entity.Candidate;
import com.hrms.entity.Employee;
import com.hrms.entity.JobPosting;
import com.hrms.enums.CandidateStage;
import com.hrms.enums.InterviewSessionStatus;
import com.hrms.enums.PanelistRole;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.repository.EmployeeRepository;
import com.hrms.modules.recruitment.dto.*;
import com.hrms.modules.recruitment.entity.InterviewPanelist;
import com.hrms.modules.recruitment.entity.InterviewScorecard;
import com.hrms.modules.recruitment.entity.InterviewSession;
import com.hrms.modules.recruitment.repository.CandidateRepository;
import com.hrms.modules.recruitment.repository.InterviewPanelistRepository;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class InterviewService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(InterviewService.class);

    private final InterviewSessionRepository sessionRepository;
    private final CandidateRepository candidateRepository;
    private final EmployeeRepository employeeRepository;
    private final JobPostingRepository jobPostingRepository;
    private final InterviewScorecardRepository scorecardRepository;
    private final InterviewPanelistRepository interviewPanelistRepository;
    private final LiveKitTokenService liveKitTokenService;
    private final EmailService emailService;

    public InterviewService(InterviewSessionRepository sessionRepository,
                            CandidateRepository candidateRepository,
                            EmployeeRepository employeeRepository,
                            JobPostingRepository jobPostingRepository,
                            InterviewScorecardRepository scorecardRepository,
                            InterviewPanelistRepository interviewPanelistRepository,
                            LiveKitTokenService liveKitTokenService,
                            EmailService emailService) {
        this.sessionRepository = sessionRepository;
        this.candidateRepository = candidateRepository;
        this.employeeRepository = employeeRepository;
        this.jobPostingRepository = jobPostingRepository;
        this.scorecardRepository = scorecardRepository;
        this.interviewPanelistRepository = interviewPanelistRepository;
        this.liveKitTokenService = liveKitTokenService;
        this.emailService = emailService;
    }

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

        // Close out previous active sessions for this candidate so only this fresh session remains active
        List<InterviewSession> previousActive = sessionRepository.findActiveSessionsForCandidate(candidate.getId());
        for (InterviewSession prev : previousActive) {
            prev.setStatus(InterviewSessionStatus.COMPLETED);
            sessionRepository.save(prev);
        }

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

        final InterviewSession finalSession = sessionRepository.save(session);

        // Save assigned panelists
        List<InterviewPanelist> savedPanelists = new ArrayList<>();
        if (request.getPanelists() != null && !request.getPanelists().isEmpty()) {
            for (PanelistAssignmentRequest par : request.getPanelists()) {
                if (par.getEmployeeId() != null && !par.getEmployeeId().equals(interviewer.getId())) {
                    employeeRepository.findById(par.getEmployeeId()).ifPresent(emp -> {
                        InterviewPanelist p = InterviewPanelist.builder()
                                .interviewSession(finalSession)
                                .employee(emp)
                                .role(par.getRole() != null ? par.getRole() : PanelistRole.TECH_PANELIST)
                                .build();
                        p.setTenantId(tenantId);
                        savedPanelists.add(interviewPanelistRepository.save(p));
                    });
                }
            }
        } else if (request.getPanelistIds() != null && !request.getPanelistIds().isEmpty()) {
            for (Long pId : request.getPanelistIds()) {
                if (pId != null && !pId.equals(interviewer.getId())) {
                    employeeRepository.findById(pId).ifPresent(emp -> {
                        InterviewPanelist p = InterviewPanelist.builder()
                                .interviewSession(finalSession)
                                .employee(emp)
                                .role(PanelistRole.TECH_PANELIST)
                                .build();
                        p.setTenantId(tenantId);
                        savedPanelists.add(interviewPanelistRepository.save(p));
                    });
                }
            }
        }

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

        // Email dispatch to Lead Interviewer
        String evaluatorMeetingLink = frontendUrl + "/recruitment/interview/" + session.getId();
        if (interviewer.getEmail() != null && !interviewer.getEmail().isBlank()) {
            emailService.sendInterviewInvitationEmail(
                    interviewer.getEmail(),
                    interviewer.getFullName(),
                    jobTitle + " (Lead Evaluator)",
                    request.getRoundName(),
                    formattedTime,
                    evaluatorMeetingLink
            );
        }

        // Email dispatch to all Technical Panelists
        for (InterviewPanelist p : savedPanelists) {
            Employee panelEmp = p.getEmployee();
            if (panelEmp.getEmail() != null && !panelEmp.getEmail().isBlank()) {
                emailService.sendInterviewInvitationEmail(
                        panelEmp.getEmail(),
                        panelEmp.getFullName(),
                        jobTitle + " (" + p.getRole() + ")",
                        request.getRoundName(),
                        formattedTime,
                        evaluatorMeetingLink
                );
            }
        }

        log.info("Scheduled interview session #{} in room '{}' with {} panelists for candidate '{}'",
                finalSession.getId(), roomName, savedPanelists.size(), candidate.getName());
        return mapToDto(finalSession);
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

        // Resolve authenticated employee joining
        Employee joinedEmployee = null;
        if (employeeEmail != null && !employeeEmail.isBlank()) {
            joinedEmployee = employeeRepository.findByEmail(employeeEmail).orElse(null);
        }
        if (joinedEmployee == null) {
            joinedEmployee = session.getInterviewer();
        }

        boolean isLead = session.getInterviewer().getId().equals(joinedEmployee.getId());
        String roleTitle = isLead ? "Lead Interviewer" : "Tech Panelist";

        // Mark panelist joinedAt if joining user is an assigned panelist
        Optional<InterviewPanelist> panelistOpt = interviewPanelistRepository.findByInterviewSessionIdAndEmployeeId(id, joinedEmployee.getId());
        if (panelistOpt.isPresent()) {
            InterviewPanelist p = panelistOpt.get();
            if (p.getJoinedAt() == null) {
                p.setJoinedAt(LocalDateTime.now());
                interviewPanelistRepository.save(p);
            }
            if (p.getRole() != null) {
                roleTitle = p.getRole().name();
            }
        }

        identity = "emp-" + joinedEmployee.getId();
        displayName = joinedEmployee.getFullName() + " (" + roleTitle + ")";

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

        // Auto-upgrade if candidate opened an old completed link to latest active session
        if ((session.getStatus() == InterviewSessionStatus.COMPLETED || session.getStatus() == InterviewSessionStatus.CANCELLED)
                && session.getCandidate() != null) {
            List<InterviewSession> active = sessionRepository.findActiveSessionsForCandidate(session.getCandidate().getId());
            if (!active.isEmpty() && !active.get(0).getId().equals(session.getId())) {
                log.info("Candidate #{} guest link auto-routed from session #{} to latest active session #{}",
                        session.getCandidate().getId(), session.getId(), active.get(0).getId());
                session = active.get(0);
            }
        }

        if (session.getGuestTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Interview session link has expired. Please contact HR for a new invitation.");
        }

        return mapToDto(session);
    }

    @Transactional
    public LiveKitTokenResponse candidateJoinRoom(String guestToken, IntegrityTelemetryDto telemetry) {
        InterviewSession session = sessionRepository.findByGuestAccessTokenWithDetails(guestToken)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewSession", "guestToken", guestToken));

        // Auto-upgrade if candidate opened an old completed link to latest active session
        if ((session.getStatus() == InterviewSessionStatus.COMPLETED || session.getStatus() == InterviewSessionStatus.CANCELLED)
                && session.getCandidate() != null) {
            List<InterviewSession> active = sessionRepository.findActiveSessionsForCandidate(session.getCandidate().getId());
            if (!active.isEmpty() && !active.get(0).getId().equals(session.getId())) {
                log.info("Candidate #{} join room auto-routed from session #{} to latest active session #{}",
                        session.getCandidate().getId(), session.getId(), active.get(0).getId());
                session = active.get(0);
            }
        }

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

        Employee interviewer = null;
        if (hrEmail != null && !hrEmail.isBlank()) {
            interviewer = employeeRepository.findByEmail(hrEmail).orElse(null);
        }
        if (interviewer == null) {
            interviewer = session.getInterviewer();
        }

        final Long currentInterviewerId = interviewer.getId();
        List<InterviewScorecard> existing = scorecardRepository.findByTenantIdAndCandidateId(session.getTenantId(), session.getCandidate().getId());
        InterviewScorecard scorecard = existing.stream()
                .filter(s -> sessionId.equals(s.getInterviewSessionId()) &&
                             s.getInterviewer() != null && currentInterviewerId.equals(s.getInterviewer().getId()))
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
        log.info("Saved live scorecard #{} by evaluator #{} for interview session #{}", scorecard.getId(), currentInterviewerId, sessionId);

        dto.setId(scorecard.getId());
        dto.setCandidateId(session.getCandidate().getId());
        dto.setInterviewerId(interviewer.getId());
        dto.setInterviewerName(interviewer.getFullName());
        dto.setInterviewSessionId(sessionId);
        dto.setIntegrityScore(scorecard.getIntegrityScore());
        dto.setIntegritySummary(scorecard.getIntegritySummary());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<InterviewScorecardDto> getScorecardsForSession(Long sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewSession", "id", sessionId));

        List<InterviewScorecard> scorecards = scorecardRepository.findByTenantIdAndCandidateId(session.getTenantId(), session.getCandidate().getId())
                .stream()
                .filter(s -> sessionId.equals(s.getInterviewSessionId()))
                .collect(Collectors.toList());

        return scorecards.stream().map(sc -> InterviewScorecardDto.builder()
                .id(sc.getId())
                .candidateId(sc.getCandidate().getId())
                .interviewerId(sc.getInterviewer() != null ? sc.getInterviewer().getId() : null)
                .interviewerName(sc.getInterviewer() != null ? sc.getInterviewer().getFullName() : "Panelist")
                .roundName(sc.getRoundName())
                .technicalRating(sc.getTechnicalRating())
                .communicationRating(sc.getCommunicationRating())
                .cultureFitRating(sc.getCultureFitRating())
                .recommendation(sc.getRecommendation())
                .feedback(sc.getFeedback())
                .interviewSessionId(sc.getInterviewSessionId())
                .integrityScore(sc.getIntegrityScore())
                .integritySummary(sc.getIntegritySummary())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewPanelistDto> getPanelistsForSession(Long sessionId) {
        return interviewPanelistRepository.findByInterviewSessionIdWithEmployee(sessionId).stream()
                .map(p -> InterviewPanelistDto.builder()
                        .id(p.getId())
                        .employeeId(p.getEmployee().getId())
                        .employeeName(p.getEmployee().getFullName())
                        .employeeEmail(p.getEmployee().getEmail())
                        .designation(p.getEmployee().getDesignation())
                        .department(p.getEmployee().getDepartment() != null ? p.getEmployee().getDepartment().getName() : null)
                        .role(p.getRole())
                        .joinedAt(p.getJoinedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public InterviewPanelistDto addPanelistToSession(Long sessionId, PanelistAssignmentRequest req) {
        String tenantId = TenantContext.getTenantId();
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewSession", "id", sessionId));

        Employee emp = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", req.getEmployeeId()));

        Optional<InterviewPanelist> existing = interviewPanelistRepository.findByInterviewSessionIdAndEmployeeId(sessionId, req.getEmployeeId());
        if (existing.isPresent()) {
            InterviewPanelist p = existing.get();
            if (req.getRole() != null) {
                p.setRole(req.getRole());
                p = interviewPanelistRepository.save(p);
            }
            return InterviewPanelistDto.builder()
                    .id(p.getId())
                    .employeeId(emp.getId())
                    .employeeName(emp.getFullName())
                    .employeeEmail(emp.getEmail())
                    .designation(emp.getDesignation())
                    .role(p.getRole())
                    .joinedAt(p.getJoinedAt())
                    .build();
        }

        InterviewPanelist p = InterviewPanelist.builder()
                .interviewSession(session)
                .employee(emp)
                .role(req.getRole() != null ? req.getRole() : PanelistRole.TECH_PANELIST)
                .build();
        p.setTenantId(tenantId);
        p = interviewPanelistRepository.save(p);

        // Send instant mid-call join email invitation to the newly added employee
        String evaluatorMeetingLink = frontendUrl + "/recruitment/interview/" + session.getId();
        if (emp.getEmail() != null && !emp.getEmail().isBlank()) {
            String nowTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
            String jobTitle = (session.getJobTitle() != null && !session.getJobTitle().isBlank())
                    ? session.getJobTitle()
                    : (session.getJobPosting() != null ? session.getJobPosting().getTitle() : "Candidate Interview");
            String roleStr = p.getRole() != null ? p.getRole().name().replace('_', ' ') : "Panel Evaluator";
            emailService.sendInterviewInvitationEmail(
                    emp.getEmail(),
                    emp.getFullName(),
                    jobTitle + " (" + roleStr + " - Live Call)",
                    session.getRoundName() != null ? session.getRoundName() : "Technical Interview",
                    nowTime + " [CALL IN PROGRESS - JOIN NOW]",
                    evaluatorMeetingLink
            );
            log.info("Sent mid-call interview invitation email to panelist {} ({}) for session #{}",
                    emp.getFullName(), emp.getEmail(), session.getId());
        }

        return InterviewPanelistDto.builder()
                .id(p.getId())
                .employeeId(emp.getId())
                .employeeName(emp.getFullName())
                .employeeEmail(emp.getEmail())
                .designation(emp.getDesignation())
                .role(p.getRole())
                .build();
    }

    public void removePanelistFromSession(Long sessionId, Long panelistId) {
        InterviewPanelist p = interviewPanelistRepository.findById(panelistId)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewPanelist", "id", panelistId));
        if (!sessionId.equals(p.getInterviewSession().getId())) {
            throw new BadRequestException("Panelist does not belong to session " + sessionId);
        }
        interviewPanelistRepository.delete(p);
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

                // Dispatch corporate stage advancement notification to candidate
                Candidate candidate = session.getCandidate();
                if (candidate != null && candidate.getEmail() != null && !candidate.getEmail().isBlank()) {
                    boolean isFinalOffer = (targetStage == CandidateStage.OFFER_PENDING || targetStage == CandidateStage.HIRED);
                    String roundDisplay = (session.getRoundName() != null && !session.getRoundName().isBlank())
                            ? session.getRoundName()
                            : "Interview Evaluation";
                    String jobTitle = (session.getJobTitle() != null && !session.getJobTitle().isBlank())
                            ? session.getJobTitle()
                            : (session.getJobPosting() != null ? session.getJobPosting().getTitle() : "Position");
                    String humanNextStage = formatStageName(targetStage);

                    emailService.sendInterviewStageAdvanceEmail(
                            candidate.getEmail(),
                            candidate.getName(),
                            jobTitle,
                            roundDisplay,
                            humanNextStage,
                            isFinalOffer
                    );
                    log.info("Dispatched stage advancement email to candidate '{}' ({}) -> {}",
                            candidate.getName(), candidate.getEmail(), humanNextStage);
                }
            } catch (IllegalArgumentException e) {
                log.warn("Invalid next stage '{}' ignored", nextStage);
            }
        }

        session = sessionRepository.save(session);
        return mapToDto(session);
    }

    private String formatStageName(CandidateStage stage) {
        if (stage == null) return "Next Evaluation Stage";
        switch (stage) {
            case INTERVIEW_ROUND_1: return "Technical Screening (Round 1)";
            case INTERVIEW_ROUND_2: return "Technical Deep-Dive / Panel Interview (Round 2)";
            case OFFER_PENDING: return "Job Offer & Compensation Discussion";
            case HIRED: return "Offer Finalized & Corporate Onboarding";
            case DROPPED: return "Application Review Completed";
            case SCREENING: return "Initial Profile Screening";
            default: return stage.name().replace('_', ' ');
        }
    }

    public InterviewSessionDto cancelInterview(Long sessionId, String hrEmail) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewSession", "id", sessionId));

        session.setStatus(InterviewSessionStatus.CANCELLED);
        session = sessionRepository.save(session);
        return mapToDto(session);
    }

    private InterviewSessionDto mapToDto(InterviewSession s) {
        List<InterviewPanelistDto> panelistDtos = new ArrayList<>();
        if (s.getId() != null) {
            panelistDtos = interviewPanelistRepository.findByInterviewSessionIdWithEmployee(s.getId()).stream()
                    .map(p -> InterviewPanelistDto.builder()
                            .id(p.getId())
                            .employeeId(p.getEmployee().getId())
                            .employeeName(p.getEmployee().getFullName())
                            .employeeEmail(p.getEmployee().getEmail())
                            .designation(p.getEmployee().getDesignation())
                            .department(p.getEmployee().getDepartment() != null ? p.getEmployee().getDepartment().getName() : null)
                            .role(p.getRole())
                            .joinedAt(p.getJoinedAt())
                            .build())
                    .collect(Collectors.toList());
        }

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
                .panelists(panelistDtos)
                .build();
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"").replace("\n", " ").replace("\r", "");
    }
}
