package com.cuet.sphere.controller;

import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.UserRepository;
import com.cuet.sphere.service.UserService;
import com.cuet.sphere.exception.UserException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

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

            // Log current user state before update
            logger.debug("Updating profile for user: {}", user.getEmail());

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
                if (newProfilePictureUrl != null && !newProfilePictureUrl.trim().isEmpty()) {
                    user = userService.updateProfilePicture(user, newProfilePictureUrl);
                    // Return immediately to avoid overwriting with other fields
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Profile picture updated successfully");
                    response.put("user", user);
                    return ResponseEntity.ok(response);
                }
            }
            
            // Handle background image update with S3 cleanup  
            if (profileData.containsKey("backgroundImage")) {
                String newBackgroundImageUrl = (String) profileData.get("backgroundImage");
                if (newBackgroundImageUrl != null && !newBackgroundImageUrl.trim().isEmpty()) {
                    user = userService.updateBackgroundImage(user, newBackgroundImageUrl);
                    // Return immediately to avoid overwriting with other fields
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Background image updated successfully");
                    response.put("user", user);
                    return ResponseEntity.ok(response);
                }
            }

            // Save updated user only if no image fields were updated (since UserService methods already save)
            User updatedUser = user;
            if (!profileData.containsKey("profilePicture") && !profileData.containsKey("backgroundImage")) {
                updatedUser = userRepository.save(user);
            }

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

            logger.debug("Getting profile for user: {}", user.getEmail());

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

            logger.debug("Getting profile picture for user: {}", user.getEmail());

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

            logger.debug("Set test profile picture for user: {}", user.getEmail());

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
    
    // DEBUG ENDPOINT: Clear background image for current user
    @PostMapping("/clear-background")
    public ResponseEntity<Map<String, Object>> clearBackgroundImage() {
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

            User updatedUser = userService.clearBackgroundImage(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Background image cleared successfully");
            response.put("user", updatedUser);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to clear background image: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
