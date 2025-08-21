package com.cuet.sphere.repository;

import com.cuet.sphere.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
}

