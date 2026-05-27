package com.hrms.entity;

import com.hrms.enums.AttendanceStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"employee_id","date"}, name = "uk_att_emp_date")},
    indexes = {@Index(name = "idx_att_date", columnList = "date"),
               @Index(name = "idx_att_emp", columnList = "employee_id"),
               @Index(name = "idx_att_status", columnList = "status")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Attendance extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "check_in_time")
    private LocalTime checkInTime;

    @Column(name = "check_out_time")
    private LocalTime checkOutTime;

    @Column(name = "working_hours")
    private Double workingHours;

    @Column(name = "overtime_hours")
    private Double overtimeHours;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    @Column(length = 500)
    private String remarks;

    @Column(name = "late_arrival_reason", length = 500)
    private String lateArrivalReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
}
