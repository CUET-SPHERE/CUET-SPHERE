package com.cuet.sphere.repository;

import com.cuet.sphere.model.SavedPost;
import com.cuet.sphere.model.User;
import com.cuet.sphere.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {
    
    /**
     * Check if a user has saved a specific post
     */
    boolean existsByUserAndPost(User user, Post post);
    
    /**
     * Check if a user has saved a post by IDs
     */
    @Query("SELECT CASE WHEN COUNT(sp) > 0 THEN true ELSE false END FROM SavedPost sp WHERE sp.user.id = :userId AND sp.post.id = :postId")
    boolean existsByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);
    
    /**
     * Find saved post by user and post
     */
    Optional<SavedPost> findByUserAndPost(User user, Post post);
    
    /**
     * Find saved post by user ID and post ID
     */
    @Query("SELECT sp FROM SavedPost sp WHERE sp.user.id = :userId AND sp.post.id = :postId")
    Optional<SavedPost> findByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);
    
    /**
     * Get all posts saved by a user (paginated)
     */
    @Query("SELECT sp FROM SavedPost sp WHERE sp.user.id = :userId ORDER BY sp.savedAt DESC")
    Page<SavedPost> findByUserIdOrderBySavedAtDesc(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Get all posts saved by a user (list)
     */
    @Query("SELECT sp FROM SavedPost sp WHERE sp.user.id = :userId ORDER BY sp.savedAt DESC")
    List<SavedPost> findByUserIdOrderBySavedAtDesc(@Param("userId") Long userId);
    
    /**
     * Get the actual Post entities saved by a user (paginated)
     */
    @Query("SELECT sp.post FROM SavedPost sp WHERE sp.user.id = :userId ORDER BY sp.savedAt DESC")
    Page<Post> findPostsByUserIdOrderBySavedAtDesc(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Get the actual Post entities saved by a user (list)
     */
    @Query("SELECT sp.post FROM SavedPost sp WHERE sp.user.id = :userId ORDER BY sp.savedAt DESC")
    List<Post> findPostsByUserIdOrderBySavedAtDesc(@Param("userId") Long userId);
    
    /**
     * Count total saved posts by a user
     */
    long countByUserId(Long userId);
    
    /**
     * Count how many users have saved a specific post
     */
    long countByPostId(Long postId);
    
    /**
     * Delete saved post by user and post
     */
    void deleteByUserAndPost(User user, Post post);
    
    /**
     * Delete all saved post records for a specific post (when post is deleted)
     */
    void deleteByPost(Post post);
    
    /**
     * Delete saved post by user ID and post ID
     */
    @Query("DELETE FROM SavedPost sp WHERE sp.user.id = :userId AND sp.post.id = :postId")
    void deleteByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);
    
    /**
     * Get post IDs that are saved by a specific user
     * Useful for checking which posts are saved when displaying a list
     */
    @Query("SELECT sp.post.id FROM SavedPost sp WHERE sp.user.id = :userId")
    Set<Long> findPostIdsByUserId(@Param("userId") Long userId);
    
    /**
     * Batch check if multiple posts are saved by a user
     */
    @Query("SELECT sp.post.id FROM SavedPost sp WHERE sp.user.id = :userId AND sp.post.id IN :postIds")
    Set<Long> findSavedPostIdsByUserIdAndPostIds(@Param("userId") Long userId, @Param("postIds") List<Long> postIds);
}