package com.cuet.sphere.service;

import com.cuet.sphere.dto.NotificationDTO;
import com.cuet.sphere.model.Notification;
import com.cuet.sphere.model.User;
import com.cuet.sphere.model.Post;
import com.cuet.sphere.model.Comment;
import com.cuet.sphere.model.Reply;
import com.cuet.sphere.repository.NotificationRepository;
import com.cuet.sphere.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private WebSocketService webSocketService;
    
    public List<NotificationDTO> getUserNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }
    
    public void markAsRead(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }
    
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findUnreadByUserIdOrderByCreatedAtDesc(userId);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }
    
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
    
    public void deleteAllUserNotifications(Long userId) {
        notificationRepository.deleteByUserId(userId);
    }
    
    // Create notification for post comment (Database storage only)
    public void createPostCommentNotification(Post post, Comment comment, User commenter) {
        if (post.getUser().getId().equals(commenter.getId())) {
            return; // Don't notify if user comments on their own post
        }
        
        Notification notification = new Notification();
        notification.setUser(post.getUser());
        notification.setTitle("New Comment on Your Post");
        notification.setMessage(commenter.getFullName() + " commented on your post: \"" + 
                               truncateText(post.getTitle(), 50) + "\"");
        notification.setType(Notification.NotificationType.POST_COMMENT);
        notification.setRelatedPostId(post.getId());
        notification.setRelatedCommentId(comment.getId());
        notification.setActorUserId(commenter.getId());
        
        notificationRepository.save(notification);
        
        logger.debug("Comment notification created for post: {} - User will see it on notifications page", post.getId());
    }
    
    // Create notification for comment reply (Database storage only)
    public void createCommentReplyNotification(Comment comment, Reply reply, User replier) {
        if (comment.getUser().getId().equals(replier.getId())) {
            return; // Don't notify if user replies to their own comment
        }
        
        Notification notification = new Notification();
        notification.setUser(comment.getUser());
        notification.setTitle("New Reply to Your Comment");
        notification.setMessage(replier.getFullName() + " replied to your comment: \"" + 
                               truncateText(comment.getText(), 50) + "\"");
        notification.setType(Notification.NotificationType.COMMENT_REPLY);
        notification.setRelatedPostId(comment.getPost().getId());
        notification.setRelatedCommentId(comment.getId());
        notification.setRelatedReplyId(reply.getId());
        notification.setActorUserId(replier.getId());
        
        notificationRepository.save(notification);
        
        logger.debug("Reply notification created for comment: {} - User will see it on notifications page", comment.getId());
    }
    
    // Create notification for admin when new post is created (Database + Email notification)
    public void createNewPostAdminNotification(Post post, User postCreator) {
        // Find all system admins
        List<User> admins = userRepository.findByRole(User.Role.SYSTEM_ADMIN);
        
        for (User admin : admins) {
            if (admin.getId().equals(postCreator.getId())) {
                continue; // Don't notify admin if they created the post
            }
            
            Notification notification = new Notification();
            notification.setUser(admin);
            notification.setTitle("New Post Created");
            notification.setMessage(postCreator.getFullName() + " created a new post: \"" + 
                                   truncateText(post.getTitle(), 50) + "\"");
            notification.setType(Notification.NotificationType.NEW_POST_ADMIN);
            notification.setRelatedPostId(post.getId());
            notification.setActorUserId(postCreator.getId());
            
            notificationRepository.save(notification);
            
            // Send email notification to admin (IMPORTANT: Admins get emails for new posts)
            emailService.sendNewPostAdminEmail(
                admin.getEmail(),
                admin.getFullName(),
                postCreator.getFullName(),
                post.getTitle(),
                post.getContent()
            );
            
            logger.debug("Admin notification created (Database + Email) for new post: {} to admin: {}", post.getId(), admin.getEmail());
        }
    }
    
    // Create welcome notification for new user
    public void createWelcomeNotification(User newUser) {
        Notification notification = new Notification();
        notification.setUser(newUser);
        notification.setTitle("Welcome to CUET Sphere!");
        notification.setMessage("Welcome " + newUser.getFullName() + "! Thank you for joining CUET Sphere. " +
                               "Start exploring posts, connect with your classmates, and share academic resources.");
        notification.setType(Notification.NotificationType.WELCOME);
        notification.setActorUserId(newUser.getId());
        
        notificationRepository.save(notification);
        
        // Send welcome email
        emailService.sendWelcomeEmail(newUser.getEmail(), newUser.getFullName());
    }
    
    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = NotificationDTO.fromEntity(notification);
        
        // Add actor user name if available
        if (notification.getActorUserId() != null) {
            Optional<User> actorUser = userRepository.findById(notification.getActorUserId());
            if (actorUser.isPresent()) {
                dto.setActorUserName(actorUser.get().getFullName());
            }
        }
        
        return dto;
    }
    
    private String truncateText(String text, int maxLength) {
        if (text == null) return "";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    }
}