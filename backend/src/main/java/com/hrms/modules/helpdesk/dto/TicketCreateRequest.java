package com.hrms.modules.helpdesk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TicketCreateRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required (HARDWARE, SOFTWARE, ACCESS_VPN, PAYROLL_QUERY, HR_POLICY, FACILITY)")
    private String category;

    @Builder.Default
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, CRITICAL

    private Long assetId;
}
