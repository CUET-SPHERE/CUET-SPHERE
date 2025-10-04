package com.cuet.sphere.repository;

import com.cuet.sphere.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // Paginated query with only user info (no comments to avoid N+1)
    // Don't use FETCH in paginated queries to avoid pagination issues
    @Query("""
        SELECT p FROM Post p 
        ORDER BY p.createdAt DESC
        """)
    Page<Post> findAllWithUserOnlyPaginated(Pageable pageable);
    
    // Paginated query - simple query without FETCH to avoid pagination issues
    @Query(value = """
        SELECT p FROM Post p 
        ORDER BY p.createdAt DESC
        """,
        countQuery = "SELECT COUNT(p) FROM Post p")
    Page<Post> findAllWithUserAndCommentsPaginated(Pageable pageable);
    
    // Count query for pagination
    @Query("SELECT COUNT(p) FROM Post p")
    long countAllPosts();
    
    // Simple ordering by creation date (newest first)
    @Query("""
        SELECT DISTINCT p FROM Post p 
        LEFT JOIN FETCH p.user 
        LEFT JOIN FETCH p.comments c 
        LEFT JOIN FETCH c.user 
        LEFT JOIN FETCH c.replies r 
        LEFT JOIN FETCH r.user 
        ORDER BY p.createdAt DESC
        """)
    List<Post> findAllWithUserAndCommentsOrderedByDate();
    
    // Alternative: Get posts ordered by creation date without complex joins
    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    List<Post> findAllOrderedByDateSimple();
    
    @Query("""
        SELECT p FROM Post p 
        LEFT JOIN FETCH p.user 
        LEFT JOIN FETCH p.comments c 
        LEFT JOIN FETCH c.user 
        LEFT JOIN FETCH c.replies r 
        LEFT JOIN FETCH r.user 
        WHERE p.id = :id
        """)
    Optional<Post> findByIdWithUserAndComments(Long id);
}

