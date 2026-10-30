package com.hrms.modules.asset.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AssetAllocationDto {
    private Long id;

    @NotNull(message = "Asset ID is required")
    private Long assetId;
    private String assetTag;
    private String assetCategory;
    private String assetModel;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    private String employeeName;

    private LocalDateTime allocatedAt;
    private LocalDateTime returnedAt;
    private String allocationStatus;
    private String notes;
}
