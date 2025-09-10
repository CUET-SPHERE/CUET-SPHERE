package com.cuet.sphere.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class Vote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "post_id")
    @JsonBackReference("post-votes")
    private Post post;

    private Long userId;
    
    @Column(name = "upvote", nullable = false)
    private Boolean upvote = false; // true for UPVOTE, false for DOWNVOTE, default to false
    
    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Boolean getUpvote() { return upvote; }
    public void setUpvote(Boolean upvote) { this.upvote = upvote; }
    
    // Helper methods for string-based vote type
    public String getVoteType() { 
        return upvote != null ? (upvote ? "UPVOTE" : "DOWNVOTE") : null; 
    }
    
    public void setVoteType(String voteType) { 
        if ("UPVOTE".equals(voteType)) {
            this.upvote = true;
        } else if ("DOWNVOTE".equals(voteType)) {
            this.upvote = false;
        } else {
            this.upvote = null;
        }
    }
    
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(java.time.LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
