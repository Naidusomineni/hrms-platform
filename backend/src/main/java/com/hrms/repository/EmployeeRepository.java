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
    boolean existsByEmail(String email);
    boolean existsByEmployeeNumber(String employeeNumber);
    Optional<Employee> findByEmployeeNumber(String employeeNumber);
    Optional<Employee> findByUserId(Long userId);
    Page<Employee> findByDepartmentId(Long departmentId, Pageable pageable);
    Page<Employee> findByEmploymentStatus(EmploymentStatus status, Pageable pageable);
    
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

    @Query("SELECT e.employmentStatus, COUNT(e) FROM Employee e GROUP BY e.employmentStatus")
    List<Object[]> countByStatus();

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.employmentStatus = 'ACTIVE'")
    Long countActive();

    @Query("SELECT e FROM Employee e WHERE e.manager.id = :managerId")
    List<Employee> findDirectReports(@Param("managerId") Long managerId);

    @Query("SELECT e FROM Employee e WHERE FUNCTION('DAYOFYEAR', e.dateOfBirth) BETWEEN :startDay AND :endDay")
    List<Employee> findUpcomingBirthdaysBetween(@Param("startDay") int startDay, @Param("endDay") int endDay);

    @Query("SELECT e FROM Employee e WHERE FUNCTION('DAYOFYEAR', e.dateOfBirth) >= :startDay OR FUNCTION('DAYOFYEAR', e.dateOfBirth) <= :endDay")
    List<Employee> findUpcomingBirthdaysWrap(@Param("startDay") int startDay, @Param("endDay") int endDay);
}
