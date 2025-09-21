package com.cuet.sphere.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ResourceFileResponse {
    private Long fileId;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String fileType;
    private Integer uploadOrder;
    private LocalDateTime createdAt;
    private String formattedFileSize;
    private String fileExtension;
    
    // Static factory method to create from ResourceFile entity
    public static ResourceFileResponse fromResourceFile(com.cuet.sphere.model.ResourceFile resourceFile) {
        ResourceFileResponse response = new ResourceFileResponse();
        response.setFileId(resourceFile.getFileId());
        response.setFileName(resourceFile.getFileName());
        response.setFilePath(resourceFile.getFilePath());
        response.setFileSize(resourceFile.getFileSize());
        response.setFileType(resourceFile.getFileType());
        response.setUploadOrder(resourceFile.getUploadOrder());
        response.setCreatedAt(resourceFile.getCreatedAt());
        response.setFormattedFileSize(resourceFile.getFormattedFileSize());
        response.setFileExtension(resourceFile.getFileExtension());
        return response;
    }
}