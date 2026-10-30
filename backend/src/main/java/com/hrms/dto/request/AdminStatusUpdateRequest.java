package com.hrms.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminStatusUpdateRequest {

    @NotNull(message = "Active status is required")
    private Boolean isActive;
}
