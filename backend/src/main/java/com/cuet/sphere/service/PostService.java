package com.cuet.sphere.service;

import com.cuet.sphere.dto.CommentDTO;
import com.cuet.sphere.dto.PostDTO;
import com.cuet.sphere.model.Post;
import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private CommentService commentService;

    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    public Optional<Post> getPost(Long id) {
        return postRepository.findById(id);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }
    
    public List<PostDTO> getAllPostsWithUserInfo() {
        // Use simple query first to avoid 500 errors, then load user data manually
        List<Post> posts = postRepository.findAllOrderedByDateSimple();
        return posts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public PostDTO getPostWithUserInfo(Long id) {
        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isPresent()) {
            return convertToDTO(postOpt.get());
        }
        return null;
    }

    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }

    public Post updatePost(Post post) {
        return postRepository.save(post);
    }
    
    public PostDTO convertToDTO(Post post) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setMediaUrl(post.getMediaUrl());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setUserId(post.getUserId());
        dto.setTags(post.getTags());
        
        // Set computed fields
        dto.setUpvotes(post.getUpvotes());
        dto.setDownvotes(post.getDownvotes());
        dto.setCommentCount(post.getCommentCount());
        
        // Set frontend compatibility fields
        dto.setTimestamp(post.getCreatedAt());
        dto.setImage(post.getMediaUrl());
        
        // Set user information from the relationship
        try {
            User user = post.getUser();
            if (user != null) {
                dto.setAuthor(user.getFullName());
                dto.setAuthorEmail(user.getEmail());
                dto.setStudentId(user.getFullStudentId());
                dto.setProfilePicture(user.getProfilePicture());
            } else {
                // Fallback for missing user
                dto.setAuthor("Unknown User");
                dto.setAuthorEmail("unknown@example.com");
                dto.setStudentId("0000000");
                dto.setProfilePicture(null);
            }
        } catch (Exception e) {
            // Handle any database errors gracefully
            System.err.println("Error accessing user for post " + post.getId() + ": " + e.getMessage());
            dto.setAuthor("Unknown User");
            dto.setAuthorEmail("unknown@example.com");
            dto.setStudentId("0000000");
            dto.setProfilePicture(null);
        }
        
        // Load comments with the post
        try {
            if (post.getComments() != null) {
                List<CommentDTO> commentDTOs = post.getComments().stream()
                        .map(comment -> {
                            try {
                                return commentService.convertToDTO(comment);
                            } catch (Exception e) {
                                System.err.println("Error converting comment " + comment.getId() + " to DTO: " + e.getMessage());
                                return null;
                            }
                        })
                        .filter(commentDTO -> commentDTO != null)
                        .collect(Collectors.toList());
                dto.setComments(commentDTOs);
            } else {
                dto.setComments(new ArrayList<>());
            }
        } catch (Exception e) {
            System.err.println("Error loading comments for post " + post.getId() + ": " + e.getMessage());
            dto.setComments(new ArrayList<>());
        }
        
        return dto;
    }
}

