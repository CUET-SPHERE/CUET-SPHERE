package com.cuet.sphere.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "password_reset_otps")
public class PasswordResetOtp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "email", nullable = false)
    private String email;
    
    @Column(name = "otp", nullable = false)
    private String otp;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false;
    
    @Column(name = "used_at")
    private LocalDateTime usedAt;
    
    // Constructor
    public PasswordResetOtp() {}
    
    public PasswordResetOtp(String email, String otp, LocalDateTime expiresAt) {
        this.email = email;
        this.otp = otp;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = expiresAt;
        this.isUsed = false;
    }
    
    // Helper methods
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }
    
    public boolean isValid() {
        return !this.isUsed && !this.isExpired();
    }
    
    public void markAsUsed() {
        this.isUsed = true;
        this.usedAt = LocalDateTime.now();
    }
}