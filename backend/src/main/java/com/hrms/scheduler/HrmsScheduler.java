package com.hrms.scheduler;

import com.hrms.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Component @Slf4j @RequiredArgsConstructor
public class HrmsScheduler {

    private final RefreshTokenRepository refreshTokenRepository;

    /** Clean up expired/revoked refresh tokens every night at 2am */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanExpiredTokens() {
        refreshTokenRepository.deleteExpired(Instant.now());
        log.info("Expired refresh tokens cleaned up");
    }
}
