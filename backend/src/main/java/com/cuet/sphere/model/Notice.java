package com.cuet.sphere.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "notices")
public class Notice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id")
    private Long noticeId;
    
    @Column(name = "N_department", nullable = false)
    private String department;
    
    @Column(name = "N_batch", nullable = false)
    private String batch;
    
    @Column(name = "N_title", nullable = false)
    private String title;
    
    @Column(name = "N_message", nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "N_attachment")
    private String attachment;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "N_notice_type")
    private NoticeType noticeType;
    
    @CreationTimestamp
    @Column(name = "N_created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "N_updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    public enum NoticeType {
        GENERAL, URGENT, ACADEMIC, EVENT
    }
} 