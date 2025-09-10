package com.cuet.sphere.repository;

import com.cuet.sphere.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    Vote findByPost_IdAndUserId(Long postId, Long userId);
}

