package com.hrms.modules.recruitment.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Candidate;
import com.hrms.entity.Employee;
import com.hrms.entity.JobPosting;
import com.hrms.enums.InterviewSessionStatus;
import com.hrms.enums.PanelistRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.Hibernate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interview_sessions",
    indexes = {
        @Index(name = "idx_interview_sessions_tenant", columnList = "tenant_id, scheduled_start"),
        @Index(name = "idx_interview_sessions_candidate", columnList = "candidate_id"),
        @Index(name = "idx_interview_sessions_guest_token", columnList = "guest_access_token"),
        @Index(name = "idx_interview_sessions_interviewer", columnList = "interviewer_id")
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InterviewSession extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id")
    private JobPosting jobPosting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_id", nullable = false)
    private Employee interviewer;

    @Column(name = "round_name", nullable = false, length = 100)
    private String roundName;

    @Column(name = "scheduled_start", nullable = false)
    private LocalDateTime scheduledStart;

    @Column(name = "scheduled_end", nullable = false)
    private LocalDateTime scheduledEnd;

    @Enumerated(EnumType.STRING)
    @Column(length = 30, nullable = false)
    @Builder.Default
    private InterviewSessionStatus status = InterviewSessionStatus.SCHEDULED;

    @Column(name = "room_name", nullable = false, unique = true, length = 150)
    private String roomName;

    @Column(name = "guest_access_token", nullable = false, unique = true, length = 128)
    private String guestAccessToken;

    @Column(name = "guest_token_expiry", nullable = false)
    private LocalDateTime guestTokenExpiry;

    @Column(name = "meeting_link", length = 255)
    private String meetingLink;

    @Column(name = "interviewer_joined_at")
    private LocalDateTime interviewerJoinedAt;

    @Column(name = "candidate_joined_at")
    private LocalDateTime candidateJoinedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "interview_notes", columnDefinition = "TEXT")
    private String interviewNotes;

    @Column(name = "integrity_status", length = 50)
    @Builder.Default
    private String integrityStatus = "CLEAN"; // CLEAN, FLAGGED, PROXY_SUSPECT

    @Column(name = "integrity_details", columnDefinition = "TEXT")
    private String integrityDetails;

    @OneToMany(mappedBy = "interviewSession", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InterviewPanelist> panelists = new ArrayList<>();

    public void addPanelist(Employee emp, PanelistRole role) {
        if (panelists == null) {
            panelists = new ArrayList<>();
        }
        InterviewPanelist panelist = InterviewPanelist.builder()
                .interviewSession(this)
                .employee(emp)
                .role(role != null ? role : PanelistRole.TECH_PANELIST)
                .build();
        panelist.setTenantId(this.getTenantId());
        panelists.add(panelist);
    }

    // Helper getters for JSON serialization
    @JsonProperty("candidateId")
    public Long getCandidateId() {
        return candidate != null ? candidate.getId() : null;
    }

    @JsonProperty("candidateName")
    public String getCandidateName() {
        return (candidate != null && Hibernate.isInitialized(candidate)) ? candidate.getName() : null;
    }

    @JsonProperty("candidateEmail")
    public String getCandidateEmail() {
        return (candidate != null && Hibernate.isInitialized(candidate)) ? candidate.getEmail() : null;
    }

    @JsonProperty("candidatePhone")
    public String getCandidatePhone() {
        return (candidate != null && Hibernate.isInitialized(candidate)) ? candidate.getPhone() : null;
    }

    @JsonProperty("jobPostingId")
    public Long getJobPostingId() {
        return jobPosting != null ? jobPosting.getId() : null;
    }

    @JsonProperty("jobTitle")
    public String getJobTitle() {
        return (jobPosting != null && Hibernate.isInitialized(jobPosting)) ? jobPosting.getTitle() : null;
    }

    @JsonProperty("interviewerId")
    public Long getInterviewerId() {
        return interviewer != null ? interviewer.getId() : null;
    }

    @JsonProperty("interviewerName")
    public String getInterviewerName() {
        return (interviewer != null && Hibernate.isInitialized(interviewer)) ? interviewer.getFullName() : null;
    }

    @JsonProperty("interviewerEmail")
    public String getInterviewerEmail() {
        return (interviewer != null && Hibernate.isInitialized(interviewer)) ? interviewer.getEmail() : null;
    }
}
