package com.cuet.sphere.dto;

import java.time.LocalDateTime;

public class ReplyDTO {
    private Long id;
    private String text;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long userId;
    
    // User details
    private String author;
    private String authorEmail;
    private String studentId;
    private String profilePicture;

    // Constructors
    public ReplyDTO() {}

    public ReplyDTO(Long id, String text, LocalDateTime createdAt, LocalDateTime updatedAt, 
                   Long userId, String author, String authorEmail, String studentId, 
                   String profilePicture) {
        this.id = id;
        this.text = text;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.userId = userId;
        this.author = author;
        this.authorEmail = authorEmail;
        this.studentId = studentId;
        this.profilePicture = profilePicture;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    
    // Frontend compatibility - alias for text
    public String getContent() { return text; }
    public void setContent(String content) { this.text = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    // Frontend compatibility - alias for createdAt
    public LocalDateTime getTimestamp() { return createdAt; }
    public void setTimestamp(LocalDateTime timestamp) { this.createdAt = timestamp; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getAuthorEmail() { return authorEmail; }
    public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
}