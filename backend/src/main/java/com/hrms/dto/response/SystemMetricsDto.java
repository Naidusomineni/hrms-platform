package com.hrms.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemMetricsDto {
    private String status;
    private Long dbPingLatencyMs;
    private Long uptimeSeconds;
    private Integer availableProcessors;
    private Integer liveThreads;
    private Integer peakThreads;

    // Memory
    private Long heapUsedMb;
    private Long heapMaxMb;
    private Long heapAllocatedMb;
    private Double heapUsagePercent;

    // HikariCP Connection Pool
    private String connectionPoolName;
    private Integer poolActiveConnections;
    private Integer poolIdleConnections;
    private Integer poolTotalConnections;
    private Integer poolThreadsAwaitingConnection;
    private Integer poolMaximumSize;
    private Integer poolMinimumIdle;

    private LocalDateTime timestamp;
}
