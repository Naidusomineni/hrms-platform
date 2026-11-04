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
@Slf4j
@RequiredArgsConstructor
public class InterviewSignalingService {

    private final InterviewSessionRepository sessionRepository;
    @Nullable
    private final SimpMessagingTemplate messagingTemplate;

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

        // Prune older signals if buffer exceeds 150 to keep memory ultra-lean
        if (buffer.size() > 150) {
            buffer.subList(0, buffer.size() - 100).clear();
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
        List<WebRtcSignalDto> buffer = sessionSignalBuffer.get(sessionId);
        if (buffer == null || buffer.isEmpty()) {
            return Collections.emptyList();
        }

        return buffer.stream()
                .filter(s -> s.getTimestamp() > sinceTimestamp)
                .filter(s -> excludeSenderType == null || !excludeSenderType.equalsIgnoreCase(s.getSenderType()))
                .collect(Collectors.toList());
    }

    public Long getSessionIdFromGuestToken(String guestToken) {
        return sessionRepository.findByGuestAccessToken(guestToken)
                .map(InterviewSession::getId)
                .orElse(null);
    }
}
