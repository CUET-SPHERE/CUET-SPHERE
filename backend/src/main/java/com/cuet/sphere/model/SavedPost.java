package com.cuet.sphere.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "saved_posts",
    uniqueConstraints = @UniqueConstraint(
        name = "unique_user_post", 
        columnNames = {"user_id", "post_id"}
    ),
    indexes = {
        @Index(name = "idx_saved_posts_user_id", columnList = "user_id"),
        @Index(name = "idx_saved_posts_user_post", columnList = "user_id, post_id"),
        @Index(name = "idx_saved_posts_post_id", columnList = "post_id"),
        @Index(name = "idx_saved_posts_saved_at", columnList = "saved_at"),
        @Index(name = "idx_saved_posts_user_saved_at", columnList = "user_id, saved_at")
    }
)
public class SavedPost {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-saved-posts")
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @JsonBackReference("post-saved-by")
    private Post post;
    
    @Column(name = "saved_at", nullable = false)
    private LocalDateTime savedAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public SavedPost() {
        this.savedAt = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public SavedPost(User user, Post post) {
        this();
        this.user = user;
        this.post = post;
    }
    
    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.savedAt = now;
        this.createdAt = now;
        this.updatedAt = now;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Post getPost() {
        return post;
    }
    
    public void setPost(Post post) {
        this.post = post;
    }
    
    public LocalDateTime getSavedAt() {
        return savedAt;
    }
    
    public void setSavedAt(LocalDateTime savedAt) {
        this.savedAt = savedAt;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SavedPost)) return false;
        SavedPost savedPost = (SavedPost) o;
        return user != null && post != null && 
               user.equals(savedPost.user) && post.equals(savedPost.post);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}