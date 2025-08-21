package com.cuet.sphere.response;

public class CommentRequest {
    public String text;
    public Long userId;
    public Long postId;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
}
