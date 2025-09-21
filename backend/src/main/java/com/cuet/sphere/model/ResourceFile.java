package com.cuet.sphere.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "fileId") // Correct for JPA entities: base on ID only
@Table(name = "resource_files")
public class ResourceFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id")
    private Long fileId;
    
    @Column(name = "file_name", nullable = false)
    private String fileName;
    
    @Column(name = "file_path", nullable = false, columnDefinition = "TEXT")
    private String filePath;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "file_type")
    private String fileType;
    
    @Column(name = "upload_order")
    private Integer uploadOrder = 0;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    // Direct resource ID field - no JPA relationship to avoid orphan deletion issues
    @Column(name = "resource_id", nullable = false)
    private Long resourceId;
    
    // Helper method to extract file extension
    public String getFileExtension() {
        if (fileName != null && fileName.contains(".")) {
            return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        }
        return "";
    }
    
    // Helper method to format file size
    public String getFormattedFileSize() {
        if (fileSize == null || fileSize == 0) {
            return "Unknown size";
        }
        
        double size = fileSize.doubleValue();
        String[] units = {"B", "KB", "MB", "GB"};
        int unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return String.format("%.1f %s", size, units[unitIndex]);
    }
}