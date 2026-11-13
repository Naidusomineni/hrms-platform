package com.hrms.repository;
import com.hrms.entity.RefreshToken;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findByUserIdAndIsRevokedFalseOrderByIdAsc(Long userId);

    List<RefreshToken> findByUserIdAndIsRevokedFalseOrderByIdDesc(Long userId);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.isRevoked = true, rt.revokedAt = :now WHERE rt.user.id = :userId AND rt.isRevoked = false")
    void revokeAllForUser(@Param("userId") Long userId, @Param("now") Instant now);

    default void revokeAllForUser(Long userId) { revokeAllForUser(userId, Instant.now()); }

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :now OR rt.isRevoked = true")
    void deleteExpired(@Param("now") Instant now);
}
