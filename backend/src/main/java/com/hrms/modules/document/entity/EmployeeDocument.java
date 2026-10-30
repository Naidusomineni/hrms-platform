package com.hrms.modules.document.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_documents",
    indexes = {@Index(name = "idx_ed_emp_cat", columnList = "tenant_id,employee_id,category"),
               @Index(name = "idx_ed_expiry", columnList = "tenant_id,expiry_date")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EmployeeDocument extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, length = 50)
    private String category; // GOVERNMENT_ID, ACADEMIC, EXPERIENCE, TAX, COMPANY_POLICY, PAYSLIP

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "document_number", length = 100)
    private String documentNumber;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(nullable = false, length = 25)
    @Builder.Default
    private String status = "PENDING"; // PENDING, VERIFIED, REJECTED, EXPIRED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "verification_remarks", length = 500)
    private String verificationRemarks;
}
