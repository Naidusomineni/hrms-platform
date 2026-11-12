package com.hrms.modules.attendance.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PolicyAssignmentDto {
    private Long id;
    private String policyType; // ATTENDANCE, LEAVE
    private Long policyId;
    private String policyName;
    private String policyCode;
    private Long departmentId;
    private String departmentName;
    private Long officeLocationId;
    private String officeLocationName;
    private Long employeeId;
    private String employeeName;
    private Integer priorityLevel; // 1: Employee, 2: Department, 3: Location, 4: Tenant Default
    private LocalDateTime createdAt;
}

