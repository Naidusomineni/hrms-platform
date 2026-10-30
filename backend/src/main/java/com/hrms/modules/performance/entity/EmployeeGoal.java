package com.hrms.modules.performance.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "employee_goals",
    indexes = {@Index(name = "idx_employee_goals_tenant", columnList = "tenant_id, employee_id, cycle_id")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EmployeeGoal extends BaseTenantEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id")
    private AppraisalCycle cycle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "metric_target", length = 100)
    private String metricTarget;

    @Column(name = "metric_current", length = 100)
    private String metricCurrent;

    @Column
    @Builder.Default
    private Integer weightage = 25;

    @Column
    @Builder.Default
    private Integer progress = 0; // 0 - 100%

    @Column(length = 50, nullable = false)
    @Builder.Default
    private String status = "IN_PROGRESS"; // NOT_STARTED, IN_PROGRESS, ACHIEVED, EXCEEDED, DEFERRED
}
