package com.cuet.sphere.controller;

import com.cuet.sphere.service.S3Service;
import com.cuet.sphere.response.FileUploadResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);

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

    @PostMapping("/post")
    public ResponseEntity<FileUploadResponse> uploadPostFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(FileUploadResponse.error("File is empty"));
            }

            String contentType = file.getContentType();
            if (contentType == null) {
                return ResponseEntity.badRequest().body(FileUploadResponse.error("Unable to determine file type"));
            }

            // Check file type and size based on content type
            if (contentType.startsWith("image/")) {
                // Images: max 10MB
                if (file.getSize() > 10 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body(FileUploadResponse.error("Image file size exceeds 10MB limit"));
                }
                if (!isAllowedImageType(contentType)) {
                    return ResponseEntity.badRequest().body(FileUploadResponse.error("Image type not allowed. Allowed types: JPG, JPEG, PNG, GIF, WEBP"));
                }
            } else if (contentType.startsWith("video/")) {
                // Videos: max 50MB
                if (file.getSize() > 50 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body(FileUploadResponse.error("Video file size exceeds 50MB limit"));
                }
                if (!isAllowedVideoType(contentType)) {
                    return ResponseEntity.badRequest().body(FileUploadResponse.error("Video type not allowed. Allowed types: MP4, AVI, MOV, WMV, WEBM"));
                }
            } else {
                // Other files (documents): max 10MB
                if (file.getSize() > 10 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body(FileUploadResponse.error("File size exceeds 10MB limit"));
                }
                if (!isAllowedDocumentType(contentType)) {
                    return ResponseEntity.badRequest().body(FileUploadResponse.error("File type not allowed. Allowed types: PDF, DOC, DOCX, TXT, and images"));
                }
            }

            String fileUrl = s3Service.uploadPostFile(file);
            logger.debug("Post file uploaded successfully: {}", fileUrl);
            return ResponseEntity.ok(FileUploadResponse.success(fileUrl));
            
        } catch (IOException e) {
            logger.error("Error uploading post file: {}", e.getMessage(), e);
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
            logger.debug("Profile picture uploaded successfully: {}", fileUrl);
            return ResponseEntity.ok(FileUploadResponse.success(fileUrl));
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(FileUploadResponse.error("Failed to upload profile picture: " + e.getMessage()));
        }
    }

    @PostMapping("/resource")
    public ResponseEntity<FileUploadResponse> uploadResourceFile(
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(FileUploadResponse.error("File is empty"));
            }

            // Check file size (limit to 100MB for resource files)
            if (file.getSize() > 100 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(FileUploadResponse.error("File size exceeds 100MB limit"));
            }

            // Check file type (allow all common resource file types)
            String contentType = file.getContentType();
            if (contentType == null || !isAllowedResourceFileType(contentType)) {
                return ResponseEntity.badRequest().body(FileUploadResponse.error("File type not allowed. Allowed types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, Images, ZIP, RAR"));
            }

            // Generate a unique filename for resource
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".") ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            
            // Create a filename with timestamp to avoid conflicts
            String baseFilename = originalFilename != null ? 
                originalFilename.substring(0, originalFilename.lastIndexOf(".") != -1 ? originalFilename.lastIndexOf(".") : originalFilename.length()) : 
                "resource";
            String filename = baseFilename + "_" + System.currentTimeMillis() + fileExtension;

            String fileUrl = s3Service.uploadResourceFile(file, filename);
            logger.debug("Resource file uploaded successfully: {}", fileUrl);
            
            return ResponseEntity.ok(FileUploadResponse.success(fileUrl, originalFilename, file.getSize()));
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(FileUploadResponse.error("Failed to upload resource file: " + e.getMessage()));
        }
    }

    private boolean isAllowedFileType(String contentType) {
        return contentType.startsWith("application/pdf") ||
               contentType.equals("application/msword") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
               contentType.startsWith("image/");
    }

    private boolean isAllowedResourceFileType(String contentType) {
        return contentType.startsWith("application/pdf") ||
               contentType.equals("application/msword") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
               contentType.equals("application/vnd.ms-powerpoint") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.presentationml.presentation") ||
               contentType.equals("application/vnd.ms-excel") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") ||
               contentType.equals("text/plain") ||
               contentType.equals("application/zip") ||
               contentType.equals("application/x-rar-compressed") ||
               contentType.equals("application/x-zip-compressed") ||
               contentType.startsWith("image/") ||
               contentType.startsWith("video/") ||
               contentType.startsWith("audio/");
    }

    private boolean isAllowedImageType(String contentType) {
        return contentType.equals("image/jpeg") ||
               contentType.equals("image/jpg") ||
               contentType.equals("image/png") ||
               contentType.equals("image/gif") ||
               contentType.equals("image/webp");
    }

    private boolean isAllowedVideoType(String contentType) {
        return contentType.equals("video/mp4") ||
               contentType.equals("video/avi") ||
               contentType.equals("video/quicktime") || // .mov
               contentType.equals("video/x-ms-wmv") ||  // .wmv
               contentType.equals("video/webm");
    }

    private boolean isAllowedDocumentType(String contentType) {
        return contentType.startsWith("application/pdf") ||
               contentType.equals("application/msword") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
               contentType.equals("text/plain") ||
               isAllowedImageType(contentType); // Also allow images in document category
    }
}
