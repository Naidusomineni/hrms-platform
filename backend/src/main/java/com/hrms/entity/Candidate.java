package com.hrms.entity;

import com.hrms.enums.CandidateStage;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "candidates",
    indexes = {@Index(name = "idx_cand_stage", columnList = "stage"),
               @Index(name = "idx_cand_job", columnList = "job_posting_id")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Candidate extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "resume_url", length = 500)
    private String resumeUrl;

    @Column(name = "linkedin_url", length = 300)
    private String linkedinUrl;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "current_ctc", precision = 12, scale = 2)
    private BigDecimal currentCtc;

    @Column(name = "expected_ctc", precision = 12, scale = 2)
    private BigDecimal expectedCtc;

    @Column(name = "notice_period_days")
    private Integer noticePeriodDays;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private CandidateStage stage = CandidateStage.APPLIED;

    @Column(length = 100)
    private String source; // LinkedIn, Naukri, Referral, Direct

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_by")
    private Employee referredBy;
}
