package com.hrms.modules.performance.entity;

import com.hrms.entity.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "appraisal_cycles",
    indexes = {@Index(name = "idx_appraisal_cycles_tenant", columnList = "tenant_id, status")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AppraisalCycle extends BaseTenantEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(length = 50, nullable = false)
    @Builder.Default
    private String status = "GOAL_SETTING"; // GOAL_SETTING, IN_REVIEW, CALIBRATION, COMPLETED
}
