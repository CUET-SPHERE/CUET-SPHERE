package com.cuet.sphere.service;

import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.UserRepository;
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

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("=== CustomUserDetailsService.loadUserByUsername CALLED ===");
        System.out.println("Looking for user with email: " + username);

        User user = userRepository.findUserByEmail(username);

        if (user == null) {
            System.out.println("User not found with email: " + username);
            throw new UsernameNotFoundException("User not found with email: " + username);
        }

        System.out.println("User found:");
        System.out.println("- ID: " + user.getId());
        System.out.println("- Email: " + user.getEmail());
        System.out.println("- Full Name: " + user.getFullName());
        System.out.println("- Role: " + user.getRole());
        System.out.println("- Password is null: " + (user.getPassword() == null));
        System.out.println("- Password length: " + (user.getPassword() != null ? user.getPassword().length() : 0));

        // Check if password starts with BCrypt prefix
        if (user.getPassword() != null) {
            System.out.println("- Password starts with $2a$ (BCrypt): " + user.getPassword().startsWith("$2a$"));
            System.out.println("- Password starts with $2b$ (BCrypt): " + user.getPassword().startsWith("$2b$"));
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        if (user.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
            System.out.println("- Authority added: ROLE_" + user.getRole().name());
        } else {
            authorities.add(new SimpleGrantedAuthority("ROLE_STUDENT"));
            System.out.println("- Default authority added: ROLE_STUDENT");
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

        System.out.println("UserDetails created successfully");
        System.out.println("=== END CustomUserDetailsService.loadUserByUsername ===");

        return userDetails;
    }
}