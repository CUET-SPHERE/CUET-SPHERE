package com.cuet.sphere.service;

import com.cuet.sphere.model.Department;
import com.cuet.sphere.repository.DepartmentRepository;
import com.cuet.sphere.response.DepartmentResponse;
import com.cuet.sphere.response.DepartmentRequest;
import com.cuet.sphere.exception.UserException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
public class DepartmentService {
    
    private static final Logger logger = LoggerFactory.getLogger(DepartmentService.class);
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    // Department code to name mapping (for legacy support)
    private static final Map<String, String> DEPT_CODE_MAP = new HashMap<String, String>() {{
        put("01", "Civil Engineering");
        put("02", "Electrical and Electronical Engineering");
        put("03", "Mechanical Engineering");
        put("04", "Computer Science & Engineering");
        put("05", "Water Resources Engineering");
        put("06", "Petroleum & Mining Engineering");
        put("07", "Mechatronics and Industrial Engineering");
        put("08", "Electronics & Telecommunication Engineering");
        put("09", "Urban & Regional Planning");
        put("10", "Architecture");
        put("11", "Biomedical Engineering");
        put("12", "Nuclear Engineering");
        put("13", "Materials Science & Engineering");
        put("14", "Physics");
        put("15", "Chemistry");
        put("16", "Mathematics");
        put("17", "Humanities");
    }};
    
    // Reverse mapping for name to code
    private static final Map<String, String> DEPT_NAME_TO_CODE_MAP = new HashMap<>();
    static {
        for (Map.Entry<String, String> entry : DEPT_CODE_MAP.entrySet()) {
            DEPT_NAME_TO_CODE_MAP.put(entry.getValue(), entry.getKey());
        }
    }
    
    /**
     * Get all departments with their codes
     */
    public Map<String, Object> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        
        Map<String, String> departmentMap = new HashMap<>();
        Map<String, Long> departmentIds = new HashMap<>();
        
        for (Department dept : departments) {
            String code = DEPT_NAME_TO_CODE_MAP.get(dept.getDeptName());
            if (code != null) {
                departmentMap.put(code, dept.getDeptName());
                departmentIds.put(code, dept.getDeptId());
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("departments", departmentMap);
        response.put("departmentIds", departmentIds);
        response.put("total", departmentMap.size());
        response.put("success", true);
        
        logger.info("Retrieved {} departments", departmentMap.size());
        return response;
    }
    
    /**
     * Get total department count
     */
    public long getDepartmentCount() {
        return departmentRepository.count();
    }
    
    /**
     * Create a new department
     */
    public DepartmentResponse createDepartment(DepartmentRequest request) throws UserException {
        // Check if department already exists
        Optional<Department> existingDept = departmentRepository.findByDeptName(request.getName());
        if (existingDept.isPresent()) {
            throw new UserException("Department already exists: " + request.getName());
        }
        
        // Validate department code if provided
        if (request.getCode() != null && DEPT_CODE_MAP.containsKey(request.getCode())) {
            String expectedName = DEPT_CODE_MAP.get(request.getCode());
            if (!expectedName.equals(request.getName())) {
                throw new UserException("Department code " + request.getCode() + " is reserved for: " + expectedName);
            }
        }
        
        Department department = new Department();
        department.setDeptName(request.getName());
        
        Department savedDept = departmentRepository.save(department);
        
        DepartmentResponse response = new DepartmentResponse();
        response.setId(savedDept.getDeptId());
        response.setName(savedDept.getDeptName());
        response.setCode(request.getCode());
        response.setMessage("Department created successfully");
        response.setSuccess(true);
        
        logger.info("Created new department: {} with ID: {}", savedDept.getDeptName(), savedDept.getDeptId());
        
        return response;
    }
    
    /**
     * Update a department
     */
    public DepartmentResponse updateDepartment(Long deptId, DepartmentRequest request) throws UserException {
        Department department = departmentRepository.findById(deptId)
            .orElseThrow(() -> new UserException("Department not found with ID: " + deptId));
        
        // Check if new name conflicts with existing department
        if (!department.getDeptName().equals(request.getName())) {
            Optional<Department> existingDept = departmentRepository.findByDeptName(request.getName());
            if (existingDept.isPresent()) {
                throw new UserException("Department already exists with name: " + request.getName());
            }
        }
        
        department.setDeptName(request.getName());
        Department savedDept = departmentRepository.save(department);
        
        DepartmentResponse response = new DepartmentResponse();
        response.setId(savedDept.getDeptId());
        response.setName(savedDept.getDeptName());
        response.setCode(request.getCode());
        response.setMessage("Department updated successfully");
        response.setSuccess(true);
        
        logger.info("Updated department ID: {} to name: {}", deptId, savedDept.getDeptName());
        
        return response;
    }
    
    /**
     * Delete a department
     */
    public void deleteDepartment(Long deptId) throws UserException {
        Department department = departmentRepository.findById(deptId)
            .orElseThrow(() -> new UserException("Department not found with ID: " + deptId));
        
        // Check if department has courses
        if (department.getCourses() != null && !department.getCourses().isEmpty()) {
            throw new UserException("Cannot delete department with existing courses. Please remove courses first.");
        }
        
        String deptName = department.getDeptName();
        departmentRepository.delete(department);
        
        logger.info("Deleted department: {} with ID: {}", deptName, deptId);
    }
    
    /**
     * Get department by code
     */
    public Department getDepartmentByCode(String code) throws UserException {
        String deptName = DEPT_CODE_MAP.get(code);
        if (deptName == null) {
            throw new UserException("Invalid department code: " + code);
        }
        
        return departmentRepository.findByDeptName(deptName)
            .orElseThrow(() -> new UserException("Department not found: " + deptName));
    }
    
    /**
     * Get department code by name
     */
    public String getDepartmentCodeByName(String name) {
        return DEPT_NAME_TO_CODE_MAP.get(name);
    }
    
    /**
     * Get department name by code
     */
    public String getDepartmentNameByCode(String code) {
        return DEPT_CODE_MAP.get(code);
    }
}