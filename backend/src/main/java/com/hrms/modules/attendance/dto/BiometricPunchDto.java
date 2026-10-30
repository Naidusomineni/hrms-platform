package com.hrms.modules.attendance.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BiometricPunchDto {

    @NotBlank(message = "Employee number is required")
    private String employeeNumber;

    @NotNull(message = "Timestamp is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    @NotBlank(message = "Device ID is required")
    private String deviceId;

    private String punchType; // CHECK_IN, CHECK_OUT, or AUTO
}
