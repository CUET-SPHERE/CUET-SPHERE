package com.cuet.sphere.response;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseRequest {
    @NotBlank(message = "Course code is required")
    private String courseCode;
    
    @NotBlank(message = "Course name is required")
    private String courseName;
    
    @NotBlank(message = "Department code is required")
    private String department;
    
    private String semesterName;
    
    private Long semesterId;

    private String batch;
}