package com.cuet.sphere.controller;

import com.cuet.sphere.dto.NotificationDTO;
import com.cuet.sphere.service.NotificationService;
import com.cuet.sphere.service.UserService;
import com.cuet.sphere.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getUserNotifications() {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            List<NotificationDTO> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error fetching notifications: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            Long count = notificationService.getUnreadCount(userId);
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error fetching unread count: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Long notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Notification marked as read");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error marking notification as read: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/mark-all-read")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            notificationService.markAllAsRead(userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "All notifications marked as read");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error marking all notifications as read: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable Long notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Notification deleted");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error deleting notification: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, String>> clearAllNotifications() {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            notificationService.deleteAllUserNotifications(userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "All notifications cleared");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error clearing all notifications: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    private Long getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getName().equals("anonymousUser")) {
                
                String userEmail = authentication.getName();
                Optional<User> userOpt = userService.getUserByEmail(userEmail);
                if (userOpt.isPresent()) {
                    return userOpt.get().getId();
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("Error getting current user ID: " + e.getMessage());
            return null;
        }
    }
}