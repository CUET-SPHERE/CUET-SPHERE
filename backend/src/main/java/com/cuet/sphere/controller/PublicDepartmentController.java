package com.cuet.sphere.controller;

import com.cuet.sphere.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/public/departments")
@CrossOrigin(origins = "*")
public class PublicDepartmentController {
    
    private static final Logger logger = LoggerFactory.getLogger(PublicDepartmentController.class);
    
    @Autowired
    private DepartmentService departmentService;
    
    /**
     * Get department name by code (public endpoint)
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<?> getDepartmentNameByCode(@PathVariable String code) {
        try {
            String departmentName = departmentService.getDepartmentNameByCode(code);
            
            if (departmentName == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Department not found for code: " + code);
                error.put("success", false);
                return ResponseEntity.status(404).body(error);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", code);
            response.put("name", departmentName);
            response.put("success", true);
            
            logger.info("Retrieved department name for code {}: {}", code, departmentName);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving department name for code {}: {}", code, e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("success", false);
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get all department codes and names (public endpoint)
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllDepartmentCodes() {
        try {
            Map<String, Object> departments = departmentService.getAllDepartments();
            logger.info("Retrieved all department codes and names");
            return ResponseEntity.ok(departments);
            
        } catch (Exception e) {
            logger.error("Error retrieving all departments: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("success", false);
            return ResponseEntity.status(500).body(error);
        }
    }
}