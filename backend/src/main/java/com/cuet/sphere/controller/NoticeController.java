package com.cuet.sphere.controller;

import com.cuet.sphere.model.User;
import com.cuet.sphere.model.Notice;
import com.cuet.sphere.response.NoticeRequest;
import com.cuet.sphere.response.NoticeResponse;
import com.cuet.sphere.service.NoticeService;
import com.cuet.sphere.exception.UserException;
import com.cuet.sphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.data.domain.Page;
import com.cuet.sphere.repository.NoticeRepository;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = "*")
public class NoticeController {
    
    private static final Logger logger = LoggerFactory.getLogger(NoticeController.class);
    
    @Autowired
    private NoticeService noticeService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NoticeRepository noticeRepository;
    
    @PostMapping
    public ResponseEntity<?> createNotice(@Valid @RequestBody NoticeRequest noticeRequest) {
        try {
            logger.info("Creating notice with message: {}", noticeRequest.getMessage());
            logger.info("Notice type: {}", noticeRequest.getNoticeType());
            logger.info("Attachment: {}", noticeRequest.getAttachment());
            logger.info("Title: {}", noticeRequest.getTitle());
            
            User currentUser = getCurrentUser();
            logger.info("Current user: {} ({})", currentUser.getFullName(), currentUser.getEmail());
            logger.info("User role: {}", currentUser.getRole());
            logger.info("User batch: {}", currentUser.getBatch());
            logger.info("User department: {}", currentUser.getDepartment());
            
            NoticeResponse notice = noticeService.createNotice(noticeRequest, currentUser);
            logger.info("Notice created successfully with ID: {}", notice.getNoticeId());
            
            // Return response format that frontend expects
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notice created successfully");
            response.put("noticeId", notice.getNoticeId());
            response.put("notice", notice);
            
            return ResponseEntity.ok(response);
        } catch (UserException e) {
            logger.error("UserException while creating notice: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (RuntimeException e) {
            logger.error("RuntimeException while creating notice: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(401).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error while creating notice: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllNotices(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        Authentication authentication) {
        try {
            User currentUser = getCurrentUser();
            Page<NoticeResponse> notices = noticeService.getNoticesByUser(currentUser, page, size);
            return ResponseEntity.ok(notices);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to get notices: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @GetMapping("/type/{noticeType}")
    public ResponseEntity<List<NoticeResponse>> getNoticesByType(@PathVariable String noticeType) {
        try {
            User currentUser = getCurrentUser();
            Notice.NoticeType type = Notice.NoticeType.valueOf(noticeType.toUpperCase());
            List<NoticeResponse> notices = noticeService.getNoticesByUserAndType(currentUser, type);
            return ResponseEntity.ok(notices);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<NoticeResponse>> getMyNotices() {
        try {
            User currentUser = getCurrentUser();
            List<NoticeResponse> notices = noticeService.getNoticesBySender(currentUser);
            return ResponseEntity.ok(notices);
        } catch (UserException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/group-members")
    public ResponseEntity<?> getGroupMembers() {
        try {
            User currentUser = getCurrentUser();
            List<Map<String, Object>> groupMembers = noticeService.getGroupMembers(currentUser);
            return ResponseEntity.ok(groupMembers);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to get group members: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @GetMapping("/{noticeId}")
    public ResponseEntity<NoticeResponse> getNoticeById(@PathVariable Long noticeId) {
        try {
            User currentUser = getCurrentUser();
            NoticeResponse notice = noticeService.getNoticeById(noticeId, currentUser);
            return ResponseEntity.ok(notice);
        } catch (UserException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{noticeId}")
    public ResponseEntity<?> deleteNotice(@PathVariable Long noticeId) {
        try {
            User currentUser = getCurrentUser();
            noticeService.deleteNotice(noticeId, currentUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notice deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (UserException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Test endpoint for debugging (no authentication required)
    @PostMapping("/test")
    public ResponseEntity<?> testNoticeCreation(@Valid @RequestBody NoticeRequest noticeRequest) {
        logger.info("Test endpoint called with message: {}", noticeRequest.getMessage());
        logger.info("Notice type: {}", noticeRequest.getNoticeType());
        logger.info("Attachment: {}", noticeRequest.getAttachment());
        logger.info("Title: {}", noticeRequest.getTitle());
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Test endpoint working");
        response.put("receivedData", noticeRequest);
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
    
    // Simple test endpoint for notice creation without validation
    @PostMapping("/test-simple")
    public ResponseEntity<?> testSimpleNoticeCreation(@RequestBody Map<String, Object> request) {
        logger.info("Simple test endpoint called with: {}", request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Simple test successful");
        response.put("receivedData", request);
        
        return ResponseEntity.ok(response);
    }
    
    // Debug endpoint to check if the service is working
    @GetMapping("/debug")
    public ResponseEntity<?> debugEndpoint() {
        logger.info("Debug endpoint called");
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Debug endpoint working");
        response.put("timestamp", System.currentTimeMillis());
        response.put("serviceStatus", "NoticeService is available");
        
        return ResponseEntity.ok(response);
    }
    
    // Database check endpoint
    @GetMapping("/db-check")
    public ResponseEntity<?> databaseCheck() {
        try {
            logger.info("Database check endpoint called");
            
            // Try to count notices
            long noticeCount = noticeRepository.count();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Database connection successful");
            response.put("noticeCount", noticeCount);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Database check failed: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Database check failed: " + e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        logger.info("Authentication object: {}", authentication);
        
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            logger.info("Authenticated user email: {}", email);
            User user = userRepository.findUserByEmail(email);
            if (user != null) {
                logger.info("Found user: {} ({})", user.getFullName(), user.getEmail());
                return user;
            } else {
                logger.error("User not found in database for email: {}", email);
            }
        } else {
            logger.error("Authentication failed or user not authenticated");
        }
        throw new RuntimeException("User not authenticated");
    }
}
