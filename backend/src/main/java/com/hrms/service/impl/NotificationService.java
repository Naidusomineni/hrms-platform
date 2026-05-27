package com.hrms.service.impl;

import com.hrms.dto.response.NotificationResponse;
import com.hrms.entity.*;
import com.hrms.enums.NotificationType;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service @Slf4j @RequiredArgsConstructor @Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void send(Long userId, String title, String message, NotificationType type, String actionUrl) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User","id",userId));

        Notification notif = Notification.builder()
            .user(user).title(title).message(message).type(type)
            .actionUrl(actionUrl).isRead(false).build();
        notif = notificationRepository.save(notif);

        // Push via WebSocket to the specific user
        try {
            messagingTemplate.convertAndSendToUser(
                user.getEmail(), "/queue/notifications", toResponse(notif));
        } catch (Exception e) {
            log.warn("WebSocket push failed for user {}: {}", userId, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getForUser(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public void markAllRead(Long userId) {
        notificationRepository.markAllRead(userId);
    }

    public void markRead(Long notifId) {
        notificationRepository.findById(notifId).ifPresent(n -> {
            n.setIsRead(true); n.setReadAt(LocalDateTime.now());
            notificationRepository.save(n);
        });
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
            .id(n.getId()).title(n.getTitle()).message(n.getMessage())
            .type(n.getType()).isRead(n.getIsRead()).readAt(n.getReadAt())
            .actionUrl(n.getActionUrl()).entityId(n.getEntityId()).entityType(n.getEntityType())
            .createdAt(n.getCreatedAt()).build();
    }
}
