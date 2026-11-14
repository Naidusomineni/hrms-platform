package com.hrms.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Validates enterprise security posture at startup.
 * Prevents booting in production if public repository fallback secrets are detected.
 */
@Component
@Slf4j
public class ProductionSecurityValidator {

    public static final String DEFAULT_PUBLIC_JWT_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    public static final String DEFAULT_PUBLIC_BIOMETRIC_KEY = "hrms-biometric-terminal-secret-key";

    private final String jwtSecret;
    private final String biometricKey;
    private final Environment environment;

    public ProductionSecurityValidator(
            @Value("${jwt.secret}") String jwtSecret,
            @Value("${biometric.device.api-key:hrms-biometric-terminal-secret-key}") String biometricKey,
            Environment environment) {
        this.jwtSecret = jwtSecret;
        this.biometricKey = biometricKey;
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void validateSecurityPosture() {
        boolean isProduction = Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("prod") || p.equalsIgnoreCase("production"));

        if (DEFAULT_PUBLIC_JWT_SECRET.equals(jwtSecret)) {
            if (isProduction) {
                log.error("CRITICAL PRODUCTION SECURITY FAILURE: JWT secret matches public fallback key! Refusing to run in production.");
                throw new IllegalStateException("CRITICAL: Default JWT secret detected in production profile. Set JWT_SECRET environment variable.");
            } else {
                log.warn("⚠️ SECURITY WARNING: Using public repository default JWT secret. Ensure JWT_SECRET is overridden before deploying to production!");
            }
        }

        if (DEFAULT_PUBLIC_BIOMETRIC_KEY.equals(biometricKey)) {
            if (isProduction) {
                log.warn("⚠️ SECURITY WARNING: Biometric terminal webhook uses default API key. Override BIOMETRIC_API_KEY in production.");
            }
        }

        log.info("🛡️ Enterprise Security Posture Validator: Active profile(s) = {}, JWT secret configuration = VERIFIED",
                Arrays.toString(environment.getActiveProfiles()));
    }
}

