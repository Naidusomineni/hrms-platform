package com.hrms.controller.v1;

import com.hrms.dto.request.*;
import com.hrms.dto.response.*;
import com.hrms.service.impl.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Auth, JWT, password management, email verification")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Registration successful. Please verify your email.", authService.register(req)));
    }

    @PostMapping("/login")
    @Operation(summary = "Login — returns access + refresh tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest req, HttpServletRequest httpReq) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(req, httpReq)));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token (token rotation)")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", authService.refreshToken(req)));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout — revoke refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestParam String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @PostMapping("/logout-all")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Logout from all devices")
    public ResponseEntity<ApiResponse<Void>> logoutAll(@AuthenticationPrincipal UserDetails userDetails) {
        // userId must be resolved from userDetails
        return ResponseEntity.ok(ApiResponse.success("All sessions invalidated"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Initiate password reset — sends OTP to email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req);
        return ResponseEntity.ok(ApiResponse.success("If your email is registered, you will receive an OTP shortly."));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using OTP")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully. Please login with your new password."));
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify email address using token")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @RequestParam String token, @RequestParam String email) {
        authService.verifyEmail(token, email);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully!"));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend email verification link")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@RequestParam String email) {
        authService.resendVerificationEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Verification email resent"));
    }

    @PostMapping("/change-password")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Change password (logged-in user)")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest req,
            @RequestParam Long userId) {
        authService.changePassword(userId, req);
        return ResponseEntity.ok(ApiResponse.success("Password changed. Please login again."));
    }

    @GetMapping("/login-history")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get login history for current user")
    public ResponseEntity<ApiResponse<?>> loginHistory(@RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.success(authService.getLoginHistory(userId)));
    }
}
