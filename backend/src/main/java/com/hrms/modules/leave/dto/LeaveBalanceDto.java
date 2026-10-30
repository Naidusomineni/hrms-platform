package com.hrms.modules.leave.dto;

import com.hrms.enums.LeaveType;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class LeaveBalanceDto {
    private Long id;
    private Long employeeId;
    private LeaveType leaveType;
    private BigDecimal allocatedDays;
    private BigDecimal usedDays;
    private BigDecimal pendingDays;
    private BigDecimal balanceDays;
    private Integer year;
}
