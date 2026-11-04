package com.hrms.modules.recruitment.dto;

import com.hrms.enums.InterviewSessionStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSessionDto {
    private Long id;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String candidatePhone;
    private String candidateResumeUrl;

    private Long jobPostingId;
    private String jobTitle;

    private Long interviewerId;
    private String interviewerName;
    private String interviewerEmail;

    private String roundName;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private InterviewSessionStatus status;

    private String roomName;
    private String guestAccessToken;
    private LocalDateTime guestTokenExpiry;
    private String meetingLink;

    private LocalDateTime interviewerJoinedAt;
    private LocalDateTime candidateJoinedAt;
    private LocalDateTime completedAt;
    private String interviewNotes;

    private String integrityStatus;
    private String integrityDetails;
    private LocalDateTime createdAt;

    private java.util.List<InterviewPanelistDto> panelists;
}
