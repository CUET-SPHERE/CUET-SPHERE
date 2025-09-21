package com.cuet.sphere.service;

import com.cuet.sphere.model.*;
import com.cuet.sphere.repository.*;
import com.cuet.sphere.response.ResourceRequest;
import com.cuet.sphere.response.ResourceResponse;
import com.cuet.sphere.response.ResourceFileResponse;
import com.cuet.sphere.exception.UserException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
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
    
    @Autowired
    private ResourceFileRepository resourceFileRepository;
    
    @Autowired
    private S3Service s3Service;
    
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

    public ResourceResponse createResourceWithFile(ResourceRequest resourceRequest, MultipartFile file, User uploader) throws UserException {
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
        
        // Upload file to S3
        String fileUrl;
        try {
            // Generate a unique filename for the resource
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".") ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            
            // Create a structured filename: dept_batch_course_resourceType_timestamp.ext
            String baseFilename = String.format("%s_%s_%s_%s_%d",
                uploader.getDepartment(),
                uploader.getBatch(),
                course.getCourseCode().replaceAll("[^a-zA-Z0-9]", ""),
                resourceRequest.getResourceType().toString(),
                System.currentTimeMillis()
            );
            String filename = baseFilename + fileExtension;
            
            fileUrl = s3Service.uploadResourceFile(file, filename);
        } catch (IOException e) {
            throw new UserException("Failed to upload file: " + e.getMessage());
        }
        
        Resource resource = new Resource();
        resource.setTitle(resourceRequest.getTitle());
        resource.setFilePath(fileUrl); // Store the S3 URL
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
        
        // Handle file path update - delete old file from S3 if new file is provided
        if (resourceRequest.getFilePath() != null && !resourceRequest.getFilePath().equals(resource.getFilePath())) {
            // Delete old file from S3 if it exists
            if (resource.getFilePath() != null && !resource.getFilePath().isEmpty()) {
                try {
                    s3Service.deleteFile(resource.getFilePath());
                } catch (Exception e) {
                    // Failed to delete old resource file from S3
                }
            }
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
        
        // Delete the file from S3 if it exists
        if (resource.getFilePath() != null && !resource.getFilePath().isEmpty()) {
            try {
                s3Service.deleteFile(resource.getFilePath());
            } catch (Exception e) {
                // Failed to delete resource file from S3
            }
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
        response.setDescription(resource.getDescription());
        response.setCreatedAt(resource.getCreatedAt());
        response.setUpdatedAt(resource.getUpdatedAt());
        
        // New folder-related fields
        response.setIsFolder(resource.getIsFolder() != null ? resource.getIsFolder() : false);
        response.setFileCount(resource.getFileCount() != null ? resource.getFileCount() : 0);
        
        // Load files explicitly from repository to avoid lazy loading issues
        List<ResourceFile> resourceFiles = resourceFileRepository.findByResourceIdOrderByUploadOrder(resource.getResourceId());
        List<ResourceFileResponse> fileResponses = new ArrayList<>();
        
        if (!resourceFiles.isEmpty()) {
            // Use ResourceFile entities from repository
            fileResponses = resourceFiles.stream()
                .map(ResourceFileResponse::fromResourceFile)
                .collect(Collectors.toList());
            response.setFiles(fileResponses);
            
            // Set filePath to first file for backward compatibility
            response.setFilePath(fileResponses.get(0).getFilePath());
        } else if (resource.getFilePath() != null && !resource.getFilePath().isEmpty()) {
            // Fallback to legacy filePath for existing resources
            response.setFilePath(resource.getFilePath());
            
            // Create a single ResourceFileResponse for backward compatibility
            ResourceFileResponse legacyFile = new ResourceFileResponse();
            legacyFile.setFileName(extractFileNameFromPath(resource.getFilePath()));
            legacyFile.setFilePath(resource.getFilePath());
            legacyFile.setUploadOrder(0);
            legacyFile.setCreatedAt(resource.getCreatedAt());
            fileResponses.add(legacyFile);
            response.setFiles(fileResponses);
        }
        
        // Update response metadata based on actual files loaded
        response.setFileCount(fileResponses.size());
        response.setIsFolder(fileResponses.size() > 1);
        
        // Uploader information
        User uploader = resource.getUploader();
        if (uploader != null) {
            response.setUploaderName(uploader.getFullName());
            response.setUploaderEmail(uploader.getEmail());
            response.setUploaderStudentId(uploader.getFullStudentId());
            response.setUploaderProfilePicture(uploader.getProfilePicture());
        } else {
            // Fallback for missing uploader
            response.setUploaderName("Unknown User");
            response.setUploaderEmail("unknown@example.com");
            response.setUploaderStudentId("0000000");
            response.setUploaderProfilePicture(null);
        }
        
        // Course information
        if (resource.getCourse() != null) {
            response.setCourseCode(resource.getCourse().getCourseCode());
            response.setCourseName(resource.getCourse().getCourseName());
            if (resource.getCourse().getDepartment() != null) {
                response.setDepartmentName(resource.getCourse().getDepartment().getDeptName());
            }
        }
        
        // Semester information
        if (resource.getSemester() != null) {
            response.setSemesterName(resource.getSemester().getSemesterName());
        }
        
        return response;
    }
    
    // Helper method to extract filename from file path
    private String extractFileNameFromPath(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return "Unknown File";
        }
        
        // Extract filename from URL or path
        String fileName = filePath;
        if (fileName.contains("/")) {
            fileName = fileName.substring(fileName.lastIndexOf("/") + 1);
        }
        if (fileName.contains("\\")) {
            fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
        }
        
        return fileName.isEmpty() ? "Unknown File" : fileName;
    }
    
    // New method: Create resource with multiple files (folder mode)
    public ResourceResponse createResourceWithMultipleFiles(ResourceRequest resourceRequest, List<MultipartFile> files, User uploader) throws UserException {
        // Check if uploader is CR
        if (!uploader.isCR()) {
            throw new UserException("Only CR users can upload resources");
        }
        
        if (files == null || files.isEmpty()) {
            throw new UserException("At least one file is required");
        }
        
        // Find course
        Course course = courseRepository.findByCourseCode(resourceRequest.getCourseCode());
        if (course == null) {
            throw new UserException("Course not found with code: " + resourceRequest.getCourseCode());
        }
        
        // Check if course belongs to uploader's department
        String uploaderDeptName = getDepartmentNameByCode(uploader.getDepartment());
        if (!course.getDepartment().getDeptName().equals(uploaderDeptName)) {
            throw new UserException("You can only upload resources for your department. Your department code: " + uploader.getDepartment() + " (" + uploaderDeptName + "), Course department: " + course.getDepartment().getDeptName());
        }
        
        // Find semester
        Semester semester = semesterRepository.findBySemesterName(resourceRequest.getSemesterName());
        if (semester == null) {
            throw new UserException("Semester not found: " + resourceRequest.getSemesterName());
        }
        
        // Create and save the main resource first WITHOUT any file collection access
        Resource resource = new Resource();
        resource.setTitle(resourceRequest.getTitle());
        resource.setDescription(resourceRequest.getDescription());
        resource.setResourceType(resourceRequest.getResourceType());
        resource.setBatch(uploader.getBatch());
        resource.setUploader(uploader);
        resource.setCourse(course);
        resource.setSemester(semester);
        resource.setIsFolder(files.size() > 1);
        resource.setFileCount(files.size());
        resource.setFilePath(null); // Will be set after first file upload
        
        // Save the resource first to get an ID - DO NOT access files collection
        Resource savedResource = resourceRepository.save(resource);
        Long resourceId = savedResource.getResourceId();
        
        // Now upload files and create ResourceFile entities independently
        try {
            String primaryFilePath = null;
            
            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                
                String originalFilename = file.getOriginalFilename();
                String fileExtension = originalFilename != null && originalFilename.contains(".") ? 
                    originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
                
                String baseFilename = String.format("%s_%s_%s_%s_%d_%d",
                    uploader.getDepartment(),
                    uploader.getBatch(),
                    course.getCourseCode().replaceAll("[^a-zA-Z0-9]", ""),
                    resourceRequest.getResourceType().toString(),
                    System.currentTimeMillis(),
                    i
                );
                String filename = baseFilename + fileExtension;
                
                String fileUrl = s3Service.uploadResourceFile(file, filename);
                
                // Create and save each ResourceFile individually - NO entity relationships
                ResourceFile resourceFile = new ResourceFile();
                resourceFile.setFileName(originalFilename);
                resourceFile.setFilePath(fileUrl);
                resourceFile.setFileSize(file.getSize());
                resourceFile.setFileType(getFileType(originalFilename));
                resourceFile.setUploadOrder(i);
                
                // Set the resource ID directly without using entity relationship
                resourceFile.setResourceId(resourceId);
                
                resourceFileRepository.save(resourceFile);
                
                // Store the first file's path for backward compatibility
                if (i == 0) {
                    primaryFilePath = fileUrl;
                }
            }
            
            // Update the resource with the primary file path - reload fresh from DB
            Resource freshResource = resourceRepository.findById(resourceId).orElseThrow();
            freshResource.setFilePath(primaryFilePath);
            resourceRepository.save(freshResource);
            
            // Create a minimal response to avoid any entity access issues
            ResourceResponse response = new ResourceResponse();
            response.setResourceId(resourceId);
            response.setTitle(freshResource.getTitle());
            response.setDescription(freshResource.getDescription());
            response.setBatch(freshResource.getBatch());
            response.setResourceType(freshResource.getResourceType());
            response.setIsFolder(true);
            response.setFileCount(files.size());
            response.setFilePath(primaryFilePath);
            response.setCreatedAt(freshResource.getCreatedAt());
            response.setUpdatedAt(freshResource.getUpdatedAt());
            
            // Just return the basic response without loading additional data
            return response;
            
        } catch (IOException e) {
            // If an error occurs, delete the saved resource and clean up any uploaded files
            resourceRepository.deleteById(resourceId);
            throw new UserException("Failed to upload file: " + e.getMessage());
        }
    }
    
    // Method to add files to an existing resource
    public ResourceResponse addFilesToResource(Long resourceId, List<MultipartFile> files, User user) throws UserException {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new UserException("Resource not found"));
        
        // Check if user is the uploader or has CR role
        if (!resource.getUploader().getId().equals(user.getId()) && !user.isCR()) {
            throw new UserException("You can only add files to your own resources");
        }
        
        if (files == null || files.isEmpty()) {
            throw new UserException("At least one file is required");
        }
        
        // Get current max upload order
        Integer maxOrder = resourceFileRepository.getMaxUploadOrderByResourceId(resourceId);
        int nextOrder = (maxOrder != null ? maxOrder : -1) + 1;
        
        try {
            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                String originalFilename = file.getOriginalFilename();
                String fileExtension = originalFilename != null && originalFilename.contains(".") ? 
                    originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
                
                String baseFilename = String.format("%s_%s_%s_%s_%d_%d",
                    user.getDepartment(),
                    user.getBatch(),
                    resource.getCourse().getCourseCode().replaceAll("[^a-zA-Z0-9]", ""),
                    resource.getResourceType().toString(),
                    System.currentTimeMillis(),
                    nextOrder + i
                );
                String filename = baseFilename + fileExtension;
                
                String fileUrl = s3Service.uploadResourceFile(file, filename);
                
                // Create and save each ResourceFile individually
                ResourceFile resourceFile = new ResourceFile();
                resourceFile.setFileName(originalFilename);
                resourceFile.setFilePath(fileUrl);
                resourceFile.setFileSize(file.getSize());
                resourceFile.setFileType(getFileType(originalFilename));
                resourceFile.setUploadOrder(nextOrder + i);
                resourceFile.setResourceId(resourceId);
                
                resourceFileRepository.save(resourceFile);
            }
            
            // Update resource metadata
            int newFileCount = resourceFileRepository.countByResourceId(resourceId);
            resource.setFileCount(newFileCount);
            resource.setIsFolder(newFileCount > 1);
            resourceRepository.save(resource);
            
            return convertToResponse(resource);
            
        } catch (IOException e) {
            throw new UserException("Failed to upload file: " + e.getMessage());
        }
    }
    
    // Method to remove a file from a resource
    public ResourceResponse removeFileFromResource(Long resourceId, Long fileId, User user) throws UserException {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new UserException("Resource not found"));
        
        // Check if user is the uploader or has CR role
        if (!resource.getUploader().getId().equals(user.getId()) && !user.isCR()) {
            throw new UserException("You can only remove files from your own resources");
        }
        
        ResourceFile fileToRemove = resourceFileRepository.findByFileIdAndResourceId(fileId, resourceId);
        if (fileToRemove == null) {
            throw new UserException("File not found in this resource");
        }
        
        // Don't allow removing the last file
        if (resource.getFileCount() <= 1) {
            throw new UserException("Cannot remove the last file from a resource. Delete the entire resource instead.");
        }
        
        // Delete file from S3
        try {
            s3Service.deleteFile(fileToRemove.getFilePath());
        } catch (Exception e) {
            // Log error but continue with database cleanup
            System.err.println("Failed to delete file from S3: " + e.getMessage());
        }
        
        // Remove file from database
        resourceFileRepository.delete(fileToRemove);
        
        // Update resource metadata
        int newFileCount = resourceFileRepository.countByResourceId(resourceId);
        resource.setFileCount(newFileCount);
        resource.setIsFolder(newFileCount > 1);
        Resource savedResource = resourceRepository.save(resource);
        
        return convertToResponse(savedResource);
    }
    
    // Helper method to determine file type from filename
    private String getFileType(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "unknown";
        }
        
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        
        switch (extension) {
            case "pdf": return "pdf";
            case "doc": case "docx": return "document";
            case "ppt": case "pptx": return "presentation";
            case "xls": case "xlsx": return "spreadsheet";
            case "jpg": case "jpeg": case "png": case "gif": return "image";
            case "mp4": case "avi": case "mov": return "video";
            case "mp3": case "wav": return "audio";
            case "zip": case "rar": case "7z": return "archive";
            case "txt": return "text";
            default: return "other";
        }
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
