package com.cuet.sphere.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CommentDTO {
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
    
    private List<ReplyDTO> replies;

    // Constructors
    public CommentDTO() {}

    public CommentDTO(Long id, String text, LocalDateTime createdAt, LocalDateTime updatedAt, 
                     Long userId, String author, String authorEmail, String studentId, 
                     String profilePicture, List<ReplyDTO> replies) {
        this.id = id;
        this.text = text;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.userId = userId;
        this.author = author;
        this.authorEmail = authorEmail;
        this.studentId = studentId;
        this.profilePicture = profilePicture;
        this.replies = replies;
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

    public List<ReplyDTO> getReplies() { return replies; }
    public void setReplies(List<ReplyDTO> replies) { this.replies = replies; }
}