package com.hrms.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component @Slf4j
public class JwtUtils {

    @Value("${jwt.secret}") private String jwtSecret;
    @Value("${jwt.access-token.expiration}") private long jwtExpirationMs;
    @Value("${jwt.issuer:hrms-platform}") private String issuer;
    @Value("${jwt.allowed-clock-skew-seconds:60}") private long allowedClockSkewSeconds;

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", userDetails.getAuthorities().iterator().next().getAuthority());
        return buildToken(claims, userDetails.getUsername(), jwtExpirationMs);
    }

    private String buildToken(Map<String, Object> claims, String subject, long expiration) {
        long expTs = System.currentTimeMillis() + expiration;
        log.debug("Generating token for {} exp={} (ms since epoch)", subject, expTs);
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(subject)
            .setIssuer(issuer)
            .setIssuedAt(new Date())
            .setExpiration(new Date(expTs))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            return extractUsername(token).equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (Exception e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public String extractUsername(String token) { return extractClaim(token, Claims::getSubject); }
    private Date extractExpiration(String token) { return extractClaim(token, Claims::getExpiration); }
    private boolean isTokenExpired(String token) {
        // consider allowed clock skew when checking expiration
        long skewMs = allowedClockSkewSeconds * 1000L;
        return extractExpiration(token).before(new Date(System.currentTimeMillis() - skewMs));
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .setAllowedClockSkewSeconds(allowedClockSkewSeconds)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }
}
