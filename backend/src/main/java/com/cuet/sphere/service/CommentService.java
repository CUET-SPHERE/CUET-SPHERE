package com.cuet.sphere.service;

import com.cuet.sphere.dto.CommentDTO;
import com.cuet.sphere.dto.ReplyDTO;
import com.cuet.sphere.model.Comment;
import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ReplyService replyService;

    public Optional<Comment> getComment(Long id) {
        return commentRepository.findById(id);
    }

    public Comment createComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
    
    public CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setText(comment.getText());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setUserId(comment.getUserId());
        
        // Get user information
        Optional<User> userOpt = userService.getUserById(comment.getUserId());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            dto.setAuthor(user.getFullName());
            dto.setAuthorEmail(user.getEmail());
            dto.setStudentId(user.getFullStudentId());
            dto.setProfilePicture(user.getProfilePicture());
        } else {
            // Fallback values if user not found
            dto.setAuthor("Unknown User");
            dto.setAuthorEmail("unknown@example.com");
            dto.setStudentId("0000000");
            dto.setProfilePicture(null);
        }
        
        // Convert replies to DTOs
        if (comment.getReplies() != null) {
            List<ReplyDTO> replyDTOs = comment.getReplies().stream()
                .map(reply -> replyService.convertToDTO(reply))
                .collect(Collectors.toList());
            dto.setReplies(replyDTOs);
        }
        
        return dto;
    }
}

