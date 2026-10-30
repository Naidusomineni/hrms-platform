package com.hrms.repository;
import com.hrms.entity.PayrollSlip;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PayrollSlipRepository extends JpaRepository<PayrollSlip, Long> {
    @Query("SELECT ps FROM PayrollSlip ps WHERE ps.employee.id = :empId AND ps.month = :month AND ps.year = :year")
    Optional<PayrollSlip> findByEmployeeIdAndMonthAndYear(@Param("empId") Long empId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT ps FROM PayrollSlip ps WHERE ps.employee.id = :empId ORDER BY ps.year DESC, ps.month DESC")
    Page<PayrollSlip> findByEmployeeIdOrderByYearDescMonthDesc(@Param("empId") Long empId, Pageable pageable);

    java.util.List<PayrollSlip> findByMonthAndYear(int month, int year);

    java.util.List<PayrollSlip> findByTenantIdAndMonthAndYear(String tenantId, int month, int year);

    @Query("SELECT SUM(ps.netSalary) FROM PayrollSlip ps WHERE ps.tenantId = :tenantId AND ps.month = :month AND ps.year = :year AND ps.status = 'PROCESSED'")
    java.math.BigDecimal sumNetSalaryForMonthAndTenant(@Param("tenantId") String tenantId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT SUM(ps.netSalary) FROM PayrollSlip ps WHERE ps.month = :month AND ps.year = :year AND ps.status = 'PROCESSED'")
    java.math.BigDecimal sumNetSalaryForMonth(@Param("month") int month, @Param("year") int year);
}
