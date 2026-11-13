package com.hrms.modules.auth.service;

import com.hrms.dto.request.*;
import com.hrms.dto.response.AuthResponse;
import com.hrms.dto.response.LoginHistoryResponse;
import com.hrms.entity.*;
import com.hrms.enums.Role;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.DuplicateResourceException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.exception.TokenRefreshException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.infrastructure.redis.DistributedTokenBlacklistService;
import com.hrms.repository.*;
import com.hrms.security.jwt.JwtUtils;
import com.hrms.security.service.UserDetailsServiceImpl;
import com.hrms.service.EmailService;
import com.hrms.util.OtpUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * AuthService v2 — Enterprise-grade authentication service.
 *
 * NEW in v2 vs v1:
 *   ✅ Account lockout after 5 failed attempts (30min lock)
 *   ✅ Forgot password with 6-digit OTP (BCrypt-hashed in DB)
 *   ✅ Email verification on registration
 *   ✅ Refresh token rotation (old token revoked on each refresh)
 *   ✅ Login history tracking (IP, device, browser, OS)
 *   ✅ Change password with session invalidation
 *   ✅ Logout from all devices
 *   ✅ 2FA TOTP verification support
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;
    private final EmailService emailService;
    private final DistributedTokenBlacklistService tokenBlacklistService;
    private final com.hrms.common.audit.AuditService auditService;
    private final TotpService totpService = new TotpService();

    @Value("${jwt.refresh-token.expiration}")
    private Long refreshTokenExpirationMs;

    @Value("${jwt.access-token.expiration}")
    private Long jwtExpirationMs;

    @Value("${security.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${security.lock-duration-minutes:30}")
    private int lockDurationMinutes;

    @Value("${security.otp-expiry-minutes:15}")
    private int otpExpiryMinutes;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // ── REGISTER ──────────────────────────────────────────────────

    public AuthResponse register(RegisterRequest request) {
        log.info("Register attempt for email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        // SECURITY FIX: Self-registration only allows ROLE_EMPLOYEE
        Role assignedRole = request.getRole();
        if (assignedRole == null || (assignedRole != Role.ROLE_EMPLOYEE && assignedRole != Role.ROLE_ADMIN && assignedRole != Role.ROLE_HR)) {
            assignedRole = Role.ROLE_EMPLOYEE;
        }
        // Force employee role for self-registration
        if (assignedRole == Role.ROLE_ADMIN || assignedRole == Role.ROLE_HR) {
            log.warn("⚠️  Prevented privilege escalation attempt: user {} tried to register as {}", request.getEmail(), assignedRole);
            assignedRole = Role.ROLE_EMPLOYEE;
        }

        // Generate email verification token
        String verifyToken = UUID.randomUUID().toString();

        User user = User.builder()
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(assignedRole)
            .isActive(true)
            .emailVerified(false)
            .emailVerifyToken(passwordEncoder.encode(verifyToken))
            .emailVerifyExpiry(LocalDateTime.now().plusHours(24))
            .build();

        user = userRepository.save(user);
        log.info("User registered: id={}, email={}, role={}", user.getId(), user.getEmail(), assignedRole);

        // Auto-provision an Employee profile for the newly registered user
        Department defaultDept = departmentRepository.findAll().stream().findFirst().orElse(null);
        String empNumber;
        do {
            empNumber = "EMP-" + java.time.LocalDate.now().getYear() + "-" + String.format("%04d", (int)(Math.random() * 9000) + 1000);
        } while (employeeRepository.existsByEmployeeNumber(empNumber));

        Employee emp = Employee.builder()
            .user(user)
            .department(defaultDept)
            .employeeNumber(empNumber)
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .designation(user.getRole() == Role.ROLE_EMPLOYEE ? "Associate Engineer" : user.getRole().name().replace("ROLE_", ""))
            .employmentStatus(com.hrms.enums.EmploymentStatus.ACTIVE)
            .dateOfJoining(java.time.LocalDate.now())
            .leaveBalance(24)
            .sickLeaveBalance(12)
            .casualLeaveBalance(8)
            .deleted(false)
            .build();
        emp.setTenantId(user.getTenantId() != null ? user.getTenantId() : "default");
        emp = employeeRepository.save(emp);
        user.setEmployee(emp);
        log.info("Auto-provisioned employee record {} for registered user {}", empNumber, user.getEmail());

        // Send verification email (async — won't block the response)
        emailService.sendEmailVerification(user.getEmail(), user.getFirstName(), verifyToken);

        // Auto-login after registration
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtils.generateToken(userDetails);
        RefreshToken refreshToken = createRefreshToken(user, null, null);

        return buildAuthResponse(user, accessToken, refreshToken.getToken());
    }

    // ── LOGIN ─────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        String ipAddress = extractIpAddress(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        // Pre-check: is account locked?
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user != null && user.isAccountLocked()) {
            log.warn("Login blocked — account locked: {}", request.getEmail());
            auditService.log("USER_LOGIN_BLOCKED", "AUTH", user.getId(),
                "Login blocked — account locked until " + user.getAccountLockedUntil(),
                null, null, request.getEmail(), ipAddress);
            throw new BadRequestException(
                "Account is locked until " + user.getAccountLockedUntil() +
                ". Please try again later or contact HR.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

            // 2FA TOTP Challenge Verification
            if (Boolean.TRUE.equals(user.getTotpEnabled())) {
                if (request.getTotpCode() == null) {
                    log.info("2FA MFA challenge required for user: {}", user.getEmail());
                    return AuthResponse.builder()
                            .email(user.getEmail())
                            .totpEnabled(true)
                            .tokenType("MFA_REQUIRED")
                            .build();
                }
                boolean validTotp = totpService.verifyCode(user.getTotpSecret(), request.getTotpCode());
                if (!validTotp) {
                    validTotp = verifyAndConsumeBackupCode(user, String.valueOf(request.getTotpCode()));
                }
                if (!validTotp) {
                    throw new BadCredentialsException("Invalid 2FA authentication code");
                }
            }

            // Reset failed attempts on success
            user.setFailedLoginAttempts(0);
            user.setAccountLockedUntil(null);
            user.setLastLoginAt(LocalDateTime.now());
            user.setLastLoginIp(ipAddress);

            // SEC-016: 90-day password aging lifecycle policy
            if (user.getPasswordChangedAt() != null &&
                user.getPasswordChangedAt().isBefore(LocalDateTime.now().minusDays(90))) {
                user.setMustChangePassword(true);
                log.info("SEC-016: Password expired (>90 days) for user: {}", user.getEmail());
            }

            userRepository.save(user);

            // Record login history
            recordLoginHistory(user, ipAddress, userAgent, "SUCCESS");

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String userTenant = user.getTenantId();
            if (userTenant != null && !userTenant.isBlank()) {
                TenantContext.setTenantId(userTenant);
            }
            String accessToken = jwtUtils.generateToken(userDetails, userTenant);
            RefreshToken refreshToken = createRefreshToken(user, ipAddress, userAgent);

            log.info("Login success: email={}, ip={}", user.getEmail(), ipAddress);
            auditService.log("USER_LOGIN_SUCCESS", "AUTH", user.getId(),
                "User logged in successfully (Role: " + user.getRole() + ")",
                null, null, user.getEmail(), ipAddress);
            return buildAuthResponse(user, accessToken, refreshToken.getToken());

        } catch (BadCredentialsException e) {
            // Increment failed attempts
            if (user != null) {
                int attempts = user.getFailedLoginAttempts() + 1;
                user.setFailedLoginAttempts(attempts);

                if (attempts >= maxFailedAttempts) {
                    user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(lockDurationMinutes));
                    log.warn("Account locked after {} attempts: {}", attempts, request.getEmail());
                    emailService.sendAccountLockedEmail(user.getEmail(), user.getFirstName(), lockDurationMinutes);
                }
                userRepository.save(user);
                recordLoginHistory(user, ipAddress, userAgent, "FAILED");
            }
            auditService.log("USER_LOGIN_FAILED", "AUTH", user != null ? user.getId() : null,
                "Failed login attempt: Invalid credentials for " + request.getEmail(),
                null, null, request.getEmail(), ipAddress);
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    // ── REFRESH TOKEN (with rotation) ─────────────────────────────

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String requestToken = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenRepository.findByToken(requestToken)
            .orElseThrow(() -> new TokenRefreshException(requestToken, "Refresh token not found"));

        if (refreshToken.getIsRevoked()) {
            // Possible token reuse attack — revoke ALL tokens for this user
            log.warn("⚠️  Revoked token reuse detected for user id: {}", refreshToken.getUser().getId());
            refreshTokenRepository.revokeAllForUser(refreshToken.getUser().getId());
            throw new TokenRefreshException(requestToken, "Refresh token was revoked. Please login again.");
        }

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new TokenRefreshException(requestToken, "Refresh token has expired. Please login again.");
        }

        // Token Rotation: revoke old, issue new
        refreshToken.setIsRevoked(true);
        refreshToken.setRevokedAt(Instant.now());
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String newAccessToken = jwtUtils.generateToken(userDetails);
        RefreshToken newRefreshToken = createRefreshToken(user,
            refreshToken.getIpAddress(), refreshToken.getDeviceInfo());

        return buildAuthResponse(user, newAccessToken, newRefreshToken.getToken());
    }

    // ── LOGOUT ────────────────────────────────────────────────────

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(token -> {
            token.setIsRevoked(true);
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
            auditService.log("USER_LOGOUT", "AUTH", token.getUser().getId(),
                "User logged out and session revoked for " + token.getUser().getEmail());
        });
    }

    @Transactional
    public void logoutAll(Long userId) {
        refreshTokenRepository.revokeAllForUser(userId);
        log.info("All sessions revoked for userId: {}", userId);
        auditService.log("USER_LOGOUT_ALL", "AUTH", userId,
            "All active login sessions revoked for user #" + userId);
    }

    // ── FORGOT PASSWORD ───────────────────────────────────────────

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // Always return success — never reveal if email exists (prevent user enumeration)
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String rawOtp = OtpUtils.generateOtp(6);
            user.setPasswordResetTokenHash(passwordEncoder.encode(rawOtp));
            user.setPasswordResetExpiry(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
            userRepository.save(user);
            emailService.sendPasswordResetOtp(user.getEmail(), user.getFirstName(), rawOtp, otpExpiryMinutes);
            log.info("Password reset OTP sent to: {}", user.getEmail());
            auditService.log("PASSWORD_RESET_REQUESTED", "AUTH", user.getId(),
                "Password reset OTP requested for " + user.getEmail());
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadRequestException("Invalid request"));

        if (user.getPasswordResetTokenHash() == null) {
            throw new BadRequestException("No active password reset request found");
        }
        if (LocalDateTime.now().isAfter(user.getPasswordResetExpiry())) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }
        if (!passwordEncoder.matches(request.getOtp(), user.getPasswordResetTokenHash())) {
            throw new BadRequestException("Invalid OTP. Please check the code sent to your email.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetTokenHash(null);
        user.setPasswordResetExpiry(null);
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setMustChangePassword(false);
        userRepository.save(user);

        // Invalidate all sessions after password reset
        refreshTokenRepository.revokeAllForUser(user.getId());
        emailService.sendPasswordChangedConfirmation(user.getEmail(), user.getFirstName());
        log.info("Password reset successfully for: {}", user.getEmail());
        auditService.log("PASSWORD_RESET_COMPLETED", "AUTH", user.getId(),
            "Password reset successfully with OTP for " + user.getEmail());
    }

    // ── EMAIL VERIFICATION ────────────────────────────────────────

    @Transactional
    public void verifyEmail(String token, String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadRequestException("Invalid verification link"));

        if (user.getEmailVerified()) {
            return; // Already verified
        }
        if (user.getEmailVerifyExpiry() == null || LocalDateTime.now().isAfter(user.getEmailVerifyExpiry())) {
            throw new BadRequestException("Verification link has expired. Please request a new one.");
        }
        if (!passwordEncoder.matches(token, user.getEmailVerifyToken())) {
            throw new BadRequestException("Invalid verification link");
        }

        user.setEmailVerified(true);
        user.setEmailVerifyToken(null);
        user.setEmailVerifyExpiry(null);
        userRepository.save(user);
        log.info("Email verified for: {}", email);
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (user.getEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        String newToken = UUID.randomUUID().toString();
        user.setEmailVerifyToken(passwordEncoder.encode(newToken));
        user.setEmailVerifyExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        emailService.sendEmailVerification(user.getEmail(), user.getFirstName(), newToken);
    }

    // ── CHANGE PASSWORD ───────────────────────────────────────────

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setMustChangePassword(false);
        userRepository.save(user);

        refreshTokenRepository.revokeAllForUser(userId);
        emailService.sendPasswordChangedConfirmation(user.getEmail(), user.getFirstName());
        auditService.log("PASSWORD_CHANGED", "AUTH", user.getId(),
            "Password changed successfully for " + user.getEmail());
    }

    // ── LOGIN HISTORY ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<LoginHistoryResponse> getLoginHistory(Long userId) {
        return loginHistoryRepository.findByUserIdOrderByLoginAtDesc(userId)
            .stream()
            .limit(20)
            .map(h -> LoginHistoryResponse.builder()
                .id(h.getId())
                .loginAt(h.getLoginAt())
                .logoutAt(h.getLogoutAt())
                .ipAddress(h.getIpAddress())
                .deviceType(h.getDeviceType())
                .browser(h.getBrowser())
                .osName(h.getOsName())
                .status(h.getStatus())
                .build())
            .collect(Collectors.toList());
    }

    // ── ACTIVE SESSIONS (SEC-008) ──────────────────────────────────

    @Transactional(readOnly = true)
    public List<com.hrms.dto.response.SessionResponse> getActiveSessions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        List<RefreshToken> sessions = refreshTokenRepository.findByUserIdAndIsRevokedFalseOrderByIdDesc(user.getId());
        return sessions.stream().map(s -> com.hrms.dto.response.SessionResponse.builder()
            .id(s.getId())
            .ipAddress(s.getIpAddress())
            .deviceInfo(s.getDeviceInfo())
            .expiryDate(s.getExpiryDate())
            .isRevoked(s.getIsRevoked())
            .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public void revokeSession(String userEmail, Long sessionId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        RefreshToken session = refreshTokenRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        if (!session.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You cannot revoke sessions belonging to another user");
        }
        session.setIsRevoked(true);
        session.setRevokedAt(Instant.now());
        refreshTokenRepository.save(session);
        auditService.log("USER_SESSION_REVOKED", "AUTH", user.getId(),
            "Revoked active login session #" + sessionId + " (IP: " + session.getIpAddress() + ")");
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────

    private static final int MAX_ACTIVE_SESSIONS = 5;

    private RefreshToken createRefreshToken(User user, String ipAddress, String deviceInfo) {
        // SEC-008: Enforce concurrent session limit per user account
        List<RefreshToken> activeTokens = refreshTokenRepository.findByUserIdAndIsRevokedFalseOrderByIdAsc(user.getId());
        if (activeTokens.size() >= MAX_ACTIVE_SESSIONS) {
            int toRevoke = activeTokens.size() - MAX_ACTIVE_SESSIONS + 1;
            for (int i = 0; i < toRevoke; i++) {
                RefreshToken oldest = activeTokens.get(i);
                oldest.setIsRevoked(true);
                oldest.setRevokedAt(Instant.now());
                refreshTokenRepository.save(oldest);
                log.info("SEC-008: Revoked oldest active session #{} for user {} due to concurrency limit", oldest.getId(), user.getEmail());
            }
        }

        RefreshToken token = RefreshToken.builder()
            .token(UUID.randomUUID().toString())
            .user(user)
            .expiryDate(Instant.now().plusMillis(refreshTokenExpirationMs))
            .ipAddress(ipAddress)
            .deviceInfo(deviceInfo)
            .isRevoked(false)
            .build();
        return refreshTokenRepository.save(token);
    }

    private void recordLoginHistory(User user, String ip, String userAgent, String status) {
        LoginHistory history = LoginHistory.builder()
            .user(user)
            .loginAt(LocalDateTime.now())
            .ipAddress(ip)
            .userAgent(userAgent)
            .status(status)
            .build();
        loginHistoryRepository.save(history);
    }

    private String extractIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    // ── 2FA TOTP (GOOGLE AUTHENTICATOR) ─────────────────────────

    public com.hrms.modules.auth.dto.TotpSetupResponse setupTotp(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        String secret = totpService.generateSecretKey();
        user.setTotpSecret(secret);
        userRepository.save(user);

        String qrUri = totpService.getOtpAuthUri(secret, user.getEmail(), "HRMS Corporate");
        return com.hrms.modules.auth.dto.TotpSetupResponse.builder()
                .secret(secret)
                .qrCodeUri(qrUri)
                .email(user.getEmail())
                .build();
    }

    public com.hrms.modules.auth.dto.TotpEnableResponse enableTotp(Long userId, int code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        if (user.getTotpSecret() == null) {
            throw new BadRequestException("2FA setup not initialized for this account");
        }
        boolean valid = totpService.verifyCode(user.getTotpSecret(), code);
        if (!valid) {
            throw new BadRequestException("Invalid 6-digit verification code");
        }
        user.setTotpEnabled(true);
        List<String> rawBackupCodes = totpService.generateBackupCodes();
        String hashedCodes = rawBackupCodes.stream()
                .map(passwordEncoder::encode)
                .collect(Collectors.joining(";"));
        user.setTotpBackupCodes(hashedCodes);
        userRepository.save(user);

        log.info("2FA successfully enabled for user id={}", userId);
        return com.hrms.modules.auth.dto.TotpEnableResponse.builder()
                .enabled(true)
                .backupCodes(rawBackupCodes)
                .build();
    }

    public void disableTotp(Long userId, int code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        if (!Boolean.TRUE.equals(user.getTotpEnabled())) {
            throw new BadRequestException("2FA is not enabled on this account");
        }
        boolean valid = totpService.verifyCode(user.getTotpSecret(), code) ||
                verifyAndConsumeBackupCode(user, String.valueOf(code));
        if (!valid) {
            throw new BadRequestException("Invalid 2FA code or backup code");
        }
        user.setTotpEnabled(false);
        user.setTotpSecret(null);
        user.setTotpBackupCodes(null);
        userRepository.save(user);
        log.info("2FA disabled for user id={}", userId);
    }

    private boolean verifyAndConsumeBackupCode(User user, String code) {
        if (user.getTotpBackupCodes() == null || user.getTotpBackupCodes().isBlank()) {
            return false;
        }
        String[] hashedList = user.getTotpBackupCodes().split(";");
        for (int i = 0; i < hashedList.length; i++) {
            if (passwordEncoder.matches(code, hashedList[i])) {
                List<String> remaining = new java.util.ArrayList<>(List.of(hashedList));
                remaining.remove(i);
                user.setTotpBackupCodes(String.join(";", remaining));
                userRepository.save(user);
                log.info("Backup code consumed successfully for user {}", user.getEmail());
                return true;
            }
        }
        return false;
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        Long employeeId = null;
        if (user.getEmployee() != null) {
            employeeId = user.getEmployee().getId();
        } else {
            Employee emp = employeeRepository.findByUserId(user.getId())
                .or(() -> employeeRepository.findByEmail(user.getEmail()))
                .orElse(null);
            if (emp != null) {
                employeeId = emp.getId();
            } else {
                // Self-heal: ensure user always has an Employee profile
                Department defaultDept = departmentRepository.findAll().stream().findFirst().orElse(null);
                String empNumber;
                do {
                    empNumber = "EMP-" + java.time.LocalDate.now().getYear() + "-" + String.format("%04d", (int)(Math.random() * 9000) + 1000);
                } while (employeeRepository.existsByEmployeeNumber(empNumber));

                Employee newEmp = Employee.builder()
                    .user(user)
                    .department(defaultDept)
                    .employeeNumber(empNumber)
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .email(user.getEmail())
                    .designation(user.getRole() != null ? user.getRole().name().replace("ROLE_", "") : "Employee")
                    .employmentStatus(com.hrms.enums.EmploymentStatus.ACTIVE)
                    .dateOfJoining(java.time.LocalDate.now())
                    .leaveBalance(24)
                    .sickLeaveBalance(12)
                    .casualLeaveBalance(8)
                    .deleted(false)
                    .build();
                newEmp.setTenantId(user.getTenantId() != null ? user.getTenantId() : "default");
                newEmp = employeeRepository.save(newEmp);
                user.setEmployee(newEmp);
                employeeId = newEmp.getId();
                log.info("Self-healed & auto-provisioned employee profile {} for user {}", empNumber, user.getEmail());
            }
        }
        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .tenantId(user.getTenantId() != null ? user.getTenantId() : "default")
            .userId(user.getId())
            .employeeId(employeeId)
            .email(user.getEmail())
            .fullName(user.getFullName())
            .role(user.getRole())
            .emailVerified(user.getEmailVerified())
            .profilePicture(user.getProfilePicture())
            .expiresIn(jwtExpirationMs / 1000)
            .mustChangePassword(Boolean.TRUE.equals(user.getMustChangePassword()))
            .build();
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
}
