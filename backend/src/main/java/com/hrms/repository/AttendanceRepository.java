package com.hrms.repository;
import com.hrms.entity.Attendance;
import com.hrms.enums.AttendanceStatus;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    boolean existsByEmployeeIdAndDate(Long employeeId, LocalDate date);
    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);
    Page<Attendance> findByEmployeeIdOrderByDateDesc(Long employeeId, Pageable pageable);
    List<Attendance> findByDateOrderByEmployee_FirstNameAsc(LocalDate date);

    @Query("""
        SELECT a FROM Attendance a WHERE a.employee.id = :empId
        AND YEAR(a.date) = :year AND MONTH(a.date) = :month ORDER BY a.date
        """)
    List<Attendance> findMonthly(@Param("empId") Long empId, @Param("year") int year, @Param("month") int month);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = :status")
    Long countByDateAndStatus(@Param("date") LocalDate date, @Param("status") AttendanceStatus status);

    @Query("""
        SELECT a.status, COUNT(a) FROM Attendance a WHERE a.employee.id = :empId
        AND YEAR(a.date) = :year AND MONTH(a.date) = :month GROUP BY a.status
        """)
    List<Object[]> summarizeMonth(@Param("empId") Long empId, @Param("year") int year, @Param("month") int month);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.employee.id = :empId AND a.status = 'PRESENT' AND YEAR(a.date) = :year AND MONTH(a.date) = :month")
    Integer countPresentDays(@Param("empId") Long empId, @Param("year") int year, @Param("month") int month);
}
