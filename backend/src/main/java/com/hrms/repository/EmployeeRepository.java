package com.hrms.repository;
import com.hrms.entity.Employee;
import com.hrms.enums.EmploymentStatus;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {
    Optional<Employee> findByEmail(String email);
    List<Employee> findByTenantId(String tenantId);
    Page<Employee> findByTenantId(String tenantId, Pageable pageable);
    Page<Employee> findByTenantIdAndDepartmentId(String tenantId, Long departmentId, Pageable pageable);
    Page<Employee> findByTenantIdAndEmploymentStatus(String tenantId, EmploymentStatus status, Pageable pageable);
    boolean existsByEmail(String email);
    boolean existsByEmployeeNumber(String employeeNumber);
    Optional<Employee> findByEmployeeNumber(String employeeNumber);
    Optional<Employee> findByUserId(Long userId);
    Page<Employee> findByDepartmentId(Long departmentId, Pageable pageable);
    Page<Employee> findByEmploymentStatus(EmploymentStatus status, Pageable pageable);
    
    @Query("""
        SELECT e FROM Employee e LEFT JOIN FETCH e.department d
        WHERE e.tenantId = :tenantId
          AND (LOWER(e.firstName) LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(e.lastName)  LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(e.email)     LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(e.designation) LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(e.employeeNumber) LIKE LOWER(CONCAT('%',:q,'%')))
        """)
    Page<Employee> searchByTenant(@Param("q") String query, @Param("tenantId") String tenantId, Pageable pageable);

    @Query("""
        SELECT e FROM Employee e LEFT JOIN FETCH e.department d
        WHERE LOWER(e.firstName) LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(e.lastName)  LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(e.email)     LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(e.designation) LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(e.employeeNumber) LIKE LOWER(CONCAT('%',:q,'%'))
        """)
    Page<Employee> search(@Param("q") String query, Pageable pageable);

    @Query("SELECT e.department.name, COUNT(e) FROM Employee e WHERE e.department IS NOT NULL GROUP BY e.department.name")
    List<Object[]> countByDepartment();

    @Query("""
        SELECT e.department.name, COUNT(e) FROM Employee e
        WHERE (:tenantId IS NULL OR e.tenantId = :tenantId)
          AND e.department IS NOT NULL
        GROUP BY e.department.name
        """)
    List<Object[]> countByDepartmentForTenant(@Param("tenantId") String tenantId);

    @Query("SELECT e.employmentStatus, COUNT(e) FROM Employee e GROUP BY e.employmentStatus")
    List<Object[]> countByStatus();

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.employmentStatus = 'ACTIVE'")
    Long countActive();

    Long countByTenantId(String tenantId);

    Long countByTenantIdAndEmploymentStatus(String tenantId, EmploymentStatus status);

    @Query("""
        SELECT COUNT(e) FROM Employee e
        WHERE (:tenantId IS NULL OR e.tenantId = :tenantId)
          AND (e.dateOfJoining IS NULL OR e.dateOfJoining <= :cutoff)
          AND (e.dateOfLeaving IS NULL OR e.dateOfLeaving > :cutoff)
        """)
    Long countHeadcountAtDate(@Param("tenantId") String tenantId, @Param("cutoff") java.time.LocalDate cutoff);

    @Query("SELECT e FROM Employee e WHERE e.manager.id = :managerId")
    List<Employee> findDirectReports(@Param("managerId") Long managerId);

    @Query("SELECT e FROM Employee e WHERE dayofyear(e.dateOfBirth) BETWEEN :startDay AND :endDay")
    List<Employee> findUpcomingBirthdaysBetween(@Param("startDay") int startDay, @Param("endDay") int endDay);

    @Query("""
        SELECT e FROM Employee e
        WHERE (:tenantId IS NULL OR e.tenantId = :tenantId)
          AND dayofyear(e.dateOfBirth) BETWEEN :startDay AND :endDay
        """)
    List<Employee> findUpcomingBirthdaysBetweenForTenant(@Param("tenantId") String tenantId, @Param("startDay") int startDay, @Param("endDay") int endDay);

    @Query("SELECT e FROM Employee e WHERE dayofyear(e.dateOfBirth) >= :startDay OR dayofyear(e.dateOfBirth) <= :endDay")
    List<Employee> findUpcomingBirthdaysWrap(@Param("startDay") int startDay, @Param("endDay") int endDay);

    @Query("""
        SELECT e FROM Employee e
        WHERE (:tenantId IS NULL OR e.tenantId = :tenantId)
          AND (dayofyear(e.dateOfBirth) >= :startDay OR dayofyear(e.dateOfBirth) <= :endDay)
        """)
    List<Employee> findUpcomingBirthdaysWrapForTenant(@Param("tenantId") String tenantId, @Param("startDay") int startDay, @Param("endDay") int endDay);

    @Query("SELECT COALESCE(SUM(e.salary), 0) FROM Employee e WHERE (:tenantId IS NULL OR e.tenantId = :tenantId) AND e.deleted = false")
    java.math.BigDecimal sumSalaryByTenantId(@Param("tenantId") String tenantId);
}
