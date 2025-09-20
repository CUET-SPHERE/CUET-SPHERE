package com.cuet.sphere.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CurrentSemesterRequest {
    
    @NotBlank(message = "Semester name is required")
    private String semesterName;
    
    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Batch is required")
    private String batch;
    
    private Boolean isActive = false;
}