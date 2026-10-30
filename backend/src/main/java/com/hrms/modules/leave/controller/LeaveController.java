package com.hrms.modules.leave.controller;
import com.hrms.modules.leave.service.LeaveService;

import com.hrms.dto.request.*;
import com.hrms.dto.response.*;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/v1/leaves") @RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth") @Tag(name = "Leave Management")
public class LeaveController {
    private final LeaveService leaveService;

    @PostMapping("/apply/{empId}")
    public ResponseEntity<ApiResponse<LeaveResponse>> apply(
            @PathVariable("empId") Long empId, @Valid @RequestBody LeaveApplicationRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Leave application submitted", leaveService.apply(empId, req)));
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<LeaveResponse>> review(
            @PathVariable("id") Long id, @Valid @RequestBody LeaveActionRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Leave reviewed", leaveService.review(id, req)));
    }

    @PutMapping("/{id}/cancel/{empId}")
    public ResponseEntity<ApiResponse<LeaveResponse>> cancel(@PathVariable("id") Long id, @PathVariable("empId") Long empId) {
        return ResponseEntity.ok(ApiResponse.success("Leave cancelled", leaveService.cancel(id, empId)));
    }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<ApiResponse<Page<LeaveResponse>>> getForEmployee(
            @PathVariable("empId") Long empId,
            @RequestParam(name = "page", defaultValue="0") int page,
            @RequestParam(name = "size", defaultValue="10") int size) {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getForEmployee(empId, PageRequest.of(page,size))));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<Page<LeaveResponse>>> getPending(
            @RequestParam(name = "page", defaultValue="0") int page,
            @RequestParam(name = "size", defaultValue="10") int size) {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getPending(PageRequest.of(page,size))));
    }
}
