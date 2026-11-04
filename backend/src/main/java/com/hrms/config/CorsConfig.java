package com.hrms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.web.cors.*;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.*;

@Configuration
public class CorsConfig {
    @Value("${cors.allowed-origins:http://localhost:5173,https://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://127.0.0.1:5173,https://192.168.0.140:5173,*}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();

        Set<String> patterns = new LinkedHashSet<>();
        if (allowedOrigins != null && !allowedOrigins.isBlank()) {
            for (String origin : allowedOrigins.split(",")) {
                String trimmed = origin.trim();
                if (!trimmed.isEmpty()) {
                    patterns.add(trimmed);
                }
            }
        }

        // Always allow localhost and LAN origins across any port and scheme (HTTP & HTTPS)
        patterns.add("http://localhost:[*]");
        patterns.add("https://localhost:[*]");
        patterns.add("http://127.0.0.1:[*]");
        patterns.add("https://127.0.0.1:[*]");
        patterns.add("http://192.168.*:[*]");
        patterns.add("https://192.168.*:[*]");
        patterns.add("http://10.*:[*]");
        patterns.add("https://10.*:[*]");
        patterns.add("https://*.trycloudflare.com");
        patterns.add("https://*.onrender.com");
        patterns.add("https://*.up.railway.app");
        patterns.add("https://*.vercel.app");
        patterns.add("*");

        cfg.setAllowedOriginPatterns(new ArrayList<>(patterns));
        cfg.setAllowedMethods(Arrays.asList("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setExposedHeaders(Arrays.asList("Authorization","Content-Disposition","X-Request-Id","X-Tenant-ID"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
