package com.cuet.sphere.dto;

import com.cuet.sphere.model.Notification;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private String type;
    private Boolean isRead;
    private Long relatedPostId;
    private Long relatedCommentId;
    private Long relatedReplyId;
    private Long actorUserId;
    private String actorUserName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static NotificationDTO fromEntity(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType().name());
        dto.setIsRead(notification.getIsRead());
        dto.setRelatedPostId(notification.getRelatedPostId());
        dto.setRelatedCommentId(notification.getRelatedCommentId());
        dto.setRelatedReplyId(notification.getRelatedReplyId());
        dto.setActorUserId(notification.getActorUserId());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setUpdatedAt(notification.getUpdatedAt());
        return dto;
    }
}