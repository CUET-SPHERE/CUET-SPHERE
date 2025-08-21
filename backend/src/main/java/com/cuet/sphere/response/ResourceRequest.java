package com.cuet.sphere.response;

import com.cuet.sphere.model.Resource.ResourceType;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class ResourceRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "File path (Google Drive link) is required")
    private String filePath;
    
    private String description;
    
    @NotNull(message = "Resource type is required")
    private ResourceType resourceType;
    
    @NotBlank(message = "Course code is required")
    private String courseCode;
    
    @NotBlank(message = "Semester name is required")
    private String semesterName;
}
