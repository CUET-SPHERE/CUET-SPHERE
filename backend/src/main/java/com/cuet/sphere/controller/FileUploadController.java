package com.cuet.sphere.controller;

import com.cuet.sphere.service.S3Service;
import com.cuet.sphere.response.FileUploadResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    @Autowired
    private S3Service s3Service;

    @PostMapping("/file")
    public ResponseEntity<FileUploadResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(FileUploadResponse.error("File is empty"));
            }

            // Check file size (limit to 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(FileUploadResponse.error("File size exceeds 10MB limit"));
            }

            // Check file type (allow common document and image types)
            String contentType = file.getContentType();
            if (contentType == null || !isAllowedFileType(contentType)) {
                return ResponseEntity.badRequest().body(FileUploadResponse.error("File type not allowed. Allowed types: PDF, DOC, DOCX, JPG, PNG, GIF"));
            }

            String fileUrl = s3Service.uploadFile(file);
            return ResponseEntity.ok(FileUploadResponse.success(fileUrl));
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(FileUploadResponse.error("Failed to upload file: " + e.getMessage()));
        }
    }

    @PostMapping("/profile")
    public ResponseEntity<FileUploadResponse> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(FileUploadResponse.error("File is empty"));
            }

            // Check file size (limit to 5MB for profile pictures)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(FileUploadResponse.error("File size exceeds 5MB limit"));
            }

            // Check file type (only images for profile pictures)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(FileUploadResponse.error("Only image files are allowed for profile pictures"));
            }

            // Generate a unique filename based on type and timestamp
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String filename = type + "_" + System.currentTimeMillis() + fileExtension;

            String fileUrl = s3Service.uploadFile(file, filename);
            return ResponseEntity.ok(FileUploadResponse.success(fileUrl));
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(FileUploadResponse.error("Failed to upload profile picture: " + e.getMessage()));
        }
    }

    private boolean isAllowedFileType(String contentType) {
        return contentType.startsWith("application/pdf") ||
               contentType.equals("application/msword") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
               contentType.startsWith("image/");
    }
}
