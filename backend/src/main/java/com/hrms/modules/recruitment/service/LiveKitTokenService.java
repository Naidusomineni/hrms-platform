package com.hrms.modules.recruitment.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class LiveKitTokenService {

    @Value("${livekit.url:wss://demo.livekit.cloud}")
    private String serverUrl;

    @Value("${livekit.api-key:devkey}")
    private String apiKey;

    @Value("${livekit.api-secret:secret_jwt_hmac_sha256_livekit_key_32bytes}")
    private String apiSecret;

    public String getServerUrl() {
        return serverUrl;
    }

    /**
     * Mints a cryptographically signed LiveKit WebRTC access token.
     *
     * @param roomName       The target room identifier
     * @param identity       Unique participant identity (e.g. "cand-42", "emp-10")
     * @param displayName    Human readable participant name
     * @param isInterviewer  Whether participant has interviewer privileges
     * @param durationMillis Token validity duration in milliseconds (e.g. 2 hours)
     * @return Signed RFC 7519 JWT string compatible with LiveKit SFU
     */
    public String createToken(String roomName, String identity, String displayName, boolean isInterviewer, long durationMillis) {
        long now = System.currentTimeMillis();
        long expiry = now + durationMillis;

        // Video grants conforming to LiveKit SFU specification
        Map<String, Object> videoGrants = new HashMap<>();
        videoGrants.put("room", roomName);
        videoGrants.put("roomJoin", true);
        videoGrants.put("canPublish", true);
        videoGrants.put("canPublishData", true);
        videoGrants.put("canSubscribe", true);

        if (isInterviewer) {
            videoGrants.put("roomAdmin", true);
            videoGrants.put("roomRecord", true);
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("name", displayName);
        claims.put("video", videoGrants);

        Key signingKey = getSigningKey(apiSecret);

        String token = Jwts.builder()
                .setClaims(claims)
                .setIssuer(apiKey)
                .setSubject(identity)
                .setIssuedAt(new Date(now))
                .setNotBefore(new Date(now - 10_000)) // 10s clock skew tolerance
                .setExpiration(new Date(expiry))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();

        log.debug("Minted LiveKit token for room={}, identity={}, exp={}", roomName, identity, expiry);
        return token;
    }

    private Key getSigningKey(String secret) {
        try {
            // Guarantee 256-bit entropy via SHA-256 hashing of secret
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = md.digest(secret.getBytes(StandardCharsets.UTF_8));
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (NoSuchAlgorithmException e) {
            byte[] rawBytes = secret.getBytes(StandardCharsets.UTF_8);
            return Keys.hmacShaKeyFor(rawBytes);
        }
    }
}
