package com.cuet.sphere.service;

import com.cuet.sphere.model.Course;
import com.cuet.sphere.model.Department;
import com.cuet.sphere.model.Semester;
import com.cuet.sphere.repository.CourseRepository;
import com.cuet.sphere.repository.DepartmentRepository;
import com.cuet.sphere.repository.SemesterRepository;

import java.util.Optional;
import com.cuet.sphere.response.CourseRequest;
import com.cuet.sphere.response.CourseResponse;
import com.cuet.sphere.response.CourseBatchResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {
    
    private static final Logger logger = LoggerFactory.getLogger(CourseService.class);
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private SemesterRepository semesterRepository;
    
    /**
     * Create a new course
     */
    public CourseResponse createCourse(CourseRequest courseRequest) {
        logger.info("Creating course: code={}, name={}, department={}, semesterId={}, semesterName={}", 
                   courseRequest.getCourseCode(), courseRequest.getCourseName(), 
                   courseRequest.getDepartment(), courseRequest.getSemesterId(), courseRequest.getSemesterName());
        
        // Find department by code
        Department department = getDepartmentByCode(courseRequest.getDepartment());
        logger.info("Found department: {}", department.getDeptName());
        
        // Check if course with same code already exists
        Course existingCourse = courseRepository.findByCourseCode(courseRequest.getCourseCode());
        if (existingCourse != null) {
            throw new RuntimeException("Course with code " + courseRequest.getCourseCode() + " already exists");
        }
        
        // Find semester by ID first, then by name
        Semester semester = null;
        if (courseRequest.getSemesterId() != null) {
            // Try to find semester by ID first
            logger.info("Looking for semester with ID: {}", courseRequest.getSemesterId());
            semester = semesterRepository.findById(courseRequest.getSemesterId())
                .orElseThrow(() -> new RuntimeException("Semester not found with ID: " + courseRequest.getSemesterId()));
            logger.info("Found semester: {}", semester.getSemesterName());
        } else if (courseRequest.getSemesterName() != null && !courseRequest.getSemesterName().isEmpty()) {
            // Fall back to finding by name
            logger.info("Looking for semester with name: {}", courseRequest.getSemesterName());
            semester = semesterRepository.findBySemesterName(courseRequest.getSemesterName());
            if (semester == null) {
                throw new RuntimeException("Invalid semester name: " + courseRequest.getSemesterName() + 
                                         ". Please use valid semester names like '1-1', '1-2', '2-1', '2-2', etc.");
            }
            logger.info("Found semester: {}", semester.getSemesterName());
        } else {
            logger.warn("No semester ID or name provided in course request");
        }
        
        // Create and save the new course
        Course course = new Course();
        course.setCourseCode(courseRequest.getCourseCode());
        course.setCourseName(courseRequest.getCourseName());
        course.setDepartment(department);
        course.setSemester(semester);
        if (semester != null) {
            course.setSemesterName(semester.getSemesterName());
        } else {
            course.setSemesterName(null);
        }
        
        Course savedCourse = courseRepository.save(course);
        logger.info("Course saved: {} for semester: {}", savedCourse.getCourseCode(), 
                   semester != null ? semester.getSemesterName() : "No semester");
        
        return convertToCourseResponse(savedCourse);
    }
    
    /**
     * Get courses by department code and semester name
     */
    public List<CourseResponse> getCoursesByDepartmentAndSemester(String departmentCode, String semesterName) {
        // Find department by code
        Department department = getDepartmentByCode(departmentCode);
        
        // Get all courses for this department
        List<Course> courses = courseRepository.findByDepartmentId(department.getDeptId());
        
        // Filter courses by semester name
        List<Course> filteredCourses = courses.stream()
            .filter(course -> {
                // If semester name is specified, filter by it
                if (semesterName != null && !semesterName.equalsIgnoreCase("all")) {
                    return course.getSemester() != null && 
                           semesterName.equals(course.getSemester().getSemesterName());
                }
                // If no semester name specified, return all courses
                return true;
            })
            .collect(Collectors.toList());
        
        logger.info("Found {} courses for department {} and semester {}", 
                   filteredCourses.size(), departmentCode, semesterName);
        
        return filteredCourses.stream()
            .map(this::convertToCourseResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Delete a course by course code and department
     */
    public void deleteCourseByCode(String courseCode, String departmentCode) {
        logger.info("Attempting to delete course with code: {} by department: {}", courseCode, departmentCode);
        
        // Get department first
        Department department = getDepartmentByCode(departmentCode);
        
        // Find course by both course code AND department to ensure we get the right one
        Course course = courseRepository.findByDepartmentIdAndCourseCode(department.getDeptId(), courseCode);
        if (course == null) {
            throw new RuntimeException("Course not found with code: " + courseCode + " in department: " + departmentCode);
        }
        
        logger.info("Found course: {} ({}) in department: {}", course.getCourseName(), course.getCourseCode(), department.getDeptName());
        
        // Check if there are any resources associated with this course
        // Use a more explicit check to avoid lazy loading issues
        long resourceCount = courseRepository.countResourcesByCourseId(course.getCourseId());
        if (resourceCount > 0) {
            logger.error("Cannot delete course. Found {} resources associated with it.", resourceCount);
            throw new RuntimeException("Cannot delete course. There are " + resourceCount + " resources associated with it.");
        }
        
        logger.info("No resources found. Proceeding with deletion...");
        
        // Delete the course
        courseRepository.delete(course);
        
        logger.info("Course deleted successfully: {} ({})", course.getCourseName(), course.getCourseCode());
    }

    /**
     * Update a course by course code and department
     */
    public CourseResponse updateCourseByCode(String courseCode, CourseRequest courseRequest, String departmentCode) {
        logger.info("Attempting to update course with code: {} by department: {}", courseCode, departmentCode);
        
        // Get department first
        Department department = getDepartmentByCode(departmentCode);
        
        // Find course by both course code AND department to ensure we get the right one
        Course course = courseRepository.findByDepartmentIdAndCourseCode(department.getDeptId(), courseCode);
        if (course == null) {
            throw new RuntimeException("Course not found with code: " + courseCode + " in department: " + departmentCode);
        }
        
        logger.info("Found course: {} ({}) in department: {}", course.getCourseName(), course.getCourseCode(), department.getDeptName());
        
        // Check if the new course code already exists (if it's being changed)
        if (!course.getCourseCode().equals(courseRequest.getCourseCode())) {
            Course existingCourse = courseRepository.findByDepartmentIdAndCourseCode(department.getDeptId(), courseRequest.getCourseCode());
            if (existingCourse != null && !existingCourse.getCourseId().equals(course.getCourseId())) {
                throw new RuntimeException("Course with code " + courseRequest.getCourseCode() + " already exists in your department");
            }
        }
        
        // Update course fields
        course.setCourseCode(courseRequest.getCourseCode());
        course.setCourseName(courseRequest.getCourseName());
        
        // Set semester if provided
        if (courseRequest.getSemesterName() != null && !courseRequest.getSemesterName().isEmpty()) {
            Semester semester = semesterRepository.findBySemesterName(courseRequest.getSemesterName());
            if (semester != null) {
                course.setSemester(semester);
                course.setSemesterName(courseRequest.getSemesterName());
            }
        }
        
        Course updatedCourse = courseRepository.save(course);
        logger.info("Course updated successfully: {} ({})", updatedCourse.getCourseName(), updatedCourse.getCourseCode());
        
        return convertToCourseResponse(updatedCourse);
    }

    /**
     * Helper method to convert Course to CourseResponse
     */
    private CourseResponse convertToCourseResponse(Course course) {
        CourseResponse response = new CourseResponse();
        response.setCourseId(course.getCourseId());
        response.setCourseCode(course.getCourseCode());
        response.setCourseName(course.getCourseName());
        response.setDepartmentName(course.getDepartment().getDeptName());
        
        // Set semester information from the Semester entity
        if (course.getSemester() != null) {
            response.setSemesterName(course.getSemester().getSemesterName());
            response.setSemesterId(course.getSemester().getSemesterId());
        }
        
        return response;
    }
    
    /**
     * Helper method to get Department by code
     */
    private Department getDepartmentByCode(String departmentCode) {
        String departmentName = getDepartmentNameByCode(departmentCode);
        return departmentRepository.findByDeptName(departmentName)
            .orElseThrow(() -> new RuntimeException("Department not found with code: " + departmentCode));
    }
    
    /**
     * Helper method to convert department codes to department names
     * Based on CUET department codes
     */
    private String getDepartmentNameByCode(String deptCode) {
        switch (deptCode) {
            case "01": return "Civil Engineering";
            case "02": return "Mechanical Engineering";
            case "03": return "Electrical & Electronics Engineering";
            case "04": return "Computer Science & Engineering";
            case "05": return "Water Resources Engineering";
            case "06": return "Petroleum & Mining Engineering";
            case "07": return "Mechatronics and Industrial Engineering";
            case "08": return "Electronics & Telecommunication Engineering";
            case "09": return "Urban & Regional Planning";
            case "10": return "Architecture";
            case "11": return "Biomedical Engineering";
            case "12": return "Nuclear Engineering";
            case "13": return "Materials Science & Engineering";
            case "14": return "Physics";
            case "15": return "Chemistry";
            case "16": return "Mathematics";
            case "17": return "Humanities";
            default: return "Unknown Department";
        }
    }
    
    /**
     * Create multiple courses at once
     * @param courseRequests List of course requests to create
     * @return Batch response with created and skipped courses
     */
    public CourseBatchResponse createCoursesBatch(List<CourseRequest> courseRequests) {
        List<CourseResponse> createdCourses = new ArrayList<>();
        List<CourseBatchResponse.SkippedCourse> skippedCourses = new ArrayList<>();
        
        logger.info("Starting batch creation of {} courses", courseRequests.size());
        
        // Process each course request
        for (CourseRequest request : courseRequests) {
            try {
                logger.info("Processing course request: code={}, name={}, semesterName={}, semesterId={}", 
                           request.getCourseCode(), request.getCourseName(), 
                           request.getSemesterName(), request.getSemesterId());
                
                // Check if course with same code already exists
                Course existingCourse = courseRepository.findByCourseCode(request.getCourseCode());
                if (existingCourse != null) {
                    logger.warn("Course with code {} already exists (ID: {}, Name: {}, Semester: {}), skipping", 
                               request.getCourseCode(), 
                               existingCourse.getCourseId(),
                               existingCourse.getCourseName(),
                               existingCourse.getSemester() != null ? existingCourse.getSemester().getSemesterName() : "No semester");
                    
                    // Add to skipped courses list
                    CourseBatchResponse.SkippedCourse skipped = new CourseBatchResponse.SkippedCourse(
                        request.getCourseCode(),
                        request.getCourseName(),
                        "Course already exists"
                    );
                    skippedCourses.add(skipped);
                    continue;
                }
                
                // Create the course
                logger.info("Calling createCourse for {}", request.getCourseCode());
                CourseResponse response = createCourse(request);
                logger.info("Course created with ID: {}, semesterId: {}", 
                           response.getCourseId(), response.getSemesterId());
                createdCourses.add(response);
            } catch (Exception e) {
                logger.error("Error creating course {}: {}", request.getCourseCode(), e.getMessage(), e);
                
                // Add to skipped courses list with error reason
                CourseBatchResponse.SkippedCourse skipped = new CourseBatchResponse.SkippedCourse(
                    request.getCourseCode(),
                    request.getCourseName(),
                    "Error: " + e.getMessage()
                );
                skippedCourses.add(skipped);
            }
        }
        
        logger.info("Successfully created {} courses out of {} requests, {} skipped", 
                   createdCourses.size(), courseRequests.size(), skippedCourses.size());
        
        return new CourseBatchResponse(createdCourses, skippedCourses);
    }
    
    /**
     * Update an existing course
     * @param courseId The ID of the course to update
     * @param courseRequest The new course data
     * @param departmentCode The department code of the current user
     * @return Updated course response
     */
    public CourseResponse updateCourse(Long courseId, CourseRequest courseRequest, String departmentCode) {
        // Find the course
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found with ID: " + courseId));
        
        // Check if the course belongs to the user's department
        Department department = getDepartmentByCode(departmentCode);
        if (!course.getDepartment().getDeptId().equals(department.getDeptId())) {
            throw new RuntimeException("You can only update courses from your own department");
        }
        
        // Update the course properties
        course.setCourseName(courseRequest.getCourseName());
        
        // Only update course code if it changed and doesn't conflict
        if (!course.getCourseCode().equals(courseRequest.getCourseCode())) {
            Course existingCourse = courseRepository.findByCourseCode(courseRequest.getCourseCode());
            if (existingCourse != null && !existingCourse.getCourseId().equals(courseId)) {
                throw new RuntimeException("Course with code " + courseRequest.getCourseCode() + " already exists");
            }
            course.setCourseCode(courseRequest.getCourseCode());
        }
        
        // Update semester information
        Semester semester = null;
        
        // First, try to get semester by ID if provided
        if (courseRequest.getSemesterId() != null) {
            logger.info("Course {} has semesterId: {}", courseRequest.getCourseCode(), courseRequest.getSemesterId());
            
            // Find semester by ID
            semester = semesterRepository.findById(courseRequest.getSemesterId())
                .orElseThrow(() -> new RuntimeException("Semester not found with ID: " + courseRequest.getSemesterId()));
            
            course.setSemester(semester);
            if (semester != null) {
                course.setSemesterName(semester.getSemesterName());
            }
            logger.info("Updated course {} with specific semester ID: {}, name: {}", 
                       courseRequest.getCourseCode(), semester.getSemesterId(), semester.getSemesterName());
        }
        // Otherwise fall back to semesterName
        else if (courseRequest.getSemesterName() != null && !courseRequest.getSemesterName().isEmpty()) {
            // Find semester by name
            semester = semesterRepository.findBySemesterName(courseRequest.getSemesterName());
            if (semester == null) {
                throw new RuntimeException("Invalid semester name: " + courseRequest.getSemesterName() + 
                                         ". Please use valid semester names like '1-1', '1-2', '2-1', '2-2', etc.");
            }
            course.setSemester(semester);
            course.setSemesterName(semester.getSemesterName());
            logger.info("Updated course {} with semester name: {}", 
                       courseRequest.getCourseCode(), semester.getSemesterName());
        }
        
        // Save updated course
        Course updatedCourse = courseRepository.save(course);
        logger.info("Course updated: {}", updatedCourse.getCourseCode());
        
        return convertToCourseResponse(updatedCourse);
    }
}