package com.hrms.modules.attendance.entity;

import com.hrms.entity.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "biometric_devices",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"tenant_id", "device_code"}, name = "uk_biometric_device")},
    indexes = {@Index(name = "idx_biometric_tenant", columnList = "tenant_id")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BiometricDevice extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_code", nullable = false, length = 50)
    private String deviceCode;

    @Column(name = "device_name", nullable = false, length = 100)
    private String deviceName;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(length = 100)
    private String location;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;
}
