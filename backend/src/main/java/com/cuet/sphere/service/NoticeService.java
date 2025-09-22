package com.cuet.sphere.service;

import com.cuet.sphere.model.Notice;
import com.cuet.sphere.model.User;
import com.cuet.sphere.model.User.Role;
import com.cuet.sphere.repository.NoticeRepository;
import com.cuet.sphere.repository.UserRepository;
import com.cuet.sphere.response.NoticeRequest;
import com.cuet.sphere.response.NoticeResponse;
import com.cuet.sphere.exception.UserException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@Service
public class NoticeService {
    
    private static final Logger logger = LoggerFactory.getLogger(NoticeService.class);
    
    @Autowired
    private NoticeRepository noticeRepository;
    
    // Temporarily comment out to isolate the issue
    // @Autowired
    // private WebSocketService webSocketService;
    
    @Autowired
    private S3Service s3Service;
    
    @Autowired
    private UserRepository userRepository;
    
    public NoticeResponse createNotice(NoticeRequest noticeRequest, User sender) throws UserException {
        try {
            // Check if sender is CR or SYSTEM_ADMIN
            if (!sender.isCR() && !Role.SYSTEM_ADMIN.equals(sender.getRole())) {
                throw new UserException("Only CR users and System Administrators can create notices");
            }
            
            logger.debug("Creating notice with title: {} for batch: {}", noticeRequest.getTitle(), sender.getBatch());
            logger.debug("Sender: {} ({})", sender.getFullName(), sender.getRole());
            
            Notice notice = new Notice();
            notice.setTitle(noticeRequest.getTitle());
            notice.setMessage(noticeRequest.getMessage());
            notice.setAttachment(noticeRequest.getAttachment());
            notice.setNoticeType(noticeRequest.getNoticeType());
            notice.setBatch(sender.getBatch());
            notice.setDepartment(sender.getDepartment());
            notice.setSender(sender);
            
            Notice savedNotice = noticeRepository.save(notice);
            logger.info("Notice created successfully with ID: {}", savedNotice.getNoticeId());
            
            NoticeResponse response = convertToResponse(savedNotice);
            
            return response;
        } catch (Exception e) {
            System.err.println("Error in createNotice: " + e.getMessage());
            e.printStackTrace();
            throw new UserException("Failed to create notice: " + e.getMessage());
        }
    }
    
    public Page<NoticeResponse> getNoticesByUser(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Notice> notices;
        if (Role.SYSTEM_ADMIN.equals(user.getRole())) {
            notices = noticeRepository.findAll(pageable);
        } else {
            notices = noticeRepository.findByBatchAndDepartmentOrderByCreatedAtDesc(
                user.getBatch(),
                user.getDepartment(),
                pageable
            );
        }
        
        return notices.map(this::convertToResponse);
    }
    
    public List<NoticeResponse> getNoticesByUserAndType(User user, Notice.NoticeType noticeType) {
        List<Notice> notices = noticeRepository.findByBatchAndDepartmentAndNoticeTypeOrderByCreatedAtDesc(
            user.getBatch(), 
            user.getDepartment(), 
            noticeType
        );
        
        return notices.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public List<NoticeResponse> getNoticesBySender(User sender) throws UserException {
        if (!sender.isCR() && !Role.SYSTEM_ADMIN.equals(sender.getRole())) {
            throw new UserException("Only CR users and System Administrators can view their sent notices");
        }
        
        List<Notice> notices = noticeRepository.findBySenderIdOrderByCreatedAtDesc(sender.getId());
        
        return notices.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public NoticeResponse getNoticeById(Long noticeId, User user) throws UserException {
        Notice notice = noticeRepository.findById(noticeId)
            .orElseThrow(() -> new UserException("Notice not found"));
        
        // Check if user can access this notice
        // SYSTEM_ADMIN can access any notice, others need same batch and department
        if (!Role.SYSTEM_ADMIN.equals(user.getRole()) && 
            (!notice.getBatch().equals(user.getBatch()) || !notice.getDepartment().equals(user.getDepartment()))) {
            throw new UserException("Access denied: Notice not for your batch/department");
        }
        
        return convertToResponse(notice);
    }
    
    public List<Map<String, Object>> getGroupMembers(User user) {
        List<User> groupMembers;
        
        if (Role.SYSTEM_ADMIN.equals(user.getRole())) {
            // SYSTEM_ADMIN can see all users
            groupMembers = userRepository.findAllByOrderByFullNameAsc();
        } else {
            // Regular users see only users from their batch and department
            groupMembers = userRepository.findByBatchAndDepartmentOrderByFullNameAsc(
                user.getBatch(), 
                user.getDepartment()
            );
        }
        
        return groupMembers.stream()
            .map(member -> {
                Map<String, Object> memberInfo = new HashMap<>();
                memberInfo.put("id", member.getId());
                memberInfo.put("fullName", member.getFullName());
                memberInfo.put("email", member.getEmail());
                memberInfo.put("role", member.getRole());
                memberInfo.put("studentId", member.getStudentId());
                memberInfo.put("hall", member.getHall());
                memberInfo.put("isOnline", false); // This could be enhanced with WebSocket status
                return memberInfo;
            })
            .collect(Collectors.toList());
    }
    
    public void deleteNotice(Long noticeId, User user) throws UserException {
        Notice notice = noticeRepository.findById(noticeId)
            .orElseThrow(() -> new UserException("Notice not found"));
        
        // Check if user can delete this notice
        // SYSTEM_ADMIN can delete any notice, CR can only delete their own
        if (!Role.SYSTEM_ADMIN.equals(user.getRole()) && !notice.getSender().getId().equals(user.getId())) {
            throw new UserException("Access denied: You can only delete your own notices");
        }
        
        // Delete the attachment file from S3 if it exists (optional - don't fail if S3 is not available)
        if (notice.getAttachment() != null && !notice.getAttachment().isEmpty()) {
            try {
                s3Service.deleteFile(notice.getAttachment());
            } catch (Exception e) {
                // Log error but don't fail notice deletion
                System.err.println("S3 file deletion failed: " + e.getMessage());
            }
        }
        
        // Delete the notice from database
        noticeRepository.delete(notice);
    }
    
    private NoticeResponse convertToResponse(Notice notice) {
        NoticeResponse response = new NoticeResponse();
        response.setNoticeId(notice.getNoticeId());
        response.setDepartment(notice.getDepartment());
        response.setBatch(notice.getBatch());
        response.setTitle(notice.getTitle());
        response.setMessage(notice.getMessage());
        response.setAttachment(notice.getAttachment());
        response.setNoticeType(notice.getNoticeType());
        response.setSenderName(notice.getSender().getFullName());
        response.setSenderEmail(notice.getSender().getEmail());
        response.setCreatedAt(notice.getCreatedAt());
        response.setUpdatedAt(notice.getUpdatedAt());
        return response;
    }
}
