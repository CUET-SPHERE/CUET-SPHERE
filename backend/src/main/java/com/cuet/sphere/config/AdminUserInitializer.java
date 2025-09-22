package com.cuet.sphere.config;

import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Value("${system.admin.email:u2204015@student.cuet.ac.bd}")
    private String systemAdminEmail;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Check if the system admin user exists and update their role
            User adminUser = userRepository.findUserByEmail(systemAdminEmail);
            if (adminUser != null) {
                if (adminUser.getRole() != User.Role.SYSTEM_ADMIN) {
                    adminUser.setRole(User.Role.SYSTEM_ADMIN);
                    userRepository.save(adminUser);
                    logger.info("Updated user {} to SYSTEM_ADMIN role", systemAdminEmail);
                } else {
                    logger.debug("User {} already has SYSTEM_ADMIN role", systemAdminEmail);
                }
            } else {
                logger.warn("System admin user {} not found in database", systemAdminEmail);
            }
        } catch (Exception e) {
            logger.error("Error updating admin user role: {}", e.getMessage());
        }
    }
}