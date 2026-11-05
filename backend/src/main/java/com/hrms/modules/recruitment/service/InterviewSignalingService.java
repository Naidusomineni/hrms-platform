package com.hrms.modules.recruitment.service;

import com.hrms.modules.recruitment.dto.WebRtcSignalDto;
import com.hrms.modules.recruitment.entity.InterviewSession;
import com.hrms.modules.recruitment.repository.InterviewSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
public class InterviewSignalingService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(InterviewSignalingService.class);

    private final InterviewSessionRepository sessionRepository;
    @Nullable
    private final SimpMessagingTemplate messagingTemplate;

    public InterviewSignalingService(InterviewSessionRepository sessionRepository, @Nullable SimpMessagingTemplate messagingTemplate) {
        this.sessionRepository = sessionRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // Buffer to hold signals per interview session (max 150 per session)
    private final Map<Long, List<WebRtcSignalDto>> sessionSignalBuffer = new ConcurrentHashMap<>();

    public WebRtcSignalDto postSignal(Long sessionId, WebRtcSignalDto signal) {
        if (signal.getId() == null) {
            signal.setId(UUID.randomUUID().toString());
        }
        if (signal.getTimestamp() == null) {
            signal.setTimestamp(System.currentTimeMillis());
        }
        signal.setSessionId(sessionId);

        List<WebRtcSignalDto> buffer = sessionSignalBuffer.computeIfAbsent(sessionId, k -> new CopyOnWriteArrayList<>());
        buffer.add(signal);

        // Prune older ephemeral signals (HEARTBEAT/JOIN) older than 60 seconds, keep CHAT signals intact
        if (buffer.size() > 200) {
            long cutoff = System.currentTimeMillis() - 60000;
            buffer.removeIf(s -> !"CHAT".equalsIgnoreCase(s.getSignalType()) && s.getTimestamp() < cutoff);
        }

        // Broadcast to WebSocket subscribers if STOMP broker is active
        try {
            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/interview/" + sessionId, signal);
            }
        } catch (Exception e) {
            log.debug("WebSocket broadcast skipped or unavailable: {}", e.getMessage());
        }

        log.debug("Dispatched WebRTC signal [{}] for session #{} by {}", signal.getSignalType(), sessionId, signal.getSenderType());
        return signal;
    }

    public List<WebRtcSignalDto> getSignals(Long sessionId, long sinceTimestamp, String excludeSenderType) {
        return getSignals(sessionId, sinceTimestamp, excludeSenderType, null);
    }

    public List<WebRtcSignalDto> getSignals(Long sessionId, long sinceTimestamp, String excludeSenderType, String excludeSenderIdentity) {
        List<WebRtcSignalDto> buffer = sessionSignalBuffer.get(sessionId);
        if (buffer == null || buffer.isEmpty()) {
            return Collections.emptyList();
        }

        return buffer.stream()
                .filter(s -> s.getTimestamp() > sinceTimestamp)
                .filter(s -> {
                    // 1. Exclude signals originating from self if identity provided
                    if (excludeSenderIdentity != null && !excludeSenderIdentity.isBlank() &&
                        excludeSenderIdentity.equalsIgnoreCase(s.getSenderIdentity())) {
                        return false;
                    }
                    // 2. Chat, heartbeats, and room presence signals should be visible to ALL participants in the room
                    if ("CHAT".equalsIgnoreCase(s.getSignalType()) ||
                        "JOIN".equalsIgnoreCase(s.getSignalType()) ||
                        "LEAVE".equalsIgnoreCase(s.getSignalType()) ||
                        "HEARTBEAT".equalsIgnoreCase(s.getSignalType())) {
                        return true;
                    }
                    // 3. For directed WebRTC P2P signals (OFFER, ANSWER, ICE), deliver if targeted to self or broadcast
                    if (s.getTargetIdentity() != null && !s.getTargetIdentity().isBlank() && !"*".equals(s.getTargetIdentity())) {
                        if (excludeSenderIdentity != null && !excludeSenderIdentity.isBlank()) {
                            return s.getTargetIdentity().equalsIgnoreCase(excludeSenderIdentity);
                        }
                    }
                    // 4. Default role-based filtering only if identity is not specified
                    if (excludeSenderIdentity != null && !excludeSenderIdentity.isBlank()) {
                        return true;
                    }
                    return excludeSenderType == null || !excludeSenderType.equalsIgnoreCase(s.getSenderType());
                })
                .collect(Collectors.toList());
    }

    public Long getSessionIdFromGuestToken(String guestToken) {
        return sessionRepository.findByGuestAccessToken(guestToken)
                .map(session -> {
                    if (session.getStatus() == com.hrms.enums.InterviewSessionStatus.SCHEDULED || 
                        session.getStatus() == com.hrms.enums.InterviewSessionStatus.IN_PROGRESS) {
                        return session.getId();
                    }
                    if (session.getCandidate() != null) {
                        List<InterviewSession> active = sessionRepository.findActiveSessionsForCandidate(session.getCandidate().getId());
                        if (!active.isEmpty()) {
                            return active.get(0).getId();
                        }
                    }
                    return session.getId();
                })
                .orElse(null);
    }
}
