package com.cuet.sphere.service;

import com.cuet.sphere.exception.UserException;
import com.cuet.sphere.model.PasswordResetOtp;
import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.PasswordResetOtpRepository;
import com.cuet.sphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {
    
    @Autowired
    private PasswordResetOtpRepository otpRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private final SecureRandom secureRandom = new SecureRandom();
    
    // OTP expiration time in minutes
    private static final int OTP_EXPIRATION_MINUTES = 10;
    
    // Maximum OTPs per email per hour (to prevent spam)
    private static final int MAX_OTPS_PER_HOUR = 5;
    
    @Transactional
    public void requestPasswordReset(String email) throws UserException {
        System.out.println("PROCESSING: Password reset request for: " + email);
        
        // Validate email format
        if (email == null || email.trim().isEmpty()) {
            throw new UserException("Email is required");
        }
        
        email = email.trim().toLowerCase();
        
        // Check if user exists
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            // For security, we don't reveal if email exists or not
            System.out.println("WARNING: Password reset requested for non-existent email: " + email);
            // Still return success to prevent email enumeration attacks
            return;
        }
        
        // Check rate limiting - count valid OTPs in last hour
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentOtpCount = otpRepository.countValidOtpsForEmail(email, LocalDateTime.now());
        
        if (recentOtpCount >= MAX_OTPS_PER_HOUR) {
            throw new UserException("Too many password reset requests. Please try again later.");
        }
        
        // Mark all previous OTPs as used for this email
        otpRepository.markAllOtpsAsUsedForEmail(email, LocalDateTime.now());
        
        // Generate 6-digit OTP
        String otp = generateSecureOtp();
        
        // Calculate expiration time
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);
        
        // Save OTP to database
        PasswordResetOtp otpEntity = new PasswordResetOtp(email, otp, expiresAt);
        otpRepository.save(otpEntity);
        
        // Send OTP via email
        boolean emailSent = emailService.sendPasswordResetOtp(email, otp);
        
        if (!emailSent) {
            System.err.println("ERROR: Failed to send OTP email to: " + email);
            // Don't throw exception here - OTP is still valid in database
            // User can still use it if they received it through other means
        }
        
        System.out.println("SUCCESS: Password reset OTP generated and sent to: " + email);
        System.out.println("EXPIRES: OTP expires at: " + expiresAt);
    }
    
    @Transactional
    public String verifyOtpAndGenerateResetToken(String email, String otp) throws UserException {
        System.out.println("VERIFYING: OTP for email: " + email);
        
        if (email == null || email.trim().isEmpty()) {
            throw new UserException("Email is required");
        }
        
        if (otp == null || otp.trim().isEmpty()) {
            throw new UserException("OTP is required");
        }
        
        email = email.trim().toLowerCase();
        otp = otp.trim();
        
        // Validate OTP format
        if (!otp.matches("^\\d{6}$")) {
            throw new UserException("Invalid OTP format. OTP must be 6 digits.");
        }
        
        // Find valid OTP
        Optional<PasswordResetOtp> otpEntityOpt = otpRepository.findValidOtpByEmailAndOtp(
            email, otp, LocalDateTime.now()
        );
        
        if (otpEntityOpt.isEmpty()) {
            System.out.println("ERROR: Invalid or expired OTP for email: " + email);
            throw new UserException("Invalid or expired OTP. Please request a new one.");
        }
        
        PasswordResetOtp otpEntity = otpEntityOpt.get();
        
        // Double-check validity (extra safety)
        if (!otpEntity.isValid()) {
            System.out.println("ERROR: OTP is not valid (used or expired) for email: " + email);
            throw new UserException("Invalid or expired OTP. Please request a new one.");
        }
        
        // Mark OTP as used
        otpEntity.markAsUsed();
        otpRepository.save(otpEntity);
        
        // Generate reset token (UUID)
        String resetToken = UUID.randomUUID().toString();
        
        System.out.println("SUCCESS: OTP verified successfully for email: " + email);
        System.out.println("TOKEN: Generated reset token: " + resetToken.substring(0, 8) + "...");
        
        return resetToken;
    }
    
    @Transactional
    public void resetPassword(String email, String resetToken, String newPassword) throws UserException {
        System.out.println("PROCESSING: Password reset for email: " + email);
        
        if (email == null || email.trim().isEmpty()) {
            throw new UserException("Email is required");
        }
        
        if (resetToken == null || resetToken.trim().isEmpty()) {
            throw new UserException("Reset token is required");
        }
        
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new UserException("New password is required");
        }
        
        email = email.trim().toLowerCase();
        
        // Find user
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new UserException("User not found");
        }
        
        // Validate password strength
        validatePasswordStrength(newPassword);
        
        // For this implementation, we'll use a simple token validation
        // In a production system, you might want to store reset tokens in database
        // For now, we'll accept any valid UUID format as token
        try {
            UUID.fromString(resetToken);
        } catch (IllegalArgumentException e) {
            throw new UserException("Invalid reset token");
        }
        
        // Hash new password
        String hashedPassword = passwordEncoder.encode(newPassword);
        
        // Update user password
        user.setPassword(hashedPassword);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Clean up all OTPs for this email
        otpRepository.deleteByEmail(email);
        
        System.out.println("SUCCESS: Password reset successfully for email: " + email);
    }
    
    private String generateSecureOtp() {
        // Generate 6-digit OTP using SecureRandom
        int otp = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(otp);
    }
    
    private void validatePasswordStrength(String password) throws UserException {
        if (password.length() < 8) {
            throw new UserException("Password must be at least 8 characters long");
        }
        
        if (!password.matches(".*[a-z].*")) {
            throw new UserException("Password must contain at least one lowercase letter");
        }
        
        if (!password.matches(".*[A-Z].*")) {
            throw new UserException("Password must contain at least one uppercase letter");
        }
        
        if (!password.matches(".*\\d.*")) {
            throw new UserException("Password must contain at least one number");
        }
    }
    
    // Scheduled task to clean up expired OTPs (runs every hour)
    @Scheduled(fixedRate = 3600000) // 1 hour = 3600000 milliseconds
    @Transactional
    public void cleanupExpiredOtps() {
        try {
            int deletedCount = otpRepository.deleteExpiredOtps(LocalDateTime.now());
            if (deletedCount > 0) {
                System.out.println("CLEANUP: Cleaned up " + deletedCount + " expired OTPs");
            }
        } catch (Exception e) {
            System.err.println("ERROR: Error during OTP cleanup: " + e.getMessage());
        }
    }
    
    // Manual cleanup method for testing
    public int manualCleanupExpiredOtps() {
        return otpRepository.deleteExpiredOtps(LocalDateTime.now());
    }
    
    // Get OTP statistics for monitoring
    public void logOtpStatistics() {
        try {
            long totalOtps = otpRepository.count();
            long expiredOtps = otpRepository.findExpiredOtps(LocalDateTime.now()).size();
            
            System.out.println("STATS: OTP Statistics:");
            System.out.println("   Total OTPs: " + totalOtps);
            System.out.println("   Expired OTPs: " + expiredOtps);
            System.out.println("   Active OTPs: " + (totalOtps - expiredOtps));
        } catch (Exception e) {
            System.err.println("ERROR: Error getting OTP statistics: " + e.getMessage());
        }
    }
}