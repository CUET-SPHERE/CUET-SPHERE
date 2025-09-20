package com.cuet.sphere.controller;

import com.cuet.sphere.model.CurrentSemester;
import com.cuet.sphere.model.Department;
import com.cuet.sphere.model.Semester;
import com.cuet.sphere.repository.CurrentSemesterRepository;
import com.cuet.sphere.repository.DepartmentRepository;
import com.cuet.sphere.repository.SemesterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/semester-info")
@CrossOrigin(origins = "*")
public class SemesterInfoController {

    @Autowired
    private CurrentSemesterRepository currentSemesterRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private SemesterRepository semesterRepository;
    
    private static final Logger logger = LoggerFactory.getLogger(SemesterInfoController.class);

    @GetMapping("/by-id")
    public ResponseEntity<?> getSemesterById(@RequestParam String batch) {
        try {
            logger.info("Looking up semester with batch: {}", batch);
            boolean exists = currentSemesterRepository.existsById(batch);
            logger.info("Semester with batch {} exists: {}", batch, exists);
            
            Optional<CurrentSemester> semesterOpt = currentSemesterRepository.findById(batch);
            if (semesterOpt.isPresent()) {
                CurrentSemester semester = semesterOpt.get();
                Map<String, Object> response = new HashMap<>();
                response.put("id", semester.getBatch()); // Use batch as ID
                response.put("semesterName", semester.getSemester().getSemesterName());
                response.put("department", semester.getDepartment().getDeptName());
                response.put("isActive", semester.getIsActive());
                response.put("batch", semester.getBatch());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Semester not found with batch: " + batch);
                errorResponse.put("exists", exists);
                
                // List all available semesters
                List<CurrentSemester> allSemesters = currentSemesterRepository.findAll();
                List<Map<String, Object>> semesterList = allSemesters.stream().map(s -> {
                    Map<String, Object> semesterInfo = new HashMap<>();
                    semesterInfo.put("id", s.getBatch());
                    semesterInfo.put("semesterName", s.getSemester().getSemesterName());
                    semesterInfo.put("department", s.getDepartment().getDeptName());
                    semesterInfo.put("batch", s.getBatch());
                    return semesterInfo;
                }).collect(Collectors.toList());
                errorResponse.put("availableSemesters", semesterList);
                
                return ResponseEntity.status(404).body(errorResponse);
            }
        } catch (Exception e) {
            logger.error("Error looking up semester by batch: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/by-department")
    public ResponseEntity<?> getSemestersByDepartment(@RequestParam String department, @RequestParam String batch) {
        try {
            List<CurrentSemester> semesters = currentSemesterRepository.findByDepartmentAndBatch(department, batch);
            
            List<Map<String, Object>> response = semesters.stream().map(sem -> {
                Map<String, Object> semesterInfo = new HashMap<>();
                semesterInfo.put("id", sem.getBatch()); // Use batch as ID
                semesterInfo.put("semesterName", sem.getSemester().getSemesterName());
                semesterInfo.put("isActive", sem.getIsActive());
                semesterInfo.put("batch", sem.getBatch());
                return semesterInfo;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/ensure")
    public ResponseEntity<?> ensureSemesterExists(
            @RequestParam(required = false) String batch,
            @RequestParam String semesterName,
            @RequestParam String department,
            @RequestParam(required = false) String defaultBatch) {
        try {
            // Use provided batch or default batch
            String actualBatch = batch != null ? batch : defaultBatch;
            logger.info("Ensuring semester exists - Batch: {}, Name: {}, Department: {}", actualBatch, semesterName, department);
            
            // Try to find the semester by batch if provided
            if (actualBatch != null) {
                Optional<CurrentSemester> semesterById = currentSemesterRepository.findById(actualBatch);
                if (semesterById.isPresent()) {
                    CurrentSemester semester = semesterById.get();
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", semester.getBatch());
                    response.put("semesterName", semester.getSemester().getSemesterName());
                    response.put("department", semester.getDepartment().getDeptName());
                    response.put("isActive", semester.getIsActive());
                    response.put("batch", semester.getBatch());
                    response.put("created", false);
                    return ResponseEntity.ok(response);
                }
            }
            
            // Try to find the semester by name and department
            Optional<CurrentSemester> semesterByName = 
                currentSemesterRepository.findBySemesterNameAndDepartmentAndBatch(semesterName, department, actualBatch);
            
            if (semesterByName.isPresent()) {
                CurrentSemester semester = semesterByName.get();
                Map<String, Object> response = new HashMap<>();
                response.put("id", semester.getBatch());
                response.put("semesterName", semester.getSemester().getSemesterName());
                response.put("department", semester.getDepartment().getDeptName());
                response.put("isActive", semester.getIsActive());
                response.put("batch", semester.getBatch());
                response.put("created", false);
                return ResponseEntity.ok(response);
            }
            
            // If not found, create a new semester
            Department departmentEntity = departmentRepository
                .findByDeptName(department)
                .orElseThrow(() -> new RuntimeException("Department not found: " + department));
            
            // Find the semester entity by name
            Semester semesterEntity = semesterRepository.findBySemesterName(semesterName);
            if (semesterEntity == null) {
                throw new RuntimeException("Semester not found with name: " + semesterName);
            }
            
            CurrentSemester newSemester = new CurrentSemester();
            newSemester.setSemester(semesterEntity);
            newSemester.setDepartment(departmentEntity);
            newSemester.setBatch(actualBatch);
            newSemester.setIsActive(false);
            
            CurrentSemester savedSemester = currentSemesterRepository.save(newSemester);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedSemester.getBatch());
            response.put("semesterName", savedSemester.getSemester().getSemesterName());
            response.put("department", savedSemester.getDepartment().getDeptName());
            response.put("isActive", savedSemester.getIsActive());
            response.put("batch", savedSemester.getBatch());
            response.put("created", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error ensuring semester exists: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/by-name")
    public ResponseEntity<?> getSemesterByNameAndDepartment(
            @RequestParam String semesterName, 
            @RequestParam String department,
            @RequestParam String batch) {
        try {
            return currentSemesterRepository.findBySemesterNameAndDepartmentAndBatch(semesterName, department, batch)
                .map(semester -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", semester.getBatch()); // Use batch as ID
                    response.put("semesterName", semester.getSemester().getSemesterName());
                    response.put("isActive", semester.getIsActive());
                    response.put("batch", semester.getBatch());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Semester not found");
                    return ResponseEntity.status(404).body(errorResponse);
                });
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}