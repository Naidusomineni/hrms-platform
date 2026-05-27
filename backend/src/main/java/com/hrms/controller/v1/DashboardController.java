package com.hrms.controller.v1;

import com.hrms.dto.response.*;
import com.hrms.service.impl.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/v1/dashboard") @RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth") @Tag(name = "Dashboard & Analytics")
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<DashboardStats>> getAdminDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAdminDashboard()));
    }
}
