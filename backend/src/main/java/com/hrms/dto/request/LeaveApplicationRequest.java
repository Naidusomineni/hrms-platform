package com.hrms.dto.request;
import com.hrms.enums.LeaveType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveApplicationRequest {
    @NotNull private LeaveType leaveType;
    @NotNull private LocalDate startDate;
    @NotNull private LocalDate endDate;
    @NotBlank private String reason;
}
