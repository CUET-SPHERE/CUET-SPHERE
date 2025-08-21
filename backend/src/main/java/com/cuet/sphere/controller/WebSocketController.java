package com.cuet.sphere.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {
    
    @MessageMapping("/notices/subscribe")
    @SendToUser("/queue/notices")
    public String subscribeToNotices(String message) {
        return "Subscribed to notices successfully";
    }
    
    @MessageMapping("/notices/batch-department")
    @SendTo("/topic/notices")
    public String subscribeToBatchDepartmentNotices(String message) {
        return "Subscribed to batch and department notices successfully";
    }
}
