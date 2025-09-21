package com.cuet.sphere.response;

import com.cuet.sphere.model.Resource.ResourceType;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
public class ResourceResponse {
    private Long resourceId;
    private String batch;
    private ResourceType resourceType;
    private String title;
    private String filePath; // Keep for backward compatibility
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // New folder-related fields
    private Boolean isFolder = false;
    private Integer fileCount = 0;
    private List<ResourceFileResponse> files = new ArrayList<>();
    
    // Uploader information
    private String uploaderName;
    private String uploaderEmail;
    private String uploaderStudentId;
    private String uploaderProfilePicture;
    
    // Course information
    private String courseCode;
    private String courseName;
    private String departmentName;
    
    // Semester information
    private String semesterName;
}
