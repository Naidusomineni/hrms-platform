package com.hrms.modules.document.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.modules.document.dto.DocumentResponse;
import com.hrms.modules.document.dto.DocumentVerifyRequest;
import com.hrms.modules.document.dto.HrLetterRequest;
import com.hrms.modules.document.entity.EmployeeDocument;
import com.hrms.modules.document.service.DocumentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@RestController
@RequestMapping("/v1/documents")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Enterprise Document Vault (DMS)")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentResponse>> upload(
            @RequestParam("employeeId") Long employeeId,
            @RequestParam("category") String category,
            @RequestParam("title") String title,
            @RequestParam(name = "documentNumber", required = false) String documentNumber,
            @RequestParam(name = "issueDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDate,
            @RequestParam(name = "expiryDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
            @RequestPart("file") MultipartFile file) {

        DocumentResponse res = documentService.uploadDocument(employeeId, category, title, documentNumber, issueDate, expiryDate, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Document uploaded successfully", res));
    }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<ApiResponse<Page<DocumentResponse>>> getForEmployee(
            @PathVariable("empId") Long empId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(documentService.getDocumentsForEmployee(empId, PageRequest.of(page, size))));
    }

    @GetMapping("/pending-verification")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<Page<DocumentResponse>>> getPending(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(documentService.getPendingVerification(PageRequest.of(page, size))));
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<DocumentResponse>> verify(
            @PathVariable("id") Long id,
            @Valid @RequestBody DocumentVerifyRequest req) {
        String reviewer = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ApiResponse.success("Document verification updated", documentService.verifyDocument(id, req, reviewer)));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable("id") Long id) {
        Resource resource = documentService.loadDocumentResource(id);
        EmployeeDocument doc = documentService.getDocumentEntity(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<ApiResponse<String>> acknowledge(
            @PathVariable("id") Long id,
            @RequestParam("employeeId") Long employeeId,
            HttpServletRequest request) {
        documentService.acknowledgePolicy(id, employeeId, request.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Policy acknowledged successfully"));
    }

    @PostMapping("/letters/generate")
    public ResponseEntity<ApiResponse<DocumentResponse>> generateLetter(@Valid @RequestBody HrLetterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("HR letter generated", documentService.generateHrLetter(req)));
    }
}
