package com.hrms.modules.attendance.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Department;
import com.hrms.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "policy_assignments",
    indexes = {@Index(name = "idx_pa_tenant_lookup", columnList = "tenant_id, policy_type, employee_id, department_id, office_location_id")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PolicyAssignment extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "policy_type", nullable = false, length = 32)
    @Builder.Default
    private String policyType = "ATTENDANCE"; // ATTENDANCE, LEAVE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private AttendancePolicy policy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_location_id")
    private OfficeLocation officeLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Column(name = "priority_level", nullable = false)
    @Builder.Default
    private Integer priorityLevel = 4; // 1: Employee, 2: Department, 3: Location, 4: Tenant Default
}

