package com.hrms.modules.asset.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.modules.asset.dto.AssetAllocationDto;
import com.hrms.modules.asset.dto.AssetDto;
import com.hrms.modules.asset.service.AssetService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/assets")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Enterprise Asset & Inventory Management")
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssetDto>>> getAssets() {
        return ResponseEntity.ok(ApiResponse.success(assetService.getAssets()));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<AssetDto>> createAsset(@Valid @RequestBody AssetDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Asset registered", assetService.createAsset(dto)));
    }

    @PostMapping("/{id}/allocate")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<AssetAllocationDto>> allocateAsset(
            @PathVariable("id") Long id,
            @RequestParam("employeeId") Long employeeId,
            @RequestParam(name = "notes", required = false) String notes) {
        return ResponseEntity.ok(ApiResponse.success("Asset allocated",
                assetService.allocateAsset(id, employeeId, notes)));
    }

    @PostMapping("/allocations/{id}/return")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR')")
    public ResponseEntity<ApiResponse<AssetAllocationDto>> returnAsset(
            @PathVariable("id") Long id,
            @RequestParam(name = "notes", required = false) String notes) {
        return ResponseEntity.ok(ApiResponse.success("Asset marked as returned",
                assetService.returnAsset(id, notes)));
    }

    @GetMapping("/employee/{empId}")
    public ResponseEntity<ApiResponse<List<AssetAllocationDto>>> getEmployeeAssets(@PathVariable("empId") Long empId) {
        return ResponseEntity.ok(ApiResponse.success(assetService.getEmployeeAssets(empId)));
    }
}
