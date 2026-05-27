package com.hrms.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.hrms.service.EmailService;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service @Slf4j @RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.frontend.url}") private String frontendUrl;
    @Value("${spring.mail.from.name:HRMS Platform}") private String fromName;
    @Value("${spring.mail.from.address:noreply@hrms.com}") private String fromAddress;

    @Async("emailExecutor")
    public void sendEmailVerification(String to, String firstName, String token) {
        try {
            Context ctx = new Context();
            ctx.setVariable("firstName", firstName);
            ctx.setVariable("verifyUrl", frontendUrl + "/verify-email?token=" + token + "&email=" + to);
            ctx.setVariable("appName", "HRMS Platform");
            sendHtmlEmail(to, "Verify Your Email — HRMS Platform",
                "email/verify-email", ctx);
            log.info("Verification email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", to, e.getMessage());
        }
    }

    @Async("emailExecutor")
    public void sendPasswordResetOtp(String to, String firstName, String otp, int expiryMinutes) {
        try {
            Context ctx = new Context();
            ctx.setVariable("firstName", firstName);
            ctx.setVariable("otp", otp);
            ctx.setVariable("expiryMinutes", expiryMinutes);
            ctx.setVariable("appName", "HRMS Platform");
            sendHtmlEmail(to, "Password Reset OTP — HRMS Platform",
                "email/password-reset-otp", ctx);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage());
        }
    }

    @Async("emailExecutor")
    public void sendPasswordChangedConfirmation(String to, String firstName) {
        try {
            Context ctx = new Context();
            ctx.setVariable("firstName", firstName);
            ctx.setVariable("appName", "HRMS Platform");
            sendHtmlEmail(to, "Password Changed Successfully — HRMS Platform",
                "email/password-changed", ctx);
        } catch (Exception e) {
            log.error("Failed to send password-changed email to {}: {}", to, e.getMessage());
        }
    }

    @Async("emailExecutor")
    public void sendAccountLockedEmail(String to, String firstName, int lockMinutes) {
        try {
            Context ctx = new Context();
            ctx.setVariable("firstName", firstName);
            ctx.setVariable("lockMinutes", lockMinutes);
            sendHtmlEmail(to, "⚠️ Account Locked — HRMS Platform",
                "email/account-locked", ctx);
        } catch (Exception e) {
            log.error("Failed to send account-locked email: {}", e.getMessage());
        }
    }

    @Async("emailExecutor")
    public void sendLeaveApprovalEmail(String to, String firstName, String leaveType,
                                        String startDate, String endDate, String status, String comments) {
        try {
            Context ctx = new Context();
            ctx.setVariable("firstName", firstName);
            ctx.setVariable("leaveType", leaveType);
            ctx.setVariable("startDate", startDate);
            ctx.setVariable("endDate", endDate);
            ctx.setVariable("status", status);
            ctx.setVariable("comments", comments);
            String subject = status.equals("APPROVED") ? "✅ Leave Approved" : "❌ Leave Rejected";
            sendHtmlEmail(to, subject + " — HRMS Platform", "email/leave-status", ctx);
        } catch (Exception e) {
            log.error("Failed to send leave email: {}", e.getMessage());
        }
    }

    @Async("emailExecutor")
    public void sendWelcomeEmail(String to, String firstName, String tempPassword) {
        try {
            Context ctx = new Context();
            ctx.setVariable("firstName", firstName);
            ctx.setVariable("loginUrl", frontendUrl + "/login");
            ctx.setVariable("tempPassword", tempPassword);
            ctx.setVariable("appName", "HRMS Platform");
            sendHtmlEmail(to, "Welcome to HRMS Platform!", "email/welcome", ctx);
        } catch (Exception e) {
            log.error("Failed to send welcome email: {}", e.getMessage());
        }
    }

    @Async("emailExecutor")
    public void sendPayrollProcessedEmail(String to, String firstName, String month, String year, String netSalary) {
        try {
            Context ctx = new Context();
            ctx.setVariable("firstName", firstName);
            ctx.setVariable("month", month);
            ctx.setVariable("year", year);
            ctx.setVariable("netSalary", netSalary);
            ctx.setVariable("loginUrl", frontendUrl + "/payroll");
            sendHtmlEmail(to, "Your Salary Slip is Ready — " + month + " " + year, "email/payroll-ready", ctx);
        } catch (Exception e) {
            log.error("Failed to send payroll email: {}", e.getMessage());
        }
    }

    private void sendHtmlEmail(String to, String subject, String template, Context ctx) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            String htmlContent = templateEngine.process(template, ctx);
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send email '{}' to {}: {}", subject, to, e.getMessage());
        }
    }
}
