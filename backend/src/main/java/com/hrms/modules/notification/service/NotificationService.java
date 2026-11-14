package com.hrms.modules.notification.service;

import com.hrms.dto.response.NotificationResponse;
import com.hrms.entity.*;
import com.hrms.enums.NotificationType;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service @Slf4j @RequiredArgsConstructor @Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void send(Long userId, String title, String message, NotificationType type, String actionUrl) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Notification notif = Notification.builder()
            .user(user).title(title).message(message).type(type)
            .actionUrl(actionUrl).isRead(false).build();

        if (notif.getTenantId() == null && user.getTenantId() != null) {
            notif.setTenantId(user.getTenantId());
        }

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
    public Page<NotificationResponse> getForCurrentUser(UserDetails userDetails, Pageable pageable) {
        User user = resolveUser(userDetails);
        return getForUser(user.getId(), pageable);
    }

    @Transactional(readOnly = true)
    public Long countUnreadForCurrentUser(UserDetails userDetails) {
        User user = resolveUser(userDetails);
        return countUnread(user.getId());
    }

    public void markAllReadForCurrentUser(UserDetails userDetails) {
        User user = resolveUser(userDetails);
        markAllRead(user.getId());
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getForUser(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getForUser(Long userId, Pageable pageable, UserDetails userDetails) {
        enforceUserAccess(userId, userDetails);
        return getForUser(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional(readOnly = true)
    public Long countUnread(Long userId, UserDetails userDetails) {
        enforceUserAccess(userId, userDetails);
        return countUnread(userId);
    }

    public void markAllRead(Long userId) {
        notificationRepository.markAllRead(userId);
    }

    public void markAllRead(Long userId, UserDetails userDetails) {
        enforceUserAccess(userId, userDetails);
        markAllRead(userId);
    }

    public void markRead(Long notifId) {
        notificationRepository.findById(notifId).ifPresent(n -> {
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
            notificationRepository.save(n);
        });
    }

    public void markRead(Long notifId, UserDetails userDetails) {
        Notification n = notificationRepository.findById(notifId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notifId));

        if (userDetails != null && !isElevated(userDetails)) {
            User caller = resolveUser(userDetails);
            if (!n.getUser().getId().equals(caller.getId())) {
                throw new AccessDeniedException("Access denied: You cannot modify notifications for other users.");
            }
        }

        n.setIsRead(true);
        n.setReadAt(LocalDateTime.now());
        notificationRepository.save(n);
    }

    private User resolveUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("Authentication required");
        }
        return userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
    }

    private boolean isElevated(UserDetails userDetails) {
        if (userDetails == null) return false;
        return userDetails.getAuthorities().stream().anyMatch(a ->
            a.getAuthority().equals("ROLE_ADMIN") ||
            a.getAuthority().equals("ROLE_SUPER_ADMIN") ||
            a.getAuthority().equals("ROLE_HR"));
    }

    private void enforceUserAccess(Long targetUserId, UserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("Authentication required");
        }
        if (isElevated(userDetails)) {
            return;
        }
        User caller = resolveUser(userDetails);
        if (!caller.getId().equals(targetUserId)) {
            throw new AccessDeniedException("Access denied: You cannot view or modify notifications for other users.");
        }
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
            .id(n.getId()).title(n.getTitle()).message(n.getMessage())
            .type(n.getType()).isRead(n.getIsRead()).readAt(n.getReadAt())
            .actionUrl(n.getActionUrl()).entityId(n.getEntityId()).entityType(n.getEntityType())
            .createdAt(n.getCreatedAt()).build();
    }
}
