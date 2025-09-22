package com.cuet.sphere.controller;

import com.cuet.sphere.dto.CommentDTO;
import com.cuet.sphere.dto.PostDTO;
import com.cuet.sphere.dto.ReplyDTO;
import com.cuet.sphere.model.Comment;
import com.cuet.sphere.model.Post;
import com.cuet.sphere.model.Reply;
import com.cuet.sphere.model.SavedPost;
import com.cuet.sphere.model.User;
import com.cuet.sphere.model.Vote;
import com.cuet.sphere.repository.SavedPostRepository;
import com.cuet.sphere.response.CommentRequest;
import com.cuet.sphere.response.PostRequest;
import com.cuet.sphere.response.ReplyRequest;
import com.cuet.sphere.response.VoteRequest;
import com.cuet.sphere.service.CommentService;
import com.cuet.sphere.service.NotificationService;
import com.cuet.sphere.service.PostService;
import com.cuet.sphere.service.ReplyService;
import com.cuet.sphere.service.UserService;
import com.cuet.sphere.service.VoteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    private final PostService postService;
    private final CommentService commentService;
    private final ReplyService replyService;
    private final VoteService voteService;
    private final UserService userService;
    private final NotificationService notificationService;
    private final SavedPostRepository savedPostRepository;

    public PostController(PostService postService, CommentService commentService, ReplyService replyService, VoteService voteService, UserService userService, NotificationService notificationService, SavedPostRepository savedPostRepository) {
        this.postService = postService;
        this.commentService = commentService;
        this.replyService = replyService;
        this.voteService = voteService;
        this.userService = userService;
        this.notificationService = notificationService;
        this.savedPostRepository = savedPostRepository;
    }

    @GetMapping
    public ResponseEntity<Page<PostDTO>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "false") boolean includeComments
    ) {
        try {
            logger.debug("GET /api/posts called with pagination - Page: {}, Size: {}, Sort: {} {}, Include Comments: {}", page, size, sortBy, sortDir, includeComments);
            
            Pageable pageable = PageRequest.of(page, size, 
                sortDir.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
            
            Page<PostDTO> posts = postService.getAllPostsPaginated(pageable, includeComments);
            logger.debug("Posts fetched successfully, count: {}, total pages: {}, total elements: {}", 
                         posts.getContent().size(), posts.getTotalPages(), posts.getTotalElements());
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            logger.error("Error in getAllPosts: {}", e.getMessage(), e);
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostDTO> getPost(@PathVariable Long postId) {
        PostDTO post = postService.getPostWithUserInfo(postId);
        if (post == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(post);
    }

    @PostMapping
    public ResponseEntity<PostDTO> createPost(@RequestBody PostRequest request) {
        try {
            Post post = new Post();
            post.setTitle(request.title);
            post.setContent(request.content);
            post.setMediaUrl(request.mediaUrl);
            
            // Try to get the authenticated user from SecurityContext first
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User user = null;
            
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getName().equals("anonymousUser")) {
                
                String userEmail = authentication.getName(); // This is the email from JWT
                logger.debug("Creating post for authenticated user: {}", userEmail);
                
                // Find user by email
                Optional<User> userOpt = userService.getUserByEmail(userEmail);
                if (userOpt.isPresent()) {
                    user = userOpt.get();
                    logger.debug("User found: {} (ID: {})", user.getFullName(), user.getId());
                }
            }
            
            // Fallback to userId from request if no authenticated user found
            if (user == null) {
                Long userId = request.userId != null ? request.userId : 1L;
                logger.debug("No authenticated user found, using userId from request: {}", userId);
                Optional<User> userOpt = userService.getUserById(userId);
                if (userOpt.isPresent()) {
                    user = userOpt.get();
                } else {
                    logger.error("User not found for ID: {}", userId);
                    return ResponseEntity.badRequest().build();
                }
            }
            
            post.setUser(user);
            post.setTags(request.tags);
            post.setCreatedAt(java.time.LocalDateTime.now());
            post.setUpdatedAt(java.time.LocalDateTime.now());
            Post createdPost = postService.createPost(post);
            
            // Send notification to admins about new post
            try {
                notificationService.createNewPostAdminNotification(createdPost, user);
                logger.debug("Admin notification sent for new post: {}", createdPost.getId());
            } catch (Exception e) {
                logger.error("Error sending admin notification for new post: {}", e.getMessage(), e);
                // Don't fail post creation if notification fails
            }
            
            PostDTO postDTO = postService.convertToDTO(createdPost);
            return ResponseEntity.created(URI.create("/api/posts/" + createdPost.getId())).body(postDTO);
        } catch (Exception e) {
            logger.error("Error creating post: {}", e.getMessage(), e);
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostDTO> updatePost(@PathVariable Long postId, @RequestBody PostRequest request) {
        Post post = postService.getPost(postId).orElse(null);
        if (post == null) return ResponseEntity.notFound().build();
        post.setTitle(request.title);
        post.setContent(request.content);
        post.setMediaUrl(request.mediaUrl);
        post.setTags(request.tags);
        post.setUpdatedAt(java.time.LocalDateTime.now());
        Post updatedPost = postService.createPost(post);
        PostDTO postDTO = postService.convertToDTO(updatedPost);
        return ResponseEntity.ok(postDTO);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<CommentDTO>> getCommentsForPost(@PathVariable Long postId) {
        Post post = postService.getPost(postId).orElse(null);
        if (post == null) return ResponseEntity.notFound().build();
        
        List<CommentDTO> commentDTOs = post.getComments().stream()
            .map(comment -> commentService.convertToDTO(comment))
            .collect(java.util.stream.Collectors.toList());
            
        return ResponseEntity.ok(commentDTOs);
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<CommentDTO> createComment(@PathVariable Long postId, @RequestBody CommentRequest request) {
        Post post = postService.getPost(postId).orElse(null);
        if (post == null) return ResponseEntity.notFound().build();
        
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User commenter = null;
        
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getName().equals("anonymousUser")) {
            
            String userEmail = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (userOpt.isPresent()) {
                commenter = userOpt.get();
            }
        }
        
        // Fallback to userId from request if no authenticated user found
        if (commenter == null) {
            Long userId = request.userId != null ? request.userId : 1L;
            Optional<User> userOpt = userService.getUserById(userId);
            if (userOpt.isPresent()) {
                commenter = userOpt.get();
            } else {
                return ResponseEntity.badRequest().build();
            }
        }
        
        Comment comment = new Comment();
        comment.setText(request.text);
        comment.setUser(commenter);
        comment.setPost(post);
        comment.setCreatedAt(java.time.LocalDateTime.now());
        comment.setUpdatedAt(java.time.LocalDateTime.now());
        
        Comment createdComment = commentService.createComment(comment);
        
        // Send notification to post owner about new comment
        try {
            notificationService.createPostCommentNotification(post, createdComment, commenter);
            logger.debug("Comment notification sent for post: {}", postId);
        } catch (Exception e) {
            logger.warn("Error sending comment notification: {}", e.getMessage());
            // Don't fail comment creation if notification fails
        }
        
        CommentDTO commentDTO = commentService.convertToDTO(createdComment);
        return ResponseEntity.created(URI.create("/api/posts/" + postId + "/comments/" + createdComment.getId())).body(commentDTO);
    }

    @GetMapping("/comments/{commentId}/replies")
    public ResponseEntity<List<ReplyDTO>> getRepliesForComment(@PathVariable Long commentId) {
        Comment comment = commentService.getComment(commentId).orElse(null);
        if (comment == null) return ResponseEntity.notFound().build();
        
        List<ReplyDTO> replyDTOs = comment.getReplies().stream()
            .map(reply -> replyService.convertToDTO(reply))
            .collect(java.util.stream.Collectors.toList());
            
        return ResponseEntity.ok(replyDTOs);
    }

    @PostMapping("/comments/{commentId}/replies")
    public ResponseEntity<ReplyDTO> createReply(@PathVariable Long commentId, @RequestBody ReplyRequest request) {
        Comment comment = commentService.getComment(commentId).orElse(null);
        if (comment == null) return ResponseEntity.notFound().build();
        
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User replier = null;
        
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getName().equals("anonymousUser")) {
            
            String userEmail = authentication.getName();
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (userOpt.isPresent()) {
                replier = userOpt.get();
            }
        }
        
        // Fallback to userId from request if no authenticated user found
        if (replier == null) {
            Long userId = request.userId != null ? request.userId : 1L;
            Optional<User> userOpt = userService.getUserById(userId);
            if (userOpt.isPresent()) {
                replier = userOpt.get();
            } else {
                return ResponseEntity.badRequest().build();
            }
        }
        
        Reply reply = new Reply();
        reply.setText(request.text);
        reply.setUser(replier);
        reply.setComment(comment);
        reply.setCreatedAt(java.time.LocalDateTime.now());
        reply.setUpdatedAt(java.time.LocalDateTime.now());
        
        Reply createdReply = replyService.createReply(reply);
        
        // Send notification to comment owner about new reply
        try {
            notificationService.createCommentReplyNotification(comment, createdReply, replier);
            logger.debug("Reply notification sent for comment: {}", commentId);
        } catch (Exception e) {
            logger.warn("Error sending reply notification: {}", e.getMessage());
            // Don't fail reply creation if notification fails
        }
        
        ReplyDTO replyDTO = replyService.convertToDTO(createdReply);
        return ResponseEntity.created(URI.create("/api/posts/comments/" + commentId + "/replies/" + createdReply.getId())).body(replyDTO);
    }

    @GetMapping("/{postId}/votes")
    public ResponseEntity<List<Vote>> getVotesForPost(@PathVariable Long postId) {
        Post post = postService.getPost(postId).orElse(null);
        if (post == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(post.getVotes());
    }

    @GetMapping("/{postId}/votes/counts")
    public ResponseEntity<Map<String, Object>> getVoteCountsForPost(@PathVariable Long postId) {
        Post post = postService.getPost(postId).orElse(null);
        if (post == null) return ResponseEntity.notFound().build();
        
        Map<String, Object> voteCounts = new HashMap<>();
        voteCounts.put("upvotes", post.getUpvotes());
        voteCounts.put("downvotes", post.getDownvotes());
        
        return ResponseEntity.ok(voteCounts);
    }

    @PostMapping("/{postId}/vote")
    public ResponseEntity<Vote> createOrUpdateVote(@PathVariable Long postId, @RequestBody VoteRequest request) {
        Post post = postService.getPost(postId).orElse(null);
        if (post == null) return ResponseEntity.notFound().build();
        
        // Extract user ID from JWT token instead of relying on request body
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;
        
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getName().equals("anonymousUser")) {
            
            String userEmail = authentication.getName(); // This is the email from JWT
            
            // Find user by email
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (userOpt.isPresent()) {
                userId = userOpt.get().getId();
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Check if user already voted on this post
        Vote existingVote = voteService.findByPostIdAndUserId(postId, userId);
        
        if (existingVote != null) {
            if (existingVote.getVoteType().equals(request.voteType)) {
                // Same vote type clicked - remove the vote
                voteService.deleteVote(existingVote.getId());
                return ResponseEntity.noContent().build();
            } else {
                // Different vote type - update existing vote
                existingVote.setVoteType(request.voteType);
                existingVote.setUpdatedAt(java.time.LocalDateTime.now());
                Vote updatedVote = voteService.createVote(existingVote);
                return ResponseEntity.ok(updatedVote);
            }
        } else {
            // Create new vote
            Vote vote = new Vote();
            vote.setUserId(userId);
            vote.setPost(post);
            vote.setVoteType(request.voteType);
            vote.setCreatedAt(java.time.LocalDateTime.now());
            vote.setUpdatedAt(java.time.LocalDateTime.now());
            
            Vote createdVote = voteService.createVote(vote);
            return ResponseEntity.created(URI.create("/api/posts/" + postId + "/votes/" + createdVote.getId())).body(createdVote);
        }
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long commentId, @RequestBody CommentRequest request) {
        Comment comment = commentService.getComment(commentId).orElse(null);
        if (comment == null) return ResponseEntity.notFound().build();
        comment.setText(request.getText());
        return ResponseEntity.ok(commentService.createComment(comment));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/comments/{commentId}/replies/{replyId}")
    public ResponseEntity<Reply> updateReply(@PathVariable Long commentId, @PathVariable Long replyId, @RequestBody ReplyRequest request) {
        Reply reply = replyService.getReply(replyId).orElse(null);
        if (reply == null) return ResponseEntity.notFound().build();
        reply.setText(request.getText());
        return ResponseEntity.ok(replyService.createReply(reply));
    }

    @DeleteMapping("/comments/{commentId}/replies/{replyId}")
    public ResponseEntity<Void> deleteReply(@PathVariable Long commentId, @PathVariable Long replyId) {
        replyService.deleteReply(replyId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{postId}/votes/{voteId}")
    public ResponseEntity<Void> deleteVote(@PathVariable Long postId, @PathVariable Long voteId) {
        voteService.deleteVote(voteId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{postId}/votes/user")
    public ResponseEntity<Vote> getCurrentUserVoteForPost(@PathVariable Long postId) {
        Post post = postService.getPost(postId).orElse(null);
        if (post == null) return ResponseEntity.notFound().build();
        
        // Extract user ID from JWT token
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;
        
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getName().equals("anonymousUser")) {
            
            String userEmail = authentication.getName(); // This is the email from JWT
            
            // Find user by email
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (userOpt.isPresent()) {
                userId = userOpt.get().getId();
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        return voteService.getUserVoteForPost(postId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ========== SAVED POSTS ENDPOINTS ==========

    @PostMapping("/{postId}/save")
    public ResponseEntity<?> savePost(@PathVariable Long postId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("success", false, "message", "User not authenticated"));
            }
            User user = userOpt.get();
            
            Post post = postService.getPost(postId).orElse(null);
            if (post == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(java.util.Map.of("success", false, "message", "Post not found"));
            }
            
            // Check if already saved
            if (savedPostRepository.existsByUserAndPost(user, post)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of("success", false, "message", "Post already saved"));
            }
            
            // Save the post
            SavedPost savedPost = new SavedPost(user, post);
            savedPostRepository.save(savedPost);
            
            return ResponseEntity.ok(java.util.Map.of(
                "success", true, 
                "message", "Post saved successfully",
                "savedAt", savedPost.getSavedAt()
            ));
            
        } catch (Exception e) {
            logger.error("Error saving post: {}", e.getMessage(), e);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Map.of("success", false, "message", "Failed to save post"));
        }
    }

    @DeleteMapping("/{postId}/save")
    public ResponseEntity<?> unsavePost(@PathVariable Long postId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("success", false, "message", "User not authenticated"));
            }
            User user = userOpt.get();
            
            Post post = postService.getPost(postId).orElse(null);
            if (post == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(java.util.Map.of("success", false, "message", "Post not found"));
            }
            
            // Check if the post is saved
            Optional<SavedPost> savedPost = savedPostRepository.findByUserAndPost(user, post);
            if (savedPost.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(java.util.Map.of("success", false, "message", "Post is not saved"));
            }
            
            // Remove the saved post
            savedPostRepository.delete(savedPost.get());
            
            return ResponseEntity.ok(java.util.Map.of(
                "success", true, 
                "message", "Post unsaved successfully"
            ));
            
        } catch (Exception e) {
            logger.error("Error unsaving post: {}", e.getMessage(), e);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Map.of("success", false, "message", "Failed to unsave post"));
        }
    }

    @GetMapping("/saved")
    public ResponseEntity<?> getSavedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            
            Optional<User> userOpt = userService.getUserByEmail(userEmail);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("success", false, "message", "User not authenticated"));
            }
            User user = userOpt.get();
            
            Pageable pageable = PageRequest.of(page, size, Sort.Direction.DESC, "savedAt");
            Page<Post> savedPosts = savedPostRepository.findPostsByUserIdOrderBySavedAtDesc(user.getId(), pageable);
            
            // Convert to DTOs with proper formatting
            Page<PostDTO> savedPostDTOs = savedPosts.map(post -> {
                PostDTO dto = postService.convertToDTO(post);
                dto.setSaved(true); // Mark as saved since these are saved posts
                return dto;
            });
            
            return ResponseEntity.ok(java.util.Map.of(
                "success", true,
                "posts", savedPostDTOs.getContent(),
                "totalElements", savedPostDTOs.getTotalElements(),
                "totalPages", savedPostDTOs.getTotalPages(),
                "currentPage", savedPostDTOs.getNumber(),
                "hasNext", savedPostDTOs.hasNext(),
                "hasPrevious", savedPostDTOs.hasPrevious()
            ));
            
        } catch (Exception e) {
            logger.error("Error getting saved posts: {}", e.getMessage(), e);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Map.of("success", false, "message", "Failed to get saved posts"));
        }
    }
}
