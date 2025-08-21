package com.cuet.sphere.response;

import java.time.LocalDateTime;
import java.util.List;

public class PostResponse {
    public Long id;
    public String text;
    public String mediaUrl;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public Long userId;
    public List<CommentResponse> comments;
    public int upvotes;
    public int downvotes;
}

