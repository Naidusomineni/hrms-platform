package com.hrms.modules.recruitment.dto;

import com.hrms.enums.PanelistRole;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewPanelistDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String designation;
    private String department;
    private PanelistRole role;
    private LocalDateTime joinedAt;
}
