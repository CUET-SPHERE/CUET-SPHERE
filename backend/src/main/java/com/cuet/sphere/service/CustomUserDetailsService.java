package com.cuet.sphere.service;

import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.debug("Loading user by username: {}", username);

        User user = userRepository.findUserByEmail(username);

        if (user == null) {
            logger.warn("User not found with email: {}", username);
            throw new UsernameNotFoundException("User not found with email: " + username);
        }

        logger.debug("User found - ID: {}, Email: {}, Role: {}", 
                    user.getId(), user.getEmail(), user.getRole());

        List<GrantedAuthority> authorities = new ArrayList<>();
        if (user.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
            logger.debug("Authority added: ROLE_{}", user.getRole().name());
        } else {
            authorities.add(new SimpleGrantedAuthority("ROLE_STUDENT"));
            logger.debug("Default authority added: ROLE_STUDENT");
        }

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                true, // enabled - removed getIsActive() dependency
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                authorities
        );

        logger.debug("UserDetails created successfully for user: {}", username);
        return userDetails;
    }
}