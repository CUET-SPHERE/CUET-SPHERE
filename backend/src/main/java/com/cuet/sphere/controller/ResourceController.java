package com.cuet.sphere.controller;

import com.cuet.sphere.model.User;
import com.cuet.sphere.model.Resource;
import com.cuet.sphere.response.ResourceRequest;
import com.cuet.sphere.response.ResourceResponse;
import com.cuet.sphere.service.ResourceService;
import com.cuet.sphere.exception.UserException;
import com.cuet.sphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {
    
    private static final Logger logger = LoggerFactory.getLogger(ResourceController.class);
    
    @Autowired
    private ResourceService resourceService;
    
    @Autowired
    private UserRepository userRepository;
    
    // Create resource (CR only)
    @PostMapping
    public ResponseEntity<?> createResource(@Valid @RequestBody ResourceRequest resourceRequest) {
        try {
            logger.info("Creating resource with title: {}", resourceRequest.getTitle());
            User currentUser = getCurrentUser();
            ResourceResponse resource = resourceService.createResource(resourceRequest, currentUser);
            logger.info("Resource created successfully with ID: {}", resource.getResourceId());
            return ResponseEntity.ok(resource);
        } catch (UserException e) {
            logger.error("UserException while creating resource: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (RuntimeException e) {
            logger.error("RuntimeException while creating resource: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(401).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error while creating resource: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // Create resource with file upload (CR only)
    @PostMapping("/upload")
    public ResponseEntity<?> createResourceWithFile(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("resourceType") String resourceType,
            @RequestParam("courseCode") String courseCode,
            @RequestParam("semesterName") String semesterName,
            @RequestParam("file") MultipartFile file) {
        try {
            logger.info("Creating resource with file upload - title: {}, course: {}", title, courseCode);
            
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is required"));
            }

            User currentUser = getCurrentUser();
            
            // Create ResourceRequest object
            ResourceRequest resourceRequest = new ResourceRequest();
            resourceRequest.setTitle(title);
            resourceRequest.setDescription(description);
            resourceRequest.setResourceType(Resource.ResourceType.valueOf(resourceType.toUpperCase()));
            resourceRequest.setCourseCode(courseCode);
            resourceRequest.setSemesterName(semesterName);
            
            ResourceResponse resource = resourceService.createResourceWithFile(resourceRequest, file, currentUser);
            logger.info("Resource created successfully with file upload, ID: {}", resource.getResourceId());
            return ResponseEntity.ok(resource);
            
        } catch (UserException e) {
            logger.error("UserException while creating resource with file: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid resource type: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid resource type: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (RuntimeException e) {
            logger.error("RuntimeException while creating resource with file: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(401).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error while creating resource with file: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // Create resource with multiple files (folder mode) - CR only
    @PostMapping("/upload/multiple")
    public ResponseEntity<?> createResourceWithMultipleFiles(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("resourceType") String resourceType,
            @RequestParam("courseCode") String courseCode,
            @RequestParam("semesterName") String semesterName,
            @RequestParam("files") List<MultipartFile> files) {
        try {
            logger.info("Creating resource with multiple files - title: {}, course: {}, file count: {}", 
                       title, courseCode, files.size());
            
            if (files == null || files.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "At least one file is required"));
            }

            User currentUser = getCurrentUser();
            
            // Create ResourceRequest object
            ResourceRequest resourceRequest = new ResourceRequest();
            resourceRequest.setTitle(title);
            resourceRequest.setDescription(description);
            resourceRequest.setResourceType(Resource.ResourceType.valueOf(resourceType.toUpperCase()));
            resourceRequest.setCourseCode(courseCode);
            resourceRequest.setSemesterName(semesterName);
            
            ResourceResponse resource = resourceService.createResourceWithMultipleFiles(resourceRequest, files, currentUser);
            logger.info("Resource created successfully with {} files, ID: {}", files.size(), resource.getResourceId());
            return ResponseEntity.ok(resource);
            
        } catch (UserException e) {
            logger.error("UserException while creating resource with multiple files: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid resource type: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid resource type: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (RuntimeException e) {
            logger.error("RuntimeException while creating resource with multiple files: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(401).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error while creating resource with multiple files: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // Add files to existing resource - CR only
    @PostMapping("/{resourceId}/files")
    public ResponseEntity<?> addFilesToResource(
            @PathVariable Long resourceId,
            @RequestParam("files") List<MultipartFile> files) {
        try {
            logger.info("Adding files to resource ID: {}, file count: {}", resourceId, files.size());
            
            if (files == null || files.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "At least one file is required"));
            }

            User currentUser = getCurrentUser();
            ResourceResponse resource = resourceService.addFilesToResource(resourceId, files, currentUser);
            logger.info("Files added successfully to resource ID: {}", resourceId);
            return ResponseEntity.ok(resource);
            
        } catch (UserException e) {
            logger.error("UserException while adding files to resource: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (RuntimeException e) {
            logger.error("RuntimeException while adding files to resource: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(401).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error while adding files to resource: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // Remove a specific file from a resource - CR only
    @DeleteMapping("/{resourceId}/files/{fileId}")
    public ResponseEntity<?> removeFileFromResource(
            @PathVariable Long resourceId,
            @PathVariable Long fileId) {
        try {
            logger.info("Removing file ID: {} from resource ID: {}", fileId, resourceId);

            User currentUser = getCurrentUser();
            ResourceResponse resource = resourceService.removeFileFromResource(resourceId, fileId, currentUser);
            logger.info("File removed successfully from resource ID: {}", resourceId);
            return ResponseEntity.ok(resource);
            
        } catch (UserException e) {
            logger.error("UserException while removing file from resource: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (RuntimeException e) {
            logger.error("RuntimeException while removing file from resource: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(401).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error while removing file from resource: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Update resource
    @PutMapping("/{resourceId}")
    public ResponseEntity<?> updateResource(@PathVariable Long resourceId, @Valid @RequestBody ResourceRequest resourceRequest) {
        try {
            logger.info("Updating resource with ID: {}", resourceId);
            User currentUser = getCurrentUser();
            ResourceResponse resource = resourceService.updateResource(resourceId, resourceRequest, currentUser);
            logger.info("Resource updated successfully");
            return ResponseEntity.ok(resource);
        } catch (UserException e) {
            logger.error("UserException while updating resource: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (RuntimeException e) {
            logger.error("RuntimeException while updating resource: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(401).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error while updating resource: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Delete resource
    @DeleteMapping("/{resourceId}")
    public ResponseEntity<?> deleteResource(@PathVariable Long resourceId) {
        try {
            logger.info("Deleting resource with ID: {}", resourceId);
            User currentUser = getCurrentUser();
            resourceService.deleteResource(resourceId, currentUser);
            logger.info("Resource deleted successfully");
            return ResponseEntity.ok().build();
        } catch (UserException e) {
            logger.error("UserException while deleting resource: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (RuntimeException e) {
            logger.error("RuntimeException while deleting resource: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(401).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error while deleting resource: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Get all resources for current user (filtered by batch and department)
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getResources() {
        try {
            User currentUser = getCurrentUser();
            List<ResourceResponse> resources = resourceService.getResourcesByUser(currentUser);
            return ResponseEntity.ok(resources);
        } catch (RuntimeException e) {
            logger.error("RuntimeException while getting resources: {}", e.getMessage());
            return ResponseEntity.status(401).build();
        }
    }
    
    // Get resources by course
    @GetMapping("/course/{courseCode}")
    public ResponseEntity<List<ResourceResponse>> getResourcesByCourse(@PathVariable String courseCode) {
        try {
            User currentUser = getCurrentUser();
            List<ResourceResponse> resources = resourceService.getResourcesByUserAndCourse(currentUser, courseCode);
            return ResponseEntity.ok(resources);
        } catch (RuntimeException e) {
            logger.error("RuntimeException while getting resources by course: {}", e.getMessage());
            return ResponseEntity.status(401).build();
        }
    }
    
    // Get resources by course and semester
    @GetMapping("/course/{courseCode}/semester/{semester}")
    public ResponseEntity<List<ResourceResponse>> getResourcesByCourseAndSemester(@PathVariable String courseCode, @PathVariable String semester) {
        try {
            User currentUser = getCurrentUser();
            List<ResourceResponse> resources = resourceService.getResourcesByUserAndCourseAndSemester(currentUser, courseCode, semester);
            return ResponseEntity.ok(resources);
        } catch (RuntimeException e) {
            logger.error("RuntimeException while getting resources by course and semester: {}", e.getMessage());
            return ResponseEntity.status(401).build();
        }
    }
    
    // Get resources by type
    @GetMapping("/type/{resourceType}")
    public ResponseEntity<List<ResourceResponse>> getResourcesByType(@PathVariable String resourceType) {
        try {
            User currentUser = getCurrentUser();
            Resource.ResourceType type = Resource.ResourceType.valueOf(resourceType.toUpperCase());
            List<ResourceResponse> resources = resourceService.getResourcesByUserAndType(currentUser, type);
            return ResponseEntity.ok(resources);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            logger.error("RuntimeException while getting resources by type: {}", e.getMessage());
            return ResponseEntity.status(401).build();
        }
    }
    
    // Get resources uploaded by current user (CR only)
    @GetMapping("/my")
    public ResponseEntity<?> getMyResources() {
        try {
            User currentUser = getCurrentUser();
            List<ResourceResponse> resources = resourceService.getResourcesByUploader(currentUser);
            return ResponseEntity.ok(resources);
        } catch (UserException e) {
            logger.error("UserException while getting my resources: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (RuntimeException e) {
            logger.error("RuntimeException while getting my resources: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(401).body(error);
        }
    }
    
    // Get specific resource by ID
    @GetMapping("/{resourceId}")
    public ResponseEntity<?> getResourceById(@PathVariable Long resourceId) {
        try {
            User currentUser = getCurrentUser();
            ResourceResponse resource = resourceService.getResourceById(resourceId, currentUser);
            return ResponseEntity.ok(resource);
        } catch (UserException e) {
            logger.error("UserException while getting resource by ID: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (RuntimeException e) {
            logger.error("RuntimeException while getting resource by ID: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(401).body(error);
        }
    }
    
    // Search resources by title
    @GetMapping("/search")
    public ResponseEntity<List<ResourceResponse>> searchResources(@RequestParam String q) {
        try {
            User currentUser = getCurrentUser();
            List<ResourceResponse> resources = resourceService.searchResources(currentUser, q);
            return ResponseEntity.ok(resources);
        } catch (RuntimeException e) {
            logger.error("RuntimeException while searching resources: {}", e.getMessage());
            return ResponseEntity.status(401).build();
        }
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        logger.info("Authentication object: {}", authentication);
        
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            logger.info("Authenticated user email: {}", email);
            User user = userRepository.findUserByEmail(email);
            if (user != null) {
                logger.info("Found user: {} ({})", user.getFullName(), user.getEmail());
                return user;
            } else {
                logger.error("User not found in database for email: {}", email);
            }
        } else {
            logger.error("Authentication failed or user not authenticated");
        }
        throw new RuntimeException("User not authenticated");
    }
}
