package com.hrms.repository;

import com.hrms.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, String> {
    Optional<Tenant> findByCode(String code);
    Optional<Tenant> findByDomain(String domain);
    boolean existsByCode(String code);
}
