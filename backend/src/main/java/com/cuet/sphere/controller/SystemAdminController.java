package com.cuet.sphere.controller;

import com.cuet.sphere.model.User;
import com.cuet.sphere.response.CrAssignmentRequest;
import com.cuet.sphere.response.CrAssignmentResponse;
import com.cuet.sphere.service.SystemAdminService;
import com.cuet.sphere.exception.UserException;
import com.cuet.sphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class SystemAdminController {
    
    @Autowired
    private SystemAdminService systemAdminService;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/assign-cr")
    public ResponseEntity<CrAssignmentResponse> assignCrRole(@RequestBody CrAssignmentRequest request) {
        try {
            User currentUser = getCurrentUser();
            CrAssignmentResponse response = systemAdminService.assignCrRole(request, currentUser);
            return ResponseEntity.ok(response);
        } catch (UserException e) {
            CrAssignmentResponse errorResponse = new CrAssignmentResponse();
            errorResponse.setMessage(e.getMessage());
            errorResponse.setSuccess(false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @DeleteMapping("/remove-cr/{userEmail}")
    public ResponseEntity<CrAssignmentResponse> removeCrRole(@PathVariable String userEmail) {
        try {
            User currentUser = getCurrentUser();
            CrAssignmentResponse response = systemAdminService.removeCrRole(userEmail, currentUser);
            return ResponseEntity.ok(response);
        } catch (UserException e) {
            CrAssignmentResponse errorResponse = new CrAssignmentResponse();
            errorResponse.setMessage(e.getMessage());
            errorResponse.setSuccess(false);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            User currentUser = getCurrentUser();
            List<User> users = systemAdminService.getAllUsers(currentUser);
            return ResponseEntity.ok(users);
        } catch (UserException e) {
            return ResponseEntity.status(403).build();
        }
    }
    
    @GetMapping("/users/department/{department}/batch/{batch}")
    public ResponseEntity<List<User>> getUsersByDepartmentAndBatch(
            @PathVariable String department, 
            @PathVariable String batch) {
        try {
            User currentUser = getCurrentUser();
            List<User> users = systemAdminService.getUsersByDepartmentAndBatch(department, batch, currentUser);
            return ResponseEntity.ok(users);
        } catch (UserException e) {
            return ResponseEntity.status(403).build();
        }
    }
    
    @GetMapping("/users/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        try {
            User currentUser = getCurrentUser();
            User user = systemAdminService.getUserByEmail(email, currentUser);
            return ResponseEntity.ok(user);
        } catch (UserException e) {
            return ResponseEntity.status(403).build();
        }
    }
    
    @GetMapping("/system-info")
    public ResponseEntity<SystemInfo> getSystemInfo() {
        try {
            User currentUser = getCurrentUser();
            if (!systemAdminService.isSystemAdmin(currentUser)) {
                return ResponseEntity.status(403).build();
            }
            
            SystemInfo info = new SystemInfo();
            info.setSystemAdminEmail(systemAdminService.getSystemAdminEmail());
            info.setMessage("System information retrieved successfully");
            
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
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
    
    // Inner class for system info response
    public static class SystemInfo {
        private String systemAdminEmail;
        private String message;
        
        public String getSystemAdminEmail() {
            return systemAdminEmail;
        }
        
        public void setSystemAdminEmail(String systemAdminEmail) {
            this.systemAdminEmail = systemAdminEmail;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
}
