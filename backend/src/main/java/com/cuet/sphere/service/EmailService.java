package com.cuet.sphere.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

@Service
public class EmailService {
    
    @Value("${brevo.api.key:}")
    private String brevoApiKey;
    
    @Value("${brevo.sender.email:noreply@cuetsphere.com}")
    private String senderEmail;
    
    @Value("${brevo.sender.name:CUET Sphere}")
    private String senderName;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public EmailService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    public boolean sendPasswordResetOtp(String recipientEmail, String otp) {
        if (brevoApiKey == null || brevoApiKey.trim().isEmpty()) {
            System.out.println("WARNING: Brevo API key not configured. Skipping email send.");
            System.out.println("EMAIL: Would send OTP: " + otp + " to: " + recipientEmail);
            return true; // Return true for development/testing
        }
        
        try {
            String url = "https://api.brevo.com/v3/smtp/email";
            
            // Create email data
            Map<String, Object> emailData = new HashMap<>();
            
            // Sender
            Map<String, String> sender = new HashMap<>();
            sender.put("name", senderName);
            sender.put("email", senderEmail);
            emailData.put("sender", sender);
            
            // Recipients
            List<Map<String, String>> recipients = new ArrayList<>();
            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", recipientEmail);
            recipient.put("name", recipientEmail.split("@")[0]);
            recipients.add(recipient);
            emailData.put("to", recipients);
            
            // Subject and content
            emailData.put("subject", "Password Reset OTP - CUET Sphere");
            emailData.put("htmlContent", generateOtpEmailHtml(otp));
            emailData.put("textContent", generateOtpEmailText(otp));
            
            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");
            headers.set("api-key", brevoApiKey);
            
            // Create request
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(emailData, headers);
            
            // Send email
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("SUCCESS: Password reset OTP sent successfully to: " + recipientEmail);
                return true;
            } else {
                System.err.println("ERROR: Failed to send OTP email. Status: " + response.getStatusCode());
                return false;
            }
            
        } catch (Exception e) {
            System.err.println("ERROR: Error sending OTP email: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    private String generateOtpEmailHtml(String otp) {
        return "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset=\"utf-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<title>Password Reset OTP</title>" +
            "<style>" +
            "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }" +
            ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
            ".header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }" +
            ".content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }" +
            ".otp-box { background: white; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }" +
            ".otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: monospace; }" +
            ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }" +
            ".warning { background: #fef3cd; border: 1px solid #fecaca; border-radius: 4px; padding: 12px; margin: 15px 0; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class=\"container\">" +
            "<div class=\"header\">" +
            "<h1>CUET Sphere</h1>" +
            "<p>Password Reset Request</p>" +
            "</div>" +
            "<div class=\"content\">" +
            "<h2>Hello!</h2>" +
            "<p>We received a request to reset your password for your CUET Sphere account.</p>" +
            "<p>Please use the following 6-digit OTP to verify your identity:</p>" +
            "<div class=\"otp-box\">" +
            "<div class=\"otp-code\">" + otp + "</div>" +
            "</div>" +
            "<div class=\"warning\">" +
            "<p><strong>Important Security Information:</strong></p>" +
            "<ul style=\"margin: 8px 0; padding-left: 20px;\">" +
            "<li>This OTP is valid for <strong>10 minutes only</strong></li>" +
            "<li>Do not share this code with anyone</li>" +
            "<li>CUET Sphere will never ask for your OTP via phone or email</li>" +
            "<li>If you didn't request this reset, please ignore this email and consider changing your password</li>" +
            "</ul>" +
            "</div>" +
            "<p>If you're having trouble with the password reset process, please contact our support team.</p>" +
            "<p>Best regards,<br>The CUET Sphere Team</p>" +
            "</div>" +
            "<div class=\"footer\">" +
            "<p>&copy; 2024 CUET Sphere. All rights reserved.</p>" +
            "<p>This is an automated email. Please do not reply to this message.</p>" +
            "<p>Chittagong University of Engineering &amp; Technology</p>" +
            "</div>" +
            "</div>" +
            "</body>" +
            "</html>";
    }
    
    private String generateOtpEmailText(String otp) {
        return "CUET Sphere - Password Reset OTP\n\n" +
            "Hello!\n\n" +
            "We received a request to reset your password for your CUET Sphere account.\n\n" +
            "Your 6-digit OTP: " + otp + "\n\n" +
            "IMPORTANT SECURITY INFORMATION:\n" +
            "- This OTP is valid for 10 minutes only\n" +
            "- Do not share this code with anyone\n" +
            "- CUET Sphere will never ask for your OTP via phone or email\n" +
            "- If you didn't request this reset, please ignore this email\n\n" +
            "If you're having trouble, please contact our support team.\n\n" +
            "Best regards,\n" +
            "The CUET Sphere Team\n\n" +
            "(c) 2024 CUET Sphere. All rights reserved.\n" +
            "Chittagong University of Engineering & Technology";
    }
    
    public boolean sendWelcomeEmail(String recipientEmail, String fullName) {
        if (brevoApiKey == null || brevoApiKey.trim().isEmpty()) {
            System.out.println("WARNING: Brevo API key not configured. Skipping welcome email.");
            return true;
        }
        
        try {
            String url = "https://api.brevo.com/v3/smtp/email";
            
            Map<String, Object> emailData = new HashMap<>();
            
            // Sender
            Map<String, String> sender = new HashMap<>();
            sender.put("name", senderName);
            sender.put("email", senderEmail);
            emailData.put("sender", sender);
            
            // Recipients
            List<Map<String, String>> recipients = new ArrayList<>();
            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", recipientEmail);
            recipient.put("name", fullName);
            recipients.add(recipient);
            emailData.put("to", recipients);
            
            // Subject and content
            emailData.put("subject", "Welcome to CUET Sphere!");
            emailData.put("htmlContent", generateWelcomeEmailHtml(fullName));
            
            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");
            headers.set("api-key", brevoApiKey);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(emailData, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            return response.getStatusCode().is2xxSuccessful();
            
        } catch (Exception e) {
            System.err.println("ERROR: Error sending welcome email: " + e.getMessage());
            return false;
        }
    }
    
    private String generateWelcomeEmailHtml(String fullName) {
        return "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset=\"utf-8\">" +
            "<title>Welcome to CUET Sphere</title>" +
            "<style>" +
            "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
            ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
            ".header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }" +
            ".content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }" +
            ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class=\"container\">" +
            "<div class=\"header\">" +
            "<h1>Welcome to CUET Sphere!</h1>" +
            "</div>" +
            "<div class=\"content\">" +
            "<h2>Hello " + fullName + "!</h2>" +
            "<p>Welcome to CUET Sphere - your academic community platform!</p>" +
            "<p>You can now:</p>" +
            "<ul>" +
            "<li>Stay updated with notices and announcements</li>" +
            "<li>Connect with your classmates and batch mates</li>" +
            "<li>Access and share academic resources</li>" +
            "<li>Receive important notifications</li>" +
            "</ul>" +
            "<p>Get started by logging into your account and exploring the platform.</p>" +
            "</div>" +
            "<div class=\"footer\">" +
            "<p>&copy; 2024 CUET Sphere. All rights reserved.</p>" +
            "</div>" +
            "</div>" +
            "</body>" +
            "</html>";
    }
}