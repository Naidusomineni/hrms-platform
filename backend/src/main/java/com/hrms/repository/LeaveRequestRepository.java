package com.hrms.repository;
import com.hrms.entity.LeaveRequest;
import com.hrms.enums.LeaveStatus;
import com.hrms.enums.LeaveType;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    Page<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId, Pageable pageable);
    Page<LeaveRequest> findByStatusOrderByCreatedAtAsc(LeaveStatus status, Pageable pageable);
    Long countByStatus(LeaveStatus status);

    @Query("""
        SELECT lr FROM LeaveRequest lr WHERE lr.employee.id = :empId
        AND lr.status NOT IN ('REJECTED','CANCELLED')
        AND (lr.startDate <= :endDate AND lr.endDate >= :startDate)
        """)
    List<LeaveRequest> findOverlapping(@Param("empId") Long empId, @Param("startDate") LocalDate start, @Param("endDate") LocalDate end);

    @Query("""
        SELECT SUM(lr.numberOfDays) FROM LeaveRequest lr WHERE lr.employee.id = :empId
        AND lr.leaveType = :type AND lr.status = 'APPROVED' AND YEAR(lr.startDate) = :year
        """)
    Integer sumApprovedByType(@Param("empId") Long empId, @Param("type") LeaveType type, @Param("year") int year);
}
