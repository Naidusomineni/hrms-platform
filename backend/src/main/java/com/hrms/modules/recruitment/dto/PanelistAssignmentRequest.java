package com.hrms.modules.recruitment.dto;

import com.hrms.enums.PanelistRole;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PanelistAssignmentRequest {
    private Long employeeId;
    private PanelistRole role;
}
