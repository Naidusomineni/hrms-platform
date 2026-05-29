package com.hrms.dto.response;
import com.hrms.enums.Role;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    @Builder.Default private String tokenType = "Bearer";
    private Long userId;
    private Long employeeId;
    private String email;
    private String fullName;
    private Role role;
    private Boolean emailVerified;
    private String profilePicture;
    private Long expiresIn;
    private Boolean totpEnabled;
}
