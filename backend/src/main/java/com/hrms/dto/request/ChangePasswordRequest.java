package com.hrms.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank private String currentPassword;
    @NotBlank
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!._-]).{8,64}$",
        message = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@#$%^&+=!._-)"
    )
    private String newPassword;
}
