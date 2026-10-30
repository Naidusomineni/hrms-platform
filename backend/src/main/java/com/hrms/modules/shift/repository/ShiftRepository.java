package com.hrms.modules.shift.repository;

import com.hrms.modules.shift.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {

    List<Shift> findByTenantId(String tenantId);

    List<Shift> findByTenantIdAndIsActiveTrue(String tenantId);

    Optional<Shift> findByTenantIdAndShiftCode(String tenantId, String shiftCode);

    Optional<Shift> findByIdAndTenantId(Long id, String tenantId);
}
