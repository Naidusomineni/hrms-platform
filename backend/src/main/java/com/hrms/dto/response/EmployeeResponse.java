package com.hrms.dto.response;
import com.hrms.enums.*;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeeResponse {
    private Long id;
    private String employeeNumber;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String country;
    private String designation;
    private String jobTitle;
    private LocalDate dateOfJoining;
    private LocalDate dateOfLeaving;
    private EmploymentStatus employmentStatus;
    private ShiftType shiftType;
    private BigDecimal salary;
    private String panNumber;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
    private Integer leaveBalance;
    private Integer sickLeaveBalance;
    private Integer casualLeaveBalance;
    private Long departmentId;
    private String departmentName;
    private Long managerId;
    private String managerName;
    private String profilePictureUrl;
    private String resumeUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
