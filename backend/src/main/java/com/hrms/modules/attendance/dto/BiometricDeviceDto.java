package com.hrms.modules.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BiometricDeviceDto {
    private Long id;

    @NotBlank(message = "Device code is required")
    private String deviceCode;

    @NotBlank(message = "Device name is required")
    private String deviceName;

    private String ipAddress;
    private String location;
    private Boolean isActive;
    private LocalDateTime lastSyncAt;
}
