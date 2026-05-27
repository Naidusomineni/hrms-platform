package com.hrms.repository;
import com.hrms.entity.Department;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
    boolean existsByName(String name);
    boolean existsByCode(String code);
    @Query("SELECT d FROM Department d WHERE d.isActive = true ORDER BY d.name")
    List<Department> findAllActive();
}
