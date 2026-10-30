package com.hrms.repository;
import com.hrms.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    List<PerformanceReview> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    List<PerformanceReview> findByReviewerIdAndStatus(Long reviewerId, String status);
}
