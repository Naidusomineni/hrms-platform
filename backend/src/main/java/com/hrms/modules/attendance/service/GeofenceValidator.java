package com.hrms.modules.attendance.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Slf4j
public class GeofenceValidator {

    private static final double EARTH_RADIUS_METERS = 6371000.0;

    /**
     * Calculates the great-circle distance between two GPS coordinates using the Haversine formula.
     *
     * @param lat1 Latitude of point 1 in degrees
     * @param lon1 Longitude of point 1 in degrees
     * @param lat2 Latitude of point 2 in degrees
     * @param lon2 Longitude of point 2 in degrees
     * @return Distance in meters
     */
    public double calculateDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }

    /**
     * Checks if coordinates fall within the office geofence radius.
     */
    public boolean isWithinGeofence(BigDecimal punchLat, BigDecimal punchLon,
                                    BigDecimal officeLat, BigDecimal officeLon, int radiusMeters) {
        if (punchLat == null || punchLon == null || officeLat == null || officeLon == null) {
            return false;
        }

        double distance = calculateDistanceMeters(
                punchLat.doubleValue(), punchLon.doubleValue(),
                officeLat.doubleValue(), officeLon.doubleValue()
        );

        log.debug("Geofence distance evaluated: {}m against radius: {}m", distance, radiusMeters);
        return distance <= radiusMeters;
    }

    /**
     * Validates client IP against an IP whitelist (comma-separated exact IPs or subnets).
     */
    public boolean isIpWhitelisted(String clientIp, String ipWhitelist) {
        if (ipWhitelist == null || ipWhitelist.isBlank()) {
            return true; // No whitelist configured = allow all
        }
        if (clientIp == null || clientIp.isBlank()) {
            return false;
        }

        String[] allowedIps = ipWhitelist.split(",");
        for (String allowed : allowedIps) {
            String clean = allowed.trim();
            if (clean.equals(clientIp) || clean.equals("*") || clientIp.startsWith(clean.replace("0/24", ""))) {
                return true;
            }
        }
        return false;
    }
}
