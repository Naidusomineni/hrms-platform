package com.hrms.modules.intelligence.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "flight_risk_evaluations",
    indexes = {
        @Index(name = "idx_flight_risk_tenant_lvl", columnList = "tenant_id, risk_level"),
        @Index(name = "idx_flight_risk_emp", columnList = "tenant_id, employee_id")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightRiskEvaluation extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "attendances", "leaveRequests", "payrollSlips", "performanceReviews", "directReports"})
    private Employee employee;

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;

    @Column(name = "risk_level", nullable = false, length = 20)
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "primary_driver", nullable = false, length = 100)
    private String primaryDriver;

    @Column(name = "driver_breakdown", columnDefinition = "TEXT")
    private String driverBreakdown;

    @Column(name = "retention_recommendation", nullable = false, columnDefinition = "TEXT")
    private String retentionRecommendation;

    @Column(name = "evaluated_at", nullable = false)
    @Builder.Default
    private LocalDateTime evaluatedAt = LocalDateTime.now();
}
