package com.hrms.modules.communication.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "announcement_acknowledgments",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_announcement_user", columnNames = {"tenant_id", "announcement_id", "user_id"})
    }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AnnouncementAcknowledgment extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id", nullable = false)
    private CompanyAnnouncement announcement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "acknowledged_at", nullable = false)
    @Builder.Default
    private LocalDateTime acknowledgedAt = LocalDateTime.now();
}
