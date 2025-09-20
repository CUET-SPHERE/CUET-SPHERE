package com.cuet.sphere.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CurrentSemesterResponse {
    private String id;  // Changed to String since batch is now the primary key
    private String semesterName;
    private String department;
    private String batch;
    private Boolean isActive;
    private List<CourseResponse> courses;
}