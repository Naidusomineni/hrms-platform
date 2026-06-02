package com.hrms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SystemSettingRequest {
    @NotBlank(message = "Setting value is required")
    private String value;
}
