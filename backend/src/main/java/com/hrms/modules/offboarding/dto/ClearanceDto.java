package com.hrms.modules.offboarding.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ClearanceDto {

    private Long id;
    private Long separationId;
    private String departmentType; // IT_ASSETS, FINANCE, HR_ADMIN, MANAGER
    private String status;         // PENDING, CLEARED, REJECTED
    private String clearedBy;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime clearedAt;

    private BigDecimal pendingDues;
    private String remarks;
}
