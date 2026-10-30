package com.hrms.modules.asset.entity;

import com.hrms.entity.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "assets",
    indexes = {@Index(name = "idx_assets_tenant", columnList = "tenant_id, asset_tag")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Asset extends BaseTenantEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_tag", nullable = false, length = 50)
    private String assetTag;

    @Column(nullable = false, length = 50)
    private String category; // LAPTOP, MONITOR, MOBILE_DEVICE, ACCESS_CARD, PERIPHERAL, LICENSE

    @Column(length = 100)
    private String brand;

    @Column(length = 100)
    private String model;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "warranty_expiry")
    private LocalDate warrantyExpiry;

    @Column(precision = 12, scale = 2)
    private BigDecimal cost;

    @Column(name = "condition_status", length = 50)
    @Builder.Default
    private String conditionStatus = "GOOD"; // NEW, GOOD, FAIR, DAMAGED, SCRAPPED

    @Column(length = 50)
    @Builder.Default
    private String status = "AVAILABLE"; // AVAILABLE, ALLOCATED, IN_REPAIR, RETIRED
}
