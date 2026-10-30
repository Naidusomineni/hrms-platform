package com.hrms.modules.report.repository;

import com.hrms.modules.report.entity.TaxDeclaration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaxDeclarationRepository extends JpaRepository<TaxDeclaration, Long> {
    List<TaxDeclaration> findByTenantIdAndEmployeeId(String tenantId, Long employeeId);
    Optional<TaxDeclaration> findByTenantIdAndEmployeeIdAndFinancialYear(String tenantId, Long employeeId, String financialYear);
}
