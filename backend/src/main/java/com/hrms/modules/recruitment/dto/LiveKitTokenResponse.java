package com.hrms.modules.recruitment.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiveKitTokenResponse {
    private String token;
    private String serverUrl;
    private String roomName;
    private String participantIdentity;
    private String participantName;
    private boolean isInterviewer;
    private InterviewSessionDto session;
}
