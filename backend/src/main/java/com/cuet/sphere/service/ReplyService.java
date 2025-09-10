package com.cuet.sphere.service;

import com.cuet.sphere.dto.ReplyDTO;
import com.cuet.sphere.model.Reply;
import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.ReplyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ReplyService {
    @Autowired
    private ReplyRepository replyRepository;
    
    @Autowired
    private UserService userService;

    public Optional<Reply> getReply(Long id) {
        return replyRepository.findById(id);
    }

    public Reply createReply(Reply reply) {
        return replyRepository.save(reply);
    }

    public void deleteReply(Long id) {
        replyRepository.deleteById(id);
    }
    
    public ReplyDTO convertToDTO(Reply reply) {
        ReplyDTO dto = new ReplyDTO();
        dto.setId(reply.getId());
        dto.setText(reply.getText());
        dto.setCreatedAt(reply.getCreatedAt());
        dto.setUpdatedAt(reply.getUpdatedAt());
        dto.setUserId(reply.getUserId());
        
        // Get user information
        Optional<User> userOpt = userService.getUserById(reply.getUserId());
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
        
        return dto;
    }
}

