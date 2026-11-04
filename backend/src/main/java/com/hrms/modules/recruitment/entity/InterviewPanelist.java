package com.hrms.modules.recruitment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import com.hrms.enums.PanelistRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.Hibernate;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_panelists",
    indexes = {
        @Index(name = "idx_interview_panelists_tenant", columnList = "tenant_id, interview_session_id"),
        @Index(name = "idx_interview_panelists_employee", columnList = "employee_id")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_session_panelist", columnNames = {"interview_session_id", "employee_id"})
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InterviewPanelist extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_session_id", nullable = false)
    @JsonIgnore
    private InterviewSession interviewSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    @Builder.Default
    private PanelistRole role = PanelistRole.TECH_PANELIST;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @JsonProperty("employeeId")
    public Long getEmployeeId() {
        return employee != null ? employee.getId() : null;
    }

    @JsonProperty("employeeName")
    public String getEmployeeName() {
        return (employee != null && Hibernate.isInitialized(employee)) ? employee.getFullName() : null;
    }

    @JsonProperty("employeeEmail")
    public String getEmployeeEmail() {
        return (employee != null && Hibernate.isInitialized(employee)) ? employee.getEmail() : null;
    }

    @JsonProperty("designation")
    public String getDesignation() {
        return (employee != null && Hibernate.isInitialized(employee)) ? employee.getDesignation() : null;
    }
}
