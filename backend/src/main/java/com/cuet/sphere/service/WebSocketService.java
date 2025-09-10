package com.cuet.sphere.service;

import com.cuet.sphere.dto.NotificationDTO;
import com.cuet.sphere.response.NoticeResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
    
    public void sendNoticeToBatchAndDepartment(NoticeResponse notice) {
        // Send to all users in the same batch and department
        String destination = "/topic/notices/" + notice.getBatch() + "/" + notice.getDepartment();
        messagingTemplate.convertAndSend(destination, notice);
    }
    
    public void sendNoticeToUser(String userId, NoticeResponse notice) {
        // Send to specific user
        String destination = "/user/" + userId + "/queue/notices";
        messagingTemplate.convertAndSendToUser(userId, "/queue/notices", notice);
    }
    
    public void sendNoticeToAll(NoticeResponse notice) {
        // Send to all connected users
        messagingTemplate.convertAndSend("/topic/notices", notice);
    }
    
    // Send notification to specific user
    public void sendNotificationToUser(String userId, NotificationDTO notification) {
        try {
            String destination = "/user/" + userId + "/queue/notifications";
            messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", notification);
            System.out.println("Sent notification to user " + userId + ": " + notification.getTitle());
        } catch (Exception e) {
            System.err.println("Error sending notification to user " + userId + ": " + e.getMessage());
        }
    }
    
    // Send notification to all users (for admin broadcasts)
    public void sendNotificationToAll(NotificationDTO notification) {
        try {
            messagingTemplate.convertAndSend("/topic/notifications", notification);
            System.out.println("Sent notification to all users: " + notification.getTitle());
        } catch (Exception e) {
            System.err.println("Error sending notification to all users: " + e.getMessage());
        }
    }
}
