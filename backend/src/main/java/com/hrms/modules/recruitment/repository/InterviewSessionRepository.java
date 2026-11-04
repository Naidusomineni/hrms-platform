package com.hrms.modules.recruitment.repository;

import com.hrms.modules.recruitment.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {

    @Query("SELECT s FROM InterviewSession s " +
           "JOIN FETCH s.candidate c " +
           "LEFT JOIN FETCH s.jobPosting j " +
           "JOIN FETCH s.interviewer i " +
           "WHERE s.tenantId = :tenantId ORDER BY s.scheduledStart DESC")
    List<InterviewSession> findAllByTenantIdWithDetails(@Param("tenantId") String tenantId);

    @Query("SELECT s FROM InterviewSession s " +
           "JOIN FETCH s.candidate c " +
           "LEFT JOIN FETCH s.jobPosting j " +
           "JOIN FETCH s.interviewer i " +
           "WHERE s.tenantId = :tenantId AND s.candidate.id = :candidateId ORDER BY s.scheduledStart DESC")
    List<InterviewSession> findByTenantIdAndCandidateId(@Param("tenantId") String tenantId, @Param("candidateId") Long candidateId);

    @Query("SELECT s FROM InterviewSession s " +
           "JOIN FETCH s.candidate c " +
           "LEFT JOIN FETCH s.jobPosting j " +
           "JOIN FETCH s.interviewer i " +
           "WHERE s.tenantId = :tenantId AND s.interviewer.id = :interviewerId ORDER BY s.scheduledStart DESC")
    List<InterviewSession> findByTenantIdAndInterviewerId(@Param("tenantId") String tenantId, @Param("interviewerId") Long interviewerId);

    @Query("SELECT s FROM InterviewSession s " +
           "JOIN FETCH s.candidate c " +
           "LEFT JOIN FETCH s.jobPosting j " +
           "JOIN FETCH s.interviewer i " +
           "WHERE s.guestAccessToken = :token")
    Optional<InterviewSession> findByGuestAccessTokenWithDetails(@Param("token") String token);

    @Query("SELECT s FROM InterviewSession s " +
           "JOIN FETCH s.candidate c " +
           "LEFT JOIN FETCH s.jobPosting j " +
           "JOIN FETCH s.interviewer i " +
           "WHERE s.id = :id")
    Optional<InterviewSession> findByIdWithDetails(@Param("id") Long id);

    Optional<InterviewSession> findByGuestAccessToken(String guestAccessToken);

    Optional<InterviewSession> findByRoomName(String roomName);
}
