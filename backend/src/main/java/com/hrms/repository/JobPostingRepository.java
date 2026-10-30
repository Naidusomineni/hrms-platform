package com.hrms.repository;
import com.hrms.entity.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByTenantId(String tenantId);
    List<JobPosting> findByTenantIdAndStatus(String tenantId, String status);
    List<JobPosting> findByStatus(String status);
    Long countByStatus(String status);
}
