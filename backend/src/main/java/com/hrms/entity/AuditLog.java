package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs",
    indexes = {@Index(name = "idx_al_entity", columnList = "entity_type,entity_id"),
               @Index(name = "idx_al_user", columnList = "performed_by"),
               @Index(name = "idx_al_time", columnList = "performed_at")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "old_values", columnDefinition = "JSON")
    private String oldValues;

    @Column(name = "new_values", columnDefinition = "JSON")
    private String newValues;

    @Column(name = "performed_by", length = 150)
    private String performedBy;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "request_id", length = 100)
    private String requestId;

    @Column(name = "performed_at", nullable = false)
    @Builder.Default
    private LocalDateTime performedAt = LocalDateTime.now();

    @Column(length = 500)
    private String description;

    @Column(name = "module", length = 50)
    private String module;
}
