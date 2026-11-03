package com.hrms.modules.recruitment.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Candidate;
import com.hrms.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_scorecards",
    indexes = {@Index(name = "idx_interview_scorecards_tenant", columnList = "tenant_id, candidate_id")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class InterviewScorecard extends BaseTenantEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_id")
    private Employee interviewer;

    @Column(name = "round_name", nullable = false, length = 100)
    private String roundName;

    @Column(name = "technical_rating")
    @Builder.Default
    private Integer technicalRating = 3;

    @Column(name = "communication_rating")
    @Builder.Default
    private Integer communicationRating = 3;

    @Column(name = "culture_fit_rating")
    @Builder.Default
    private Integer cultureFitRating = 3;

    @Column(length = 50, nullable = false)
    @Builder.Default
    private String recommendation = "HIRE"; // STRONG_HIRE, HIRE, HOLD, NO_HIRE

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "interview_session_id")
    private Long interviewSessionId;

    @Column(name = "integrity_score")
    @Builder.Default
    private Integer integrityScore = 100;

    @Column(name = "integrity_summary", columnDefinition = "TEXT")
    private String integritySummary;
}
