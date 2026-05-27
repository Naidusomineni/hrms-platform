package com.hrms.dto.request;
import com.hrms.enums.AttendanceStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AttendanceRequest {
    @NotNull private Long employeeId;
    @NotNull private LocalDate date;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    @NotNull private AttendanceStatus status;
    private String remarks;
    private String lateArrivalReason;
}
