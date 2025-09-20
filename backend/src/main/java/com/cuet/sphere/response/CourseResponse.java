package com.cuet.sphere.response;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseResponse {
    private Long id;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String department;
    private String departmentName;
    private String semesterName;
    private Long semesterId;
    
    // Alias methods to handle multiple naming conventions
    public Long getCourseId() {
        return courseId != null ? courseId : id;
    }
    
    public void setCourseId(Long courseId) {
        this.courseId = courseId;
        if (this.id == null) {
            this.id = courseId;
        }
    }
    
    public String getDepartmentName() {
        return departmentName != null ? departmentName : department;
    }
    
    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
        if (this.department == null) {
            this.department = departmentName;
        }
    }
}