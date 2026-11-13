package com.hrms.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {
    private Long id;
    private String ipAddress;
    private String deviceInfo;
    private Instant expiryDate;
    private Boolean isRevoked;
}
