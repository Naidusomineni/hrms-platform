package com.hrms.modules.recruitment.repository;

import com.hrms.modules.recruitment.entity.InterviewScorecard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewScorecardRepository extends JpaRepository<InterviewScorecard, Long> {
    List<InterviewScorecard> findByTenantIdAndCandidateId(String tenantId, Long candidateId);
}
