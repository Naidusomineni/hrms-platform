package com.hrms.modules.intelligence.repository;

import com.hrms.modules.intelligence.entity.HrPolicyArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HrPolicyArticleRepository extends JpaRepository<HrPolicyArticle, Long> {

    List<HrPolicyArticle> findByTenantIdAndIsActiveTrue(String tenantId);

    Page<HrPolicyArticle> findByTenantIdAndIsActiveTrue(String tenantId, Pageable pageable);

    List<HrPolicyArticle> findByTenantIdAndCategoryAndIsActiveTrue(String tenantId, String category);

    Optional<HrPolicyArticle> findByIdAndTenantId(Long id, String tenantId);

    @Query("SELECT p FROM HrPolicyArticle p WHERE p.tenantId = :tenantId AND p.isActive = true AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.summary) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.keywords) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<HrPolicyArticle> searchByTenantAndQuery(@Param("tenantId") String tenantId, @Param("query") String query);
}
