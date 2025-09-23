package com.cuet.sphere.controller;

import com.cuet.sphere.service.DepartmentService;
import com.cuet.sphere.service.SystemAdminService;
import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.UserRepository;
import com.cuet.sphere.response.DepartmentRequest;
import com.cuet.sphere.response.DepartmentResponse;
import com.cuet.sphere.exception.UserException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.validation.Valid;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin/departments")
@CrossOrigin(origins = "*")
public class DepartmentController {
    
    private static final Logger logger = LoggerFactory.getLogger(DepartmentController.class);
    
    @Autowired
    private DepartmentService departmentService;
    
    @Autowired
    private SystemAdminService systemAdminService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get all departments
     */
    @GetMapping
    public ResponseEntity<?> getAllDepartments() {
        try {
            User currentUser = getCurrentUser();
            if (!systemAdminService.isSystemAdmin(currentUser)) {
                return ResponseEntity.status(403).body(createErrorResponse("Access denied"));
            }
            
            Map<String, Object> departments = departmentService.getAllDepartments();
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            logger.error("Error getting departments: {}", e.getMessage());
            return ResponseEntity.status(500).body(createErrorResponse("Internal server error"));
        }
    }
    
    /**
     * Get department count only (for statistics)
     */
    @GetMapping("/count")
    public ResponseEntity<?> getDepartmentCount() {
        try {
            User currentUser = getCurrentUser();
            if (!systemAdminService.isSystemAdmin(currentUser)) {
                return ResponseEntity.status(403).body(createErrorResponse("Access denied"));
            }
            
            long count = departmentService.getDepartmentCount();
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting department count: {}", e.getMessage());
            return ResponseEntity.status(500).body(createErrorResponse("Internal server error"));
        }
    }
    
    /**
     * Create a new department
     */
    @PostMapping
    public ResponseEntity<?> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        try {
            User currentUser = getCurrentUser();
            if (!systemAdminService.isSystemAdmin(currentUser)) {
                return ResponseEntity.status(403).body(createErrorResponse("Access denied"));
            }
            
            DepartmentResponse response = departmentService.createDepartment(request);
            return ResponseEntity.ok(response);
        } catch (UserException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating department: {}", e.getMessage());
            return ResponseEntity.status(500).body(createErrorResponse("Internal server error"));
        }
    }
    
    /**
     * Update a department
     */
    @PutMapping("/{deptId}")
    public ResponseEntity<?> updateDepartment(@PathVariable Long deptId, @Valid @RequestBody DepartmentRequest request) {
        try {
            User currentUser = getCurrentUser();
            if (!systemAdminService.isSystemAdmin(currentUser)) {
                return ResponseEntity.status(403).body(createErrorResponse("Access denied"));
            }
            
            DepartmentResponse response = departmentService.updateDepartment(deptId, request);
            return ResponseEntity.ok(response);
        } catch (UserException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error updating department: {}", e.getMessage());
            return ResponseEntity.status(500).body(createErrorResponse("Internal server error"));
        }
    }
    
    /**
     * Delete a department
     */
    @DeleteMapping("/{deptId}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long deptId) {
        try {
            User currentUser = getCurrentUser();
            if (!systemAdminService.isSystemAdmin(currentUser)) {
                return ResponseEntity.status(403).body(createErrorResponse("Access denied"));
            }
            
            departmentService.deleteDepartment(deptId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Department deleted successfully");
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (UserException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error deleting department: {}", e.getMessage());
            return ResponseEntity.status(500).body(createErrorResponse("Internal server error"));
        }
    }
    
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
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", message);
        error.put("success", false);
        return error;
    }
}