package com.hrms.modules.recruitment.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrityTelemetryDto {
    private Integer tabSwitchCount;
    private Integer windowBlurCount;
    private Boolean virtualCameraDetected;
    private Boolean virtualAudioDetected;
    private String cameraLabel;
    private String audioDeviceLabel;
    private String clientIp;
    private String userAgent;
    private Integer screenCount;
    private String notes;
    private LocalDateTime clientTimestamp;
}
