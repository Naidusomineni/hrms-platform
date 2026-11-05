package com.hrms.modules.report.service;

import com.hrms.entity.Candidate;
import com.hrms.entity.Employee;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.asset.entity.Asset;
import com.hrms.modules.asset.repository.AssetRepository;
import com.hrms.modules.performance.repository.AppraisalCycleRepository;
import com.hrms.modules.recruitment.repository.CandidateRepository;
import com.hrms.modules.report.dto.ExecutiveAnalyticsDto;
import com.hrms.modules.report.dto.TaxDeclarationDto;
import com.hrms.modules.report.entity.TaxDeclaration;
import com.hrms.modules.report.repository.TaxDeclarationRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.JobPostingRepository;
import com.hrms.repository.PayrollSlipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ReportService {

    private final TaxDeclarationRepository taxRepository;
    private final EmployeeRepository employeeRepository;
    private final JobPostingRepository jobPostingRepository;
    private final CandidateRepository candidateRepository;
    private final AssetRepository assetRepository;
    private final AppraisalCycleRepository cycleRepository;
    private final PayrollSlipRepository payrollSlipRepository;

    public List<TaxDeclarationDto> getTaxDeclarations(Long employeeId) {
        String tenantId = TenantContext.getTenantId();
        return taxRepository.findByTenantIdAndEmployeeId(tenantId, employeeId).stream()
                .map(this::toTaxDto)
                .collect(Collectors.toList());
    }

    public TaxDeclarationDto saveTaxDeclaration(TaxDeclarationDto dto) {
        String tenantId = TenantContext.getTenantId();
        Employee emp = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));

        TaxDeclaration tax = taxRepository.findByTenantIdAndEmployeeIdAndFinancialYear(tenantId, emp.getId(), dto.getFinancialYear())
                .orElse(TaxDeclaration.builder().employee(emp).financialYear(dto.getFinancialYear()).build());

        tax.setRegime(dto.getRegime() != null ? dto.getRegime() : "NEW");
        tax.setDeclared80c(dto.getDeclared80c() != null ? dto.getDeclared80c() : BigDecimal.ZERO);
        tax.setDeclared80d(dto.getDeclared80d() != null ? dto.getDeclared80d() : BigDecimal.ZERO);
        tax.setDeclaredHra(dto.getDeclaredHra() != null ? dto.getDeclaredHra() : BigDecimal.ZERO);
        tax.setStatus("VERIFIED");
        tax.setTenantId(tenantId);
        tax = taxRepository.save(tax);

        return toTaxDto(tax);
    }

    public ExecutiveAnalyticsDto getExecutiveAnalytics() {
        String tenantId = TenantContext.getTenantId();

        List<Employee> employees = employeeRepository.findByTenantId(tenantId);
        List<Candidate> candidates = candidateRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        List<Asset> assets = assetRepository.findByTenantId(tenantId);

        long totalEmployees = (tenantId != null && !tenantId.isBlank())
                ? employeeRepository.countByTenantId(tenantId)
                : employees.size();
        long activeJobs = (tenantId != null && !tenantId.isBlank())
                ? jobPostingRepository.countByTenantIdAndStatus(tenantId, "OPEN")
                : jobPostingRepository.countByStatus("OPEN");
        long totalCandidates = (tenantId != null && !tenantId.isBlank())
                ? candidateRepository.countByTenantId(tenantId)
                : candidates.size();
        long totalAssets = (tenantId != null && !tenantId.isBlank())
                ? assetRepository.countByTenantId(tenantId)
                : assets.size();
        long allocatedAssets = (tenantId != null && !tenantId.isBlank())
                ? assetRepository.countByTenantIdAndStatus(tenantId, "ALLOCATED")
                : assets.stream().filter(a -> "ALLOCATED".equalsIgnoreCase(a.getStatus())).count();
        long activeCycles = cycleRepository.findByTenantIdOrderByYearDesc(tenantId).size();

        BigDecimal monthlyPayroll = employeeRepository.sumSalaryByTenantId(tenantId);

        Map<String, Long> deptDist = employees.stream()
                .filter(e -> e.getDepartment() != null)
                .collect(Collectors.groupingBy(e -> e.getDepartment().getName(), Collectors.counting()));

        Map<String, Long> empTypeDist = employees.stream()
                .filter(e -> e.getEmploymentStatus() != null)
                .collect(Collectors.groupingBy(e -> e.getEmploymentStatus().name(), Collectors.counting()));

        Map<String, Long> candidateStageDist = candidates.stream()
                .filter(c -> c.getStage() != null)
                .collect(Collectors.groupingBy(c -> c.getStage().name(), Collectors.counting()));

        Map<String, Long> assetCatDist = assets.stream()
                .filter(a -> a.getCategory() != null)
                .collect(Collectors.groupingBy(Asset::getCategory, Collectors.counting()));

        return ExecutiveAnalyticsDto.builder()
                .totalEmployees(totalEmployees)
                .activeJobPostings(activeJobs)
                .totalCandidates(totalCandidates)
                .totalAssets(totalAssets)
                .allocatedAssets(allocatedAssets)
                .activeAppraisalCycles(activeCycles)
                .monthlyPayrollExpense(monthlyPayroll)
                .departmentDistribution(deptDist)
                .employmentTypeDistribution(empTypeDist)
                .candidateStageDistribution(candidateStageDist)
                .assetCategoryDistribution(assetCatDist)
                .build();
    }

    private TaxDeclarationDto toTaxDto(TaxDeclaration t) {
        return TaxDeclarationDto.builder()
                .id(t.getId())
                .employeeId(t.getEmployee().getId())
                .employeeName(t.getEmployee().getFullName())
                .financialYear(t.getFinancialYear())
                .regime(t.getRegime())
                .declared80c(t.getDeclared80c())
                .declared80d(t.getDeclared80d())
                .declaredHra(t.getDeclaredHra())
                .status(t.getStatus())
                .build();
    }
}
