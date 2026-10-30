package com.hrms.modules.report.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tax_declarations",
    indexes = {@Index(name = "idx_tax_declarations_tenant", columnList = "tenant_id, employee_id, financial_year")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TaxDeclaration extends BaseTenantEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "financial_year", nullable = false, length = 20)
    private String financialYear; // e.g. "2026-2027"

    @Column(length = 20, nullable = false)
    @Builder.Default
    private String regime = "NEW"; // OLD, NEW

    @Column(name = "declared_80c", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal declared80c = BigDecimal.ZERO;

    @Column(name = "declared_80d", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal declared80d = BigDecimal.ZERO;

    @Column(name = "declared_hra", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal declaredHra = BigDecimal.ZERO;

    @Column(length = 50, nullable = false)
    @Builder.Default
    private String status = "SUBMITTED"; // DRAFT, SUBMITTED, VERIFIED, REJECTED
}
