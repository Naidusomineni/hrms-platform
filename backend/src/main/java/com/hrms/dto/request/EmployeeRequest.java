package com.hrms.dto.request;
import com.hrms.enums.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeRequest {
    @NotBlank @Size(min=2,max=50) private String firstName;
    @NotBlank @Size(min=2,max=50) private String lastName;
    @NotBlank @Email private String email;
    @Pattern(regexp="^[0-9]{10,15}$") private String phoneNumber;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String country;
    @NotBlank private String designation;
    private String jobTitle;
    @NotNull private LocalDate dateOfJoining;
    private EmploymentStatus employmentStatus;
    private ShiftType shiftType;
    @DecimalMin("0") private BigDecimal salary;
    private String bankAccountNumber;
    private String bankName;
    private String ifscCode;
    private String panNumber;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
    private Long departmentId;
    private Long managerId;
    @Size(min=8) private String password;
}
