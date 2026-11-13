package com.hrms.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String DEPARTMENTS_CACHE = "departments";
    public static final String SHIFT_POLICIES_CACHE = "shiftPolicies";
    public static final String OFFICE_LOCATIONS_CACHE = "officeLocations";

    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager manager = new ConcurrentMapCacheManager();
        manager.setCacheNames(Arrays.asList(DEPARTMENTS_CACHE, SHIFT_POLICIES_CACHE, OFFICE_LOCATIONS_CACHE));
        return manager;
    }
}
