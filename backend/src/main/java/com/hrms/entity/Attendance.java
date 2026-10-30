package com.hrms.entity;

import com.hrms.enums.AttendanceStatus;
import com.hrms.modules.attendance.entity.OfficeLocation;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"employee_id","date"}, name = "uk_att_emp_date")},
    indexes = {@Index(name = "idx_att_date", columnList = "date"),
               @Index(name = "idx_att_emp", columnList = "employee_id"),
               @Index(name = "idx_att_status", columnList = "status")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Attendance extends BaseTenantEntity {
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

    // Geofencing & Anti-Proxy fields
    @Column(name = "check_in_latitude", precision = 10, scale = 7)
    private BigDecimal checkInLatitude;

    @Column(name = "check_in_longitude", precision = 10, scale = 7)
    private BigDecimal checkInLongitude;

    @Column(name = "check_out_latitude", precision = 10, scale = 7)
    private BigDecimal checkOutLatitude;

    @Column(name = "check_out_longitude", precision = 10, scale = 7)
    private BigDecimal checkOutLongitude;

    @Column(name = "geofence_status", length = 30)
    @Builder.Default
    private String geofenceStatus = "INSIDE_GEOFENCE"; // INSIDE_GEOFENCE, OUTSIDE_GEOFENCE, REMOTE_EXEMPT

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_location_id")
    private OfficeLocation officeLocation;

    @Column(name = "selfie_url", length = 500)
    private String selfieUrl;

    @Column(name = "regularization_status", length = 30)
    @Builder.Default
    private String regularizationStatus = "NONE"; // NONE, PENDING, REGULARIZED

    @Column(name = "punch_source", length = 50)
    @Builder.Default
    private String punchSource = "WEB_MANUAL"; // WEB_MANUAL, AUTO_LOGIN, BIOMETRIC_DEVICE, GEOFENCE_GPS

    @Column(name = "device_id", length = 100)
    private String deviceId;

    @Column(name = "break_minutes")
    @Builder.Default
    private Integer breakMinutes = 0;

    @Column(name = "is_on_break")
    @Builder.Default
    private Boolean isOnBreak = false;

    @Column(name = "last_break_start")
    private java.time.LocalDateTime lastBreakStart;

    @Column(name = "work_mode", length = 30)
    @Builder.Default
    private String workMode = "OFFICE"; // OFFICE, REMOTE_WFH

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
}
