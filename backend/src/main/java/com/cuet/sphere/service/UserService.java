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
        // Delete old profile picture from S3 if exists
        if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
            try {
                s3Service.deleteFile(user.getProfilePicture());
            } catch (Exception e) {
                // Failed to delete old profile picture from S3
            }
        }
        
        // Update user with new profile picture URL
        user.setProfilePicture(newProfilePictureUrl);
        return userRepository.save(user);
    }
    
    public User updateBackgroundImage(User user, String newBackgroundImageUrl) {
        // Delete old background image from S3 if exists
        if (user.getBackgroundImage() != null && !user.getBackgroundImage().isEmpty()) {
            try {
                s3Service.deleteFile(user.getBackgroundImage());
            } catch (Exception e) {
                // Failed to delete old background image from S3
            }
        }
        
        // Update user with new background image URL
        user.setBackgroundImage(newBackgroundImageUrl);
        return userRepository.save(user);
    }
}