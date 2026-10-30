package com.hrms.modules.shift.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "roster_assignments",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"tenant_id", "employee_id", "effective_date"}, name = "uk_roster_emp_date")},
    indexes = {
        @Index(name = "idx_roster_tenant_date", columnList = "tenant_id, effective_date"),
        @Index(name = "idx_roster_emp_date", columnList = "tenant_id, employee_id, effective_date")
    })
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RosterAssignment extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(name = "rotation_pattern", nullable = false, length = 50)
    @Builder.Default
    private String rotationPattern = "STANDARD"; // STANDARD, WEEKLY_ROTATING, ON_CALL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_user_id")
    private User assignedByUser;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, SWAPPED, CANCELLED
}
