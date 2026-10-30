package com.hrms.modules.communication.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AnnouncementRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    @Builder.Default
    private String category = "GENERAL"; // GENERAL, HR_POLICY, LEADERSHIP, EVENT, EMERGENCY

    @Builder.Default
    private String priority = "NORMAL"; // NORMAL, IMPORTANT, URGENT

    @Builder.Default
    private String targetAudience = "ALL"; // ALL, DEPARTMENT, ROLE

    private Long departmentId;

    @Builder.Default
    private Boolean pinned = false;

    private LocalDateTime expiresAt;

    @Builder.Default
    private Boolean acknowledgmentRequired = false;
}
