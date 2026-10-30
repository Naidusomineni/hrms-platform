package com.hrms.infrastructure.multitenancy.filter;

import com.hrms.infrastructure.multitenancy.context.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter responsible for extracting and resolving the tenant identifier
 * from HTTP headers (X-Tenant-ID), query parameters, or subdomain before
 * any security and business processing occurs.
 */
@Component
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class TenantContextFilter extends OncePerRequestFilter {

    public static final String TENANT_HEADER = "X-Tenant-ID";
    public static final String ALT_TENANT_HEADER = "X-Tenant-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String tenantId = resolveTenantId(request);

        TenantContext.setTenantId(tenantId);
        response.setHeader(TENANT_HEADER, TenantContext.getTenantId());

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private String resolveTenantId(HttpServletRequest request) {
        // 1. Check primary header: X-Tenant-ID
        String headerTenant = request.getHeader(TENANT_HEADER);
        if (StringUtils.hasText(headerTenant)) {
            return headerTenant.trim().toLowerCase();
        }

        // 2. Check alternative casing header: X-Tenant-Id
        String altHeader = request.getHeader(ALT_TENANT_HEADER);
        if (StringUtils.hasText(altHeader)) {
            return altHeader.trim().toLowerCase();
        }

        // 3. Check query param: ?tenantId=...
        String paramTenant = request.getParameter("tenantId");
        if (StringUtils.hasText(paramTenant)) {
            return paramTenant.trim().toLowerCase();
        }

        // 4. Fallback to default system tenant
        return TenantContext.DEFAULT_TENANT_ID;
    }
}
