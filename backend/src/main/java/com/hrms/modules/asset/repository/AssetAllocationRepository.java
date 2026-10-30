package com.hrms.modules.asset.repository;

import com.hrms.modules.asset.entity.AssetAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetAllocationRepository extends JpaRepository<AssetAllocation, Long> {
    List<AssetAllocation> findByTenantIdAndEmployeeIdAndAllocationStatus(String tenantId, Long employeeId, String status);
    List<AssetAllocation> findByTenantIdAndAssetId(String tenantId, Long assetId);
}
