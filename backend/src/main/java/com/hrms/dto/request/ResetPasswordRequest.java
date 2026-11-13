package com.hrms.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank @Email private String email;
    @NotBlank @Size(min=6,max=6) private String otp;
    @NotBlank
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!._-]).{8,64}$",
        message = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@#$%^&+=!._-)"
    )
    private String newPassword;
}
