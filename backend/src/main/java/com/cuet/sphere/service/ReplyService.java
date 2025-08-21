package com.cuet.sphere.service;

import com.cuet.sphere.model.Reply;
import com.cuet.sphere.repository.ReplyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ReplyService {
    @Autowired
    private ReplyRepository replyRepository;

    public Optional<Reply> getReply(Long id) {
        return replyRepository.findById(id);
    }

    public Reply createReply(Reply reply) {
        return replyRepository.save(reply);
    }

    public void deleteReply(Long id) {
        replyRepository.deleteById(id);
    }
}

