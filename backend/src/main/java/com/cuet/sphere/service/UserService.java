package com.cuet.sphere.service;

import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private S3Service s3Service;

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getUserByStudentId(String studentId) {
        return userRepository.findByStudentId(studentId);
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        // Get user before deletion to clean up S3 files
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Delete profile picture from S3 if exists
            if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
                try {
                    s3Service.deleteFile(user.getProfilePicture());
                } catch (Exception e) {
                    // Failed to delete profile picture from S3
                }
            }
            
            // Delete background image from S3 if exists
            if (user.getBackgroundImage() != null && !user.getBackgroundImage().isEmpty()) {
                try {
                    s3Service.deleteFile(user.getBackgroundImage());
                } catch (Exception e) {
                    // Failed to delete background image from S3
                }
            }
        }
        
        userRepository.deleteById(id);
    }
    
    public User updateProfilePicture(User user, String newProfilePictureUrl) {
        // Validate URL
        if (newProfilePictureUrl == null || newProfilePictureUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("Profile picture URL cannot be null or empty");
        }
        
        // Get fresh user from database to avoid overwriting other fields
        User freshUser = userRepository.findUserByEmail(user.getEmail());
        if (freshUser == null) {
            throw new RuntimeException("User not found: " + user.getEmail());
        }
        
        // Delete old profile picture from S3 if exists
        if (freshUser.getProfilePicture() != null && !freshUser.getProfilePicture().isEmpty()) {
            try {
                s3Service.deleteFile(freshUser.getProfilePicture());
            } catch (Exception e) {
                // Failed to delete old profile picture from S3
            }
        }
        
        // Update ONLY the profile picture field, preserve everything else
        freshUser.setProfilePicture(newProfilePictureUrl.trim());
        
        return userRepository.save(freshUser);
    }
    
    public User updateBackgroundImage(User user, String newBackgroundImageUrl) {
        // Validate URL
        if (newBackgroundImageUrl == null || newBackgroundImageUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("Background image URL cannot be null or empty");
        }
        
        // Get fresh user from database to avoid overwriting other fields
        User freshUser = userRepository.findUserByEmail(user.getEmail());
        if (freshUser == null) {
            throw new RuntimeException("User not found: " + user.getEmail());
        }
        
        // Delete old background image from S3 if exists
        if (freshUser.getBackgroundImage() != null && !freshUser.getBackgroundImage().isEmpty()) {
            try {
                s3Service.deleteFile(freshUser.getBackgroundImage());
            } catch (Exception e) {
                // Failed to delete old background image from S3
            }
        }
        
        // Update ONLY the background image field, preserve everything else
        freshUser.setBackgroundImage(newBackgroundImageUrl.trim());
        
        return userRepository.save(freshUser);
    }
}