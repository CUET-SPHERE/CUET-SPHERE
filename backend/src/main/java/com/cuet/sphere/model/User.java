package com.cuet.sphere.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "u_full_name", nullable = false)
    private String fullName;
    
    @Column(name = "u_email", nullable = false, unique = true)
    private String email;
    
    @Column(name = "u_password", nullable = false)
    private String password;
    
    @Column(name = "u_hall")
    private String hall;
    
    @Column(name = "u_bio", columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "u_batch", nullable = false)
    private String batch; // e.g., "22"
    
    @Column(name = "u_department", nullable = false)
    private String department; // e.g., "04"
    
    @Column(name = "u_student_id", nullable = false)
    private String studentId; // e.g., "015"
    
    @Column(name = "u_is_active")
    private Boolean isActive = true;
    
    @Column(name = "u_req_user")
    private Boolean reqUser = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "u_role")
    private Role role = Role.STUDENT;
    
    @Column(name = "u_profile_img_url")
    private String profileImageUrl = null;
    
    @Column(name = "u_profile_picture")
    private String profilePicture = null;
    
    @Column(name = "u_background_image")
    private String backgroundImage = null;
    
    @Column(name = "u_created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "u_updated_at")
    private LocalDateTime updatedAt;

    public enum Role{
        STUDENT, CR, SYSTEM_ADMIN
    }
    
    // Explicit getter for isActive to avoid Lombok naming issues
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    // Method to get full student ID (batch + department + studentId)
    public String getFullStudentId() {
        return batch + department + studentId;
    }
    
    // Method to check if user is CR
    public boolean isCR() {
        return Role.CR.equals(this.role);
    }
    
    // Getter and setter for profilePicture
    public String getProfilePicture() {
        return profilePicture;
    }
    
    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
    
    // Getter and setter for backgroundImage
    public String getBackgroundImage() {
        return backgroundImage;
    }
    
    public void setBackgroundImage(String backgroundImage) {
        this.backgroundImage = backgroundImage;
    }
} 