package com.hrms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload.base-dir:uploads}")
    private String uploadBaseDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadBaseDir).toAbsolutePath().normalize();
        String absoluteUri = uploadPath.toUri().toString();
        if (!absoluteUri.endsWith("/")) {
            absoluteUri += "/";
        }

        // SEC-019: Only expose public folder assets (profiles and logos) statically.
        // Confidential documents are NOT registered as static resources and must be accessed
        // exclusively through authenticated, authorized REST endpoints.
        registry.addResourceHandler("/uploads/profiles/**")
                .addResourceLocations(absoluteUri + "profiles/", "file:uploads/profiles/", "file:backend/uploads/profiles/");
        registry.addResourceHandler("/uploads/logos/**")
                .addResourceLocations(absoluteUri + "logos/", "file:uploads/logos/", "file:backend/uploads/logos/");
    }
}
