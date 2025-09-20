package com.cuet.sphere.service;

import com.cuet.sphere.dto.CourseResponse;
import com.cuet.sphere.dto.CurrentSemesterRequest;
import com.cuet.sphere.dto.CurrentSemesterResponse;
import com.cuet.sphere.exception.ResourceAlreadyExistsException;
import com.cuet.sphere.exception.ResourceNotFoundException;
import com.cuet.sphere.model.Course;
import com.cuet.sphere.model.CurrentSemester;
import com.cuet.sphere.model.Department;
import com.cuet.sphere.model.Semester;
import com.cuet.sphere.repository.CourseRepository;
import com.cuet.sphere.repository.CurrentSemesterRepository;
import com.cuet.sphere.repository.DepartmentRepository;
import com.cuet.sphere.repository.SemesterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SemesterService {
    
    @Autowired
    private CurrentSemesterRepository currentSemesterRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private SemesterRepository semesterRepository;

    @Transactional
    public CurrentSemesterResponse createCurrentSemester(CurrentSemesterRequest request) {
        // Check if a semester with this name already exists for this department and batch
        if (currentSemesterRepository.existsBySemester_SemesterNameAndDepartment_DeptNameAndBatch(request.getSemesterName(), request.getDepartment(), request.getBatch())) {
            throw new ResourceAlreadyExistsException("A semester with name " + request.getSemesterName() + 
                                                    " already exists for department " + request.getDepartment() + " and batch " + request.getBatch());
        }
        
        Department department = departmentRepository.findByDeptName(request.getDepartment())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with name: " + request.getDepartment()));
        
        // If setting this as active, deactivate any currently active semester for this batch
        if (request.getIsActive()) {
            currentSemesterRepository.findActiveByDepartmentAndBatch(request.getDepartment(), request.getBatch())
                    .ifPresent(activeSemester -> {
                        activeSemester.setIsActive(false);
                        currentSemesterRepository.save(activeSemester);
                    });
        }
        
        CurrentSemester currentSemester = new CurrentSemester();
        
        // Find the semester entity by name
        Semester semesterEntity = semesterRepository.findBySemesterName(request.getSemesterName());
        if (semesterEntity == null) {
            throw new ResourceNotFoundException("Semester not found with name: " + request.getSemesterName());
        }
        
        currentSemester.setSemester(semesterEntity);
        currentSemester.setDepartment(department);
        currentSemester.setBatch(request.getBatch());
        currentSemester.setIsActive(request.getIsActive());
        
        CurrentSemester savedSemester = currentSemesterRepository.save(currentSemester);
        
        return mapToResponse(savedSemester);
    }
    
    public CurrentSemesterResponse getCurrentActiveSemester(String department, String batch) {
        CurrentSemester currentSemester = currentSemesterRepository.findActiveByDepartmentAndBatch(department, batch)
                .orElseThrow(() -> new ResourceNotFoundException("No active semester found for department: " + department + " and batch: " + batch));
        
        return mapToResponse(currentSemester);
    }
    
    public List<CurrentSemesterResponse> getAllSemesters(String department, String batch) {
        List<CurrentSemester> semesters = currentSemesterRepository.findByDepartmentAndBatch(department, batch);
        
        return semesters.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public CurrentSemesterResponse updateCurrentSemester(String batch, CurrentSemesterRequest request) {
        CurrentSemester currentSemester = currentSemesterRepository.findById(batch)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with batch: " + batch));
        
        Department department = departmentRepository.findByDeptName(request.getDepartment())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with name: " + request.getDepartment()));
        
        // If setting this as active, deactivate any currently active semester for this batch
        if (request.getIsActive() && !currentSemester.getIsActive()) {
            currentSemesterRepository.findActiveByDepartmentAndBatch(request.getDepartment(), request.getBatch())
                    .ifPresent(activeSemester -> {
                        activeSemester.setIsActive(false);
                        currentSemesterRepository.save(activeSemester);
                    });
        }
        
        // Find the semester entity by name
        Semester semesterEntity = semesterRepository.findBySemesterName(request.getSemesterName());
        if (semesterEntity == null) {
            throw new ResourceNotFoundException("Semester not found with name: " + request.getSemesterName());
        }
        
        currentSemester.setSemester(semesterEntity);
        currentSemester.setDepartment(department);
        currentSemester.setBatch(request.getBatch());
        currentSemester.setIsActive(request.getIsActive());
        
        CurrentSemester updatedSemester = currentSemesterRepository.save(currentSemester);
        
        return mapToResponse(updatedSemester);
    }
    
    @Transactional
    public void deleteSemester(String batch) {
        CurrentSemester semester = currentSemesterRepository.findById(batch)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with batch: " + batch));
        
        // You might want to handle semester deletion logically rather than physically
        // depending on your application requirements
        currentSemesterRepository.delete(semester);
    }
    
    @Transactional
    public CurrentSemesterResponse setActiveSemester(String department, String batch, String semesterName) {
        // First, deactivate the currently active semester if any for this batch
        currentSemesterRepository.findActiveByDepartmentAndBatch(department, batch)
                .ifPresent(activeSemester -> {
                    activeSemester.setIsActive(false);
                    currentSemesterRepository.save(activeSemester);
                });
        
        // Then activate the requested semester
        CurrentSemester semesterToActivate = currentSemesterRepository.findBySemesterNameAndDepartmentAndBatch(semesterName, department, batch)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with name: " + semesterName + 
                                                                " for department: " + department + " and batch: " + batch));
        
        semesterToActivate.setIsActive(true);
        CurrentSemester activatedSemester = currentSemesterRepository.save(semesterToActivate);
        
        return mapToResponse(activatedSemester);
    }
    
    private CurrentSemesterResponse mapToResponse(CurrentSemester semester) {
        List<CourseResponse> courseResponses = new ArrayList<>();
        
        // Note: CurrentSemester no longer has a direct courses relationship
        // If you need courses for a semester, query them separately
        
        return CurrentSemesterResponse.builder()
                .id(semester.getBatch()) // Use batch as ID since it's the primary key
                .semesterName(semester.getSemester().getSemesterName())
                .department(semester.getDepartment().getDeptName())
                .batch(semester.getBatch())
                .isActive(semester.getIsActive())
                .courses(courseResponses)
                .build();
    }
}