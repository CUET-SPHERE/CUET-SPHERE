package com.cuet.sphere.controller;

import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.UserRepository;
import com.cuet.sphere.service.UserService;
import com.cuet.sphere.exception.UserException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateUserProfile(@RequestBody Map<String, Object> profileData) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
            }

            String email = authentication.getName();
            User user = userRepository.findUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "User not found"));
            }

            // Update user fields if provided
            if (profileData.containsKey("full_name")) {
                user.setFullName((String) profileData.get("full_name"));
            }
            if (profileData.containsKey("bio")) {
                user.setBio((String) profileData.get("bio"));
            }
            if (profileData.containsKey("hall")) {
                user.setHall((String) profileData.get("hall"));
            }
            // Handle profile picture update with S3 cleanup
            if (profileData.containsKey("profilePicture")) {
                String newProfilePictureUrl = (String) profileData.get("profilePicture");
                System.out.println("Updating profile picture for user: " + user.getEmail() + " with URL: " + newProfilePictureUrl);
                user = userService.updateProfilePicture(user, newProfilePictureUrl);
                System.out.println("Profile picture updated successfully");
            }
            
            // Handle background image update with S3 cleanup
            if (profileData.containsKey("backgroundImage")) {
                String newBackgroundImageUrl = (String) profileData.get("backgroundImage");
                user = userService.updateBackgroundImage(user, newBackgroundImageUrl);
            }

            // Save updated user (if not already saved by S3 methods)
            User updatedUser = userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("user", updatedUser);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update profile: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getUserProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
            }

            String email = authentication.getName();
            User user = userRepository.findUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "User not found"));
            }

            System.out.println("Getting profile for user: " + user.getEmail());
            System.out.println("Profile picture URL: " + user.getProfilePicture());
            System.out.println("Background image URL: " + user.getBackgroundImage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get profile: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/{email}/profile-picture")
    public ResponseEntity<Map<String, Object>> getUserProfilePicture(@PathVariable String email) {
        try {
            User user = userRepository.findUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "User not found"));
            }

            System.out.println("Getting profile picture for user: " + user.getEmail());
            System.out.println("Profile picture URL: " + user.getProfilePicture());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("profilePicture", user.getProfilePicture());
            response.put("fullName", user.getFullName());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get profile picture: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/{email}/set-test-profile-picture")
    public ResponseEntity<Map<String, Object>> setTestProfilePicture(@PathVariable String email) {
        try {
            User user = userRepository.findUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "User not found"));
            }

            // Generate a test profile picture URL using UI Avatars
            String testProfilePictureUrl = String.format("https://ui-avatars.com/api/?name=%s&background=random&color=ffffff&size=200", 
                URLEncoder.encode(user.getFullName(), StandardCharsets.UTF_8));
            
            user.setProfilePicture(testProfilePictureUrl);
            userRepository.save(user);

            System.out.println("Set test profile picture for user: " + user.getEmail());
            System.out.println("Test profile picture URL: " + testProfilePictureUrl);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test profile picture set successfully");
            response.put("profilePicture", testProfilePictureUrl);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to set test profile picture: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
