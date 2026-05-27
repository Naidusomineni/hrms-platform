package com.hrms.dto.response;
import com.hrms.enums.NotificationType;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private Boolean isRead;
    private LocalDateTime readAt;
    private String actionUrl;
    private Long entityId;
    private String entityType;
    private LocalDateTime createdAt;
}
