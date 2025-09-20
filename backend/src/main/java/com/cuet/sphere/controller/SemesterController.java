package com.cuet.sphere.controller;

import com.cuet.sphere.dto.CurrentSemesterRequest;
import com.cuet.sphere.dto.CurrentSemesterResponse;
import com.cuet.sphere.service.SemesterService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/semesters")
@CrossOrigin(origins = "*")
public class SemesterController {

    @Autowired
    private SemesterService semesterService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CurrentSemesterResponse> createSemester(@Valid @RequestBody CurrentSemesterRequest request) {
        CurrentSemesterResponse response = semesterService.createCurrentSemester(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @GetMapping("/active")
    public ResponseEntity<CurrentSemesterResponse> getActiveSemester(@RequestParam String department, @RequestParam String batch) {
        CurrentSemesterResponse response = semesterService.getCurrentActiveSemester(department, batch);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    public ResponseEntity<List<CurrentSemesterResponse>> getAllSemesters(@RequestParam String department, @RequestParam String batch) {
        List<CurrentSemesterResponse> responses = semesterService.getAllSemesters(department, batch);
        return ResponseEntity.ok(responses);
    }
    
    @PutMapping("/{batch}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CurrentSemesterResponse> updateSemester(
            @PathVariable String batch, 
            @Valid @RequestBody CurrentSemesterRequest request) {
        CurrentSemesterResponse response = semesterService.updateCurrentSemester(batch, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{batch}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSemester(@PathVariable String batch) {
        semesterService.deleteSemester(batch);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CurrentSemesterResponse> setActiveSemester(
            @RequestParam String department,
            @RequestParam String batch,
            @RequestParam String semesterName) {
        CurrentSemesterResponse response = semesterService.setActiveSemester(department, batch, semesterName);
        return ResponseEntity.ok(response);
    }
}