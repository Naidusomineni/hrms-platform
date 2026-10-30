package com.hrms.modules.recruitment.repository;

import com.hrms.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    List<Candidate> findByTenantIdOrderByCreatedAtDesc(String tenantId);
    List<Candidate> findByTenantIdAndJobPostingId(String tenantId, Long jobPostingId);
    Optional<Candidate> findByIdAndTenantId(Long id, String tenantId);
}
