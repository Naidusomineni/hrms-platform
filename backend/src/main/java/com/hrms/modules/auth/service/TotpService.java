package com.hrms.modules.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

/**
 * Enterprise RFC 6238 Time-Based One-Time Password (TOTP) Service.
 * Compatible with Google Authenticator, Microsoft Authenticator, and Authy.
 */
@Service
@Slf4j
public class TotpService {

    private static final String BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final int TIME_STEP_SECONDS = 30;
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Generate a new 160-bit (20 bytes) Base32 secret key.
     */
    public String generateSecretKey() {
        byte[] buffer = new byte[20];
        RANDOM.nextBytes(buffer);
        return encodeBase32(buffer);
    }

    /**
     * Generate standard otpauth:// URI for QR code generation.
     */
    public String getOtpAuthUri(String secret, String email, String issuer) {
        String cleanIssuer = (issuer == null || issuer.isBlank()) ? "HRMS-Platform" : issuer.replaceAll("[^a-zA-Z0-9_-]", "");
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
                cleanIssuer, email, secret, cleanIssuer);
    }

    /**
     * Verifies the submitted 6-digit TOTP code against the secret key.
     * Allows a ±1 time step tolerance (prevents rejection from 30s clock drift).
     */
    public boolean verifyCode(String secret, int code) {
        if (secret == null || secret.isBlank()) return false;
        long currentCounter = System.currentTimeMillis() / 1000L / TIME_STEP_SECONDS;

        for (int i = -1; i <= 1; i++) {
            long counter = currentCounter + i;
            if (generateCodeForCounter(secret, counter) == code) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generates 8 single-use emergency backup recovery codes.
     */
    public List<String> generateBackupCodes() {
        List<String> codes = new ArrayList<>(8);
        for (int i = 0; i < 8; i++) {
            int num = 10000000 + RANDOM.nextInt(90000000); // 8-digit numeric code
            codes.add(String.valueOf(num));
        }
        return codes;
    }

    private int generateCodeForCounter(String secret, long counter) {
        try {
            byte[] key = decodeBase32(secret);
            byte[] data = ByteBuffer.allocate(8).putLong(counter).array();

            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(data);

            int offset = hash[hash.length - 1] & 0x0F;
            int binary = ((hash[offset] & 0x7F) << 24)
                    | ((hash[offset + 1] & 0xFF) << 16)
                    | ((hash[offset + 2] & 0xFF) << 8)
                    | (hash[offset + 3] & 0xFF);

            return binary % 1_000_000;
        } catch (Exception e) {
            log.error("Failed to generate TOTP code", e);
            return -1;
        }
    }

    private String encodeBase32(byte[] data) {
        StringBuilder sb = new StringBuilder((data.length * 8 + 4) / 5);
        int val = 0;
        int valBits = 0;
        for (byte b : data) {
            val = (val << 8) | (b & 0xFF);
            valBits += 8;
            while (valBits >= 5) {
                valBits -= 5;
                sb.append(BASE32_CHARS.charAt((val >> valBits) & 0x1F));
            }
        }
        if (valBits > 0) {
            sb.append(BASE32_CHARS.charAt((val << (5 - valBits)) & 0x1F));
        }
        return sb.toString();
    }

    private byte[] decodeBase32(String secret) {
        String clean = secret.trim().toUpperCase().replaceAll("[^A-Z2-7]", "");
        int numBytes = clean.length() * 5 / 8;
        byte[] bytes = new byte[numBytes];
        int val = 0;
        int valBits = 0;
        int byteIndex = 0;

        for (char c : clean.toCharArray()) {
            int digit = BASE32_CHARS.indexOf(c);
            if (digit < 0) continue;
            val = (val << 5) | digit;
            valBits += 5;
            if (valBits >= 8) {
                valBits -= 8;
                if (byteIndex < bytes.length) {
                    bytes[byteIndex++] = (byte) ((val >> valBits) & 0xFF);
                }
            }
        }
        return bytes;
    }
}
