package com.hrms.modules.request.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_requests",
    indexes = {@Index(name = "idx_er_tenant_emp", columnList = "tenant_id,employee_id,status")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EmployeeRequest extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "request_type", nullable = false, length = 30)
    private String requestType; // WORK_FROM_HOME, SHIFT_CHANGE, EXPENSE_CLAIM, TRAVEL_REQUEST, BONAFIDE_LETTER

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    @Column(nullable = false, length = 25)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, CANCELLED

    @Column(name = "current_step", nullable = false)
    @Builder.Default
    private Integer currentStep = 1;

    @Column(name = "approver_comments", length = 500)
    private String approverComments;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
