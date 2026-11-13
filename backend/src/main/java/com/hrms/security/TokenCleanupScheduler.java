package com.hrms.security;

import com.hrms.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
@Slf4j
@RequiredArgsConstructor
public class TokenCleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void pruneExpiredTokensOnStartup() {
        pruneExpiredTokens();
    }

    @Scheduled(cron = "0 0 3 * * ?") // Daily at 3:00 AM
    @Transactional
    public void pruneExpiredTokensScheduled() {
        pruneExpiredTokens();
    }

    @Transactional
    public void pruneExpiredTokens() {
        try {
            refreshTokenRepository.deleteExpired(Instant.now());
            log.info("SEC-017: Successfully pruned expired and revoked refresh tokens from database");
        } catch (Exception e) {
            log.warn("SEC-017: Could not prune expired tokens: {}", e.getMessage());
        }
    }
}
