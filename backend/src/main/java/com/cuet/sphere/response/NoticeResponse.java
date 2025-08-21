package com.cuet.sphere.response;

import com.cuet.sphere.model.Notice.NoticeType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoticeResponse {
    private Long noticeId;
    private String department;
    private String batch;
    private String title;
    private String message;
    private String attachment;
    private NoticeType noticeType;
    private String senderName;
    private String senderEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
