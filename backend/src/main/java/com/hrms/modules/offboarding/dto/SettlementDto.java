package com.hrms.modules.offboarding.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class SettlementDto {

    private Long id;
    private Long separationId;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private String designation;
    private String departmentName;
    private String panNumber;
    private String bankAccountNumber;
    private String bankName;
    private String ifscCode;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfJoining;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate lastWorkingDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate settlementDate;

    private BigDecimal lastDrawnBasic;
    private BigDecimal tenureYears;
    private Integer earnedLeaveBalance;
    private BigDecimal leaveEncashmentAmount;
    private BigDecimal gratuityAmount;
    private BigDecimal bonusAmount;
    private BigDecimal proratedSalaryAmount;
    private BigDecimal noticePayRecovery;
    private BigDecimal assetRecoveryDuction;
    private BigDecimal statutoryDeductions;
    private BigDecimal netPayableAmount;
    private String status; // DRAFT, APPROVED, DISBURSED
    private String remarks;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime disbursedAt;

    private String transactionReference;
}
