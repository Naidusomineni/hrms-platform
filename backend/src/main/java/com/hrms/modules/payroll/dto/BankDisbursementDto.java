package com.hrms.modules.payroll.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BankDisbursementDto {
    private String employeeNumber;
    private String employeeName;
    private String bankAccountNumber;
    private String bankName;
    private String ifscCode;
    private BigDecimal netSalary;
    @Builder.Default
    private String currency = "INR";
    private String paymentType; // NEFT, RTGS, IMPS
    private String narration;
    private Integer month;
    private Integer year;
}
