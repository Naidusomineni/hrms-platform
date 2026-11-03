package com.hrms.modules.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollAdjustmentRequest {
    private Integer presentDays;             // Optional override of payable attendance days
    private BigDecimal bonus;                // Performance / Festival / Ad-hoc bonus
    private BigDecimal overtimeAmount;       // Overtime / Arrears
    private BigDecimal deductionsAdjustment; // Salary advance recovery, damages, fines
    private BigDecimal basicSalary;          // Basic salary override
    private BigDecimal hra;                  // HRA override
    private BigDecimal specialAllowance;     // Special allowance override
    private BigDecimal pfDeduction;          // PF override
    private BigDecimal incomeTax;            // TDS / Income tax override
    private String hrRemarks;                // Audit trail explanation
    private Boolean approveImmediately;      // Optional 1-click lock & approve
}
