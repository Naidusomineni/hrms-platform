package com.hrms.entity;

import com.hrms.enums.EmploymentStatus;
import com.hrms.enums.Gender;
import com.hrms.enums.ShiftType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "employees",
    indexes = {
        @Index(name = "idx_emp_email",   columnList = "email"),
        @Index(name = "idx_emp_dept",    columnList = "department_id"),
        @Index(name = "idx_emp_number",  columnList = "employee_number"),
        @Index(name = "idx_emp_status",  columnList = "employment_status"),
        @Index(name = "idx_emp_manager", columnList = "manager_id")
    }
)
@SQLDelete(sql = "UPDATE employees SET deleted = true, updated_at = NOW() WHERE id = ?")
@Where(clause = "deleted = false")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Employee extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_number", unique = true, nullable = false, length = 20)
    private String employeeNumber;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "alternate_phone", length = 15)
    private String alternatePhone;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Gender gender;

    @Column(length = 255)
    private String address;

    @Column(length = 100) private String city;
    @Column(length = 100) private String state;
    @Column(length = 10)  private String pincode;
    @Column(length = 100) private String country;

    @Column(length = 100) private String designation;
    @Column(name = "job_title", length = 100) private String jobTitle;

    @Column(name = "date_of_joining", nullable = false)
    private LocalDate dateOfJoining;

    @Column(name = "date_of_confirmation")
    private LocalDate dateOfConfirmation;

    @Column(name = "date_of_leaving")
    private LocalDate dateOfLeaving;

    @Column(name = "last_working_date")
    private LocalDate lastWorkingDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_status", length = 25)
    @Builder.Default
    private EmploymentStatus employmentStatus = EmploymentStatus.PROBATION;

    @Enumerated(EnumType.STRING)
    @Column(name = "shift_type", length = 20)
    @Builder.Default
    private ShiftType shiftType = ShiftType.MORNING;

    // ── Salary & Banking ──────────────────────────────────────────
    @Column(precision = 12, scale = 2)
    private BigDecimal salary;

    @Column(name = "bank_account_number", length = 30)
    private String bankAccountNumber;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "ifsc_code", length = 15)
    private String ifscCode;

    @Column(name = "pan_number", length = 20)
    private String panNumber;

    @Column(name = "pf_number", length = 30)
    private String pfNumber;

    @Column(name = "esi_number", length = 30)
    private String esiNumber;

    // ── Leave & Attendance ────────────────────────────────────────
    @Builder.Default
    @Column(name = "leave_balance")
    private Integer leaveBalance = 24;

    @Builder.Default
    @Column(name = "sick_leave_balance")
    private Integer sickLeaveBalance = 12;

    @Builder.Default
    @Column(name = "casual_leave_balance")
    private Integer casualLeaveBalance = 8;

    // ── Emergency Contact ─────────────────────────────────────────
    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 15)
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_relation", length = 50)
    private String emergencyContactRelation;

    // ── Documents ─────────────────────────────────────────────────
    @Column(name = "resume_url", length = 500)
    private String resumeUrl;

    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;

    @Builder.Default
    @Column(nullable = false)
    private Boolean deleted = false;

    // ── Relationships ─────────────────────────────────────────────
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    /** Self-referential — who is this employee's manager */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @OneToMany(mappedBy = "manager", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Employee> directReports = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Attendance> attendances = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<LeaveRequest> leaveRequests = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PayrollSlip> payrollSlips = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PerformanceReview> performanceReviews = new ArrayList<>();

    // ── Helpers ───────────────────────────────────────────────────
    public String getFullName() { return firstName + " " + lastName; }
}
