package com.hrms.modules.attendance.service;

import com.hrms.entity.Department;
import com.hrms.entity.Employee;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.attendance.dto.AttendancePolicyDto;
import com.hrms.modules.attendance.dto.PolicyAssignmentDto;
import com.hrms.modules.attendance.entity.AttendancePolicy;
import com.hrms.modules.attendance.entity.OfficeLocation;
import com.hrms.modules.attendance.entity.PolicyAssignment;
import com.hrms.modules.attendance.repository.AttendancePolicyRepository;
import com.hrms.modules.attendance.repository.OfficeLocationRepository;
import com.hrms.modules.attendance.repository.PolicyAssignmentRepository;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class PolicyResolverService {

    private final AttendancePolicyRepository policyRepository;
    private final PolicyAssignmentRepository assignmentRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final OfficeLocationRepository officeLocationRepository;

    /**
     * Resolves the effective attendance policy using the 4-tier hierarchy:
     * 1. Employee-level override (Priority 1)
     * 2. Department-level policy (Priority 2)
     * 3. Location-level policy (Priority 3)
     * 4. Tenant-level default policy (Priority 4)
     */
    @Transactional(readOnly = true)
    public AttendancePolicy resolveAttendancePolicy(Long employeeId, LocalDate date) {
        String tenantId = TenantContext.getTenantId();
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        // Tier 1: Employee Specific Assignment
        Optional<PolicyAssignment> empAssignment = assignmentRepository
                .findByTenantIdAndPolicyTypeAndEmployeeId(tenantId, "ATTENDANCE", employee.getId());
        if (empAssignment.isPresent() && Boolean.TRUE.equals(empAssignment.get().getPolicy().getIsActive())) {
            log.debug("Resolved attendance policy [Tier 1 Employee] {} for employee {}", 
                    empAssignment.get().getPolicy().getPolicyCode(), employeeId);
            return empAssignment.get().getPolicy();
        }

        // Tier 2: Department Assignment
        if (employee.getDepartment() != null) {
            Optional<PolicyAssignment> deptAssignment = assignmentRepository
                    .findByTenantIdAndPolicyTypeAndDepartmentId(tenantId, "ATTENDANCE", employee.getDepartment().getId());
            if (deptAssignment.isPresent() && Boolean.TRUE.equals(deptAssignment.get().getPolicy().getIsActive())) {
                log.debug("Resolved attendance policy [Tier 2 Department] {} for employee {}", 
                        deptAssignment.get().getPolicy().getPolicyCode(), employeeId);
                return deptAssignment.get().getPolicy();
            }
        }

        // Tier 3: Location Assignment
        // If employee has a preferred location or office assignment
        List<OfficeLocation> locations = officeLocationRepository.findByTenantIdAndIsActiveTrue(tenantId);
        if (!locations.isEmpty()) {
            for (OfficeLocation loc : locations) {
                Optional<PolicyAssignment> locAssignment = assignmentRepository
                        .findByTenantIdAndPolicyTypeAndOfficeLocationId(tenantId, "ATTENDANCE", loc.getId());
                if (locAssignment.isPresent() && Boolean.TRUE.equals(locAssignment.get().getPolicy().getIsActive())) {
                    // Match employee location if present
                    log.debug("Resolved attendance policy [Tier 3 Location] {} for employee {}", 
                            locAssignment.get().getPolicy().getPolicyCode(), employeeId);
                    return locAssignment.get().getPolicy();
                }
            }
        }

        // Tier 4: Tenant Default Policy Assignment
        Optional<PolicyAssignment> tenantDefaultAssignment = assignmentRepository.findTenantDefault(tenantId, "ATTENDANCE");
        if (tenantDefaultAssignment.isPresent() && Boolean.TRUE.equals(tenantDefaultAssignment.get().getPolicy().getIsActive())) {
            log.debug("Resolved attendance policy [Tier 4 Tenant Assignment] {} for employee {}", 
                    tenantDefaultAssignment.get().getPolicy().getPolicyCode(), employeeId);
            return tenantDefaultAssignment.get().getPolicy();
        }

        // Direct Tenant Default Flag
        return policyRepository.findByTenantIdAndIsDefaultTrue(tenantId)
                .orElseGet(() -> policyRepository.findByTenantIdAndPolicyCode(tenantId, "STD_CORPORATE")
                .orElseGet(this::createFallbackPolicy));
    }

    private AttendancePolicy createFallbackPolicy() {
        return AttendancePolicy.builder()
                .policyName("Standard Corporate Fallback")
                .policyCode("STD_FALLBACK")
                .gracePeriodMinutes(15)
                .maxLateAllowedPerMonth(3)
                .latePenaltyAction("FLAG_ONLY")
                .fullDayHours(new BigDecimal("8.00"))
                .halfDayHours(new BigDecimal("4.00"))
                .absentThresholdHours(new BigDecimal("3.00"))
                .earlyDepartureMinutes(30)
                .overtimeEnabled(true)
                .minOvertimeThresholdMinutes(60)
                .overtimeRequiresApproval(true)
                .autoDeductBreak(false)
                .breakDeductionMinutes(45)
                .maxRegularizationsPerMonth(3)
                .regularizationFilingWindowDays(5)
                .allowedPunchMethods("BIOMETRIC,WEB,GEOFENCE")
                .isActive(true)
                .build();
    }

    // --- Policy CRUD Operations ---

    @Transactional(readOnly = true)
    @Cacheable(value = "shiftPolicies", key = "T(com.hrms.infrastructure.multitenancy.context.TenantContext).getTenantId()")
    public List<AttendancePolicyDto> getAllPolicies() {
        String tenantId = TenantContext.getTenantId();
        return policyRepository.findByTenantIdAndIsActiveTrue(tenantId).stream()
                .map(this::toPolicyDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AttendancePolicyDto getPolicyById(Long id) {
        return policyRepository.findById(id)
                .map(this::toPolicyDto)
                .orElseThrow(() -> new ResourceNotFoundException("AttendancePolicy", "id", id));
    }

    @CacheEvict(value = "shiftPolicies", allEntries = true)
    public AttendancePolicyDto createPolicy(AttendancePolicyDto dto) {
        String tenantId = TenantContext.getTenantId();

        if (policyRepository.findByTenantIdAndPolicyCode(tenantId, dto.getPolicyCode()).isPresent()) {
            throw new BadRequestException("Policy with code '" + dto.getPolicyCode() + "' already exists");
        }

        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            // Unset previous default
            policyRepository.findByTenantIdAndIsDefaultTrue(tenantId).ifPresent(p -> {
                p.setIsDefault(false);
                policyRepository.save(p);
            });
        }

        AttendancePolicy policy = AttendancePolicy.builder()
                .policyName(dto.getPolicyName())
                .policyCode(dto.getPolicyCode().toUpperCase().trim())
                .description(dto.getDescription())
                .isDefault(Boolean.TRUE.equals(dto.getIsDefault()))
                .effectiveFrom(dto.getEffectiveFrom() != null ? dto.getEffectiveFrom() : LocalDate.now())
                .shiftStartTime(dto.getShiftStartTime() != null ? dto.getShiftStartTime() : LocalTime.of(9, 0))
                .shiftEndTime(dto.getShiftEndTime() != null ? dto.getShiftEndTime() : LocalTime.of(18, 0))
                .allowedPunchMethods(dto.getAllowedPunchMethods() != null ? dto.getAllowedPunchMethods() : "BIOMETRIC,WEB,GEOFENCE")
                .gracePeriodMinutes(dto.getGracePeriodMinutes() != null ? dto.getGracePeriodMinutes() : 15)
                .maxLateAllowedPerMonth(dto.getMaxLateAllowedPerMonth() != null ? dto.getMaxLateAllowedPerMonth() : 3)
                .latePenaltyAction(dto.getLatePenaltyAction() != null ? dto.getLatePenaltyAction() : "FLAG_ONLY")
                .fullDayHours(dto.getFullDayHours() != null ? dto.getFullDayHours() : new BigDecimal("8.00"))
                .halfDayHours(dto.getHalfDayHours() != null ? dto.getHalfDayHours() : new BigDecimal("4.00"))
                .absentThresholdHours(dto.getAbsentThresholdHours() != null ? dto.getAbsentThresholdHours() : new BigDecimal("3.00"))
                .earlyDepartureMinutes(dto.getEarlyDepartureMinutes() != null ? dto.getEarlyDepartureMinutes() : 30)
                .earlyDeparturePenalty(dto.getEarlyDeparturePenalty() != null ? dto.getEarlyDeparturePenalty() : "FLAG_ONLY")
                .overtimeEnabled(dto.getOvertimeEnabled() != null ? dto.getOvertimeEnabled() : true)
                .minOvertimeThresholdMinutes(dto.getMinOvertimeThresholdMinutes() != null ? dto.getMinOvertimeThresholdMinutes() : 60)
                .overtimeRequiresApproval(dto.getOvertimeRequiresApproval() != null ? dto.getOvertimeRequiresApproval() : true)
                .autoDeductBreak(dto.getAutoDeductBreak() != null ? dto.getAutoDeductBreak() : false)
                .breakDeductionMinutes(dto.getBreakDeductionMinutes() != null ? dto.getBreakDeductionMinutes() : 45)
                .maxRegularizationsPerMonth(dto.getMaxRegularizationsPerMonth() != null ? dto.getMaxRegularizationsPerMonth() : 3)
                .regularizationFilingWindowDays(dto.getRegularizationFilingWindowDays() != null ? dto.getRegularizationFilingWindowDays() : 5)
                .isActive(true)
                .build();

        policy = policyRepository.save(policy);
        return toPolicyDto(policy);
    }

    @CacheEvict(value = "shiftPolicies", allEntries = true)
    public AttendancePolicyDto updatePolicy(Long id, AttendancePolicyDto dto) {
        String tenantId = TenantContext.getTenantId();
        AttendancePolicy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AttendancePolicy", "id", id));

        if (Boolean.TRUE.equals(dto.getIsDefault()) && !Boolean.TRUE.equals(policy.getIsDefault())) {
            policyRepository.findByTenantIdAndIsDefaultTrue(tenantId).ifPresent(p -> {
                p.setIsDefault(false);
                policyRepository.save(p);
            });
        }

        if (dto.getPolicyName() != null) policy.setPolicyName(dto.getPolicyName());
        if (dto.getDescription() != null) policy.setDescription(dto.getDescription());
        if (dto.getIsDefault() != null) policy.setIsDefault(dto.getIsDefault());
        if (dto.getEffectiveFrom() != null) policy.setEffectiveFrom(dto.getEffectiveFrom());
        if (dto.getShiftStartTime() != null) policy.setShiftStartTime(dto.getShiftStartTime());
        if (dto.getShiftEndTime() != null) policy.setShiftEndTime(dto.getShiftEndTime());
        if (dto.getAllowedPunchMethods() != null) policy.setAllowedPunchMethods(dto.getAllowedPunchMethods());
        if (dto.getGracePeriodMinutes() != null) policy.setGracePeriodMinutes(dto.getGracePeriodMinutes());
        if (dto.getMaxLateAllowedPerMonth() != null) policy.setMaxLateAllowedPerMonth(dto.getMaxLateAllowedPerMonth());
        if (dto.getLatePenaltyAction() != null) policy.setLatePenaltyAction(dto.getLatePenaltyAction());
        if (dto.getFullDayHours() != null) policy.setFullDayHours(dto.getFullDayHours());
        if (dto.getHalfDayHours() != null) policy.setHalfDayHours(dto.getHalfDayHours());
        if (dto.getAbsentThresholdHours() != null) policy.setAbsentThresholdHours(dto.getAbsentThresholdHours());
        if (dto.getEarlyDepartureMinutes() != null) policy.setEarlyDepartureMinutes(dto.getEarlyDepartureMinutes());
        if (dto.getEarlyDeparturePenalty() != null) policy.setEarlyDeparturePenalty(dto.getEarlyDeparturePenalty());
        if (dto.getOvertimeEnabled() != null) policy.setOvertimeEnabled(dto.getOvertimeEnabled());
        if (dto.getMinOvertimeThresholdMinutes() != null) policy.setMinOvertimeThresholdMinutes(dto.getMinOvertimeThresholdMinutes());
        if (dto.getOvertimeRequiresApproval() != null) policy.setOvertimeRequiresApproval(dto.getOvertimeRequiresApproval());
        if (dto.getAutoDeductBreak() != null) policy.setAutoDeductBreak(dto.getAutoDeductBreak());
        if (dto.getBreakDeductionMinutes() != null) policy.setBreakDeductionMinutes(dto.getBreakDeductionMinutes());
        if (dto.getMaxRegularizationsPerMonth() != null) policy.setMaxRegularizationsPerMonth(dto.getMaxRegularizationsPerMonth());
        if (dto.getRegularizationFilingWindowDays() != null) policy.setRegularizationFilingWindowDays(dto.getRegularizationFilingWindowDays());
        if (dto.getIsActive() != null) policy.setIsActive(dto.getIsActive());

        policy = policyRepository.save(policy);
        return toPolicyDto(policy);
    }

    @CacheEvict(value = "shiftPolicies", allEntries = true)
    public void deletePolicy(Long id) {
        AttendancePolicy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AttendancePolicy", "id", id));
        if (Boolean.TRUE.equals(policy.getIsDefault())) {
            throw new BadRequestException("Cannot delete the default attendance policy. Set another policy as default first.");
        }
        policy.setIsActive(false);
        policyRepository.save(policy);
    }

    // --- Policy Assignment Operations ---

    @Transactional(readOnly = true)
    public List<PolicyAssignmentDto> getAssignments(String policyType) {
        String tenantId = TenantContext.getTenantId();
        return assignmentRepository.findByTenantIdAndPolicyType(tenantId, policyType != null ? policyType : "ATTENDANCE")
                .stream().map(this::toAssignmentDto).collect(Collectors.toList());
    }

    public PolicyAssignmentDto assignPolicy(PolicyAssignmentDto dto) {
        String tenantId = TenantContext.getTenantId();
        AttendancePolicy policy = policyRepository.findById(dto.getPolicyId())
                .orElseThrow(() -> new ResourceNotFoundException("AttendancePolicy", "id", dto.getPolicyId()));

        Department dept = null;
        if (dto.getDepartmentId() != null) {
            dept = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", dto.getDepartmentId()));
            assignmentRepository.deleteByTenantIdAndPolicyTypeAndDepartmentId(tenantId, "ATTENDANCE", dept.getId());
        }

        OfficeLocation loc = null;
        if (dto.getOfficeLocationId() != null) {
            loc = officeLocationRepository.findById(dto.getOfficeLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("OfficeLocation", "id", dto.getOfficeLocationId()));
            assignmentRepository.deleteByTenantIdAndPolicyTypeAndOfficeLocationId(tenantId, "ATTENDANCE", loc.getId());
        }

        Employee emp = null;
        if (dto.getEmployeeId() != null) {
            emp = employeeRepository.findById(dto.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));
            assignmentRepository.deleteByTenantIdAndPolicyTypeAndEmployeeId(tenantId, "ATTENDANCE", emp.getId());
        }

        int priority = 4;
        if (emp != null) priority = 1;
        else if (dept != null) priority = 2;
        else if (loc != null) priority = 3;

        PolicyAssignment assignment = PolicyAssignment.builder()
                .policy(policy)
                .policyType(dto.getPolicyType() != null ? dto.getPolicyType() : "ATTENDANCE")
                .department(dept)
                .officeLocation(loc)
                .employee(emp)
                .priorityLevel(priority)
                .build();

        assignment = assignmentRepository.save(assignment);
        return toAssignmentDto(assignment);
    }

    public void deleteAssignment(Long id) {
        PolicyAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PolicyAssignment", "id", id));
        if (assignment.getPriorityLevel() == 4) {
            throw new BadRequestException("Cannot delete default tenant assignment");
        }
        assignmentRepository.delete(assignment);
    }

    private AttendancePolicyDto toPolicyDto(AttendancePolicy p) {
        return AttendancePolicyDto.builder()
                .id(p.getId())
                .policyName(p.getPolicyName())
                .policyCode(p.getPolicyCode())
                .description(p.getDescription())
                .isDefault(p.getIsDefault())
                .effectiveFrom(p.getEffectiveFrom())
                .shiftStartTime(p.getShiftStartTime())
                .shiftEndTime(p.getShiftEndTime())
                .allowedPunchMethods(p.getAllowedPunchMethods())
                .gracePeriodMinutes(p.getGracePeriodMinutes())
                .maxLateAllowedPerMonth(p.getMaxLateAllowedPerMonth())
                .latePenaltyAction(p.getLatePenaltyAction())
                .fullDayHours(p.getFullDayHours())
                .halfDayHours(p.getHalfDayHours())
                .absentThresholdHours(p.getAbsentThresholdHours())
                .earlyDepartureMinutes(p.getEarlyDepartureMinutes())
                .earlyDeparturePenalty(p.getEarlyDeparturePenalty())
                .overtimeEnabled(p.getOvertimeEnabled())
                .minOvertimeThresholdMinutes(p.getMinOvertimeThresholdMinutes())
                .overtimeRequiresApproval(p.getOvertimeRequiresApproval())
                .autoDeductBreak(p.getAutoDeductBreak())
                .breakDeductionMinutes(p.getBreakDeductionMinutes())
                .maxRegularizationsPerMonth(p.getMaxRegularizationsPerMonth())
                .regularizationFilingWindowDays(p.getRegularizationFilingWindowDays())
                .isActive(p.getIsActive())
                .build();
    }

    private PolicyAssignmentDto toAssignmentDto(PolicyAssignment a) {
        return PolicyAssignmentDto.builder()
                .id(a.getId())
                .policyType(a.getPolicyType())
                .policyId(a.getPolicy().getId())
                .policyName(a.getPolicy().getPolicyName())
                .policyCode(a.getPolicy().getPolicyCode())
                .departmentId(a.getDepartment() != null ? a.getDepartment().getId() : null)
                .departmentName(a.getDepartment() != null ? a.getDepartment().getName() : null)
                .officeLocationId(a.getOfficeLocation() != null ? a.getOfficeLocation().getId() : null)
                .officeLocationName(a.getOfficeLocation() != null ? a.getOfficeLocation().getName() : null)
                .employeeId(a.getEmployee() != null ? a.getEmployee().getId() : null)
                .employeeName(a.getEmployee() != null ? a.getEmployee().getFullName() : null)
                .priorityLevel(a.getPriorityLevel())
                .createdAt(a.getCreatedAt())
                .build();
    }
}

