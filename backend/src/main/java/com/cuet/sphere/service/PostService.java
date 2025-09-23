package com.cuet.sphere.service;

import com.cuet.sphere.dto.CommentDTO;
import com.cuet.sphere.dto.PostDTO;
import com.cuet.sphere.model.Post;
import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.PostRepository;
import com.cuet.sphere.repository.SavedPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    
    @Autowired
    private S3Service s3Service;
    
    @Autowired
    private SavedPostRepository savedPostRepository;

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
    
    public Page<PostDTO> getAllPostsPaginated(Pageable pageable) {
        return getAllPostsPaginated(pageable, false);
    }
    
    public Page<PostDTO> getAllPostsPaginated(Pageable pageable, boolean includeComments) {
        Page<Post> posts;
        
        if (includeComments) {
            // Use query that includes comments
            posts = postRepository.findAllWithUserAndCommentsPaginated(pageable);
            return posts.map(this::convertToDTO);
        } else {
            // Use query with only user info to avoid N+1 queries
            posts = postRepository.findAllWithUserOnlyPaginated(pageable);
            return posts.map(this::convertToDTOWithoutComments);
        }
    }
    
    public PostDTO getPostWithUserInfo(Long id) {
        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isPresent()) {
            return convertToDTO(postOpt.get());
        }
        return null;
    }

    public void deletePost(Long id) {
        // Get post before deletion to clean up S3 files and saved post records
        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isPresent()) {
            Post post = postOpt.get();
            
            // Delete media file from S3 if exists
            if (post.getMediaUrl() != null && !post.getMediaUrl().isEmpty()) {
                try {
                    s3Service.deleteFile(post.getMediaUrl());
                } catch (Exception e) {
                    // Failed to delete post media from S3, but continue with deletion
                    // Log this in production for monitoring
                }
            }
            
            // Clean up saved post records manually since they don't have cascade
            try {
                savedPostRepository.deleteByPost(post);
            } catch (Exception e) {
                // Failed to delete saved post records, but continue with deletion
                // This will be handled by database constraints if needed
            }
        }
        
        // Delete the post (this will cascade delete comments and votes)
        postRepository.deleteById(id);
    }

    public Post updatePost(Post post) {
        // If updating media URL, delete old media from S3
        if (post.getId() != null) {
            Optional<Post> existingPostOpt = postRepository.findById(post.getId());
            if (existingPostOpt.isPresent()) {
                Post existingPost = existingPostOpt.get();
                
                // Check if media URL is being changed
                if (existingPost.getMediaUrl() != null && 
                    !existingPost.getMediaUrl().equals(post.getMediaUrl())) {
                    try {
                        s3Service.deleteFile(existingPost.getMediaUrl());
                    } catch (Exception e) {
                        // Failed to delete old post media from S3
                    }
                }
            }
        }
        
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
            // Error accessing user for post
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
                                // Error converting comment to DTO
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
            // Error loading comments for post
            dto.setComments(new ArrayList<>());
        }
        
        return dto;
    }
    
    // Overloaded method that includes saved status for current user
    public PostDTO convertToDTO(Post post, User currentUser) {
        PostDTO dto = convertToDTO(post);
        
        // Check if the current user has saved this post
        if (currentUser != null) {
            boolean isSaved = savedPostRepository.existsByUserAndPost(currentUser, post);
            dto.setSaved(isSaved);
        } else {
            dto.setSaved(false);
        }
        
        return dto;
    }
    
    public PostDTO convertToDTOWithoutComments(Post post) {
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
            dto.setAuthor("Unknown User");
            dto.setAuthorEmail("unknown@example.com");
            dto.setStudentId("0000000");
            dto.setProfilePicture(null);
        }
        
        // Don't load comments for feed - they will be loaded separately when needed
        dto.setComments(new ArrayList<>());
        
        return dto;
    }
}

