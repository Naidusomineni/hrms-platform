package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_postings",
    indexes = {@Index(name = "idx_jp_status", columnList = "status"),
               @Index(name = "idx_jp_dept", columnList = "department_id")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class JobPosting extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "experience_min")
    private Integer experienceMin;

    @Column(name = "experience_max")
    private Integer experienceMax;

    @Column(name = "salary_min", precision = 12, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 12, scale = 2)
    private BigDecimal salaryMax;

    @Column(length = 100)
    private String location;

    @Column(length = 20)
    @Builder.Default
    private String status = "OPEN"; // DRAFT, OPEN, CLOSED, ON_HOLD

    @Column(name = "openings")
    @Builder.Default
    private Integer openings = 1;

    @Column(name = "closes_at")
    private LocalDate closesAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hiring_manager_id")
    private Employee hiringManager;

    @OneToMany(mappedBy = "jobPosting", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Candidate> candidates = new ArrayList<>();
}
