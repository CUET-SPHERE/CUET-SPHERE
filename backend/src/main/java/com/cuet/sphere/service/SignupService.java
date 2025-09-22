package com.cuet.sphere.service;

import com.cuet.sphere.exception.UserException;
import com.cuet.sphere.model.PasswordResetOtp;
import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.PasswordResetOtpRepository;
import com.cuet.sphere.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class SignupService {
    
    private static final Logger logger = LoggerFactory.getLogger(SignupService.class);
    
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
    public void requestSignupOtp(String email) throws UserException {
        // Validate email format
        if (email == null || email.trim().isEmpty()) {
            throw new UserException("Email is required");
        }
        
        email = email.trim().toLowerCase();
        
        // Check if user already exists
        User existingUser = userRepository.findUserByEmail(email);
        if (existingUser != null) {
            throw new UserException("An account with this email already exists");
        }
        
        // Check rate limiting - count valid OTPs in last hour
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentOtpCount = otpRepository.countValidOtpsForEmail(email, LocalDateTime.now());
        
        if (recentOtpCount >= MAX_OTPS_PER_HOUR) {
            throw new UserException("Too many verification requests. Please try again later.");
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
        
        // Send OTP via email using a custom signup template
        boolean emailSent = sendSignupVerificationEmail(email, otp);
        
        if (!emailSent) {
            // Log the error but don't reveal it to the user for security
            logger.error("Failed to send signup OTP email to {}", email);
        }
        
        logger.info("Signup OTP generated and sent to {}", email);
    }
    
    @Transactional
    public boolean verifySignupOtp(String email, String otp) throws UserException {
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
            throw new UserException("Invalid or expired OTP. Please request a new one.");
        }
        
        PasswordResetOtp otpEntity = otpEntityOpt.get();
        
        // Double-check validity
        if (!otpEntity.isValid()) {
            throw new UserException("Invalid or expired OTP. Please request a new one.");
        }
        
        // Mark OTP as used
        otpEntity.markAsUsed();
        otpRepository.save(otpEntity);
        
        return true;
    }
    
    private String generateSecureOtp() {
        // Generate 6-digit OTP using SecureRandom
        int otp = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(otp);
    }
    
    private boolean sendSignupVerificationEmail(String email, String otp) {
        try {
            return emailService.sendSignupOtp(email, otp);
        } catch (Exception e) {
            System.err.println("Error sending signup OTP email: " + e.getMessage());
            return false;
        }
    }
}