package com.hrms.repository;

import com.hrms.entity.PayrollSlip;
import com.hrms.enums.PayrollStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollSlipRepository extends JpaRepository<PayrollSlip, Long> {

    @Query("SELECT ps FROM PayrollSlip ps WHERE ps.employee.id = :empId AND ps.month = :month AND ps.year = :year")
    Optional<PayrollSlip> findByEmployeeIdAndMonthAndYear(@Param("empId") Long empId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT ps FROM PayrollSlip ps WHERE ps.employee.id = :empId ORDER BY ps.year DESC, ps.month DESC")
    Page<PayrollSlip> findByEmployeeIdOrderByYearDescMonthDesc(@Param("empId") Long empId, Pageable pageable);

    @Query("SELECT ps FROM PayrollSlip ps WHERE ps.employee.id = :empId AND ps.status IN (:statuses) ORDER BY ps.year DESC, ps.month DESC")
    Page<PayrollSlip> findByEmployeeIdAndStatusInOrderByYearDescMonthDesc(@Param("empId") Long empId, @Param("statuses") List<PayrollStatus> statuses, Pageable pageable);

    List<PayrollSlip> findByMonthAndYear(int month, int year);

    List<PayrollSlip> findByTenantIdAndMonthAndYear(String tenantId, int month, int year);

    @Query(value = "SELECT ps FROM PayrollSlip ps JOIN FETCH ps.employee emp LEFT JOIN FETCH emp.department dept " +
                   "WHERE ps.tenantId = :tenantId AND ps.month = :month AND ps.year = :year",
           countQuery = "SELECT COUNT(ps) FROM PayrollSlip ps WHERE ps.tenantId = :tenantId AND ps.month = :month AND ps.year = :year")
    Page<PayrollSlip> findByTenantIdAndMonthAndYear(@Param("tenantId") String tenantId, @Param("month") int month, @Param("year") int year, Pageable pageable);

    @Query(value = "SELECT ps FROM PayrollSlip ps JOIN FETCH ps.employee emp LEFT JOIN FETCH emp.department dept " +
                   "WHERE ps.tenantId = :tenantId AND ps.month = :month AND ps.year = :year AND ps.status = :status",
           countQuery = "SELECT COUNT(ps) FROM PayrollSlip ps WHERE ps.tenantId = :tenantId AND ps.month = :month AND ps.year = :year AND ps.status = :status")
    Page<PayrollSlip> findByTenantIdAndMonthAndYearAndStatus(@Param("tenantId") String tenantId, @Param("month") int month, @Param("year") int year, @Param("status") PayrollStatus status, Pageable pageable);

    List<PayrollSlip> findByTenantIdAndMonthAndYearAndStatus(String tenantId, int month, int year, PayrollStatus status);

    @Query(value = "SELECT ps FROM PayrollSlip ps JOIN FETCH ps.employee emp LEFT JOIN FETCH emp.department dept " +
                   "WHERE ps.tenantId = :tenantId AND ps.month = :month AND ps.year = :year " +
                   "AND (LOWER(emp.firstName) LIKE CONCAT('%', :search, '%') OR LOWER(emp.lastName) LIKE CONCAT('%', :search, '%') OR LOWER(emp.employeeNumber) LIKE CONCAT('%', :search, '%'))",
           countQuery = "SELECT COUNT(ps) FROM PayrollSlip ps JOIN ps.employee emp " +
                        "WHERE ps.tenantId = :tenantId AND ps.month = :month AND ps.year = :year " +
                        "AND (LOWER(emp.firstName) LIKE CONCAT('%', :search, '%') OR LOWER(emp.lastName) LIKE CONCAT('%', :search, '%') OR LOWER(emp.employeeNumber) LIKE CONCAT('%', :search, '%'))")
    Page<PayrollSlip> findByTenantPeriodAndSearch(@Param("tenantId") String tenantId,
                                                  @Param("month") int month,
                                                  @Param("year") int year,
                                                  @Param("search") String search,
                                                  Pageable pageable);

    @Query(value = "SELECT ps FROM PayrollSlip ps JOIN FETCH ps.employee emp LEFT JOIN FETCH emp.department dept " +
                   "WHERE ps.tenantId = :tenantId AND ps.month = :month AND ps.year = :year " +
                   "AND ps.status = :status " +
                   "AND (LOWER(emp.firstName) LIKE CONCAT('%', :search, '%') OR LOWER(emp.lastName) LIKE CONCAT('%', :search, '%') OR LOWER(emp.employeeNumber) LIKE CONCAT('%', :search, '%'))",
           countQuery = "SELECT COUNT(ps) FROM PayrollSlip ps JOIN ps.employee emp " +
                        "WHERE ps.tenantId = :tenantId AND ps.month = :month AND ps.year = :year " +
                        "AND ps.status = :status " +
                        "AND (LOWER(emp.firstName) LIKE CONCAT('%', :search, '%') OR LOWER(emp.lastName) LIKE CONCAT('%', :search, '%') OR LOWER(emp.employeeNumber) LIKE CONCAT('%', :search, '%'))")
    Page<PayrollSlip> findByTenantPeriodStatusAndSearch(@Param("tenantId") String tenantId,
                                                        @Param("month") int month,
                                                        @Param("year") int year,
                                                        @Param("status") PayrollStatus status,
                                                        @Param("search") String search,
                                                        Pageable pageable);

    @Query("SELECT SUM(ps.netSalary) FROM PayrollSlip ps WHERE ps.tenantId = :tenantId AND ps.month = :month AND ps.year = :year AND ps.status = 'PROCESSED'")
    BigDecimal sumNetSalaryForMonthAndTenant(@Param("tenantId") String tenantId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT SUM(ps.netSalary) FROM PayrollSlip ps WHERE ps.month = :month AND ps.year = :year AND ps.status = 'PROCESSED'")
    BigDecimal sumNetSalaryForMonth(@Param("month") int month, @Param("year") int year);
}
