package com.cuet.sphere.repository;

import com.cuet.sphere.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
}

