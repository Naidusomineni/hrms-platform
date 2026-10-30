package com.hrms.modules.attendance.entity;

import com.hrms.entity.Attendance;
import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "attendance_regularizations",
    indexes = {@Index(name = "idx_att_reg_tenant_emp", columnList = "tenant_id,employee_id,status")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AttendanceRegularization extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendance_id")
    private Attendance attendance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "requested_check_in")
    private LocalTime requestedCheckIn;

    @Column(name = "requested_check_out")
    private LocalTime requestedCheckOut;

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(nullable = false, length = 25)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @Column(name = "reviewer_comments", length = 500)
    private String reviewerComments;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
