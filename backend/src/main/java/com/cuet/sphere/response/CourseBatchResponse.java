package com.cuet.sphere.response;

import java.util.List;

public class CourseBatchResponse {
    private List<CourseResponse> createdCourses;
    private List<SkippedCourse> skippedCourses;
    private String message;
    
    public CourseBatchResponse() {}
    
    public CourseBatchResponse(List<CourseResponse> createdCourses, List<SkippedCourse> skippedCourses) {
        this.createdCourses = createdCourses;
        this.skippedCourses = skippedCourses;
        this.message = generateMessage();
    }
    
    public List<CourseResponse> getCreatedCourses() {
        return createdCourses;
    }
    
    public void setCreatedCourses(List<CourseResponse> createdCourses) {
        this.createdCourses = createdCourses;
        this.message = generateMessage();
    }
    
    public List<SkippedCourse> getSkippedCourses() {
        return skippedCourses;
    }
    
    public void setSkippedCourses(List<SkippedCourse> skippedCourses) {
        this.skippedCourses = skippedCourses;
        this.message = generateMessage();
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    private String generateMessage() {
        int created = createdCourses != null ? createdCourses.size() : 0;
        int skipped = skippedCourses != null ? skippedCourses.size() : 0;
        
        if (created > 0 && skipped > 0) {
            return String.format("Successfully created %d course(s). %d course(s) were skipped (already exist).", created, skipped);
        } else if (created > 0) {
            return String.format("Successfully created %d course(s).", created);
        } else if (skipped > 0) {
            return String.format("No courses were created. %d course(s) already exist.", skipped);
        } else {
            return "No courses to process.";
        }
    }
    
    public static class SkippedCourse {
        private String courseCode;
        private String courseName;
        private String reason;
        
        public SkippedCourse() {}
        
        public SkippedCourse(String courseCode, String courseName, String reason) {
            this.courseCode = courseCode;
            this.courseName = courseName;
            this.reason = reason;
        }
        
        public String getCourseCode() {
            return courseCode;
        }
        
        public void setCourseCode(String courseCode) {
            this.courseCode = courseCode;
        }
        
        public String getCourseName() {
            return courseName;
        }
        
        public void setCourseName(String courseName) {
            this.courseName = courseName;
        }
        
        public String getReason() {
            return reason;
        }
        
        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}