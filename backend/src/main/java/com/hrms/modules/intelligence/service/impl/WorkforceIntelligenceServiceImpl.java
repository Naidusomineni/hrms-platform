package com.hrms.modules.intelligence.service.impl;

import com.hrms.entity.Candidate;
import com.hrms.entity.Employee;
import com.hrms.entity.JobPosting;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.intelligence.dto.*;
import com.hrms.modules.intelligence.entity.FlightRiskEvaluation;
import com.hrms.modules.intelligence.entity.HrPolicyArticle;
import com.hrms.modules.intelligence.repository.FlightRiskEvaluationRepository;
import com.hrms.modules.intelligence.repository.HrPolicyArticleRepository;
import com.hrms.modules.intelligence.service.WorkforceIntelligenceService;
import com.hrms.modules.recruitment.repository.CandidateRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WorkforceIntelligenceServiceImpl implements WorkforceIntelligenceService {

    private final HrPolicyArticleRepository hrPolicyArticleRepository;
    private final FlightRiskEvaluationRepository flightRiskEvaluationRepository;
    private final EmployeeRepository employeeRepository;
    private final JobPostingRepository jobPostingRepository;
    private final CandidateRepository candidateRepository;

    @Override
    @Transactional(readOnly = true)
    public AiAssistantResponse askAssistant(AiAssistantQueryRequest request) {
        String tenantId = getTenantId();
        String rawQuery = request.getQuery() != null ? request.getQuery().trim() : "";
        String normalizedQuery = rawQuery.toLowerCase();

        List<HrPolicyArticle> articles = hrPolicyArticleRepository.findByTenantIdAndIsActiveTrue(tenantId);
        if (articles.isEmpty()) {
            return buildFallbackResponse(rawQuery);
        }

        Set<String> queryTokens = Arrays.stream(normalizedQuery.split("\\W+"))
                .filter(t -> t.length() > 2)
                .filter(t -> !STOP_WORDS.contains(t))
                .collect(Collectors.toSet());

        HrPolicyArticle bestArticle = null;
        double highestScore = 0.0;

        for (HrPolicyArticle article : articles) {
            double score = computeMatchScore(queryTokens, normalizedQuery, article, request.getCategoryHint());
            if (score > highestScore) {
                highestScore = score;
                bestArticle = article;
            }
        }

        if (bestArticle != null && highestScore >= 1.5) {
            List<String> related = generateRelatedQuestions(bestArticle.getCategory());
            return AiAssistantResponse.builder()
                    .query(rawQuery)
                    .answer(bestArticle.getContent())
                    .matchedArticleTitle(bestArticle.getTitle())
                    .category(bestArticle.getCategory())
                    .actionLabel(bestArticle.getActionLabel())
                    .actionRoute(bestArticle.getActionRoute())
                    .confidenceScore(Math.min(1.0, Math.round((highestScore / 10.0) * 100.0) / 100.0))
                    .relatedQuestions(related)
                    .foundDirectMatch(true)
                    .build();
        }

        return buildFallbackResponse(rawQuery);
    }

    private double computeMatchScore(Set<String> queryTokens, String normalizedQuery, HrPolicyArticle article, String categoryHint) {
        double score = 0.0;

        if (categoryHint != null && !categoryHint.isBlank() && categoryHint.equalsIgnoreCase(article.getCategory())) {
            score += 3.0;
        }

        String keywords = article.getKeywords() != null ? article.getKeywords().toLowerCase() : "";
        String title = article.getTitle() != null ? article.getTitle().toLowerCase() : "";
        String summary = article.getSummary() != null ? article.getSummary().toLowerCase() : "";
        String content = article.getContent() != null ? article.getContent().toLowerCase() : "";

        for (String token : queryTokens) {
            if (keywords.contains(token)) score += 2.5;
            if (title.contains(token)) score += 3.0;
            if (summary.contains(token)) score += 1.5;
            if (content.contains(token)) score += 0.8;
        }

        if (normalizedQuery.contains(title) || (title.length() > 10 && title.contains(normalizedQuery))) {
            score += 5.0;
        }

        return score;
    }

    private List<String> generateRelatedQuestions(String category) {
        if ("LEAVE_AND_TIME_OFF".equalsIgnoreCase(category)) {
            return List.of(
                    "How many annual privilege leaves can be rolled over to next year?",
                    "What is the medical certificate requirement for sick leave?",
                    "How does leave encashment work during full and final settlement?"
            );
        } else if ("STATUTORY_AND_TAX".equalsIgnoreCase(category)) {
            return List.of(
                    "What is the difference between New and Old Tax Regime?",
                    "What documents are mandatory to claim HRA exemptions under Section 10(13A)?",
                    "When are Form 16 Part A and Part B released for the financial year?"
            );
        } else if ("HEALTH_AND_INSURANCE".equalsIgnoreCase(category)) {
            return List.of(
                    "What is the total family sum insured under Tier-1 Mediclaim?",
                    "How do I initiate a cashless hospitalisation claim through MediBuddy TPA?",
                    "Can I add dependent elderly parents during open enrollment?"
            );
        } else if ("ATTENDANCE_AND_SHIFTS".equalsIgnoreCase(category)) {
            return List.of(
                    "What is the night differential allowance rate per logged shift?",
                    "How do I initiate a shift swap with a teammate?",
                    "What is the grace period before late mark penalty applies?"
            );
        } else if ("COMPENSATION_AND_BENEFITS".equalsIgnoreCase(category)) {
            return List.of(
                    "What is the tenure requirement to qualify for statutory gratuity?",
                    "What formula is used for calculating gratuity under the 1972 Act?",
                    "Is gratuity payout subject to income tax withholding?"
            );
        } else {
            return List.of(
                    "How do I submit an inquiry or grievance to the HR team?",
                    "Where can I view all corporate policies and compliance guidelines?",
                    "How do I raise a confidential ticket to the Internal Committee?"
            );
        }
    }

    private AiAssistantResponse buildFallbackResponse(String query) {
        return AiAssistantResponse.builder()
                .query(query)
                .answer("I could not find an exact policy document matching your query in the corporate knowledge base. " +
                        "For personalized assistance regarding leaves, payroll adjustments, benefits, or grievances, " +
                        "please raise an internal ticket with the HR People Team or consult your reporting manager.")
                .matchedArticleTitle("HR Helpdesk & Inquiry Guidance")
                .category("GENERAL_HR_INQUIRY")
                .actionLabel("Submit HR Ticket")
                .actionRoute("/helpdesk")
                .confidenceScore(0.30)
                .relatedQuestions(List.of(
                        "How do I check my annual leave balance?",
                        "How can I submit investment proofs for tax deduction?",
                        "What are the company guidelines for night shift allowances?"
                ))
                .foundDirectMatch(false)
                .build();
    }

    @Override
    public List<FlightRiskAnalysisDto> evaluateTenantFlightRisks() {
        String tenantId = getTenantId();
        List<Employee> employees = employeeRepository.findByTenantId(tenantId);
        List<FlightRiskAnalysisDto> results = new ArrayList<>();

        for (Employee emp : employees) {
            FlightRiskAnalysisDto analysis = calculateEmployeeFlightRisk(emp, tenantId);
            results.add(analysis);
        }

        results.sort(Comparator.comparingInt(FlightRiskAnalysisDto::getRiskScore).reversed());
        return results;
    }

    private FlightRiskAnalysisDto calculateEmployeeFlightRisk(Employee emp, String tenantId) {
        int attendanceScore = calculateAttendanceVolatility(emp);
        int compensationScore = calculateCompensationStagnation(emp);
        int tenureScore = calculateTenureRisk(emp);
        int performanceScore = calculatePerformanceDisengagement(emp);

        int totalScore = Math.min(95, Math.max(8, attendanceScore + compensationScore + tenureScore + performanceScore));

        String riskLevel;
        if (totalScore >= 75) {
            riskLevel = "CRITICAL";
        } else if (totalScore >= 55) {
            riskLevel = "HIGH";
        } else if (totalScore >= 35) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "LOW";
        }

        String primaryDriver = determinePrimaryDriver(attendanceScore, compensationScore, tenureScore, performanceScore);
        String recommendation = determineRetentionRecommendation(riskLevel, primaryDriver, emp.getFullName());

        String breakdownJson = String.format(
                "{\"attendanceScore\": %d, \"compensationScore\": %d, \"tenureScore\": %d, \"performanceScore\": %d}",
                attendanceScore, compensationScore, tenureScore, performanceScore
        );

        Optional<FlightRiskEvaluation> existingOpt = flightRiskEvaluationRepository
                .findTopByTenantIdAndEmployeeIdOrderByEvaluatedAtDesc(tenantId, emp.getId());

        FlightRiskEvaluation evaluation;
        if (existingOpt.isPresent()) {
            evaluation = existingOpt.get();
            evaluation.setRiskScore(totalScore);
            evaluation.setRiskLevel(riskLevel);
            evaluation.setPrimaryDriver(primaryDriver);
            evaluation.setDriverBreakdown(breakdownJson);
            evaluation.setRetentionRecommendation(recommendation);
            evaluation.setEvaluatedAt(LocalDateTime.now());
        } else {
            evaluation = FlightRiskEvaluation.builder()
                    .employee(emp)
                    .riskScore(totalScore)
                    .riskLevel(riskLevel)
                    .primaryDriver(primaryDriver)
                    .driverBreakdown(breakdownJson)
                    .retentionRecommendation(recommendation)
                    .evaluatedAt(LocalDateTime.now())
                    .build();
            evaluation.setTenantId(tenantId);
        }

        FlightRiskEvaluation saved = flightRiskEvaluationRepository.save(evaluation);

        return mapToDto(saved, emp);
    }

    private int calculateAttendanceVolatility(Employee emp) {
        int score = 5;
        if (emp.getLeaveBalance() != null && emp.getLeaveBalance() < 5) {
            score += 15;
        } else if (emp.getLeaveBalance() != null && emp.getLeaveBalance() < 10) {
            score += 8;
        }

        if (emp.getSickLeaveBalance() != null && emp.getSickLeaveBalance() <= 2) {
            score += 10;
        }
        return Math.min(30, score);
    }

    private int calculateCompensationStagnation(Employee emp) {
        int score = 5;
        if (emp.getSalary() == null) return score;

        if (emp.getDateOfJoining() != null) {
            int years = Period.between(emp.getDateOfJoining(), LocalDate.now()).getYears();
            if (years >= 3 && emp.getSalary().compareTo(new BigDecimal("600000")) <= 0) {
                score += 20;
            } else if (years >= 2) {
                score += 12;
            }
        }
        return Math.min(25, score);
    }

    private int calculateTenureRisk(Employee emp) {
        int score = 5;
        if (emp.getDateOfJoining() != null) {
            int months = Period.between(emp.getDateOfJoining(), LocalDate.now()).getYears() * 12
                    + Period.between(emp.getDateOfJoining(), LocalDate.now()).getMonths();
            if (months >= 12 && months <= 24) {
                score += 15; // 1-2 year turnover cliff
            } else if (months > 24 && months <= 36) {
                score += 10;
            }
        }
        return Math.min(20, score);
    }

    private int calculatePerformanceDisengagement(Employee emp) {
        int score = 5;
        if (emp.getPerformanceReviews() != null && !emp.getPerformanceReviews().isEmpty()) {
            var latest = emp.getPerformanceReviews().get(emp.getPerformanceReviews().size() - 1);
            if (latest.getFinalRating() != null && latest.getFinalRating().doubleValue() < 3.0) {
                score += 18;
            } else if (latest.getFinalRating() != null && latest.getFinalRating().doubleValue() < 3.5) {
                score += 10;
            }
        }
        return Math.min(25, score);
    }

    private String determinePrimaryDriver(int attendance, int comp, int tenure, int perf) {
        int max = Math.max(Math.max(attendance, comp), Math.max(tenure, perf));
        if (max == comp) return "COMPENSATION_STAGNATION";
        if (max == attendance) return "ATTENDANCE_VOLATILITY";
        if (max == perf) return "PERFORMANCE_DISENGAGEMENT";
        return "TENURE_FLIGHT_WINDOW";
    }

    private String determineRetentionRecommendation(String riskLevel, String driver, String empName) {
        if ("CRITICAL".equalsIgnoreCase(riskLevel)) {
            if ("COMPENSATION_STAGNATION".equals(driver)) {
                return "Immediate manager intervention: Initiate off-cycle compensation review and market parity adjustment.";
            } else if ("ATTENDANCE_VOLATILITY".equals(driver)) {
                return "Urgent 1-on-1 wellness check: Address potential burnout, workload stress, or flexible work needs.";
            } else {
                return "Critical retention alert: Schedule executive check-in to discuss career advancement and leadership roadmap.";
            }
        } else if ("HIGH".equalsIgnoreCase(riskLevel)) {
            if ("TENURE_FLIGHT_WINDOW".equals(driver)) {
                return "Tenure milestone risk: Engage in long-term role expansion discussion and offer skill enrichment opportunities.";
            } else {
                return "High attrition signal: Manager should conduct monthly check-ins and recognize key project milestones.";
            }
        } else if ("MEDIUM".equalsIgnoreCase(riskLevel)) {
            return "Monitor quarterly engagement: Ensure clear quarterly OKRs and healthy team project allocation.";
        } else {
            return "Stable retention profile: Continue regular mentorship and maintain ongoing development trajectory.";
        }
    }

    @Override
    @Transactional
    public List<FlightRiskAnalysisDto> getCachedFlightRiskEvaluations() {
        String tenantId = getTenantId();
        List<FlightRiskEvaluation> list = flightRiskEvaluationRepository.findAllWithEmployeeByTenant(tenantId);
        if (list.isEmpty()) {
            return evaluateTenantFlightRisks();
        }

        return list.stream()
                .map(ev -> mapToDto(ev, ev.getEmployee()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<DepartmentFlightRiskSummaryDto> getDepartmentRiskOverview() {
        List<FlightRiskAnalysisDto> evaluations = getCachedFlightRiskEvaluations();

        Map<String, List<FlightRiskAnalysisDto>> grouped = evaluations.stream()
                .collect(Collectors.groupingBy(ev -> ev.getDepartment() != null ? ev.getDepartment() : "General"));

        List<DepartmentFlightRiskSummaryDto> summaries = new ArrayList<>();
        for (Map.Entry<String, List<FlightRiskAnalysisDto>> entry : grouped.entrySet()) {
            String dept = entry.getKey();
            List<FlightRiskAnalysisDto> list = entry.getValue();
            long total = list.size();
            long low = list.stream().filter(e -> "LOW".equalsIgnoreCase(e.getRiskLevel())).count();
            long med = list.stream().filter(e -> "MEDIUM".equalsIgnoreCase(e.getRiskLevel())).count();
            long high = list.stream().filter(e -> "HIGH".equalsIgnoreCase(e.getRiskLevel())).count();
            long crit = list.stream().filter(e -> "CRITICAL".equalsIgnoreCase(e.getRiskLevel())).count();
            double avg = list.stream().mapToInt(FlightRiskAnalysisDto::getRiskScore).average().orElse(0.0);

            summaries.add(DepartmentFlightRiskSummaryDto.builder()
                    .departmentName(dept)
                    .totalEmployees(total)
                    .lowRiskCount(low)
                    .mediumRiskCount(med)
                    .highRiskCount(high)
                    .criticalRiskCount(crit)
                    .averageRiskScore(Math.round(avg * 10.0) / 10.0)
                    .build());
        }

        summaries.sort(Comparator.comparingDouble(DepartmentFlightRiskSummaryDto::getAverageRiskScore).reversed());
        return summaries;
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeMatchResultDto evaluateCandidateMatch(ResumeMatchRequest request) {
        String tenantId = getTenantId();

        JobPosting job = jobPostingRepository.findByIdAndTenantId(request.getJobPostingId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Job Posting not found with ID: " + request.getJobPostingId()));

        Candidate candidate = candidateRepository.findByIdAndTenantId(request.getCandidateId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with ID: " + request.getCandidateId()));

        // Extract skills from job description/requirements
        String jobText = ((job.getTitle() != null ? job.getTitle() : "") + " " +
                (job.getRequirements() != null ? job.getRequirements() : "") + " " +
                (job.getDescription() != null ? job.getDescription() : "")).toLowerCase();

        String candText = ((candidate.getName() != null ? candidate.getName() : "") + " " +
                (candidate.getNotes() != null ? candidate.getNotes() : "") + " " +
                (candidate.getSource() != null ? candidate.getSource() : "")).toLowerCase();

        List<String> coreSkills = List.of(
                "java", "spring boot", "react", "typescript", "postgresql", "docker",
                "kubernetes", "aws", "microservices", "rest api", "sql", "git",
                "ci/cd", "agile", "tdd", "python", "golang", "angular", "node.js"
        );

        List<String> requiredInJob = coreSkills.stream()
                .filter(jobText::contains)
                .collect(Collectors.toList());

        if (requiredInJob.isEmpty()) {
            requiredInJob = List.of("java", "spring boot", "rest api", "sql");
        }

        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String skill : requiredInJob) {
            if (candText.contains(skill)) {
                matchedSkills.add(skill.toUpperCase());
            } else {
                missingSkills.add(skill.toUpperCase());
            }
        }

        // Skills match score
        int skillsScore = requiredInJob.isEmpty() ? 75 :
                (int) Math.round(((double) matchedSkills.size() / requiredInJob.size()) * 100.0);

        // Experience match score
        int expScore = 70;
        int candExp = candidate.getExperienceYears() != null ? candidate.getExperienceYears() : 3;
        int minExp = job.getExperienceMin() != null ? job.getExperienceMin() : 2;
        int maxExp = job.getExperienceMax() != null ? job.getExperienceMax() : 8;

        if (candExp >= minExp && candExp <= maxExp) {
            expScore = 95;
        } else if (candExp >= minExp - 1) {
            expScore = 80;
        } else if (candExp > maxExp) {
            expScore = 85; // overqualified
        } else {
            expScore = 50;
        }

        // Salary alignment score
        int salaryScore = 80;
        if (candidate.getExpectedCtc() != null && job.getSalaryMax() != null) {
            if (candidate.getExpectedCtc().compareTo(job.getSalaryMax()) <= 0) {
                salaryScore = 95;
            } else if (candidate.getExpectedCtc().compareTo(job.getSalaryMax().multiply(new BigDecimal("1.15"))) <= 0) {
                salaryScore = 75;
            } else {
                salaryScore = 50;
            }
        }

        // Overall composite match score (50% skills, 30% exp, 20% salary)
        int overallScore = (int) Math.round((skillsScore * 0.50) + (expScore * 0.30) + (salaryScore * 0.20));

        String verdict;
        if (overallScore >= 80) {
            verdict = "STRONG_HIRE";
        } else if (overallScore >= 65) {
            verdict = "HIRE";
        } else if (overallScore >= 50) {
            verdict = "CONSIDER";
        } else {
            verdict = "REJECT";
        }

        List<String> strengths = new ArrayList<>();
        if (skillsScore >= 70) strengths.add("Strong technical proficiency aligning with core job tech stack");
        if (expScore >= 80) strengths.add(String.format("Relevant industry tenure (%d years) fits requirement band (%d-%d yrs)", candExp, minExp, maxExp));
        if (salaryScore >= 80) strengths.add("Compensation expectations align cleanly with departmental budget");

        List<String> growthAreas = new ArrayList<>();
        if (!missingSkills.isEmpty()) growthAreas.add("Skill gaps identified: " + String.join(", ", missingSkills));
        if (salaryScore < 70) growthAreas.add("Expected CTC exceeds budgeted maximum salary range");

        String summary = String.format(
                "Candidate %s achieves a %d%% overall match for %s with %d/%d required competencies verified. Hiring Recommendation: %s.",
                candidate.getName(), overallScore, job.getTitle(), matchedSkills.size(), requiredInJob.size(), verdict
        );

        return ResumeMatchResultDto.builder()
                .candidateId(candidate.getId())
                .candidateName(candidate.getName())
                .jobPostingId(job.getId())
                .jobTitle(job.getTitle())
                .overallMatchScore(overallScore)
                .skillsMatchScore(skillsScore)
                .experienceMatchScore(expScore)
                .salaryAlignmentScore(salaryScore)
                .matchedSkills(matchedSkills)
                .missingSkills(missingSkills)
                .candidateStrengths(strengths)
                .growthAreas(growthAreas)
                .hiringVerdict(verdict)
                .executiveSummary(summary)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HrPolicyArticle> getActivePolicies(String category) {
        String tenantId = getTenantId();
        if (category != null && !category.isBlank()) {
            return hrPolicyArticleRepository.findByTenantIdAndCategoryAndIsActiveTrue(tenantId, category);
        }
        return hrPolicyArticleRepository.findByTenantIdAndIsActiveTrue(tenantId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HrPolicyArticle> getAllPolicies(String category) {
        String tenantId = getTenantId();
        if (category != null && !category.isBlank()) {
            return hrPolicyArticleRepository.findByTenantIdAndCategoryOrderByCreatedAtDesc(tenantId, category);
        }
        return hrPolicyArticleRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    @Override
    @Transactional(readOnly = true)
    public HrPolicyArticle getPolicyById(Long id) {
        String tenantId = getTenantId();
        return hrPolicyArticleRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("HR Policy Article not found with id: " + id));
    }

    @Override
    public HrPolicyArticle createPolicy(HrPolicyRequest request) {
        String tenantId = getTenantId();
        HrPolicyArticle article = HrPolicyArticle.builder()
                .category(request.getCategory().trim())
                .title(request.getTitle().trim())
                .summary(request.getSummary().trim())
                .content(request.getContent().trim())
                .keywords(request.getKeywords() != null ? request.getKeywords().trim() : null)
                .actionLabel(request.getActionLabel() != null ? request.getActionLabel().trim() : null)
                .actionRoute(request.getActionRoute() != null ? request.getActionRoute().trim() : null)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        article.setTenantId(tenantId);
        log.info("Creating new HR policy article '{}' in category '{}' for tenant '{}'", article.getTitle(), article.getCategory(), tenantId);
        return hrPolicyArticleRepository.save(article);
    }

    @Override
    public HrPolicyArticle updatePolicy(Long id, HrPolicyRequest request) {
        String tenantId = getTenantId();
        HrPolicyArticle article = hrPolicyArticleRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("HR Policy Article not found with id: " + id));

        article.setCategory(request.getCategory().trim());
        article.setTitle(request.getTitle().trim());
        article.setSummary(request.getSummary().trim());
        article.setContent(request.getContent().trim());
        article.setKeywords(request.getKeywords() != null ? request.getKeywords().trim() : null);
        article.setActionLabel(request.getActionLabel() != null ? request.getActionLabel().trim() : null);
        article.setActionRoute(request.getActionRoute() != null ? request.getActionRoute().trim() : null);
        if (request.getIsActive() != null) {
            article.setIsActive(request.getIsActive());
        }
        log.info("Updating HR policy article '{}' (id: {}) for tenant '{}'", article.getTitle(), id, tenantId);
        return hrPolicyArticleRepository.save(article);
    }

    @Override
    public void deletePolicy(Long id) {
        String tenantId = getTenantId();
        HrPolicyArticle article = hrPolicyArticleRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("HR Policy Article not found with id: " + id));
        article.setIsActive(false);
        hrPolicyArticleRepository.save(article);
        log.info("Soft-deactivated HR policy article '{}' (id: {}) for tenant '{}'", article.getTitle(), id, tenantId);
    }

    private FlightRiskAnalysisDto mapToDto(FlightRiskEvaluation ev, Employee emp) {
        return FlightRiskAnalysisDto.builder()
                .id(ev.getId())
                .employeeId(emp.getId())
                .employeeNumber(emp.getEmployeeNumber())
                .employeeName(emp.getFullName())
                .department(emp.getDepartment() != null ? emp.getDepartment().getName() : "Unassigned")
                .designation(emp.getDesignation() != null ? emp.getDesignation() : "Staff")
                .riskScore(ev.getRiskScore())
                .riskLevel(ev.getRiskLevel())
                .primaryDriver(ev.getPrimaryDriver())
                .driverBreakdown(ev.getDriverBreakdown())
                .retentionRecommendation(ev.getRetentionRecommendation())
                .evaluatedAt(ev.getEvaluatedAt())
                .build();
    }

    private String getTenantId() {
        String tenantId = TenantContext.getTenantId();
        return (tenantId != null && !tenantId.isBlank()) ? tenantId : "default";
    }

    private static final Set<String> STOP_WORDS = Set.of(
            "what", "is", "the", "are", "how", "do", "can", "our", "for", "and", "with",
            "about", "does", "policy", "tell", "explain", "please", "company", "rules"
    );
}
