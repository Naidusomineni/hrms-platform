package com.hrms.modules.recruitment.service;

import com.hrms.dto.response.EmployeeResponse;
import com.hrms.entity.Candidate;
import com.hrms.entity.Department;
import com.hrms.entity.Employee;
import com.hrms.entity.JobPosting;
import com.hrms.entity.User;
import com.hrms.modules.employee.service.EmployeeService;
import com.hrms.repository.UserRepository;
import com.hrms.enums.CandidateStage;
import com.hrms.enums.EmploymentStatus;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.recruitment.dto.*;
import com.hrms.modules.recruitment.entity.InterviewScorecard;
import com.hrms.modules.recruitment.repository.CandidateRepository;
import com.hrms.modules.recruitment.repository.InterviewScorecardRepository;
import com.hrms.modules.leave.entity.EmployeeLeaveBalance;
import com.hrms.modules.leave.repository.EmployeeLeaveBalanceRepository;
import com.hrms.enums.LeaveType;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class RecruitmentService {

    private final JobPostingRepository jobPostingRepository;
    private final CandidateRepository candidateRepository;
    private final InterviewScorecardRepository scorecardRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmployeeService employeeService;
    private final EmployeeLeaveBalanceRepository leaveBalanceRepository;
    private final com.hrms.service.EmailService emailService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public List<JobPostingDto> getJobPostings() {
        String tenantId = TenantContext.getTenantId();
        List<JobPosting> jobs = (tenantId != null && !tenantId.isBlank())
                ? jobPostingRepository.findByTenantId(tenantId)
                : jobPostingRepository.findByStatus("OPEN");
        return jobs.stream()
                .map(this::toJobDto)
                .collect(Collectors.toList());
    }

    public JobPostingDto createJobPosting(JobPostingDto dto) {
        String tenantId = TenantContext.getTenantId();
        Department dept = null;
        if (dto.getDepartmentId() != null) {
            dept = departmentRepository.findById(dto.getDepartmentId()).orElse(null);
        }

        JobPosting job = JobPosting.builder()
                .title(dto.getTitle())
                .department(dept)
                .description(dto.getDescription())
                .requirements(dto.getRequirements())
                .experienceMin(dto.getExperienceMin())
                .experienceMax(dto.getExperienceMax())
                .salaryMin(dto.getSalaryMin())
                .salaryMax(dto.getSalaryMax())
                .location(dto.getLocation() != null ? dto.getLocation() : "Headquarters")
                .openings(dto.getOpenings() != null ? dto.getOpenings() : 1)
                .status(dto.getStatus() != null ? dto.getStatus() : "OPEN")
                .closesAt(dto.getClosesAt())
                .build();
        job.setTenantId(tenantId);
        job = jobPostingRepository.save(job);
        return toJobDto(job);
    }

    public List<CandidateDto> getCandidates(Long jobPostingId) {
        String tenantId = TenantContext.getTenantId();
        List<Candidate> list = (jobPostingId != null)
                ? candidateRepository.findByTenantIdAndJobPostingId(tenantId, jobPostingId)
                : candidateRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        return list.stream().map(this::toCandidateDto).collect(Collectors.toList());
    }

    public CandidateDto createCandidate(CandidateDto dto) {
        String tenantId = TenantContext.getTenantId();
        JobPosting job = null;
        if (dto.getJobPostingId() != null) {
            job = jobPostingRepository.findById(dto.getJobPostingId()).orElse(null);
        }
        if (job == null) {
            job = (tenantId != null && !tenantId.isBlank())
                    ? jobPostingRepository.findByTenantId(tenantId).stream().findFirst().orElse(null)
                    : null;
        }

        Candidate cand = Candidate.builder()
                .jobPosting(job)
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .resumeUrl(dto.getResumeUrl())
                .linkedinUrl(dto.getLinkedinUrl())
                .experienceYears(dto.getExperienceYears())
                .currentCtc(dto.getCurrentCtc())
                .expectedCtc(dto.getExpectedCtc())
                .noticePeriodDays(dto.getNoticePeriodDays() != null ? dto.getNoticePeriodDays() : 30)
                .source(dto.getSource() != null ? dto.getSource() : "Portal")
                .notes(dto.getNotes())
                .stage(CandidateStage.APPLIED)
                .build();
        cand.setTenantId(tenantId);
        cand = candidateRepository.save(cand);
        return toCandidateDto(cand);
    }

    public CandidateDto updateCandidateStage(Long candidateId, String stageStr) {
        Candidate cand = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));
        CandidateStage stage = CandidateStage.valueOf(stageStr.toUpperCase());
        cand.setStage(stage);
        cand = candidateRepository.save(cand);
        return toCandidateDto(cand);
    }

    public InterviewScorecardDto addScorecard(InterviewScorecardDto dto) {
        String tenantId = TenantContext.getTenantId();
        Candidate cand = candidateRepository.findById(dto.getCandidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", dto.getCandidateId()));

        Employee interviewer = null;
        if (dto.getInterviewerId() != null) {
            interviewer = employeeRepository.findById(dto.getInterviewerId()).orElse(null);
        }

        InterviewScorecard sc = InterviewScorecard.builder()
                .candidate(cand)
                .interviewer(interviewer)
                .roundName(dto.getRoundName())
                .technicalRating(dto.getTechnicalRating() != null ? dto.getTechnicalRating() : 3)
                .communicationRating(dto.getCommunicationRating() != null ? dto.getCommunicationRating() : 3)
                .cultureFitRating(dto.getCultureFitRating() != null ? dto.getCultureFitRating() : 3)
                .recommendation(dto.getRecommendation() != null ? dto.getRecommendation() : "HIRE")
                .feedback(dto.getFeedback())
                .build();
        sc.setTenantId(tenantId);
        sc = scorecardRepository.save(sc);

        dto.setId(sc.getId());
        dto.setCreatedAt(sc.getCreatedAt());
        return dto;
    }

    public List<InterviewScorecardDto> getScorecards(Long candidateId) {
        String tenantId = TenantContext.getTenantId();
        return scorecardRepository.findByTenantIdAndCandidateId(tenantId, candidateId).stream()
                .map(sc -> InterviewScorecardDto.builder()
                        .id(sc.getId())
                        .candidateId(sc.getCandidate().getId())
                        .interviewerId(sc.getInterviewer() != null ? sc.getInterviewer().getId() : null)
                        .interviewerName(sc.getInterviewer() != null ? sc.getInterviewer().getFullName() : null)
                        .roundName(sc.getRoundName())
                        .technicalRating(sc.getTechnicalRating())
                        .communicationRating(sc.getCommunicationRating())
                        .cultureFitRating(sc.getCultureFitRating())
                        .recommendation(sc.getRecommendation())
                        .feedback(sc.getFeedback())
                        .createdAt(sc.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public EmployeeResponse convertCandidateToEmployee(Long candidateId, CandidateConvertDto dto) {
        String tenantId = TenantContext.getTenantId();
        Candidate cand = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", candidateId));

        String fullName = cand.getName();
        String firstName = fullName;
        String lastName = "";
        int spaceIdx = fullName.indexOf(' ');
        if (spaceIdx > 0) {
            firstName = fullName.substring(0, spaceIdx);
            lastName = fullName.substring(spaceIdx + 1);
        }

        Department dept = null;
        if (dto.getDepartmentId() != null) {
            dept = departmentRepository.findById(dto.getDepartmentId()).orElse(null);
        } else if (cand.getJobPosting() != null && cand.getJobPosting().getDepartment() != null) {
            dept = cand.getJobPosting().getDepartment();
        }

        // Link or create user account for converted employee
        User user = userRepository.findByEmail(cand.getEmail()).orElse(null);
        String defaultPw = "Hrms@" + (1000 + new java.util.Random().nextInt(9000));
        if (user == null) {
            user = User.builder()
                .firstName(firstName)
                .lastName(lastName.isBlank() ? "Employee" : lastName)
                .email(cand.getEmail())
                .password(passwordEncoder.encode(defaultPw))
                .role(com.hrms.enums.Role.ROLE_EMPLOYEE)
                .isActive(true)
                .emailVerified(true)
                .mustChangePassword(true)
                .build();
            user.setTenantId(tenantId);
            user = userRepository.save(user);
        } else {
            user.setMustChangePassword(true);
            user.setPassword(passwordEncoder.encode(defaultPw));
            userRepository.save(user);
        }

        Employee emp = Employee.builder()
                .employeeNumber(dto.getEmployeeNumber())
                .firstName(firstName)
                .lastName(lastName)
                .email(cand.getEmail())
                .phoneNumber(cand.getPhone())
                .designation(dto.getDesignation() != null ? dto.getDesignation() : (cand.getJobPosting() != null ? cand.getJobPosting().getTitle() : "Software Engineer"))
                .department(dept)
                .dateOfJoining(dto.getDateOfJoining())
                .employmentStatus(EmploymentStatus.ACTIVE)
                .salary(dto.getSalary() != null ? dto.getSalary() : cand.getExpectedCtc())
                .leaveBalance(24)
                .sickLeaveBalance(12)
                .casualLeaveBalance(8)
                .user(user)
                .build();
        emp.setTenantId(tenantId);
        emp = employeeRepository.save(emp);

        // Auto-initialize statutory leave balances
        int currentYear = java.time.LocalDate.now().getYear();
        for (LeaveType type : List.of(LeaveType.ANNUAL, LeaveType.SICK, LeaveType.CASUAL)) {
            java.math.BigDecimal days = switch (type) {
                case ANNUAL -> java.math.BigDecimal.valueOf(24.0);
                case SICK -> java.math.BigDecimal.valueOf(12.0);
                case CASUAL -> java.math.BigDecimal.valueOf(8.0);
                default -> java.math.BigDecimal.valueOf(10.0);
            };
            EmployeeLeaveBalance bal = EmployeeLeaveBalance.builder()
                .employee(emp)
                .leaveType(type)
                .allocatedDays(days)
                .balanceDays(days)
                .usedDays(java.math.BigDecimal.ZERO)
                .pendingDays(java.math.BigDecimal.ZERO)
                .year(currentYear)
                .build();
            bal.setTenantId(tenantId);
            leaveBalanceRepository.save(bal);
        }

        emailService.sendMncWelcomeEmail(
            emp.getEmail(),
            emp.getFirstName(),
            emp.getLastName(),
            emp.getEmployeeNumber(),
            emp.getDesignation(),
            dept != null ? dept.getName() : "General",
            defaultPw
        );

        cand.setStage(CandidateStage.HIRED);
        cand.setNotes((cand.getNotes() != null ? cand.getNotes() + " | " : "") + "Converted to Employee: " + emp.getEmployeeNumber());
        candidateRepository.save(cand);

        log.info("Candidate {} successfully converted to Employee {}", cand.getName(), emp.getEmployeeNumber());
        return employeeService.toResponse(emp);
    }

    private JobPostingDto toJobDto(JobPosting j) {
        return JobPostingDto.builder()
                .id(j.getId())
                .title(j.getTitle())
                .departmentId(j.getDepartment() != null ? j.getDepartment().getId() : null)
                .departmentName(j.getDepartment() != null ? j.getDepartment().getName() : null)
                .description(j.getDescription())
                .requirements(j.getRequirements())
                .experienceMin(j.getExperienceMin())
                .experienceMax(j.getExperienceMax())
                .salaryMin(j.getSalaryMin())
                .salaryMax(j.getSalaryMax())
                .location(j.getLocation())
                .status(j.getStatus())
                .openings(j.getOpenings())
                .closesAt(j.getClosesAt())
                .candidateCount(j.getCandidates() != null ? j.getCandidates().size() : 0)
                .build();
    }

    private CandidateDto toCandidateDto(Candidate c) {
        return CandidateDto.builder()
                .id(c.getId())
                .jobPostingId(c.getJobPosting() != null ? c.getJobPosting().getId() : null)
                .jobPostingTitle(c.getJobPosting() != null ? c.getJobPosting().getTitle() : null)
                .name(c.getName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .resumeUrl(c.getResumeUrl())
                .linkedinUrl(c.getLinkedinUrl())
                .experienceYears(c.getExperienceYears())
                .currentCtc(c.getCurrentCtc())
                .expectedCtc(c.getExpectedCtc())
                .noticePeriodDays(c.getNoticePeriodDays())
                .stage(c.getStage() != null ? c.getStage().name() : "APPLIED")
                .source(c.getSource())
                .notes(c.getNotes())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
