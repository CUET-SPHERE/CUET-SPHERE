package com.cuet.sphere.controller;

import com.cuet.sphere.model.Course;
import com.cuet.sphere.model.User;
import com.cuet.sphere.response.CourseBatchRequest;
import com.cuet.sphere.response.CourseRequest;
import com.cuet.sphere.response.CourseResponse;
import com.cuet.sphere.response.CourseBatchResponse;
import com.cuet.sphere.service.CourseService;
import com.cuet.sphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {
    
    private static final Logger logger = LoggerFactory.getLogger(CourseController.class);
    
    @Autowired
    private CourseService courseService;
    
    @Autowired
    private UserRepository userRepository;
    
    // Create a new course (CR only)
    @PostMapping
    public ResponseEntity<?> createCourse(@Valid @RequestBody CourseRequest courseRequest) {
        try {
            logger.info("Creating course with code: {}", courseRequest.getCourseCode());
            User currentUser = getCurrentUser();
            
            // Check if user is CR
            if (!currentUser.isCR()) {
                logger.error("Non-CR user attempted to create course: {}", currentUser.getEmail());
                Map<String, String> error = new HashMap<>();
                error.put("error", "Only CR users can create courses");
                return ResponseEntity.status(403).body(error);
            }
            
            CourseResponse course = courseService.createCourse(courseRequest);
            logger.info("Course created successfully with ID: {}", course.getCourseId());
            return ResponseEntity.ok(course);
        } catch (Exception e) {
            logger.error("Unexpected error while creating course: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Get courses by department and semester
    @GetMapping("/department/{departmentCode}/semester/{semesterName}")
    public ResponseEntity<?> getCoursesByDepartmentAndSemester(
            @PathVariable String departmentCode, 
            @PathVariable String semesterName) {
        try {
            logger.info("Fetching courses for department: {} and semester: {}", departmentCode, semesterName);
            List<CourseResponse> courses = courseService.getCoursesByDepartmentAndSemester(departmentCode, semesterName);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.error("Error fetching courses: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Create multiple courses in one request (CR only)
    @PostMapping("/batch")
    public ResponseEntity<?> createCoursesBatch(@Valid @RequestBody CourseBatchRequest batchRequest) {
        try {
            logger.info("Creating batch of {} courses", batchRequest.getCourses().size());
            logger.info("Batch request semesterName: {}, semesterId: {}", 
                       batchRequest.getSemesterName(), batchRequest.getSemesterId());
            
            User currentUser = getCurrentUser();
            
            // Check if user is CR
            if (!currentUser.isCR()) {
                logger.error("Non-CR user attempted to create courses: {}", currentUser.getEmail());
                Map<String, String> error = new HashMap<>();
                error.put("error", "Only CR users can create courses");
                return ResponseEntity.status(403).body(error);
            }
            
            // Log the initial state of course requests
            for (int i = 0; i < batchRequest.getCourses().size(); i++) {
                CourseRequest req = batchRequest.getCourses().get(i);
                logger.info("Initial course[{}]: code={}, name={}, semesterName={}, semesterId={}", 
                          i, req.getCourseCode(), req.getCourseName(), req.getSemesterName(), req.getSemesterId());
            }
            
            // Apply semester info from batch to individual courses if not specified
            if (batchRequest.getSemesterId() != null) {
                logger.info("Applying batch semesterId {} to courses", batchRequest.getSemesterId());
                batchRequest.getCourses().forEach(course -> {
                    if (course.getSemesterId() == null) {
                        course.setSemesterId(batchRequest.getSemesterId());
                        logger.info("Updated course {} semesterId to {}", 
                                  course.getCourseCode(), batchRequest.getSemesterId());
                    }
                });
            }
            else if (batchRequest.getSemesterName() != null) {
                logger.info("Applying batch semesterName {} to courses", batchRequest.getSemesterName());
                batchRequest.getCourses().forEach(course -> {
                    if (course.getSemesterName() == null) {
                        course.setSemesterName(batchRequest.getSemesterName());
                        logger.info("Updated course {} semesterName to {}", 
                                  course.getCourseCode(), batchRequest.getSemesterName());
                    }
                });
            }
            
            // Log the final state of course requests before sending to service
            for (int i = 0; i < batchRequest.getCourses().size(); i++) {
                CourseRequest req = batchRequest.getCourses().get(i);
                logger.info("Final course[{}]: code={}, name={}, semesterName={}, semesterId={}", 
                          i, req.getCourseCode(), req.getCourseName(), req.getSemesterName(), req.getSemesterId());
            }
            
            CourseBatchResponse batchResponse = courseService.createCoursesBatch(batchRequest.getCourses());
            
            // Log the created courses
            for (int i = 0; i < batchResponse.getCreatedCourses().size(); i++) {
                CourseResponse resp = batchResponse.getCreatedCourses().get(i);
                logger.info("Created course[{}]: id={}, code={}, name={}, semesterName={}, semesterId={}", 
                          i, resp.getCourseId(), resp.getCourseCode(), resp.getCourseName(), 
                          resp.getSemesterName(), resp.getSemesterId());
            }
            
            // Log any skipped courses
            for (int i = 0; i < batchResponse.getSkippedCourses().size(); i++) {
                CourseBatchResponse.SkippedCourse skipped = batchResponse.getSkippedCourses().get(i);
                logger.info("Skipped course[{}]: code={}, name={}, reason={}", 
                          i, skipped.getCourseCode(), skipped.getCourseName(), skipped.getReason());
            }
            
            logger.info("Batch operation completed - Created: {}, Skipped: {}", 
                       batchResponse.getCreatedCourses().size(), batchResponse.getSkippedCourses().size());
            
            // Return appropriate response based on results
            if (batchResponse.getCreatedCourses().isEmpty() && !batchResponse.getSkippedCourses().isEmpty()) {
                // All courses were skipped - return error with details
                Map<String, Object> error = new HashMap<>();
                error.put("error", batchResponse.getMessage());
                error.put("skippedCourses", batchResponse.getSkippedCourses());
                return ResponseEntity.status(400).body(error);
            }
            
            return ResponseEntity.ok(batchResponse);
        } catch (Exception e) {
            logger.error("Unexpected error while creating courses batch: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Edit a course (CR only)
    @PutMapping("/{courseId}")
    public ResponseEntity<?> updateCourse(@PathVariable Long courseId, @Valid @RequestBody CourseRequest courseRequest) {
        try {
            logger.info("Updating course with ID: {}", courseId);
            User currentUser = getCurrentUser();
            
            // Check if user is CR
            if (!currentUser.isCR()) {
                logger.error("Non-CR user attempted to update course: {}", currentUser.getEmail());
                Map<String, String> error = new HashMap<>();
                error.put("error", "Only CR users can update courses");
                return ResponseEntity.status(403).body(error);
            }
            
            CourseResponse course = courseService.updateCourse(courseId, courseRequest, currentUser.getDepartment());
            logger.info("Course updated successfully with ID: {}", course.getCourseId());
            return ResponseEntity.ok(course);
        } catch (Exception e) {
            logger.error("Error updating course: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Edit a course by course code (CR only) 
    @PutMapping("/code/{courseCode}")
    public ResponseEntity<?> updateCourseByCode(@PathVariable String courseCode, @Valid @RequestBody CourseRequest courseRequest) {
        try {
            logger.info("Updating course with code: {}", courseCode);
            User currentUser = getCurrentUser();
            
            // Check if user is CR
            if (!currentUser.isCR()) {
                logger.error("Non-CR user attempted to update course: {}", currentUser.getEmail());
                Map<String, String> error = new HashMap<>();
                error.put("error", "Only CR users can update courses");
                return ResponseEntity.status(403).body(error);
            }
            
            CourseResponse course = courseService.updateCourseByCode(courseCode, courseRequest, currentUser.getDepartment());
            logger.info("Course updated successfully with code: {}", courseCode);
            return ResponseEntity.ok(course);
        } catch (Exception e) {
            logger.error("Error updating course: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Delete a course by course code and department (CR only)
    @DeleteMapping("/code/{courseCode}")
    public ResponseEntity<?> deleteCourseByCode(@PathVariable String courseCode) {
        try {
            logger.info("Deleting course with code: {}", courseCode);
            User currentUser = getCurrentUser();
            
            // Check if user is CR
            if (!currentUser.isCR()) {
                logger.error("Non-CR user attempted to delete course: {}", currentUser.getEmail());
                Map<String, String> error = new HashMap<>();
                error.put("error", "Only CR users can delete courses");
                return ResponseEntity.status(403).body(error);
            }
            
            courseService.deleteCourseByCode(courseCode, currentUser.getDepartment());
            logger.info("Course deleted successfully by code");
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Course deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error deleting course by code: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Helper method to get current authenticated user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            User user = userRepository.findUserByEmail(email);
            if (user != null) {
                return user;
            }
        }
        throw new RuntimeException("User not authenticated");
    }
}