package com.hrms.modules.auth.controller;
import com.hrms.modules.auth.service.AuthService;

import com.hrms.dto.request.*;
import com.hrms.dto.response.*;

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

    private boolean isSecureRequest(HttpServletRequest request) {
        if (request == null) return false;
        return request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
    }

    @PostMapping("/login")
    @Operation(summary = "Login — returns access + refresh tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest req, HttpServletRequest httpReq) {
        AuthResponse authResponse = authService.login(req, httpReq);
        boolean isSecure = isSecureRequest(httpReq);
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", authResponse.getRefreshToken())
                .httpOnly(true)
                .secure(isSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(7 * 24 * 3600)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.success("Login successful", authResponse));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token (token rotation)")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @RequestBody(required = false) RefreshTokenRequest req,
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            HttpServletRequest httpReq) {
        String tokenToRefresh = (req != null && req.getRefreshToken() != null && !req.getRefreshToken().isBlank())
                ? req.getRefreshToken()
                : cookieRefreshToken;

        if (tokenToRefresh == null || tokenToRefresh.isBlank()) {
            throw new com.hrms.exception.BadRequestException("Refresh token is required via cookie or request body");
        }

        RefreshTokenRequest resolvedReq = new RefreshTokenRequest();
        resolvedReq.setRefreshToken(tokenToRefresh);
        AuthResponse authResponse = authService.refreshToken(resolvedReq);

        boolean isSecure = isSecureRequest(httpReq);
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", authResponse.getRefreshToken())
                .httpOnly(true)
                .secure(isSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(7 * 24 * 3600)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.success("Token refreshed", authResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout — revoke refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestParam(name = "refreshToken", required = false) String refreshToken,
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            HttpServletRequest httpReq) {
        String tokenToRevoke = (refreshToken != null && !refreshToken.isBlank())
                ? refreshToken
                : cookieRefreshToken;

        if (tokenToRevoke != null && !tokenToRevoke.isBlank()) {
            authService.logout(tokenToRevoke);
        }

        boolean isSecure = isSecureRequest(httpReq);
        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(isSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(ApiResponse.success("Logged out successfully"));
    }

    @PostMapping("/logout-all")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Logout from all devices")
    public ResponseEntity<ApiResponse<Void>> logoutAll(
            @RequestParam(name = "userId", required = false) Long targetUserId,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpReq) {
        if (userDetails == null) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        com.hrms.entity.User caller = authService.getUserByEmail(userDetails.getUsername());
        Long userIdToRevoke = caller.getId();

        if (targetUserId != null && !targetUserId.equals(caller.getId())) {
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isAdmin) {
                throw new org.springframework.security.access.AccessDeniedException("Only administrators can invalidate sessions for other users.");
            }
            userIdToRevoke = targetUserId;
        }

        authService.logoutAll(userIdToRevoke);

        boolean isSecure = isSecureRequest(httpReq);
        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(isSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(ApiResponse.success("All sessions invalidated successfully"));
    }

    @GetMapping("/sessions")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get active login sessions for currently authenticated user")
    public ResponseEntity<ApiResponse<java.util.List<SessionResponse>>> getActiveSessions(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        return ResponseEntity.ok(ApiResponse.success(authService.getActiveSessions(userDetails.getUsername())));
    }

    @DeleteMapping("/sessions/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Revoke specific login session for currently authenticated user")
    public ResponseEntity<ApiResponse<Void>> revokeSession(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        authService.revokeSession(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Session revoked successfully", null));
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
            @RequestParam("token") String token, @RequestParam("email") String email) {
        authService.verifyEmail(token, email);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully!"));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend email verification link")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@RequestParam("email") String email) {
        authService.resendVerificationEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Verification email resent"));
    }

    @PostMapping("/change-password")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Change password (logged-in user)")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest req,
            @RequestParam(name = "userId", required = false) Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        com.hrms.entity.User caller = authService.getUserByEmail(userDetails.getUsername());
        Long targetId = caller.getId();
        if (userId != null && !userId.equals(caller.getId())) {
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isAdmin) {
                throw new org.springframework.security.access.AccessDeniedException("Cannot change password for another user.");
            }
            targetId = userId;
        }
        authService.changePassword(targetId, req);
        return ResponseEntity.ok(ApiResponse.success("Password changed. Please login again."));
    }

    @GetMapping("/login-history")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get login history for current user")
    public ResponseEntity<ApiResponse<?>> loginHistory(
            @RequestParam(name = "userId", required = false) Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        com.hrms.entity.User caller = authService.getUserByEmail(userDetails.getUsername());
        Long targetId = caller.getId();
        if (userId != null && !userId.equals(caller.getId())) {
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isAdmin) {
                throw new org.springframework.security.access.AccessDeniedException("Cannot view login history of another user.");
            }
            targetId = userId;
        }
        return ResponseEntity.ok(ApiResponse.success(authService.getLoginHistory(targetId)));
    }

    @PostMapping("/2fa/setup")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Initialize 2FA TOTP setup (returns secret & otpauth QR URI)")
    public ResponseEntity<ApiResponse<com.hrms.modules.auth.dto.TotpSetupResponse>> setupTotp(
            @RequestParam(name = "userId", required = false) Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        com.hrms.entity.User caller = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(authService.setupTotp(caller.getId())));
    }

    @PostMapping("/2fa/enable")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Enable 2FA TOTP by verifying initial 6-digit code")
    public ResponseEntity<ApiResponse<com.hrms.modules.auth.dto.TotpEnableResponse>> enableTotp(
            @RequestParam(name = "userId", required = false) Long userId,
            @RequestParam("code") int code,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        com.hrms.entity.User caller = authService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("2FA enabled successfully", authService.enableTotp(caller.getId(), code)));
    }

    @PostMapping("/2fa/disable")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Disable 2FA TOTP by supplying current 6-digit code or backup code")
    public ResponseEntity<ApiResponse<Void>> disableTotp(
            @RequestParam(name = "userId", required = false) Long userId,
            @RequestParam("code") int code,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        com.hrms.entity.User caller = authService.getUserByEmail(userDetails.getUsername());
        authService.disableTotp(caller.getId(), code);
        return ResponseEntity.ok(ApiResponse.success("2FA disabled successfully"));
    }
}
