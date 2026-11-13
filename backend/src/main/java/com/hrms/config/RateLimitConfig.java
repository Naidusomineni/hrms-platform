package com.hrms.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component @Slf4j
public class RateLimitConfig extends OncePerRequestFilter {

    private static final int MAX_CACHE_ENTRIES = 5000;
    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();

    @org.springframework.beans.factory.annotation.Value("${rate-limit.login.capacity:100}")
    private int loginCapacity;

    private Bucket createBucket(String key, int capacity) {
        return Bucket.builder()
            .addLimit(Bandwidth.classic(capacity, Refill.intervally(capacity, Duration.ofMinutes(1))))
            .build();
    }

    private Bucket getBucket(String key, int capacity) {
        if (authBuckets.size() >= MAX_CACHE_ENTRIES) {
            log.warn("Rate limit bucket cache reached maximum threshold of {}; pruning cache to prevent memory exhaustion.", MAX_CACHE_ENTRIES);
            authBuckets.clear();
        }
        return authBuckets.computeIfAbsent(key, k -> createBucket(k, capacity));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String path = request.getServletPath();
        boolean isLogin = path.contains("/auth/login");
        boolean isRecovery = path.contains("/auth/forgot-password") || path.contains("/auth/reset-password") || path.contains("/auth/verify-email");
        boolean isPasswordChange = path.contains("/auth/change-password");
        boolean isBiometricSync = path.contains("/attendance/biometric-sync");
        boolean isGuestInterview = path.contains("/recruitment/interviews/guest");

        if (isLogin || isRecovery || isPasswordChange || isBiometricSync || isGuestInterview) {
            String ip = getClientIp(request);
            boolean isLocal = "127.0.0.1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip);
            int capacity = isLocal ? 500 : (isRecovery ? 15 : (isPasswordChange ? 20 : (isBiometricSync ? 300 : (isGuestInterview ? 30 : loginCapacity))));
            String category = isRecovery ? "recovery" : (isPasswordChange ? "change-pass" : (isBiometricSync ? "biometric" : (isGuestInterview ? "guest" : "login")));
            String bucketKey = ip + ":" + category;

            Bucket bucket = getBucket(bucketKey, capacity);
            if (!bucket.tryConsume(1)) {
                log.warn("Rate limit exceeded for IP: {} on endpoint: {}", ip, path);
                response.setStatus(429);
                response.setHeader("Retry-After", "60");
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                String msg = "Too many requests. Please try again in 1 minute.";
                if (isRecovery) msg = "Too many password recovery attempts. Please try again in 1 minute.";
                else if (isLogin) msg = "Too many login attempts. Please try again in 1 minute.";
                else if (isPasswordChange) msg = "Too many password change attempts. Please try again in 1 minute.";
                else if (isGuestInterview) msg = "Too many guest interview join requests. Please wait a minute before retrying.";
                response.getWriter().write(
                    "{\"success\":false,\"status\":429,\"message\":\"" + msg + "\"}");
                return;
            }
        }
        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return (forwarded != null && !forwarded.isEmpty())
            ? forwarded.split(",")[0].trim()
            : request.getRemoteAddr();
    }
}

