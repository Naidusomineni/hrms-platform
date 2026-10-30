package com.hrms.modules.recruitment.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CandidateDto {
    private Long id;
    private Long jobPostingId;
    private String jobPostingTitle;

    @NotBlank(message = "Candidate name is required")
    private String name;

    @NotBlank(message = "Candidate email is required")
    @Email(message = "Valid email is required")
    private String email;

    private String phone;
    private String resumeUrl;
    private String linkedinUrl;
    private Integer experienceYears;
    private BigDecimal currentCtc;
    private BigDecimal expectedCtc;
    private Integer noticePeriodDays;
    private String stage; // APPLIED, SCREENING, INTERVIEW_ROUND_1, INTERVIEW_ROUND_2, OFFER_PENDING, HIRED, DROPPED
    private String source;
    private String notes;
    private LocalDateTime createdAt;
}
