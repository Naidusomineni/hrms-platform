package com.hrms.repository;
import com.hrms.entity.PayrollSlip;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PayrollSlipRepository extends JpaRepository<PayrollSlip, Long> {
    Optional<PayrollSlip> findByEmployeeIdAndMonthAndYear(Long empId, int month, int year);
    Page<PayrollSlip> findByEmployeeIdOrderByYearDescMonthDesc(Long empId, Pageable pageable);

    @Query("SELECT SUM(ps.netSalary) FROM PayrollSlip ps WHERE ps.month = :month AND ps.year = :year AND ps.status = 'PROCESSED'")
    java.math.BigDecimal sumNetSalaryForMonth(@Param("month") int month, @Param("year") int year);
}
