package com.hrms.service;

public interface EmailService {

    void sendEmailVerification(String to, String firstName, String token);

    void sendPasswordResetOtp(String to, String firstName, String otp, int expiryMinutes);

    void sendPasswordChangedConfirmation(String to, String firstName);

    void sendAccountLockedEmail(String to, String firstName, int lockMinutes);

    void sendLeaveApprovalEmail(
            String to,
            String firstName,
            String leaveType,
            String startDate,
            String endDate,
            String status,
            String comments
    );

    void sendWelcomeEmail(String to, String firstName, String tempPassword);

    void sendPayrollProcessedEmail(
            String to,
            String firstName,
            String month,
            String year,
            String netSalary
    );
}