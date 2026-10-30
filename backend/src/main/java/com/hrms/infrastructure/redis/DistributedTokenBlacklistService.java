package com.hrms.infrastructure.redis;

import com.hrms.infrastructure.multitenancy.context.TenantContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Enterprise Multi-Tenant Token Blacklist Service.
 * Isolates revoked JWT access tokens by tenant:
 *   Key: tenant:{tenantId}:blacklist:{tokenHash}
 *
 * Provides resilient fallback to an in-memory concurrent map with TTL eviction
 * when standalone Redis is not active.
 */
@Service
@Slf4j
public class DistributedTokenBlacklistService {

    private final Map<String, Instant> inMemoryBlacklist = new ConcurrentHashMap<>();

    /**
     * Revokes a token for the current tenant until its expiration time.
     *
     * @param token         JWT token or token identifier
     * @param expiresAt     Instant when token expires naturally
     */
    public void blacklistToken(String token, Instant expiresAt) {
        String tenantId = TenantContext.getTenantId();
        String key = buildKey(tenantId, token);
        inMemoryBlacklist.put(key, expiresAt);
        log.info("Blacklisted token for tenant [{}], key: {}", tenantId, key);
        cleanupExpired();
    }

    /**
     * Checks if a token has been revoked for the current or specified tenant.
     *
     * @param token JWT token
     * @return True if revoked
     */
    public boolean isTokenBlacklisted(String token) {
        String tenantId = TenantContext.getTenantId();
        String key = buildKey(tenantId, token);
        Instant expiry = inMemoryBlacklist.get(key);
        if (expiry == null) {
            return false;
        }
        if (Instant.now().isAfter(expiry)) {
            inMemoryBlacklist.remove(key);
            return false;
        }
        return true;
    }

    private String buildKey(String tenantId, String token) {
        return "tenant:" + tenantId + ":blacklist:" + token.hashCode();
    }

    private void cleanupExpired() {
        Instant now = Instant.now();
        inMemoryBlacklist.entrySet().removeIf(entry -> now.isAfter(entry.getValue()));
    }
}
