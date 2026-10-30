package com.hrms.modules.department.controller;
import com.hrms.modules.department.service.DepartmentService;

import com.hrms.dto.request.DepartmentRequest;
import com.hrms.dto.response.*;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/v1/departments") @RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth") @Tag(name = "Department Management")
public class DepartmentController {
    private final DepartmentService deptService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> create(@Valid @RequestBody DepartmentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Department created", deptService.create(req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(deptService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(deptService.getById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> update(@PathVariable("id") Long id, @Valid @RequestBody DepartmentRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Department updated", deptService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        deptService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Department deleted"));
    }
}
