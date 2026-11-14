package com.hrms.modules.tenant.service;

import com.hrms.dto.response.SystemMetricsDto;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.ThreadMXBean;
import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class SystemMetricsService {

    private final DataSource dataSource;

    public SystemMetricsDto getSystemMetrics() {
        // 1. Measure DB Ping Latency
        long pingStart = System.currentTimeMillis();
        String dbStatus = "HEALTHY";
        long latencyMs = 0;
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("SELECT 1;");
            latencyMs = System.currentTimeMillis() - pingStart;
        } catch (Exception e) {
            latencyMs = System.currentTimeMillis() - pingStart;
            dbStatus = "DEGRADED";
            log.warn("Database health check ping degraded: {}", e.getMessage());
        }

        // 2. JVM & Process Telemetry
        long uptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        int availableProcessors = Runtime.getRuntime().availableProcessors();

        ThreadMXBean threadMx = ManagementFactory.getThreadMXBean();
        int liveThreads = threadMx.getThreadCount();
        int peakThreads = threadMx.getPeakThreadCount();

        long totalMem = Runtime.getRuntime().totalMemory();
        long freeMem = Runtime.getRuntime().freeMemory();
        long maxMem = Runtime.getRuntime().maxMemory();
        long usedMem = totalMem - freeMem;

        long heapUsedMb = usedMem / (1024 * 1024);
        long heapAllocatedMb = totalMem / (1024 * 1024);
        long heapMaxMb = maxMem / (1024 * 1024);
        double usagePercent = maxMem > 0 ? ((double) usedMem / maxMem) * 100.0 : 0.0;

        // 3. HikariCP Pool Telemetry
        String poolName = "HRMS-Pool";
        int activeConn = 0;
        int idleConn = 0;
        int totalConn = 0;
        int awaitingThreads = 0;
        int maxSize = 20;
        int minIdle = 5;

        HikariDataSource hikari = null;
        if (dataSource instanceof HikariDataSource) {
            hikari = (HikariDataSource) dataSource;
        } else {
            try {
                hikari = dataSource.unwrap(HikariDataSource.class);
            } catch (Exception ignored) {}
        }

        if (hikari != null) {
            poolName = hikari.getPoolName();
            maxSize = hikari.getMaximumPoolSize();
            minIdle = hikari.getMinimumIdle();
            HikariPoolMXBean poolMx = hikari.getHikariPoolMXBean();
            if (poolMx != null) {
                activeConn = poolMx.getActiveConnections();
                idleConn = poolMx.getIdleConnections();
                totalConn = poolMx.getTotalConnections();
                awaitingThreads = poolMx.getThreadsAwaitingConnection();
            }
        }

        return SystemMetricsDto.builder()
                .status(dbStatus)
                .dbPingLatencyMs(latencyMs)
                .uptimeSeconds(uptimeSeconds)
                .availableProcessors(availableProcessors)
                .liveThreads(liveThreads)
                .peakThreads(peakThreads)
                .heapUsedMb(heapUsedMb)
                .heapAllocatedMb(heapAllocatedMb)
                .heapMaxMb(heapMaxMb)
                .heapUsagePercent(Math.round(usagePercent * 100.0) / 100.0)
                .connectionPoolName(poolName)
                .poolActiveConnections(activeConn)
                .poolIdleConnections(idleConn)
                .poolTotalConnections(totalConn)
                .poolThreadsAwaitingConnection(awaitingThreads)
                .poolMaximumSize(maxSize)
                .poolMinimumIdle(minIdle)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
