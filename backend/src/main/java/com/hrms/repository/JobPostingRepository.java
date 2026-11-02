package com.hrms.repository;
import com.hrms.entity.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByTenantId(String tenantId);
    List<JobPosting> findByTenantIdAndStatus(String tenantId, String status);
    Optional<JobPosting> findByIdAndTenantId(Long id, String tenantId);
    List<JobPosting> findByStatus(String status);
    Long countByStatus(String status);
}
