package com.hrms.modules.asset.service;

import com.hrms.entity.Employee;
import com.hrms.entity.User;
import com.hrms.enums.NotificationType;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.asset.dto.AssetAllocationDto;
import com.hrms.modules.asset.dto.AssetDto;
import com.hrms.modules.asset.entity.Asset;
import com.hrms.modules.asset.entity.AssetAllocation;
import com.hrms.modules.asset.repository.AssetAllocationRepository;
import com.hrms.modules.asset.repository.AssetRepository;
import com.hrms.modules.notification.service.NotificationService;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetAllocationRepository allocationRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final com.hrms.common.audit.AuditService auditService;
    private final NotificationService notificationService;

    public List<AssetDto> getAssets() {
        String tenantId = TenantContext.getTenantId();
        return assetRepository.findByTenantId(tenantId).stream()
                .map(this::toAssetDto)
                .collect(Collectors.toList());
    }

    public AssetDto createAsset(AssetDto dto) {
        String tenantId = TenantContext.getTenantId();
        Asset asset = Asset.builder()
                .assetTag(dto.getAssetTag())
                .category(dto.getCategory().toUpperCase())
                .brand(dto.getBrand())
                .model(dto.getModel())
                .serialNumber(dto.getSerialNumber())
                .purchaseDate(dto.getPurchaseDate())
                .warrantyExpiry(dto.getWarrantyExpiry())
                .cost(dto.getCost())
                .conditionStatus(dto.getConditionStatus() != null ? dto.getConditionStatus() : "GOOD")
                .status("AVAILABLE")
                .build();
        asset.setTenantId(tenantId);
        asset = assetRepository.save(asset);
        auditService.log("ASSET_CREATED", "ASSET", asset.getId(),
                "Registered hardware asset: " + asset.getAssetTag() + " (" + asset.getBrand() + " " + asset.getModel() + ")");
        return toAssetDto(asset);
    }

    public AssetAllocationDto allocateAsset(Long assetId, Long employeeId, String notes) {
        String tenantId = TenantContext.getTenantId();
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", assetId));

        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        AssetAllocation alloc = AssetAllocation.builder()
                .asset(asset)
                .employee(emp)
                .allocatedAt(LocalDateTime.now())
                .allocationStatus("ACTIVE")
                .notes(notes)
                .build();
        alloc.setTenantId(tenantId);
        alloc = allocationRepository.save(alloc);

        asset.setStatus("ALLOCATED");
        assetRepository.save(asset);
        auditService.log("ASSET_ALLOCATED", "ASSET", asset.getId(),
                "Allocated asset " + asset.getAssetTag() + " to employee #" + employeeId);

        // Dispatch in-app notification to Employee
        try {
            Long empUserId = emp.getUser() != null ? emp.getUser().getId() :
                    userRepository.findByEmail(emp.getEmail()).map(User::getId).orElse(null);
            if (empUserId != null) {
                String assetDesc = (asset.getBrand() != null ? asset.getBrand() + " " : "") + (asset.getModel() != null ? asset.getModel() : asset.getCategory());
                notificationService.send(
                        empUserId,
                        "IT Asset Assigned: " + assetDesc,
                        "Asset " + assetDesc + " (" + asset.getAssetTag() + ") has been allocated to you" + (notes != null && !notes.isBlank() ? " (" + notes + ")" : "") + ".",
                        NotificationType.ASSET_ASSIGNED,
                        "/assets"
                );
            }
        } catch (Exception e) {
            log.warn("Failed to dispatch asset allocation notification: {}", e.getMessage());
        }

        return toAllocDto(alloc);
    }

    public AssetAllocationDto returnAsset(Long allocationId, String notes) {
        AssetAllocation alloc = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("AssetAllocation", "id", allocationId));

        alloc.setReturnedAt(LocalDateTime.now());
        alloc.setAllocationStatus("RETURNED");
        if (notes != null && !notes.isBlank()) {
            alloc.setNotes((alloc.getNotes() != null ? alloc.getNotes() + " | Return: " : "Return: ") + notes);
        }
        alloc = allocationRepository.save(alloc);

        Asset asset = alloc.getAsset();
        asset.setStatus("AVAILABLE");
        assetRepository.save(asset);
        auditService.log("ASSET_RETURNED", "ASSET", asset.getId(),
                "Returned asset " + asset.getAssetTag() + " to inventory");

        // Dispatch in-app notification to Employee
        try {
            Employee emp = alloc.getEmployee();
            if (emp != null) {
                Long empUserId = emp.getUser() != null ? emp.getUser().getId() :
                        userRepository.findByEmail(emp.getEmail()).map(User::getId).orElse(null);
                if (empUserId != null) {
                    String assetDesc = (asset.getBrand() != null ? asset.getBrand() + " " : "") + (asset.getModel() != null ? asset.getModel() : asset.getCategory());
                    notificationService.send(
                            empUserId,
                            "IT Asset Return Acknowledged: " + assetDesc,
                            "Return of asset " + assetDesc + " (" + asset.getAssetTag() + ") has been processed into inventory.",
                            NotificationType.ASSET_RETURNED,
                            "/assets"
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Failed to dispatch asset return notification: {}", e.getMessage());
        }

        return toAllocDto(alloc);
    }

    public List<AssetAllocationDto> getEmployeeAssets(Long employeeId, org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails != null) {
            boolean isElevated = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR") ||
                                   a.getAuthority().equals("ROLE_IT_ADMIN") ||
                                   a.getAuthority().equals("ROLE_MANAGER") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isElevated) {
                Employee emp = employeeRepository.findById(employeeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
                if (emp.getEmail() == null || !emp.getEmail().equalsIgnoreCase(userDetails.getUsername())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: You can only view your own asset allocations.");
                }
            }
        }
        return getEmployeeAssets(employeeId);
    }

    public List<AssetAllocationDto> getEmployeeAssets(Long employeeId) {
        String tenantId = TenantContext.getTenantId();
        return allocationRepository.findByTenantIdAndEmployeeIdAndAllocationStatus(tenantId, employeeId, "ACTIVE").stream()
                .map(this::toAllocDto)
                .collect(Collectors.toList());
    }

    private AssetDto toAssetDto(Asset a) {
        String tenantId = a.getTenantId();
        List<AssetAllocation> activeAllocs = allocationRepository.findByTenantIdAndAssetId(tenantId, a.getId());
        AssetAllocation active = activeAllocs.stream()
                .filter(al -> "ACTIVE".equalsIgnoreCase(al.getAllocationStatus()))
                .findFirst().orElse(null);

        return AssetDto.builder()
                .id(a.getId())
                .assetTag(a.getAssetTag())
                .category(a.getCategory())
                .brand(a.getBrand())
                .model(a.getModel())
                .serialNumber(a.getSerialNumber())
                .purchaseDate(a.getPurchaseDate())
                .warrantyExpiry(a.getWarrantyExpiry())
                .cost(a.getCost())
                .conditionStatus(a.getConditionStatus())
                .status(a.getStatus())
                .assignedToEmployeeName(active != null ? active.getEmployee().getFullName() : null)
                .assignedToEmployeeId(active != null ? active.getEmployee().getId() : null)
                .build();
    }

    private AssetAllocationDto toAllocDto(AssetAllocation al) {
        return AssetAllocationDto.builder()
                .id(al.getId())
                .assetId(al.getAsset().getId())
                .assetTag(al.getAsset().getAssetTag())
                .assetCategory(al.getAsset().getCategory())
                .assetModel(al.getAsset().getModel())
                .employeeId(al.getEmployee().getId())
                .employeeName(al.getEmployee().getFullName())
                .allocatedAt(al.getAllocatedAt())
                .returnedAt(al.getReturnedAt())
                .allocationStatus(al.getAllocationStatus())
                .notes(al.getNotes())
                .build();
    }
}
