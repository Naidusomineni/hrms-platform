package com.hrms.modules.employee.controller;
import com.hrms.modules.employee.service.EmployeeService;
import com.hrms.util.PaginationUtils;

import com.hrms.dto.request.EmployeeRequest;
import com.hrms.dto.response.*;
import com.hrms.enums.EmploymentStatus;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/v1/employees")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Employee Management")
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    @Operation(summary = "Create employee + linked user account")
    public ResponseEntity<ApiResponse<EmployeeResponse>> create(@Valid @RequestBody EmployeeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Employee created successfully", employeeService.create(req)));
    }

    @GetMapping
    @Operation(summary = "List all employees — paginated, searchable, sortable")
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> getAll(
            @RequestParam(name = "search", required=false) String search,
            @RequestParam(name = "page", defaultValue="0") int page,
            @RequestParam(name = "size", defaultValue="10") int size,
            @RequestParam(name = "sortBy", defaultValue="createdAt") String sortBy,
            @RequestParam(name = "sortDir", defaultValue="desc") String sortDir) {
        Page<EmployeeResponse> result = employeeService.getAll(search, PaginationUtils.of(page, size, sortBy, sortDir));
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated employee profile")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        return ResponseEntity.ok(ApiResponse.success(employeeService.getByEmail(userDetails.getUsername())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getById(id, userDetails)));
    }

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload current authenticated employee profile photo")
    public ResponseEntity<ApiResponse<EmployeeResponse>> uploadMyPhoto(
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Profile photo uploaded", employeeService.uploadProfilePictureForCurrentUser(file, userDetails)));
    }

    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload employee profile photo")
    public ResponseEntity<ApiResponse<EmployeeResponse>> uploadPhoto(
            @PathVariable("id") Long id,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Profile photo uploaded", employeeService.uploadProfilePicture(id, file, userDetails)));
    }

    @PostMapping(value = "/{id}/document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload employee resume/document")
    public ResponseEntity<ApiResponse<EmployeeResponse>> uploadDocument(
            @PathVariable("id") Long id,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Document uploaded", employeeService.uploadDocument(id, file, userDetails)));
    }

    @GetMapping("/department/{deptId}")
    @Operation(summary = "Get employees by department")
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> getByDept(
            @PathVariable("deptId") Long deptId,
            @RequestParam(name = "page", defaultValue="0") int page,
            @RequestParam(name = "size", defaultValue="10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            employeeService.getByDepartment(deptId, PaginationUtils.of(page, size))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    @Operation(summary = "Update employee")
    public ResponseEntity<ApiResponse<EmployeeResponse>> update(
            @PathVariable("id") Long id, @Valid @RequestBody EmployeeRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Employee updated", employeeService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    @Operation(summary = "Soft-delete employee")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        employeeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Employee removed successfully"));
    }

    @GetMapping(value = "/export", produces = "text/csv;charset=UTF-8")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    @Operation(summary = "Export employee master register with dynamic PII masking support")
    public ResponseEntity<byte[]> exportEmployees(
            @RequestParam(name = "masked", required = false, defaultValue = "false") boolean masked) {
        String csv = employeeService.exportEmployeesCsv(masked);
        byte[] csvBytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        String filename = "employee_directory_" + java.time.LocalDate.now() + (masked ? "_masked" : "") + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csvBytes);
    }

    @GetMapping(value = "/bulk-import/template", produces = "text/csv")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    @Operation(summary = "Download sample CSV template for bulk employee import")
    public ResponseEntity<byte[]> downloadBulkImportTemplate() {
        String template = employeeService.getBulkImportTemplate();
        byte[] csvBytes = template.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"employee_bulk_import_template.csv\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csvBytes);
    }

    @PostMapping(value = "/bulk-import/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    @Operation(summary = "Preview and validate CSV file for bulk employee import (dry-run pre-flight)")
    public ResponseEntity<ApiResponse<com.hrms.dto.response.BulkImportPreviewDto>> previewBulkImport(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(
                "Pre-flight validation complete",
                employeeService.previewBulkImport(file)));
    }

    @PostMapping(value = "/bulk-import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    @Operation(summary = "Bulk import employees via CSV file")
    public ResponseEntity<ApiResponse<com.hrms.dto.response.BulkImportResultDto>> bulkImport(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(
                "Bulk import processed",
                employeeService.bulkImport(file)));
    }
}
