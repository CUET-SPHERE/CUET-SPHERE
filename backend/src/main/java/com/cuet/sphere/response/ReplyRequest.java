package com.cuet.sphere.response;

public class ReplyRequest {
    public String text;
    public Long userId;
    public Long commentId;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getCommentId() { return commentId; }
    public void setCommentId(Long commentId) { this.commentId = commentId; }
}
