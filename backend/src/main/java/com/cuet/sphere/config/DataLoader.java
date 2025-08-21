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
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
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
        
        // Load courses
        loadCourses();
        
        // Load admin user
        loadAdminUser();
        
        // Create notices table
        createNoticesTable();
        
        System.out.println("✅ Database initialized with sample data!");
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

    private void loadCourses() {
        if (courseRepository.count() == 0) {
            // Get departments
            Department cse = departmentRepository.findByDeptName("Computer Science & Engineering");
            Department eee = departmentRepository.findByDeptName("Electrical & Electronics Engineering");
            Department ce = departmentRepository.findByDeptName("Civil Engineering");
            Department me = departmentRepository.findByDeptName("Mechanical Engineering");
            Department wre = departmentRepository.findByDeptName("Water Resources Engineering");
            Department pme = departmentRepository.findByDeptName("Petroleum & Mining Engineering");
            Department mie = departmentRepository.findByDeptName("Mechatronics and Industrial Engineering");
            Department ete = departmentRepository.findByDeptName("Electronics & Telecommunication Engineering");
            Department urp = departmentRepository.findByDeptName("Urban & Regional Planning");
            Department arch = departmentRepository.findByDeptName("Architecture");
            Department bme = departmentRepository.findByDeptName("Biomedical Engineering");
            Department ne = departmentRepository.findByDeptName("Nuclear Engineering");
            Department mse = departmentRepository.findByDeptName("Materials Science & Engineering");
            Department physics = departmentRepository.findByDeptName("Physics");
            Department chemistry = departmentRepository.findByDeptName("Chemistry");
            Department math = departmentRepository.findByDeptName("Mathematics");
            Department humanities = departmentRepository.findByDeptName("Humanities");

            List<Course> courses = Arrays.asList(
                // CSE Courses (Computer Science & Engineering)
                createCourse("CSE-101", "Introduction to Programming", cse),
                createCourse("CSE-102", "Programming Language", cse),
                createCourse("CSE-103", "Discrete Mathematics", cse),
                createCourse("CSE-104", "Physics", cse),
                createCourse("CSE-105", "Chemistry", cse),
                createCourse("CSE-106", "English", cse),
                createCourse("CSE-107", "Bangla", cse),
                createCourse("CSE-108", "Social Science", cse),
                
                createCourse("CSE-201", "Data Structures", cse),
                createCourse("CSE-202", "Object Oriented Programming", cse),
                createCourse("CSE-203", "Digital Logic Design", cse),
                createCourse("CSE-204", "Electrical Circuits", cse),
                createCourse("CSE-205", "Calculus", cse),
                createCourse("CSE-206", "Statistics", cse),
                
                createCourse("CSE-301", "Algorithm Design and Analysis", cse),
                createCourse("CSE-302", "Database Management Systems", cse),
                createCourse("CSE-303", "Computer Architecture", cse),
                createCourse("CSE-304", "Operating Systems", cse),
                createCourse("CSE-305", "Software Engineering", cse),
                createCourse("CSE-306", "Computer Networks", cse),
                
                createCourse("CSE-401", "Artificial Intelligence", cse),
                createCourse("CSE-402", "Machine Learning", cse),
                createCourse("CSE-403", "Computer Graphics", cse),
                createCourse("CSE-404", "Web Technologies", cse),
                createCourse("CSE-405", "Mobile Application Development", cse),
                createCourse("CSE-406", "Information Security", cse),
                
                // EEE Courses (Electrical & Electronics Engineering)
                createCourse("EEE-101", "Basic Electronics", eee),
                createCourse("EEE-102", "Electrical Circuits I", eee),
                createCourse("EEE-103", "Engineering Drawing", eee),
                createCourse("EEE-104", "Physics", eee),
                createCourse("EEE-105", "Chemistry", eee),
                createCourse("EEE-106", "English", eee),
                
                createCourse("EEE-201", "Electrical Circuits II", eee),
                createCourse("EEE-202", "Electronics I", eee),
                createCourse("EEE-203", "Digital Electronics", eee),
                createCourse("EEE-204", "Electromagnetic Theory", eee),
                createCourse("EEE-205", "Mathematics", eee),
                
                createCourse("EEE-301", "Electronics II", eee),
                createCourse("EEE-302", "Electrical Machines", eee),
                createCourse("EEE-303", "Power Systems", eee),
                createCourse("EEE-304", "Control Systems", eee),
                createCourse("EEE-305", "Communication Systems", eee),
                
                // CE Courses (Civil Engineering)
                createCourse("CE-101", "Engineering Drawing", ce),
                createCourse("CE-102", "Engineering Mechanics", ce),
                createCourse("CE-103", "Physics", ce),
                createCourse("CE-104", "Chemistry", ce),
                createCourse("CE-105", "Mathematics", ce),
                createCourse("CE-106", "English", ce),
                
                createCourse("CE-201", "Surveying", ce),
                createCourse("CE-202", "Strength of Materials", ce),
                createCourse("CE-203", "Fluid Mechanics", ce),
                createCourse("CE-204", "Engineering Geology", ce),
                createCourse("CE-205", "Transportation Engineering", ce),
                
                createCourse("CE-301", "Structural Analysis", ce),
                createCourse("CE-302", "Reinforced Concrete Design", ce),
                createCourse("CE-303", "Steel Structure Design", ce),
                createCourse("CE-304", "Foundation Engineering", ce),
                createCourse("CE-305", "Water Resources Engineering", ce),
                
                // ME Courses (Mechanical Engineering)
                createCourse("ME-101", "Engineering Drawing", me),
                createCourse("ME-102", "Engineering Mechanics", me),
                createCourse("ME-103", "Workshop Practice", me),
                createCourse("ME-104", "Physics", me),
                createCourse("ME-105", "Chemistry", me),
                
                createCourse("ME-201", "Thermodynamics", me),
                createCourse("ME-202", "Fluid Mechanics", me),
                createCourse("ME-203", "Strength of Materials", me),
                createCourse("ME-204", "Machine Design", me),
                createCourse("ME-205", "Manufacturing Processes", me),
                
                // WRE Courses (Water Resources Engineering)
                createCourse("WRE-101", "Engineering Drawing", wre),
                createCourse("WRE-102", "Engineering Mechanics", wre),
                createCourse("WRE-103", "Physics", wre),
                createCourse("WRE-104", "Chemistry", wre),
                createCourse("WRE-105", "Mathematics", wre),
                
                createCourse("WRE-201", "Hydraulics", wre),
                createCourse("WRE-202", "Hydrology", wre),
                createCourse("WRE-203", "Water Resources Planning", wre),
                createCourse("WRE-204", "Irrigation Engineering", wre),
                createCourse("WRE-205", "Drainage Engineering", wre),
                
                // PME Courses (Petroleum & Mining Engineering)
                createCourse("PME-101", "Engineering Drawing", pme),
                createCourse("PME-102", "Engineering Mechanics", pme),
                createCourse("PME-103", "Physics", pme),
                createCourse("PME-104", "Chemistry", pme),
                createCourse("PME-105", "Mathematics", pme),
                
                createCourse("PME-201", "Petroleum Geology", pme),
                createCourse("PME-202", "Drilling Engineering", pme),
                createCourse("PME-203", "Reservoir Engineering", pme),
                createCourse("PME-204", "Mining Engineering", pme),
                createCourse("PME-205", "Petroleum Production", pme),
                
                // MIE Courses (Mechatronics and Industrial Engineering)
                createCourse("MIE-101", "Engineering Drawing", mie),
                createCourse("MIE-102", "Engineering Mechanics", mie),
                createCourse("MIE-103", "Physics", mie),
                createCourse("MIE-104", "Chemistry", mie),
                createCourse("MIE-105", "Mathematics", mie),
                
                createCourse("MIE-201", "Mechatronics Systems", mie),
                createCourse("MIE-202", "Industrial Automation", mie),
                createCourse("MIE-203", "Robotics", mie),
                createCourse("MIE-204", "Manufacturing Systems", mie),
                createCourse("MIE-205", "Quality Control", mie),
                
                // ETE Courses (Electronics & Telecommunication Engineering)
                createCourse("ETE-101", "Basic Electronics", ete),
                createCourse("ETE-102", "Electrical Circuits", ete),
                createCourse("ETE-103", "Physics", ete),
                createCourse("ETE-104", "Chemistry", ete),
                createCourse("ETE-105", "Mathematics", ete),
                
                createCourse("ETE-201", "Digital Electronics", ete),
                createCourse("ETE-202", "Communication Theory", ete),
                createCourse("ETE-203", "Signal Processing", ete),
                createCourse("ETE-204", "Telecommunication Systems", ete),
                createCourse("ETE-205", "Wireless Communication", ete),
                
                // URP Courses (Urban & Regional Planning)
                createCourse("URP-101", "Planning Drawing", urp),
                createCourse("URP-102", "Planning Theory", urp),
                createCourse("URP-103", "Physics", urp),
                createCourse("URP-104", "Chemistry", urp),
                createCourse("URP-105", "Mathematics", urp),
                
                createCourse("URP-201", "Urban Planning", urp),
                createCourse("URP-202", "Regional Planning", urp),
                createCourse("URP-203", "Transportation Planning", urp),
                createCourse("URP-204", "Environmental Planning", urp),
                createCourse("URP-205", "GIS and Remote Sensing", urp),
                
                // ARCH Courses (Architecture)
                createCourse("ARCH-101", "Architectural Design I", arch),
                createCourse("ARCH-102", "Architectural Drawing", arch),
                createCourse("ARCH-103", "History of Architecture", arch),
                createCourse("ARCH-104", "Building Materials", arch),
                createCourse("ARCH-105", "Mathematics", arch),
                
                createCourse("ARCH-201", "Architectural Design II", arch),
                createCourse("ARCH-202", "Building Construction", arch),
                createCourse("ARCH-203", "Architectural Graphics", arch),
                createCourse("ARCH-204", "Environmental Science", arch),
                createCourse("ARCH-205", "Structural Systems", arch),
                
                // BME Courses (Biomedical Engineering)
                createCourse("BME-101", "Basic Electronics", bme),
                createCourse("BME-102", "Biology", bme),
                createCourse("BME-103", "Physics", bme),
                createCourse("BME-104", "Chemistry", bme),
                createCourse("BME-105", "Mathematics", bme),
                
                createCourse("BME-201", "Biomedical Instrumentation", bme),
                createCourse("BME-202", "Medical Imaging", bme),
                createCourse("BME-203", "Biomechanics", bme),
                createCourse("BME-204", "Biomaterials", bme),
                createCourse("BME-205", "Medical Electronics", bme),
                
                // NE Courses (Nuclear Engineering)
                createCourse("NE-101", "Basic Physics", ne),
                createCourse("NE-102", "Chemistry", ne),
                createCourse("NE-103", "Mathematics", ne),
                createCourse("NE-104", "Engineering Drawing", ne),
                createCourse("NE-105", "English", ne),
                
                createCourse("NE-201", "Nuclear Physics", ne),
                createCourse("NE-202", "Nuclear Reactor Theory", ne),
                createCourse("NE-203", "Radiation Protection", ne),
                createCourse("NE-204", "Nuclear Fuel Cycle", ne),
                createCourse("NE-205", "Nuclear Safety", ne),
                
                // MSE Courses (Materials Science & Engineering)
                createCourse("MSE-101", "Engineering Drawing", mse),
                createCourse("MSE-102", "Physics", mse),
                createCourse("MSE-103", "Chemistry", mse),
                createCourse("MSE-104", "Mathematics", mse),
                createCourse("MSE-105", "English", mse),
                
                createCourse("MSE-201", "Materials Science", mse),
                createCourse("MSE-202", "Physical Metallurgy", mse),
                createCourse("MSE-203", "Mechanical Metallurgy", mse),
                createCourse("MSE-204", "Materials Processing", mse),
                createCourse("MSE-205", "Materials Characterization", mse),
                
                // Basic Science Courses
                createCourse("PHY-101", "Physics I", physics),
                createCourse("PHY-102", "Physics II", physics),
                createCourse("PHY-103", "Physics Lab", physics),
                
                createCourse("CHE-101", "Chemistry I", chemistry),
                createCourse("CHE-102", "Chemistry II", chemistry),
                createCourse("CHE-103", "Chemistry Lab", chemistry),
                
                createCourse("MATH-101", "Calculus I", math),
                createCourse("MATH-102", "Calculus II", math),
                createCourse("MATH-103", "Linear Algebra", math),
                createCourse("MATH-104", "Differential Equations", math),
                
                createCourse("HUM-101", "English", humanities),
                createCourse("HUM-102", "Bangla", humanities),
                createCourse("HUM-103", "Social Science", humanities),
                createCourse("HUM-104", "Economics", humanities)
            );
            
            courseRepository.saveAll(courses);
            System.out.println("📖 Loaded " + courses.size() + " courses");
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
