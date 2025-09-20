package com.cuet.sphere.response;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CourseBatchRequest {
    @NotEmpty(message = "At least one course must be provided")
    @Valid
    private List<CourseRequest> courses;
    
    private String semesterName;
    
    private Long semesterId;
}