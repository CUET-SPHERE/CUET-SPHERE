package com.cuet.sphere.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileUploadResponse {
    private boolean success;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String message;
    private String error;
    
    public static FileUploadResponse success(String fileUrl) {
        return new FileUploadResponse(true, fileUrl, null, null, "File uploaded successfully", null);
    }
    
    public static FileUploadResponse success(String fileUrl, String fileName, Long fileSize) {
        return new FileUploadResponse(true, fileUrl, fileName, fileSize, "File uploaded successfully", null);
    }
    
    public static FileUploadResponse error(String error) {
        return new FileUploadResponse(false, null, null, null, null, error);
    }
}
