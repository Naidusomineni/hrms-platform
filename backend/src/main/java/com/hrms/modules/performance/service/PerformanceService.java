package com.hrms.modules.performance.service;

import com.hrms.entity.Employee;
import com.hrms.entity.PerformanceReview;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.performance.dto.AppraisalCycleDto;
import com.hrms.modules.performance.dto.EmployeeGoalDto;
import com.hrms.modules.performance.dto.PerformanceReviewDto;
import com.hrms.modules.performance.entity.AppraisalCycle;
import com.hrms.modules.performance.entity.EmployeeGoal;
import com.hrms.modules.performance.repository.AppraisalCycleRepository;
import com.hrms.modules.performance.repository.EmployeeGoalRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.PerformanceReviewRepository;
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
public class PerformanceService {

    private final AppraisalCycleRepository cycleRepository;
    private final EmployeeGoalRepository goalRepository;
    private final PerformanceReviewRepository reviewRepository;
    private final EmployeeRepository employeeRepository;

    public List<AppraisalCycleDto> getCycles() {
        String tenantId = TenantContext.getTenantId();
        return cycleRepository.findByTenantIdOrderByYearDesc(tenantId).stream()
                .map(this::toCycleDto)
                .collect(Collectors.toList());
    }

    public AppraisalCycleDto createCycle(AppraisalCycleDto dto) {
        String tenantId = TenantContext.getTenantId();
        AppraisalCycle cycle = AppraisalCycle.builder()
                .name(dto.getName())
                .year(dto.getYear())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status(dto.getStatus() != null ? dto.getStatus() : "GOAL_SETTING")
                .build();
        cycle.setTenantId(tenantId);
        cycle = cycleRepository.save(cycle);
        return toCycleDto(cycle);
    }

    public List<EmployeeGoalDto> getGoalsForEmployee(Long employeeId, Long cycleId, org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails != null) {
            boolean isElevated = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR") ||
                                   a.getAuthority().equals("ROLE_MANAGER") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isElevated) {
                Employee emp = employeeRepository.findById(employeeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
                if (emp.getEmail() == null || !emp.getEmail().equalsIgnoreCase(userDetails.getUsername())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You can only view your own goals.");
                }
            }
        }
        return getGoalsForEmployee(employeeId, cycleId);
    }

    public List<EmployeeGoalDto> getGoalsForEmployee(Long employeeId, Long cycleId) {
        String tenantId = TenantContext.getTenantId();
        List<EmployeeGoal> goals = (cycleId != null)
                ? goalRepository.findByTenantIdAndEmployeeIdAndCycleId(tenantId, employeeId, cycleId)
                : goalRepository.findByTenantIdAndEmployeeId(tenantId, employeeId);
        return goals.stream().map(this::toGoalDto).collect(Collectors.toList());
    }

    public EmployeeGoalDto createGoal(EmployeeGoalDto dto, org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails != null) {
            boolean isElevated = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR") ||
                                   a.getAuthority().equals("ROLE_MANAGER") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isElevated) {
                Employee emp = employeeRepository.findById(dto.getEmployeeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));
                if (emp.getEmail() == null || !emp.getEmail().equalsIgnoreCase(userDetails.getUsername())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You can only create goals for your own profile.");
                }
            }
        }
        return createGoal(dto);
    }

    public EmployeeGoalDto createGoal(EmployeeGoalDto dto) {
        String tenantId = TenantContext.getTenantId();
        Employee emp = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));

        AppraisalCycle cycle = null;
        if (dto.getCycleId() != null) {
            cycle = cycleRepository.findById(dto.getCycleId()).orElse(null);
        }

        EmployeeGoal goal = EmployeeGoal.builder()
                .employee(emp)
                .cycle(cycle)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .metricTarget(dto.getMetricTarget())
                .metricCurrent(dto.getMetricCurrent())
                .weightage(dto.getWeightage() != null ? dto.getWeightage() : 25)
                .progress(dto.getProgress() != null ? dto.getProgress() : 0)
                .status(dto.getStatus() != null ? dto.getStatus() : "IN_PROGRESS")
                .build();
        goal.setTenantId(tenantId);
        goal = goalRepository.save(goal);
        return toGoalDto(goal);
    }

    public EmployeeGoalDto updateGoalProgress(Long goalId, Integer progress, String status, org.springframework.security.core.userdetails.UserDetails userDetails) {
        EmployeeGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeGoal", "id", goalId));
        if (userDetails != null) {
            boolean isElevated = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR") ||
                                   a.getAuthority().equals("ROLE_MANAGER") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isElevated) {
                if (goal.getEmployee() == null || goal.getEmployee().getEmail() == null ||
                        !goal.getEmployee().getEmail().equalsIgnoreCase(userDetails.getUsername())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You cannot update progress on another employee's goal.");
                }
            }
        }
        if (progress != null) goal.setProgress(Math.min(100, Math.max(0, progress)));
        if (status != null) goal.setStatus(status);
        goal = goalRepository.save(goal);
        return toGoalDto(goal);
    }

    public EmployeeGoalDto updateGoalProgress(Long goalId, Integer progress, String status) {
        return updateGoalProgress(goalId, progress, status, null);
    }

    public List<PerformanceReviewDto> getAllReviews() {
        String tenantId = TenantContext.getTenantId();
        return reviewRepository.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(this::toReviewDto)
                .collect(Collectors.toList());
    }

    public List<PerformanceReviewDto> getReviewsForEmployee(Long employeeId, org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails != null) {
            boolean isElevated = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR") ||
                                   a.getAuthority().equals("ROLE_MANAGER") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isElevated) {
                Employee emp = employeeRepository.findById(employeeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
                if (emp.getEmail() == null || !emp.getEmail().equalsIgnoreCase(userDetails.getUsername())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You can only view your own performance reviews.");
                }
            }
        }
        return getReviewsForEmployee(employeeId);
    }

    public List<PerformanceReviewDto> getReviewsForEmployee(Long employeeId) {
        return reviewRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .map(this::toReviewDto)
                .collect(Collectors.toList());
    }

    public PerformanceReviewDto submitReview(PerformanceReviewDto dto, org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails != null) {
            boolean isElevated = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR") ||
                                   a.getAuthority().equals("ROLE_MANAGER") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isElevated) {
                Employee emp = employeeRepository.findById(dto.getEmployeeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));
                if (emp.getEmail() == null || !emp.getEmail().equalsIgnoreCase(userDetails.getUsername())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You can only submit self-reviews for your own profile.");
                }
                if (dto.getManagerRating() != null || dto.getFinalRating() != null) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: Employees cannot provide managerial ratings.");
                }
            }
        }
        return submitReview(dto);
    }

    public PerformanceReviewDto submitReview(PerformanceReviewDto dto) {
        String tenantId = TenantContext.getTenantId();
        Employee emp = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));

        Employee reviewer = null;
        if (dto.getReviewerId() != null) {
            reviewer = employeeRepository.findById(dto.getReviewerId()).orElse(null);
        }

        PerformanceReview review = PerformanceReview.builder()
                .employee(emp)
                .reviewer(reviewer)
                .reviewCycle(dto.getReviewCycle() != null ? dto.getReviewCycle() : "Annual-2026")
                .reviewPeriodStart(dto.getReviewPeriodStart())
                .reviewPeriodEnd(dto.getReviewPeriodEnd())
                .selfRating(dto.getSelfRating())
                .managerRating(dto.getManagerRating())
                .finalRating(dto.getFinalRating())
                .selfComments(dto.getSelfComments())
                .managerComments(dto.getManagerComments())
                .strengths(dto.getStrengths())
                .areasOfImprovement(dto.getAreasOfImprovement())
                .goalsNextCycle(dto.getGoalsNextCycle())
                .status(dto.getStatus() != null ? dto.getStatus() : "SUBMITTED")
                .build();
        review.setTenantId(tenantId);
        review = reviewRepository.save(review);
        return toReviewDto(review);
    }

    private AppraisalCycleDto toCycleDto(AppraisalCycle c) {
        return AppraisalCycleDto.builder()
                .id(c.getId())
                .name(c.getName())
                .year(c.getYear())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .status(c.getStatus())
                .build();
    }

    private EmployeeGoalDto toGoalDto(EmployeeGoal g) {
        return EmployeeGoalDto.builder()
                .id(g.getId())
                .cycleId(g.getCycle() != null ? g.getCycle().getId() : null)
                .cycleName(g.getCycle() != null ? g.getCycle().getName() : null)
                .employeeId(g.getEmployee().getId())
                .employeeName(g.getEmployee().getFullName())
                .title(g.getTitle())
                .description(g.getDescription())
                .metricTarget(g.getMetricTarget())
                .metricCurrent(g.getMetricCurrent())
                .weightage(g.getWeightage())
                .progress(g.getProgress())
                .status(g.getStatus())
                .build();
    }

    private PerformanceReviewDto toReviewDto(PerformanceReview r) {
        return PerformanceReviewDto.builder()
                .id(r.getId())
                .employeeId(r.getEmployee().getId())
                .employeeName(r.getEmployee().getFullName())
                .reviewerId(r.getReviewer() != null ? r.getReviewer().getId() : null)
                .reviewerName(r.getReviewer() != null ? r.getReviewer().getFullName() : null)
                .reviewCycle(r.getReviewCycle())
                .reviewPeriodStart(r.getReviewPeriodStart())
                .reviewPeriodEnd(r.getReviewPeriodEnd())
                .selfRating(r.getSelfRating())
                .managerRating(r.getManagerRating())
                .finalRating(r.getFinalRating())
                .selfComments(r.getSelfComments())
                .managerComments(r.getManagerComments())
                .strengths(r.getStrengths())
                .areasOfImprovement(r.getAreasOfImprovement())
                .goalsNextCycle(r.getGoalsNextCycle())
                .status(r.getStatus())
                .build();
    }
}
