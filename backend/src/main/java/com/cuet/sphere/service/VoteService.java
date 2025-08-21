package com.cuet.sphere.service;

import com.cuet.sphere.model.Vote;
import com.cuet.sphere.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class VoteService {
    @Autowired
    private VoteRepository voteRepository;

    public Optional<Vote> getVote(Long id) {
        return voteRepository.findById(id);
    }

    public Vote createVote(Vote vote) {
        return voteRepository.save(vote);
    }

    public void deleteVote(Long id) {
        voteRepository.deleteById(id);
    }
}

