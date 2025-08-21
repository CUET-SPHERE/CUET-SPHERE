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
    private String message;
    private String error;
    
    public static FileUploadResponse success(String fileUrl) {
        return new FileUploadResponse(true, fileUrl, "File uploaded successfully", null);
    }
    
    public static FileUploadResponse error(String error) {
        return new FileUploadResponse(false, null, null, error);
    }
}
