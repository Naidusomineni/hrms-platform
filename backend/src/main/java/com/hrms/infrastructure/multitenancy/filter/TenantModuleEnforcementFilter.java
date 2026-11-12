package com.hrms.infrastructure.multitenancy.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrms.dto.response.ApiResponse;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.modules.tenant.service.TenantModuleService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class TenantModuleEnforcementFilter extends OncePerRequestFilter {

    private final TenantModuleService moduleService;
    private final ObjectMapper objectMapper;

    // Mapping API path prefixes to Tenant Module Keys
    private static final Map<String, String> PATH_TO_MODULE_MAP = Map.ofEntries(
            Map.entry("/v1/recruitment", "RECRUITMENT"),
            Map.entry("/v1/jobs", "RECRUITMENT"),
            Map.entry("/v1/candidates", "RECRUITMENT"),
            Map.entry("/v1/interviews", "RECRUITMENT"),
            Map.entry("/v1/payroll", "PAYROLL"),
            Map.entry("/v1/expenses", "EXPENSES"),
            Map.entry("/v1/assets", "ASSETS"),
            Map.entry("/v1/tickets", "HELPDESK"),
            Map.entry("/v1/performance", "PERFORMANCE"),
            Map.entry("/v1/goals", "PERFORMANCE"),
            Map.entry("/v1/appraisals", "PERFORMANCE"),
            Map.entry("/v1/intelligence", "INTELLIGENCE"),
            Map.entry("/v1/offboarding", "OFFBOARDING"),
            Map.entry("/v1/separations", "OFFBOARDING"),
            Map.entry("/v1/shifts", "SHIFTS"),
            Map.entry("/v1/roster", "SHIFTS"),
            Map.entry("/v1/leaves", "LEAVES"),
            Map.entry("/v1/leave-requests", "LEAVES"),
            Map.entry("/v1/documents", "DOCUMENTS"),
            Map.entry("/v1/announcements", "COMMUNICATION")
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getServletPath();

        for (Map.Entry<String, String> entry : PATH_TO_MODULE_MAP.entrySet()) {
            if (path.startsWith(entry.getKey())) {
                String moduleKey = entry.getValue();

                // Always allow public candidate guest interview room
                if (path.startsWith("/v1/recruitment/interviews/guest/")) {
                    break;
                }

                if (!moduleService.isModuleEnabled(moduleKey)) {
                    log.warn("Blocked request to disabled module [{}] at path [{}] for tenant [{}]",
                            moduleKey, path, TenantContext.getTenantId());
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write(objectMapper.writeValueAsString(
                            ApiResponse.error("Module " + moduleKey + " is disabled for your organization.")
                    ));
                    return;
                }
                break;
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/v1/auth/") ||
               path.startsWith("/v1/tenant/") ||
               path.startsWith("/v1/policies/") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/actuator/");
    }
}

