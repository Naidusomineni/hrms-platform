package com.hrms.modules.recruitment.repository;

import com.hrms.modules.recruitment.entity.InterviewPanelist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewPanelistRepository extends JpaRepository<InterviewPanelist, Long> {

    @Query("SELECT p FROM InterviewPanelist p " +
           "JOIN FETCH p.employee e " +
           "WHERE p.interviewSession.id = :sessionId")
    List<InterviewPanelist> findByInterviewSessionIdWithEmployee(@Param("sessionId") Long sessionId);

    @Query("SELECT p FROM InterviewPanelist p WHERE p.interviewSession.id = :sessionId")
    List<InterviewPanelist> findByInterviewSessionId(@Param("sessionId") Long sessionId);

    @Query("SELECT p FROM InterviewPanelist p WHERE p.interviewSession.id = :sessionId AND p.employee.id = :employeeId")
    Optional<InterviewPanelist> findByInterviewSessionIdAndEmployeeId(@Param("sessionId") Long sessionId, @Param("employeeId") Long employeeId);

    @Query("SELECT p FROM InterviewPanelist p " +
           "JOIN FETCH p.interviewSession s " +
           "WHERE p.tenantId = :tenantId AND p.employee.id = :employeeId")
    List<InterviewPanelist> findByTenantIdAndEmployeeId(@Param("tenantId") String tenantId, @Param("employeeId") Long employeeId);
}
