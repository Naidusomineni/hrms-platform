package com.hrms.infrastructure.multitenancy.provider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.engine.jdbc.connections.spi.MultiTenantConnectionProvider;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Map;

/**
 * Enterprise Schema-per-Tenant MultiTenantConnectionProvider for PostgreSQL 18.
 *
 * For each tenant request, this provider borrows a pooled connection from HikariCP
 * and dynamically switches the PostgreSQL schema search_path:
 *   SET search_path TO tenant_<tenantId>, public;
 *
 * Operational tables (employees, attendance, payroll) are resolved in the tenant's isolated schema.
 * Global tables (users, roles, tenants, subscriptions) fall back cleanly to the public schema.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class SchemaMultiTenantConnectionProvider implements MultiTenantConnectionProvider<String>, HibernatePropertiesCustomizer {

    private final DataSource dataSource;

    @Override
    public Connection getAnyConnection() throws SQLException {
        return dataSource.getConnection();
    }

    @Override
    public void releaseAnyConnection(Connection connection) throws SQLException {
        connection.close();
    }

    @Override
    public Connection getConnection(String tenantIdentifier) throws SQLException {
        Connection connection = getAnyConnection();
        String schema = resolveSchemaName(tenantIdentifier);
        try (Statement stmt = connection.createStatement()) {
            stmt.execute("SET search_path TO " + schema + ", public;");
        } catch (SQLException e) {
            log.warn("Failed to set search_path to {}, falling back to public: {}", schema, e.getMessage());
        }
        return connection;
    }

    @Override
    public void releaseConnection(String tenantIdentifier, Connection connection) throws SQLException {
        try (Statement stmt = connection.createStatement()) {
            stmt.execute("SET search_path TO public;");
        } catch (SQLException e) {
            log.debug("Error resetting search_path: {}", e.getMessage());
        }
        connection.close();
    }

    @Override
    public boolean supportsAggressiveRelease() {
        return false;
    }

    @Override
    public boolean isUnwrappableAs(Class<?> unwrapType) {
        return MultiTenantConnectionProvider.class.isAssignableFrom(unwrapType);
    }

    @Override
    public <T> T unwrap(Class<T> unwrapType) {
        if (isUnwrappableAs(unwrapType)) {
            return (T) this;
        }
        throw new IllegalArgumentException("Cannot unwrap to " + unwrapType.getName());
    }

    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        hibernateProperties.put(org.hibernate.cfg.AvailableSettings.MULTI_TENANT_CONNECTION_PROVIDER, this);
    }

    private String resolveSchemaName(String tenantIdentifier) {
        if (tenantIdentifier == null || tenantIdentifier.isBlank() ||
            "public".equalsIgnoreCase(tenantIdentifier) || "default".equalsIgnoreCase(tenantIdentifier)) {
            return "tenant_eoxys";
        }
        String clean = tenantIdentifier.toLowerCase().replaceAll("[^a-z0-9_]", "_");
        if (clean.startsWith("tenant_")) {
            return clean;
        }
        return "tenant_" + clean;
    }
}

