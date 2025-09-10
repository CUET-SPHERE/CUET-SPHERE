package com.cuet.sphere.repository;

import com.cuet.sphere.model.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {
    
    // Find valid OTP by email and OTP code
    @Query("SELECT p FROM PasswordResetOtp p WHERE p.email = :email AND p.otp = :otp AND p.isUsed = false AND p.expiresAt > :currentTime")
    Optional<PasswordResetOtp> findValidOtpByEmailAndOtp(@Param("email") String email, 
                                                        @Param("otp") String otp, 
                                                        @Param("currentTime") LocalDateTime currentTime);
    
    // Find all OTPs for an email (for cleanup)
    List<PasswordResetOtp> findByEmailOrderByCreatedAtDesc(String email);
    
    // Find expired OTPs for cleanup
    @Query("SELECT p FROM PasswordResetOtp p WHERE p.expiresAt < :currentTime")
    List<PasswordResetOtp> findExpiredOtps(@Param("currentTime") LocalDateTime currentTime);
    
    // Delete expired OTPs
    @Modifying
    @Transactional
    @Query("DELETE FROM PasswordResetOtp p WHERE p.expiresAt < :currentTime")
    int deleteExpiredOtps(@Param("currentTime") LocalDateTime currentTime);
    
    // Delete all OTPs for an email (when password is successfully reset)
    @Modifying
    @Transactional
    void deleteByEmail(String email);
    
    // Mark all previous OTPs as used for an email
    @Modifying
    @Transactional
    @Query("UPDATE PasswordResetOtp p SET p.isUsed = true, p.usedAt = :currentTime WHERE p.email = :email AND p.isUsed = false")
    int markAllOtpsAsUsedForEmail(@Param("email") String email, @Param("currentTime") LocalDateTime currentTime);
    
    // Count valid OTPs for an email (to prevent spam)
    @Query("SELECT COUNT(p) FROM PasswordResetOtp p WHERE p.email = :email AND p.isUsed = false AND p.expiresAt > :currentTime")
    long countValidOtpsForEmail(@Param("email") String email, @Param("currentTime") LocalDateTime currentTime);
}