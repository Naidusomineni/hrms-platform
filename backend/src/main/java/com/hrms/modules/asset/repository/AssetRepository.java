package com.hrms.modules.asset.repository;

import com.hrms.modules.asset.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByTenantId(String tenantId);
    Optional<Asset> findByIdAndTenantId(Long id, String tenantId);
    Optional<Asset> findByTenantIdAndAssetTag(String tenantId, String assetTag);
}
