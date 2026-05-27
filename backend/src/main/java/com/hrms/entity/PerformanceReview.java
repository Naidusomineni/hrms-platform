package com.hrms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "performance_reviews",
    indexes = {@Index(name = "idx_pr_emp", columnList = "employee_id"),
               @Index(name = "idx_pr_cycle", columnList = "review_cycle")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PerformanceReview extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "review_cycle", nullable = false, length = 50)
    private String reviewCycle; // "Q1-2024", "Annual-2024"

    @Column(name = "review_period_start")
    private java.time.LocalDate reviewPeriodStart;

    @Column(name = "review_period_end")
    private java.time.LocalDate reviewPeriodEnd;

    @Column(name = "self_rating")
    private Integer selfRating; // 1-5

    @Column(name = "manager_rating")
    private Integer managerRating; // 1-5

    @Column(name = "final_rating")
    private Double finalRating;

    @Column(name = "self_comments", columnDefinition = "TEXT")
    private String selfComments;

    @Column(name = "manager_comments", columnDefinition = "TEXT")
    private String managerComments;

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "areas_of_improvement", columnDefinition = "TEXT")
    private String areasOfImprovement;

    @Column(name = "goals_next_cycle", columnDefinition = "TEXT")
    private String goalsNextCycle;

    @Column(length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, SELF_REVIEW, MANAGER_REVIEW, COMPLETED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private Employee reviewer;
}
