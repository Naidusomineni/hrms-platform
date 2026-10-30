package com.hrms.modules.communication.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AnnouncementResponse {

    private Long id;
    private String title;
    private String content;
    private String category;
    private String priority;
    private String targetAudience;
    private Long departmentId;
    private String departmentName;
    private Boolean pinned;
    private Long authorId;
    private String authorName;
    private LocalDateTime publishedAt;
    private LocalDateTime expiresAt;
    private Boolean acknowledgmentRequired;
    private Boolean isAcknowledgedByCurrentUser;
    private long totalAcknowledgments;
}
