package com.hrms.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank @Email private String email;
    @NotBlank @Size(min=6,max=6) private String otp;
    @NotBlank @Size(min=8) private String newPassword;
}
