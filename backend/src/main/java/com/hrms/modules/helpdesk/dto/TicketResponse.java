package com.hrms.modules.helpdesk.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TicketResponse {

    private Long id;
    private String ticketNumber;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private String departmentName;
    private String category;
    private String priority;
    private String status;
    private String title;
    private String description;
    private Long assetId;
    private String assetName;
    private String assetSerialNumber;
    private Long assignedToUserId;
    private String assignedToName;
    private LocalDateTime slaDeadline;
    private String resolutionNotes;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private List<CommentDto> comments;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CommentDto {
        private Long id;
        private Long authorId;
        private String authorName;
        private String commentText;
        private Boolean isInternal;
        private LocalDateTime createdAt;
    }
}
