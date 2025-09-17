package com.cuet.sphere.controller;

import com.cuet.sphere.model.Notice;
import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.NoticeRepository;
import com.cuet.sphere.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/files")
public class FileProxyController {

    private static final Logger logger = LoggerFactory.getLogger(FileProxyController.class);

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Simple test endpoint
     */
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        logger.info("File proxy test endpoint called");
        return ResponseEntity.ok().body("File proxy service is running");
    }

    /**
     * Get file info for a notice attachment
     */
    @GetMapping("/notice/{noticeId}/attachment/info")
    public ResponseEntity<?> getAttachmentInfo(@PathVariable Long noticeId) {
        try {
            // Get current user
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            // Find notice
            Optional<Notice> noticeOpt = noticeRepository.findById(noticeId);
            if (noticeOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Notice notice = noticeOpt.get();
            String attachmentUrl = notice.getAttachment();
            
            if (attachmentUrl == null || attachmentUrl.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // Check authorization
            if (!canUserAccessNotice(currentUser, notice)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            String filename = extractFilename(attachmentUrl);
            String contentType = getContentType(filename);
            
            return ResponseEntity.ok().body(new AttachmentInfo(filename, contentType, attachmentUrl));
            
        } catch (Exception e) {
            logger.error("Error getting attachment info: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }    /**
     * Get current user from security context
     */
    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String email = authentication.getName();
                return userRepository.findUserByEmail(email);
            }
        } catch (Exception e) {
            logger.error("Error getting current user: {}", e.getMessage());
        }
        return null;
    }
    
    /**
     * Check if user can access the notice based on their department and batch
     */
    private boolean canUserAccessNotice(User user, Notice notice) {
        // System admin can access all notices
        if ("SYSTEM_ADMIN".equals(user.getRole().toString())) {
            return true;
        }
        
        // Users can access notices from their department and batch
        return user.getDepartment().equals(notice.getDepartment()) && 
               user.getBatch().equals(notice.getBatch());
    }
    
    private String extractFilename(String url) {
        if (url == null) return "attachment";
        
        // Extract filename from URL path
        int lastSlash = url.lastIndexOf('/');
        if (lastSlash >= 0 && lastSlash < url.length() - 1) {
            String filename = url.substring(lastSlash + 1);
            // Remove any query parameters
            int queryIndex = filename.indexOf('?');
            if (queryIndex > 0) {
                filename = filename.substring(0, queryIndex);
            }
            return filename;
        }
        return "attachment";
    }
    
    private String getContentType(String filename) {
        if (filename == null) return "application/octet-stream";
        
        String extension = "";
        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0) {
            extension = filename.substring(lastDot + 1).toLowerCase();
        }
        
        switch (extension) {
            case "pdf":
                return "application/pdf";
            case "doc":
                return "application/msword";
            case "docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            default:
                return "application/octet-stream";
        }
    }
    
    // Inner class for attachment info response
    public static class AttachmentInfo {
        private String filename;
        private String contentType;
        private String url;
        
        public AttachmentInfo(String filename, String contentType, String url) {
            this.filename = filename;
            this.contentType = contentType;
            this.url = url;
        }
        
        public String getFilename() { return filename; }
        public void setFilename(String filename) { this.filename = filename; }
        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }
}