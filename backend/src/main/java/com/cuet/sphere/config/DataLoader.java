package com.cuet.sphere.config;

import com.cuet.sphere.model.Department;
import com.cuet.sphere.model.Course;
import com.cuet.sphere.model.Semester;
import com.cuet.sphere.model.User;
import com.cuet.sphere.repository.DepartmentRepository;
import com.cuet.sphere.repository.CourseRepository;
import com.cuet.sphere.repository.SemesterRepository;
import com.cuet.sphere.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@Profile("!h2") // Don't run for H2 profile
public class DataLoader implements CommandLineRunner {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SemesterRepository semesterRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
    // Load departments
    loadDepartments();
        
    // Load semesters
    loadSemesters();
        
    // Load admin user
    loadAdminUser();
        
    // Create notices table
    createNoticesTable();
        
    System.out.println("✅ Database initialized with sample data! (No courses pre-loaded)");
    }

    private void loadDepartments() {
        if (departmentRepository.count() == 0) {
            List<Department> departments = Arrays.asList(
                // Engineering Departments
                createDepartment("Civil Engineering"),
                createDepartment("Mechanical Engineering"),
                createDepartment("Electrical & Electronics Engineering"),
                createDepartment("Computer Science & Engineering"),
                createDepartment("Water Resources Engineering"),
                createDepartment("Petroleum & Mining Engineering"),
                createDepartment("Mechatronics and Industrial Engineering"),
                createDepartment("Electronics & Telecommunication Engineering"),
                createDepartment("Urban & Regional Planning"),
                createDepartment("Architecture"),
                createDepartment("Biomedical Engineering"),
                createDepartment("Nuclear Engineering"),
                createDepartment("Materials Science & Engineering"),
                
                // Basic Science Departments
                createDepartment("Physics"),
                createDepartment("Chemistry"),
                createDepartment("Mathematics"),
                createDepartment("Humanities")
            );
            
            departmentRepository.saveAll(departments);
            System.out.println("📚 Loaded " + departments.size() + " departments");
        }
    }

    private void loadSemesters() {
        if (semesterRepository.count() == 0) {
            List<Semester> semesters = Arrays.asList(
                createSemester("1-1"),
                createSemester("1-2"),
                createSemester("2-1"),
                createSemester("2-2"),
                createSemester("3-1"),
                createSemester("3-2"),
                createSemester("4-1"),
                createSemester("4-2")
            );
            
            semesterRepository.saveAll(semesters);
            System.out.println("📅 Loaded " + semesters.size() + " semesters");
        }
    }


    private Department createDepartment(String name) {
        Department dept = new Department();
        dept.setDeptName(name);
        return dept;
    }

    private Semester createSemester(String name) {
        Semester semester = new Semester();
        semester.setSemesterName(name);
        return semester;
    }

    private Course createCourse(String code, String name, Department department) {
        Course course = new Course();
        course.setCourseCode(code);
        course.setCourseName(name);
        course.setDepartment(department);
        return course;
    }
    
    private void loadAdminUser() {
        if (userRepository.count() == 0) {
            User adminUser = new User();
            adminUser.setFullName("System Administrator");
            adminUser.setEmail("admin@cuet.ac.bd");
            adminUser.setPassword(passwordEncoder.encode("asdf"));
            adminUser.setRole(User.Role.SYSTEM_ADMIN);
            adminUser.setBatch("00");
            adminUser.setDepartment("00");
            adminUser.setStudentId("000");
            adminUser.setHall("Admin Hall");
            adminUser.setBio("System Administrator for CUET Sphere");
            adminUser.setIsActive(true);
            
            userRepository.save(adminUser);
            System.out.println("👤 Created admin user: admin@cuet.ac.bd");
        }
    }
    
    private void createNoticesTable() {
        try {
            // This will be handled by JPA/Hibernate automatically
            // But we can add some logging to confirm the table exists
            System.out.println("📢 Notices table will be created by JPA/Hibernate if it doesn't exist");
        } catch (Exception e) {
            System.err.println("⚠️ Warning: Could not verify notices table: " + e.getMessage());
        }
    }
}
