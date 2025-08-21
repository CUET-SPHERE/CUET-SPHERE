package com.cuet.sphere;

import com.cuet.sphere.controller.AuthController;
import com.cuet.sphere.exception.UserException;
import com.cuet.sphere.response.SigninRequest;
import com.cuet.sphere.response.AuthResponse;
import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.UserRepository;
import com.cuet.sphere.config.JwtProvider;
import com.cuet.sphere.service.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
class AuthControllerTest {

    @Autowired
    private AuthController authController;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtProvider jwtProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private AuthenticationManager authenticationManager;

    @Test
    void testSigninWithValidCredentials() throws UserException {
        // Arrange
        SigninRequest signinRequest = new SigninRequest("test@example.com", "password123");
        
        User mockUser = new User();
        mockUser.setEmail("test@example.com");
        mockUser.setFullName("Test User");
        mockUser.setRole(User.Role.STUDENT);
        
        Authentication mockAuth = new UsernamePasswordAuthenticationToken(
            "test@example.com", 
            "password123",
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );
        
        when(userRepository.findUserByEmail("test@example.com")).thenReturn(mockUser);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(mockAuth);
        when(jwtProvider.generateToken(any(Authentication.class))).thenReturn("mock.jwt.token");
        
        // Act
        ResponseEntity<AuthResponse> response = authController.signinHandler(signinRequest);
        
        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("mock.jwt.token", response.getBody().getToken());
        assertEquals("test@example.com", response.getBody().getEmail());
        assertEquals("Test User", response.getBody().getFullName());
        assertEquals("STUDENT", response.getBody().getRole());
    }

    @Test
    void testSigninWithEmptyCredentials() {
        // Arrange
        SigninRequest signinRequest = new SigninRequest("", "");
        
        // Act & Assert
        assertThrows(Exception.class, () -> {
            authController.signinHandler(signinRequest);
        });
    }
} 