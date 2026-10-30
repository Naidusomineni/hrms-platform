package com.hrms.infrastructure.multitenancy.context;

import java.util.function.Supplier;

/**
 * Enterprise ThreadLocal Tenant Context holder.
 * Ensures thread-bound isolation of tenant identity across requests, background jobs, and async tasks.
 */
public final class TenantContext {

    public static final String DEFAULT_TENANT_ID = "default";
    private static final ThreadLocal<String> CURRENT_TENANT = ThreadLocal.withInitial(() -> DEFAULT_TENANT_ID);

    private TenantContext() {
        // Prevent instantiation
    }

    public static String getTenantId() {
        String tenantId = CURRENT_TENANT.get();
        return (tenantId != null && !tenantId.isBlank()) ? tenantId : DEFAULT_TENANT_ID;
    }

    public static void setTenantId(String tenantId) {
        if (tenantId != null && !tenantId.isBlank()) {
            CURRENT_TENANT.set(tenantId.trim().toLowerCase());
        } else {
            CURRENT_TENANT.set(DEFAULT_TENANT_ID);
        }
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }

    public static void runWithTenant(String tenantId, Runnable action) {
        String previous = getTenantId();
        try {
            setTenantId(tenantId);
            action.run();
        } finally {
            setTenantId(previous);
        }
    }

    public static <T> T callWithTenant(String tenantId, Supplier<T> action) {
        String previous = getTenantId();
        try {
            setTenantId(tenantId);
            return action.get();
        } finally {
            setTenantId(previous);
        }
    }
}
