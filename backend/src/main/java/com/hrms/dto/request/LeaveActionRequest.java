package com.hrms.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LeaveActionRequest {
    @NotBlank private String action;
    private String comments;
}
