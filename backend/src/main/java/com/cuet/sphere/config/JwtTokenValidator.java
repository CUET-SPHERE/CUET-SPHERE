package com.cuet.sphere.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.List;

public class JwtTokenValidator extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        System.out.println("=== JWT FILTER PROCESSING ===");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Request Method: " + request.getMethod());

        // Skip JWT validation for public endpoints
        String requestURI = request.getRequestURI();
        if (requestURI.startsWith("/auth/") || requestURI.startsWith("/public/")) {
            System.out.println("Skipping JWT validation for public endpoint: " + requestURI);
            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("Processing JWT validation for protected endpoint: " + requestURI);
        String jwt = request.getHeader(JwtConstant.JWT_HEADER);

        // Check if jwt is not null AND starts with Bearer
        if (jwt != null && jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7); // Remove "Bearer " prefix
            System.out.println("JWT token found, validating...");

            try {
                SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRET_KEY.getBytes());
                Claims claims = Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(jwt)
                        .getPayload();

                String email = String.valueOf(claims.get("email"));
                String authorities = String.valueOf(claims.get("authorities"));

                System.out.println("JWT validation successful for email: " + email);

                // Handle null or "null" authorities
                List<GrantedAuthority> grantedAuthorities;
                if (authorities != null && !authorities.equals("null") && !authorities.isEmpty()) {
                    grantedAuthorities = AuthorityUtils.commaSeparatedStringToAuthorityList(authorities);
                } else {
                    grantedAuthorities = AuthorityUtils.commaSeparatedStringToAuthorityList("ROLE_USER");
                }

                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        email, null, grantedAuthorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                // Don't throw exception, just clear context and continue
                SecurityContextHolder.clearContext();
                System.out.println("JWT validation failed: " + e.getMessage());
            }
        } else {
            // No JWT token provided for protected endpoint
            System.out.println("No JWT token provided for protected endpoint");
            SecurityContextHolder.clearContext();
        }

        // Always continue filter chain
        System.out.println("Continuing filter chain...");
        filterChain.doFilter(request, response);
    }
} 