package com.hrms.modules.recruitment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebRtcSignalDto {
    private String id;
    private Long sessionId;
    private String senderType; // "CANDIDATE" or "INTERVIEWER"
    private String senderName;
    private String signalType; // "OFFER", "ANSWER", "ICE", "JOIN", "LEAVE", "CHAT"
    private String payload;    // JSON string for SDP / ICE candidate or chat message text
    private Long timestamp;
}
