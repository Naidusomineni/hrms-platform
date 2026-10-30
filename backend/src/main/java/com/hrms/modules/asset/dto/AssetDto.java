package com.hrms.modules.asset.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AssetDto {
    private Long id;

    @NotBlank(message = "Asset tag is required")
    private String assetTag;

    @NotBlank(message = "Category is required")
    private String category;

    private String brand;
    private String model;
    private String serialNumber;
    private LocalDate purchaseDate;
    private LocalDate warrantyExpiry;
    private BigDecimal cost;
    private String conditionStatus;
    private String status;
    private String assignedToEmployeeName;
    private Long assignedToEmployeeId;
}
