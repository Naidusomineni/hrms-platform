package com.hrms.dto.response;
import com.hrms.enums.AttendanceStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AttendanceResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private LocalDate date;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Double workingHours;
    private Double overtimeHours;
    private AttendanceStatus status;
    private String remarks;
}
