package com.hrms.modules.attendance.repository;

import com.hrms.modules.attendance.entity.BiometricDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BiometricDeviceRepository extends JpaRepository<BiometricDevice, Long> {
    List<BiometricDevice> findByIsActiveTrue();
    List<BiometricDevice> findByTenantId(String tenantId);
    Optional<BiometricDevice> findByDeviceCode(String deviceCode);
    Optional<BiometricDevice> findByTenantIdAndDeviceCode(String tenantId, String deviceCode);
}
