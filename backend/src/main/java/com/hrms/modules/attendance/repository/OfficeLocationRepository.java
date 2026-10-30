package com.hrms.modules.attendance.repository;

import com.hrms.modules.attendance.entity.OfficeLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfficeLocationRepository extends JpaRepository<OfficeLocation, Long> {
    List<OfficeLocation> findByTenantIdAndIsActiveTrue(String tenantId);
    Optional<OfficeLocation> findByIdAndTenantId(Long id, String tenantId);
}
