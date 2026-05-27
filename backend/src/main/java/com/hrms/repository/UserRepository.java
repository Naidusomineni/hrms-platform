package com.hrms.repository;
import com.hrms.entity.User;
import com.hrms.enums.Role;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Page<User> findAllByRole(Role role, Pageable pageable);
    @Modifying
    @Query("UPDATE User u SET u.isActive = :status WHERE u.id = :id")
    void updateActiveStatus(@Param("id") Long id, @Param("status") Boolean status);
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.isActive = true")
    Long countActiveByRole(@Param("role") Role role);
}
