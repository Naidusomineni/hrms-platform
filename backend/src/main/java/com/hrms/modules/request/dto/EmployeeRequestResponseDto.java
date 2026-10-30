package com.hrms.modules.request.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EmployeeRequestResponseDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String requestType;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal amount;
    private String attachmentUrl;
    private String status;
    private Integer currentStep;
    private String approverComments;
    private String reviewerEmail;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
}
