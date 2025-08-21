package com.cuet.sphere.response;

import com.cuet.sphere.model.Notice.NoticeType;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class NoticeRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Message is required")
    private String message;
    
    private String attachment; // This will store the S3 URL after file upload
    
    @NotNull(message = "Notice type is required")
    private NoticeType noticeType;
}
