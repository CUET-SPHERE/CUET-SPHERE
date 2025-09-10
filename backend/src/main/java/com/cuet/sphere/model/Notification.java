package com.cuet.sphere.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // The user who will receive the notification
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;
    
    @Column(name = "is_read")
    private Boolean isRead = false;
    
    @Column(name = "related_post_id")
    private Long relatedPostId;
    
    @Column(name = "related_comment_id")
    private Long relatedCommentId;
    
    @Column(name = "related_reply_id")
    private Long relatedReplyId;
    
    @Column(name = "actor_user_id")
    private Long actorUserId; // The user who performed the action
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum NotificationType {
        POST_COMMENT,      // Someone commented on your post
        COMMENT_REPLY,     // Someone replied to your comment
        NEW_POST_ADMIN,    // Admin notification for new posts
        WELCOME            // Welcome notification for new users
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}