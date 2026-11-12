package com.hrms.modules.document.service;

import com.hrms.domain.storage.port.StorageService;
import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.document.dto.DocumentResponse;
import com.hrms.modules.document.dto.DocumentVerifyRequest;
import com.hrms.modules.document.dto.HrLetterRequest;
import com.hrms.modules.document.entity.EmployeeDocument;
import com.hrms.modules.document.entity.PolicyAcknowledgement;
import com.hrms.modules.document.repository.EmployeeDocumentRepository;
import com.hrms.modules.document.repository.PolicyAcknowledgementRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service @Slf4j @RequiredArgsConstructor @Transactional
public class DocumentService {

    private final EmployeeDocumentRepository documentRepository;
    private final PolicyAcknowledgementRepository acknowledgementRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    public DocumentResponse uploadDocument(
            Long empId,
            String category,
            String title,
            String documentNumber,
            LocalDate issueDate,
            LocalDate expiryDate,
            MultipartFile file) {

        Employee emp = employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", empId));

        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }

        String directory = "documents/" + empId;
        String tenantId = TenantContext.getTenantId();
        String filePath;
        try {
            filePath = storageService.uploadFile(
                    tenantId,
                    directory,
                    file.getOriginalFilename(),
                    file.getInputStream(),
                    file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                    file.getSize()
            );
        } catch (Exception e) {
            throw new BadRequestException("Failed to upload document file: " + e.getMessage());
        }

        EmployeeDocument doc = EmployeeDocument.builder()
                .employee(emp)
                .category(category.toUpperCase())
                .title(title)
                .documentNumber(documentNumber)
                .filePath(filePath)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .mimeType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .issueDate(issueDate)
                .expiryDate(expiryDate)
                .status("PENDING")
                .build();

        doc = documentRepository.save(doc);
        log.info("Document uploaded: id={}, empId={}, category={}", doc.getId(), empId, category);
        return toResponse(doc);
    }

    public Resource loadDocumentResource(Long docId) {
        return loadDocumentResource(docId, null);
    }

    public Resource loadDocumentResource(Long docId, org.springframework.security.core.userdetails.UserDetails userDetails) {
        EmployeeDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeDocument", "id", docId));
        String tenantId = TenantContext.getTenantId();

        // Multi-tenant check
        if (doc.getTenantId() != null && tenantId != null && !doc.getTenantId().equalsIgnoreCase(tenantId)) {
            throw new ResourceNotFoundException("EmployeeDocument", "id", docId);
        }

        // BOLA / IDOR Authorization check
        if (userDetails != null) {
            boolean isElevated = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isElevated) {
                String callerEmail = userDetails.getUsername();
                boolean isOwner = doc.getEmployee() != null &&
                        doc.getEmployee().getEmail() != null &&
                        doc.getEmployee().getEmail().equalsIgnoreCase(callerEmail);
                if (!isOwner) {
                    throw new org.springframework.security.access.AccessDeniedException(
                            "Access denied: You do not have permission to download this document.");
                }
            }
        }

        return new org.springframework.core.io.InputStreamResource(storageService.downloadFile(tenantId, doc.getFilePath()));
    }

    public EmployeeDocument getDocumentEntity(Long docId) {
        return documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeDocument", "id", docId));
    }

    public DocumentResponse verifyDocument(Long docId, DocumentVerifyRequest req, String reviewerEmail) {
        EmployeeDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeDocument", "id", docId));

        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", reviewerEmail));

        doc.setStatus(req.getStatus().toUpperCase());
        doc.setVerifiedBy(reviewer);
        doc.setVerifiedAt(LocalDateTime.now());
        doc.setVerificationRemarks(req.getRemarks());

        doc = documentRepository.save(doc);
        log.info("Document verified: id={}, status={}", docId, req.getStatus());
        return toResponse(doc);
    }

    @Transactional(readOnly = true)
    public Page<DocumentResponse> getDocumentsForEmployee(Long empId, Pageable pageable) {
        return getDocumentsForEmployee(empId, pageable, null);
    }

    @Transactional(readOnly = true)
    public Page<DocumentResponse> getDocumentsForEmployee(Long empId, Pageable pageable, org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails != null) {
            boolean isElevated = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isElevated) {
                String callerEmail = userDetails.getUsername();
                Employee emp = employeeRepository.findById(empId).orElse(null);
                boolean isOwner = emp != null && emp.getEmail() != null && emp.getEmail().equalsIgnoreCase(callerEmail);
                if (!isOwner) {
                    throw new org.springframework.security.access.AccessDeniedException(
                            "Access denied: You do not have permission to view documents for employee " + empId);
                }
            }
        }
        return documentRepository.findByEmployeeIdOrderByCreatedAtDesc(empId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<DocumentResponse> getPendingVerification(Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        return documentRepository.findByTenantIdAndStatus(tenantId, "PENDING", pageable).map(this::toResponse);
    }

    public void acknowledgePolicy(Long docId, Long empId, String ipAddress) {
        EmployeeDocument doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeDocument", "id", docId));
        Employee emp = employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", empId));

        PolicyAcknowledgement ack = acknowledgementRepository.findByDocumentIdAndEmployeeId(docId, empId)
                .orElse(PolicyAcknowledgement.builder().document(doc).employee(emp).build());

        ack.setAcknowledgedAt(LocalDateTime.now());
        ack.setIpAddress(ipAddress);
        acknowledgementRepository.save(ack);
        log.info("Policy acknowledged: docId={}, empId={}", docId, empId);
    }

    /**
     * Generates a digital HR Letter (Bonafide, Employment verification, Experience)
     */
    public DocumentResponse generateHrLetter(HrLetterRequest req) {
        Employee emp = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", req.getEmployeeId()));

        String letterContent = buildLetterContent(emp, req.getLetterType(), req.getPurpose(), req.getAddressedTo());
        byte[] bytes = letterContent.getBytes(StandardCharsets.UTF_8);

        String fileName = req.getLetterType().toLowerCase() + "_letter_" + emp.getEmployeeNumber() + ".txt";
        String tenantId = TenantContext.getTenantId();
        String filePath = storageService.uploadFile(
                tenantId,
                "letters/" + emp.getId(),
                fileName,
                new ByteArrayInputStream(bytes),
                "text/plain",
                bytes.length
        );

        EmployeeDocument doc = EmployeeDocument.builder()
                .employee(emp)
                .category("HR_LETTER")
                .title(req.getLetterType().replace("_", " ") + " Letter")
                .documentNumber("HR-LTR-" + System.currentTimeMillis() % 100000)
                .filePath(filePath)
                .fileName(fileName)
                .fileSize((long) bytes.length)
                .mimeType("text/plain")
                .issueDate(LocalDate.now())
                .status("VERIFIED")
                .build();

        doc = documentRepository.save(doc);
        return toResponse(doc);
    }

    private String buildLetterContent(Employee emp, String type, String purpose, String addressedTo) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
        String recipient = addressedTo != null && !addressedTo.isBlank() ? addressedTo : "To Whom It May Concern";

        return String.format("""
            ================================================================================
                               HRMS ENTERPRISE PLATFORM - OFFICIAL LETTER
            ================================================================================
            Date: %s
            Ref:  HR/DOC/%d

            %s,

            Subject: %s

            This is to certify that %s (Employee ID: %s) is currently employed with our
            organization in the capacity of %s within the %s Department.

            Joining Date: %s
            Employment Status: %s
            Purpose: %s

            This letter is issued upon the employee's request for official purposes.
            For any employment verification inquiries, please contact hr-verify@enterprise.com.

            Sincerely,
            Head of Human Resources
            HRMS Global Platform
            ================================================================================
            """,
                today,
                System.currentTimeMillis() % 10000,
                recipient,
                type.replace("_", " ") + " CERTIFICATION",
                emp.getFullName(),
                emp.getEmployeeNumber(),
                emp.getDesignation() != null ? emp.getDesignation() : "Associate",
                emp.getDepartment() != null ? emp.getDepartment().getName() : "General",
                emp.getDateOfJoining() != null ? emp.getDateOfJoining().toString() : "N/A",
                emp.getEmploymentStatus() != null ? emp.getEmploymentStatus().name() : "ACTIVE",
                purpose != null ? purpose : "Official Verification"
        );
    }

    private DocumentResponse toResponse(EmployeeDocument d) {
        return DocumentResponse.builder()
                .id(d.getId())
                .employeeId(d.getEmployee().getId())
                .employeeName(d.getEmployee().getFullName())
                .category(d.getCategory())
                .title(d.getTitle())
                .documentNumber(d.getDocumentNumber())
                .fileName(d.getFileName())
                .fileSize(d.getFileSize())
                .mimeType(d.getMimeType())
                .downloadUrl("/v1/documents/" + d.getId() + "/download")
                .issueDate(d.getIssueDate())
                .expiryDate(d.getExpiryDate())
                .status(d.getStatus())
                .verifiedByName(d.getVerifiedBy() != null ? d.getVerifiedBy().getEmail() : null)
                .verifiedAt(d.getVerifiedAt())
                .verificationRemarks(d.getVerificationRemarks())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
