package com.cuet.sphere.response;

import java.time.LocalDateTime;
import java.util.List;

public class CommentResponse {
    public Long id;
    public String text;
    public LocalDateTime createdAt;
    public Long userId;
    public List<ReplyResponse> replies;
}

