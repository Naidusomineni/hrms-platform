package com.hrms;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAwareImpl")
@EnableAsync
@EnableScheduling
@OpenAPIDefinition(
    info = @Info(
        title = "HRMS Platform API",
        version = "2.0.0",
        description = "Enterprise Human Resource Management System — Production Grade"
    )
)
@SecurityScheme(
    name = "bearerAuth",
    description = "JWT Bearer Token. Format: Bearer <token>",
    scheme = "bearer",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    in = SecuritySchemeIn.HEADER
)
public class HrmsPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(HrmsPlatformApplication.class, args);
        System.out.println("""

            ╔═══════════════════════════════════════════════════╗
            ║          HRMS PLATFORM v2.0 — STARTED            ║
            ║  API:     http://localhost:8080/api               ║
            ║  Swagger: http://localhost:8080/api/swagger-ui    ║
            ║  Health:  http://localhost:8080/api/actuator      ║
            ╚═══════════════════════════════════════════════════╝
            """);
    }
}
