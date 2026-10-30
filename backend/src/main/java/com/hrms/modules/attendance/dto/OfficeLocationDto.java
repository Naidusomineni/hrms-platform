package com.hrms.modules.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class OfficeLocationDto {
    private Long id;

    @NotBlank(message = "Office name is required")
    private String name;

    private String address;

    @NotNull(message = "Latitude is required")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    private BigDecimal longitude;

    private Integer radiusMeters;
    private String ipWhitelist;
    private Boolean isActive;
}
