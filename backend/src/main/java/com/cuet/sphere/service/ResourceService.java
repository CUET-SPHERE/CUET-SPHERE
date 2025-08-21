package com.cuet.sphere.service;

import com.cuet.sphere.model.*;
import com.cuet.sphere.repository.*;
import com.cuet.sphere.response.ResourceRequest;
import com.cuet.sphere.response.ResourceResponse;
import com.cuet.sphere.exception.UserException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {
    
    @Autowired
    private ResourceRepository resourceRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private SemesterRepository semesterRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    public ResourceResponse createResource(ResourceRequest resourceRequest, User uploader) throws UserException {
        // Check if uploader is CR
        if (!uploader.isCR()) {
            throw new UserException("Only CR users can upload resources");
        }
        
        // Find course
        Course course = courseRepository.findByCourseCode(resourceRequest.getCourseCode());
        if (course == null) {
            throw new UserException("Course not found with code: " + resourceRequest.getCourseCode());
        }
        
        // Check if course belongs to uploader's department
        // Convert department code to department name for comparison
        String uploaderDeptName = getDepartmentNameByCode(uploader.getDepartment());
        if (!course.getDepartment().getDeptName().equals(uploaderDeptName)) {
            throw new UserException("You can only upload resources for your department. Your department code: " + uploader.getDepartment() + " (" + uploaderDeptName + "), Course department: " + course.getDepartment().getDeptName());
        }
        
        // Find semester
        Semester semester = semesterRepository.findBySemesterName(resourceRequest.getSemesterName());
        if (semester == null) {
            throw new UserException("Semester not found: " + resourceRequest.getSemesterName());
        }
        
        Resource resource = new Resource();
        resource.setTitle(resourceRequest.getTitle());
        resource.setFilePath(resourceRequest.getFilePath());
        resource.setDescription(resourceRequest.getDescription());
        resource.setResourceType(resourceRequest.getResourceType());
        resource.setBatch(uploader.getBatch());
        resource.setUploader(uploader);
        resource.setCourse(course);
        resource.setSemester(semester);
        
        Resource savedResource = resourceRepository.save(resource);
        return convertToResponse(savedResource);
    }
    
    public ResourceResponse updateResource(Long resourceId, ResourceRequest resourceRequest, User user) throws UserException {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new UserException("Resource not found"));
        
        // Check if user is the uploader or has CR role
        if (!resource.getUploader().getId().equals(user.getId()) && !user.isCR()) {
            throw new UserException("You can only edit your own resources");
        }
        
        // Find course if course code is being updated
        if (resourceRequest.getCourseCode() != null && !resourceRequest.getCourseCode().equals(resource.getCourse().getCourseCode())) {
            Course course = courseRepository.findByCourseCode(resourceRequest.getCourseCode());
            if (course == null) {
                throw new UserException("Course not found with code: " + resourceRequest.getCourseCode());
            }
            resource.setCourse(course);
        }
        
        // Find semester if semester is being updated
        if (resourceRequest.getSemesterName() != null && !resourceRequest.getSemesterName().equals(resource.getSemester().getSemesterName())) {
            Semester semester = semesterRepository.findBySemesterName(resourceRequest.getSemesterName());
            if (semester == null) {
                throw new UserException("Semester not found: " + resourceRequest.getSemesterName());
            }
            resource.setSemester(semester);
        }
        
        // Update other fields
        if (resourceRequest.getTitle() != null) {
            resource.setTitle(resourceRequest.getTitle());
        }
        if (resourceRequest.getFilePath() != null) {
            resource.setFilePath(resourceRequest.getFilePath());
        }
        if (resourceRequest.getDescription() != null) {
            resource.setDescription(resourceRequest.getDescription());
        }
        if (resourceRequest.getResourceType() != null) {
            resource.setResourceType(resourceRequest.getResourceType());
        }
        
        Resource updatedResource = resourceRepository.save(resource);
        return convertToResponse(updatedResource);
    }
    
    public void deleteResource(Long resourceId, User user) throws UserException {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new UserException("Resource not found"));
        
        // Check if user is the uploader or has CR role
        if (!resource.getUploader().getId().equals(user.getId()) && !user.isCR()) {
            throw new UserException("You can only delete your own resources");
        }
        
        resourceRepository.delete(resource);
    }
    
    public List<ResourceResponse> getResourcesByUser(User user) {
        // Convert department code to name for repository query
        String deptName = getDepartmentNameByCode(user.getDepartment());
        List<Resource> resources = resourceRepository.findByBatchAndDepartment(user.getBatch(), deptName);
        return resources.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public List<ResourceResponse> getResourcesByUserAndCourse(User user, String courseCode) {
        // Convert department code to name for repository query
        String deptName = getDepartmentNameByCode(user.getDepartment());
        List<Resource> resources = resourceRepository.findByBatchAndDepartmentAndCourse(user.getBatch(), deptName, courseCode);
        return resources.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public List<ResourceResponse> getResourcesByUserAndCourseAndSemester(User user, String courseCode, String semester) {
        // Convert department code to name for repository query
        String deptName = getDepartmentNameByCode(user.getDepartment());
        List<Resource> resources = resourceRepository.findByBatchAndDepartmentAndCourseAndSemester(user.getBatch(), deptName, courseCode, semester);
        return resources.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public List<ResourceResponse> getResourcesByUserAndType(User user, Resource.ResourceType resourceType) {
        // Convert department code to name for repository query
        String deptName = getDepartmentNameByCode(user.getDepartment());
        List<Resource> resources = resourceRepository.findByBatchAndDepartmentAndResourceType(user.getBatch(), deptName, resourceType);
        return resources.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public List<ResourceResponse> getResourcesByUploader(User uploader) throws UserException {
        if (!uploader.isCR()) {
            throw new UserException("Only CR users can view their uploaded resources");
        }
        
        List<Resource> resources = resourceRepository.findByUploaderId(uploader.getId());
        return resources.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public ResourceResponse getResourceById(Long resourceId, User user) throws UserException {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new UserException("Resource not found"));
        
        // Check if user can access this resource (same batch and department)
        String userDeptName = getDepartmentNameByCode(user.getDepartment());
        if (!resource.getBatch().equals(user.getBatch()) || !resource.getCourse().getDepartment().getDeptName().equals(userDeptName)) {
            throw new UserException("Access denied: Resource not for your batch/department");
        }
        
        return convertToResponse(resource);
    }
    
    public List<ResourceResponse> searchResources(User user, String searchTerm) {
        // Convert department code to name for repository query
        String deptName = getDepartmentNameByCode(user.getDepartment());
        List<Resource> resources = resourceRepository.searchByTitle(user.getBatch(), deptName, searchTerm);
        return resources.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    private ResourceResponse convertToResponse(Resource resource) {
        ResourceResponse response = new ResourceResponse();
        response.setResourceId(resource.getResourceId());
        response.setBatch(resource.getBatch());
        response.setResourceType(resource.getResourceType());
        response.setTitle(resource.getTitle());
        response.setFilePath(resource.getFilePath());
        response.setDescription(resource.getDescription());
        response.setCreatedAt(resource.getCreatedAt());
        response.setUpdatedAt(resource.getUpdatedAt());
        
        // Uploader information
        response.setUploaderName(resource.getUploader().getFullName());
        response.setUploaderEmail(resource.getUploader().getEmail());
        
        // Course information
        response.setCourseCode(resource.getCourse().getCourseCode());
        response.setCourseName(resource.getCourse().getCourseName());
        response.setDepartmentName(resource.getCourse().getDepartment().getDeptName());
        
        // Semester information
        response.setSemesterName(resource.getSemester().getSemesterName());
        
        return response;
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
}
