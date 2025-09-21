package com.cuet.sphere.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "resourceId") // Correct for JPA entities: base on ID only
@Table(name = "resources")
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Long resourceId;
    
    @Column(name = "r_batch", nullable = false)
    private String batch;
    
    @Column(name = "r_resource_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ResourceType resourceType;
    
    @Column(name = "r_title", nullable = false)
    private String title;
    
    @Column(name = "r_file_path", nullable = true) // Made nullable for backward compatibility
    private String filePath; // This will store the Google Drive link for single files
    
    @Column(name = "r_description")
    private String description;
    
    @Column(name = "is_folder")
    private Boolean isFolder = false;
    
    @Column(name = "file_count")
    private Integer fileCount = 0;
    
    @CreationTimestamp
    @Column(name = "r_created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "r_updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;
    
    public enum ResourceType {
        LECTURE_NOTE,
        ASSIGNMENT,
        LAB_MANUAL,
        BOOK,
        PRESENTATION,
        QUESTION_PAPER,
        SOLUTION,
        OTHER
    }
    
    // Method to get the primary file path for backward compatibility
    public String getPrimaryFilePath() {
        return filePath; // Just return the legacy filePath field
    }
}
