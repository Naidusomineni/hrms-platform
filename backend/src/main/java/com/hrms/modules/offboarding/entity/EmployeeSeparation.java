package com.hrms.modules.offboarding.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "employee_separations",
    indexes = {
        @Index(name = "idx_employee_separations_tenant_emp", columnList = "tenant_id, employee_id"),
        @Index(name = "idx_employee_separations_status", columnList = "tenant_id, status")
    }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EmployeeSeparation extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "resignation_date", nullable = false)
    private LocalDate resignationDate;

    @Column(name = "requested_last_working_day")
    private LocalDate requestedLastWorkingDay;

    @Column(name = "approved_last_working_day")
    private LocalDate approvedLastWorkingDay;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "separation_type", nullable = false, length = 32)
    @Builder.Default
    private String separationType = "RESIGNATION"; // RESIGNATION, TERMINATION, RETIREMENT, END_OF_CONTRACT

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "SUBMITTED"; // SUBMITTED, MANAGER_APPROVED, HR_APPROVED, CLEARANCE_PENDING, SETTLED, REJECTED, WITHDRAWN

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @Column(name = "reviewer_comments", columnDefinition = "TEXT")
    private String reviewerComments;

    @Column(name = "exit_interview_notes", columnDefinition = "TEXT")
    private String exitInterviewNotes;

    @OneToMany(mappedBy = "separation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SeparationClearance> clearances = new ArrayList<>();

    @OneToOne(mappedBy = "separation", cascade = CascadeType.ALL, orphanRemoval = true)
    private FullAndFinalSettlement settlement;
}
