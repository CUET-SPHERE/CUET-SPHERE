package com.cuet.sphere.service;

import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.UserRepository;
import com.cuet.sphere.response.CrAssignmentRequest;
import com.cuet.sphere.response.CrAssignmentResponse;
import com.cuet.sphere.exception.UserException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SystemAdminService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${system.admin.email:u2204001@student.cuet.ac.bd}")
    private String systemAdminEmail;
    
    public CrAssignmentResponse assignCrRole(CrAssignmentRequest request, User adminUser) throws UserException {
        // Check if the user is system admin
        if (!isSystemAdmin(adminUser)) {
            throw new UserException("Access denied: Only system administrators can assign CR roles");
        }
        
        // Validate request
        if (request.getUserEmail() == null || request.getDepartment() == null || request.getBatch() == null) {
            throw new UserException("All fields are required: userEmail, department, batch");
        }
        
        // Find the user to assign CR role
        Optional<User> userOpt = userRepository.findByEmail(request.getUserEmail());
        if (userOpt.isEmpty()) {
            throw new UserException("User not found with email: " + request.getUserEmail());
        }
        
        User user = userOpt.get();
        
        // Check if user is in the specified department and batch
        if (!user.getDepartment().equals(request.getDepartment()) || !user.getBatch().equals(request.getBatch())) {
            throw new UserException("User is not in the specified department/batch combination");
        }
        
        // Check if user is already CR
        if (user.isCR()) {
            throw new UserException("User is already a CR");
        }
        
        // Assign CR role
        user.setRole(User.Role.CR);
        userRepository.save(user);
        
        // Create response
        CrAssignmentResponse response = new CrAssignmentResponse();
        response.setMessage("CR role assigned successfully");
        response.setUserEmail(user.getEmail());
        response.setDepartment(user.getDepartment());
        response.setBatch(user.getBatch());
        response.setRole(user.getRole().toString());
        response.setSuccess(true);
        
        return response;
    }
    
    public CrAssignmentResponse removeCrRole(String userEmail, User adminUser) throws UserException {
        // Check if the user is system admin
        if (!isSystemAdmin(adminUser)) {
            throw new UserException("Access denied: Only system administrators can remove CR roles");
        }
        
        // Find the user
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            throw new UserException("User not found with email: " + userEmail);
        }
        
        User user = userOpt.get();
        
        // Check if user is CR
        if (!user.isCR()) {
            throw new UserException("User is not a CR");
        }
        
        // Remove CR role (set back to STUDENT)
        user.setRole(User.Role.STUDENT);
        userRepository.save(user);
        
        // Create response
        CrAssignmentResponse response = new CrAssignmentResponse();
        response.setMessage("CR role removed successfully");
        response.setUserEmail(user.getEmail());
        response.setDepartment(user.getDepartment());
        response.setBatch(user.getBatch());
        response.setRole(user.getRole().toString());
        response.setSuccess(true);
        
        return response;
    }
    
    public List<User> getAllUsers(User adminUser) throws UserException {
        // Check if the user is system admin
        if (!isSystemAdmin(adminUser)) {
            throw new UserException("Access denied: Only system administrators can view all users");
        }
        
        return userRepository.findAll();
    }
    
    public List<User> getUsersByDepartmentAndBatch(String department, String batch, User adminUser) throws UserException {
        // Check if the user is system admin
        if (!isSystemAdmin(adminUser)) {
            throw new UserException("Access denied: Only system administrators can view users by department/batch");
        }
        
        return userRepository.findByDepartmentAndBatch(department, batch);
    }
    
    public User getUserByEmail(String email, User adminUser) throws UserException {
        // Check if the user is system admin
        if (!isSystemAdmin(adminUser)) {
            throw new UserException("Access denied: Only system administrators can view user details");
        }
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new UserException("User not found with email: " + email);
        }
        
        return userOpt.get();
    }
    
    public boolean isSystemAdmin(User user) {
        return User.Role.SYSTEM_ADMIN.equals(user.getRole());
    }
    
    public String getSystemAdminEmail() {
        return systemAdminEmail;
    }
}
