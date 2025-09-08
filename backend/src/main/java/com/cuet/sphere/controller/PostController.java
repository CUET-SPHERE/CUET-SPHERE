package com.cuet.sphere.controller;

import com.cuet.sphere.model.Comment;
import com.cuet.sphere.model.Post;
import com.cuet.sphere.model.Reply;
import com.cuet.sphere.model.Vote;
import com.cuet.sphere.response.CommentRequest;
import com.cuet.sphere.response.PostRequest;
import com.cuet.sphere.response.ReplyRequest;
import com.cuet.sphere.service.CommentService;
import com.cuet.sphere.service.PostService;
import com.cuet.sphere.service.ReplyService;
import com.cuet.sphere.service.VoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final CommentService commentService;
    private final ReplyService replyService;
    private final VoteService voteService;

    public PostController(PostService postService, CommentService commentService, ReplyService replyService, VoteService voteService) {
        this.postService = postService;
        this.commentService = commentService;
        this.replyService = replyService;
        this.voteService = voteService;
    }

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<Post> getPost(@PathVariable Long postId) {
        Post post = postService.getPost(postId).orElse(null);
        if (post == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(post);
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody PostRequest request) {
        Post post = new Post();
        post.setTitle(request.title);
        post.setContent(request.content);
        post.setMediaUrl(request.mediaUrl);
        post.setUserId(request.userId != null ? request.userId : 1L); // Default to user ID 1 if not provided
        post.setTags(request.tags);
        post.setCreatedAt(java.time.LocalDateTime.now());
        post.setUpdatedAt(java.time.LocalDateTime.now());
        Post createdPost = postService.createPost(post);
        return ResponseEntity.created(URI.create("/api/posts/" + createdPost.getId())).body(createdPost);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<Post> updatePost(@PathVariable Long postId, @RequestBody PostRequest request) {
        Post post = postService.getPost(postId).orElse(null);
        if (post == null) return ResponseEntity.notFound().build();
        post.setTitle(request.title);
        post.setContent(request.content);
        post.setMediaUrl(request.mediaUrl);
        post.setTags(request.tags);
        post.setUpdatedAt(java.time.LocalDateTime.now());
        return ResponseEntity.ok(postService.createPost(post));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<Comment>> getCommentsForPost(@PathVariable Long postId) {
        Post post = postService.getPost(postId).orElse(null);
        if (post == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(post.getComments());
    }

    @GetMapping("/comments/{commentId}/replies")
    public ResponseEntity<List<Reply>> getRepliesForComment(@PathVariable Long commentId) {
        Comment comment = commentService.getComment(commentId).orElse(null);
        if (comment == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(comment.getReplies());
    }

    @GetMapping("/{postId}/votes")
    public ResponseEntity<List<Vote>> getVotesForPost(@PathVariable Long postId) {
        Post post = postService.getPost(postId).orElse(null);
        if (post == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(post.getVotes());
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
}
