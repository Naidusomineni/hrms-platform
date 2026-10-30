package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_history",
    indexes = {@Index(name = "idx_lh_user_time", columnList = "user_id,login_at"),
               @Index(name = "idx_lh_status", columnList = "status")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class LoginHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "login_at", nullable = false)
    private LocalDateTime loginAt;

    @Column(name = "logout_at")
    private LocalDateTime logoutAt;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "device_type", length = 30)
    private String deviceType;   // MOBILE, DESKTOP, TABLET

    @Column(name = "browser", length = 100)
    private String browser;

    @Column(name = "os_name", length = 100)
    private String osName;

    @Column(name = "location", length = 200)
    private String location;

    @Column(length = 20)
    private String status;  // SUCCESS, FAILED, LOCKED

    @Column(name = "session_id", length = 255)
    private String sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
