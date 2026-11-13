package com.hrms.config;

import com.hrms.infrastructure.multitenancy.filter.TenantContextFilter;
import com.hrms.security.jwt.JwtAuthenticationFilter;
import com.hrms.security.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import com.hrms.infrastructure.multitenancy.filter.TenantModuleEnforcementFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final TenantContextFilter tenantContextFilter;
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final TenantModuleEnforcementFilter tenantModuleEnforcementFilter;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;

    private static final String[] PUBLIC_PATHS = {
            "/v1/auth/login",
            "/v1/auth/register",
            "/v1/auth/refresh",
            "/v1/auth/forgot-password",
            "/v1/auth/reset-password",
            "/v1/auth/verify-email",
            "/v1/auth/resend-verification",
            "/v1/tenants/current",
            "/v1/recruitment/interviews/guest/**",
            "/v1/attendance/biometric-sync",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/actuator/health",
            "/actuator/info",
            "/uploads/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        return http
                .csrf(AbstractHttpConfigurer::disable)

                .cors(Customizer.withDefaults())

                .exceptionHandling(ex ->
                        ex.authenticationEntryPoint(jwtAuthEntryPoint)
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth

                        // Public APIs
                        .requestMatchers(PUBLIC_PATHS).permitAll()

                        // Admin APIs
                        .requestMatchers("/v1/admin/audit/**", "/v1/admin/users/**")
                        .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_IT_ADMIN")
                        .requestMatchers("/v1/admin/**")
                        .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_ADMIN")

                        // Dashboard APIs
                        .requestMatchers("/v1/dashboard/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER", "ROLE_IT_ADMIN")

                        // Employee self-service APIs
                        .requestMatchers(HttpMethod.GET, "/v1/employees/*").authenticated()
                        .requestMatchers(HttpMethod.POST, "/v1/employees/*/photo", "/v1/employees/*/document").authenticated()

                        // Employee management APIs
                        .requestMatchers("/v1/employees/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER", "ROLE_IT_ADMIN")

                        // Department APIs
                        .requestMatchers("/v1/departments/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER", "ROLE_IT_ADMIN")

                        // Notification APIs
                        .requestMatchers("/v1/notifications/**")
                        .authenticated()

                        // Delete APIs
                        .requestMatchers(HttpMethod.DELETE, "/v1/**")
                        .hasAnyAuthority("ROLE_SUPER_ADMIN", "ROLE_ADMIN")

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )

                .authenticationProvider(authenticationProvider())

                .addFilterBefore(tenantContextFilter,
                        UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(tenantModuleEnforcementFilter,
                        JwtAuthenticationFilter.class)

                .build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {

        return config.getAuthenticationManager();
    }
}