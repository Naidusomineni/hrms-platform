package com.hrms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminRoleUpdateRequest {

    @NotBlank(message = "Role is required")
    private String role;
}
