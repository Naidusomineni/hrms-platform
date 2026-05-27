package com.hrms.entity;

import com.hrms.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * User Entity — Authentication + Security fields.
 *
 * ENTERPRISE UPGRADES over v1:
 * - failedLoginAttempts + accountLockedUntil (brute-force protection)
 * - passwordResetToken + expiry (forgot password flow)
 * - emailVerified + emailVerifyToken (email verification)
 * - totpSecret + totpEnabled (2FA)
 * - lastLoginAt (activity tracking)
 * - passwordChangedAt (session invalidation after password change)
 * - loginHistory relationship (login history tracking)
 */
@Entity
@Table(
    name = "users",
    uniqueConstraints = {@UniqueConstraint(columnNames = "email", name = "uk_users_email")},
    indexes = {@Index(name = "idx_users_email", columnList = "email")}
)
@SQLDelete(sql = "UPDATE users SET deleted = true, updated_at = NOW() WHERE id = ?")
@Where(clause = "deleted = false")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private Role role;

    // ── Account Status ────────────────────────────────────────────
    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Builder.Default
    @Column(nullable = false)
    private Boolean deleted = false;

    // ── Email Verification ────────────────────────────────────────
    @Builder.Default
    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Column(name = "email_verify_token", length = 255)
    private String emailVerifyToken;

    @Column(name = "email_verify_expiry")
    private LocalDateTime emailVerifyExpiry;

    // ── Password Reset (OTP-based) ────────────────────────────────
    @Column(name = "password_reset_token_hash", length = 255)
    private String passwordResetTokenHash;

    @Column(name = "password_reset_expiry")
    private LocalDateTime passwordResetExpiry;

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

    // ── Brute-Force Protection ────────────────────────────────────
    @Builder.Default
    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;

    @Column(name = "account_locked_until")
    private LocalDateTime accountLockedUntil;

    // ── Two-Factor Authentication ─────────────────────────────────
    @Column(name = "totp_secret", length = 255)
    private String totpSecret;  // encrypted before storing

    @Builder.Default
    @Column(name = "totp_enabled")
    private Boolean totpEnabled = false;

    @Column(name = "totp_backup_codes", length = 1000)
    private String totpBackupCodes;  // JSON array of hashed backup codes

    // ── Activity Tracking ─────────────────────────────────────────
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "last_login_ip", length = 50)
    private String lastLoginIp;

    // ── Profile ───────────────────────────────────────────────────
    @Column(name = "profile_picture", length = 500)
    private String profilePicture;

    // ── Relationships ─────────────────────────────────────────────
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Employee employee;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RefreshToken> refreshTokens = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LoginHistory> loginHistory = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Notification> notifications = new ArrayList<>();

    // ── Helpers ───────────────────────────────────────────────────
    public String getFullName() { return firstName + " " + lastName; }

    public boolean isAccountLocked() {
        return accountLockedUntil != null && LocalDateTime.now().isBefore(accountLockedUntil);
    }
}
