package com.hrms.modules.intelligence.entity;

import com.hrms.entity.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "hr_policy_articles",
    indexes = {
        @Index(name = "idx_hr_policy_tenant_cat", columnList = "tenant_id, category"),
        @Index(name = "idx_hr_policy_tenant_active", columnList = "tenant_id, is_active")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HrPolicyArticle extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String category;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String keywords;

    @Column(name = "action_label", length = 100)
    private String actionLabel;

    @Column(name = "action_route", length = 100)
    private String actionRoute;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
