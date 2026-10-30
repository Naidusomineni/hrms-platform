package com.hrms.modules.leave.dto;

import com.hrms.enums.LeaveType;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class LeavePolicyDto {
    private Long id;
    private LeaveType leaveType;
    private BigDecimal annualAllowance;
    private BigDecimal monthlyAccrualRate;
    private BigDecimal maxCarryOver;
    private Boolean allowsHalfDay;
    private Boolean requiresAttachment;
    private Boolean isActive;
}
