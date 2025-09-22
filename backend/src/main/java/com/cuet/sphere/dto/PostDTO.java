package com.cuet.sphere.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private String mediaUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long userId;
    private List<String> tags;
    
    // User information
    private String author;
    private String authorEmail;
    private String studentId;
    private String profilePicture;
    
    // Computed fields
    private int upvotes;
    private int downvotes;
    private int commentCount;
    private boolean saved; // Whether the current user has saved this post
    private LocalDateTime timestamp; // Alias for createdAt for frontend compatibility
    private String image; // Alias for mediaUrl for frontend compatibility
    
    // Comments (loaded with post)
    private List<CommentDTO> comments;

    // Default constructor
    public PostDTO() {}

    // Constructor with all fields
    public PostDTO(Long id, String title, String content, String mediaUrl, LocalDateTime createdAt, 
                   LocalDateTime updatedAt, Long userId, List<String> tags, String author, 
                   String authorEmail, String studentId, String profilePicture, int upvotes, 
                   int downvotes, int commentCount, List<CommentDTO> comments) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.mediaUrl = mediaUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.userId = userId;
        this.tags = tags;
        this.author = author;
        this.authorEmail = authorEmail;
        this.studentId = studentId;
        this.profilePicture = profilePicture;
        this.upvotes = upvotes;
        this.downvotes = downvotes;
        this.commentCount = commentCount;
        this.comments = comments;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { 
        this.createdAt = createdAt;
        this.timestamp = createdAt; // Keep timestamp in sync
    }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getAuthorEmail() { return authorEmail; }
    public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }

    public int getUpvotes() { return upvotes; }
    public void setUpvotes(int upvotes) { this.upvotes = upvotes; }

    public int getDownvotes() { return downvotes; }
    public void setDownvotes(int downvotes) { this.downvotes = downvotes; }

    public int getCommentCount() { return commentCount; }
    public void setCommentCount(int commentCount) { this.commentCount = commentCount; }

    public boolean isSaved() { return saved; }
    public void setSaved(boolean saved) { this.saved = saved; }

    public LocalDateTime getTimestamp() { return timestamp != null ? timestamp : createdAt; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getImage() { return image != null ? image : mediaUrl; }
    public void setImage(String image) { this.image = image; }

    public List<CommentDTO> getComments() { return comments; }
    public void setComments(List<CommentDTO> comments) { this.comments = comments; }
}