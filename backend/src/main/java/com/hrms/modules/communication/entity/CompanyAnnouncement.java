package com.hrms.modules.communication.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Department;
import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "company_announcements",
    indexes = {
        @Index(name = "idx_announcements_tenant_pub", columnList = "tenant_id, published_at"),
        @Index(name = "idx_announcements_pinned", columnList = "tenant_id, pinned")
    }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CompanyAnnouncement extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String category = "GENERAL"; // GENERAL, HR_POLICY, LEADERSHIP, EVENT, EMERGENCY

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String priority = "NORMAL"; // NORMAL, IMPORTANT, URGENT

    @Column(name = "target_audience", nullable = false, length = 32)
    @Builder.Default
    private String targetAudience = "ALL"; // ALL, DEPARTMENT, ROLE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(nullable = false)
    @Builder.Default
    private Boolean pinned = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "published_at", nullable = false)
    @Builder.Default
    private LocalDateTime publishedAt = LocalDateTime.now();

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "acknowledgment_required", nullable = false)
    @Builder.Default
    private Boolean acknowledgmentRequired = false;
}
