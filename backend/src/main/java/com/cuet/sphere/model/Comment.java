package com.cuet.sphere.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

    private String text;
    private LocalDateTime createdAt;
    private Long userId;

    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reply> replies;

    // Getters and setters
    public Long getId() { return id; }
    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public List<Reply> getReplies() { return replies; }
    public void setReplies(List<Reply> replies) { this.replies = replies; }
}
