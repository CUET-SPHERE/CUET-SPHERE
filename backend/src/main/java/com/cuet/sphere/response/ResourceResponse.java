package com.cuet.sphere.response;

import com.cuet.sphere.model.Resource.ResourceType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ResourceResponse {
    private Long resourceId;
    private String batch;
    private ResourceType resourceType;
    private String title;
    private String filePath;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Uploader information
    private String uploaderName;
    private String uploaderEmail;
    private String uploaderStudentId;
    
    // Course information
    private String courseCode;
    private String courseName;
    private String departmentName;
    
    // Semester information
    private String semesterName;
}
