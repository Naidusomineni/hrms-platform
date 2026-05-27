package com.hrms.dto.response;
import com.hrms.enums.*;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LeaveResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private String departmentName;
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer numberOfDays;
    private String reason;
    private LeaveStatus status;
    private String approverComments;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime appliedAt;
}
