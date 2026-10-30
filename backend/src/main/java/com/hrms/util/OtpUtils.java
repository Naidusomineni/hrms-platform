package com.hrms.util;

import java.security.SecureRandom;

public class OtpUtils {
    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generateOtp(int digits) {
        int bound = (int) Math.pow(10, digits);
        int otp = RANDOM.nextInt(bound);
        return String.format("%0" + digits + "d", otp);
    }
}
