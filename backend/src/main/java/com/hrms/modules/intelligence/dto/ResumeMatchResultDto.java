package com.hrms.modules.intelligence.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeMatchResultDto {

    private Long candidateId;
    private String candidateName;
    private Long jobPostingId;
    private String jobTitle;
    private Integer overallMatchScore; // 0 - 100
    private Integer skillsMatchScore;
    private Integer experienceMatchScore;
    private Integer salaryAlignmentScore;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> candidateStrengths;
    private List<String> growthAreas;
    private String hiringVerdict; // STRONG_HIRE, HIRE, CONSIDER, REJECT
    private String executiveSummary;
}
