-- CUET Sphere Database Setup Script
-- This script creates the required tables and populates them with sample data
-- Based on actual departments from https://www.cuet.ac.bd/

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    dept_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(255) NOT NULL UNIQUE
);

-- Semesters table
CREATE TABLE IF NOT EXISTS semesters (
    semester_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    semester_name VARCHAR(255) NOT NULL UNIQUE
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    course_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(50) NOT NULL UNIQUE,
    course_name VARCHAR(255) NOT NULL,
    dept_id BIGINT NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- Resources table (will be auto-created by JPA, but here for reference)
CREATE TABLE IF NOT EXISTS resources (
    resource_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    r_batch VARCHAR(10) NOT NULL,
    r_resource_type VARCHAR(50) NOT NULL,
    r_title VARCHAR(255) NOT NULL,
    r_file_path TEXT NOT NULL,
    r_description TEXT,
    r_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    r_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    uploader_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    FOREIGN KEY (uploader_id) REFERENCES users(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert Departments (Based on actual CUET departments)
INSERT INTO departments (dept_name) VALUES 
-- Engineering Departments
('Civil Engineering'),
('Mechanical Engineering'),
('Electrical & Electronics Engineering'),
('Computer Science & Engineering'),
('Water Resources Engineering'),
('Petroleum & Mining Engineering'),
('Mechatronics and Industrial Engineering'),
('Electronics & Telecommunication Engineering'),
('Urban & Regional Planning'),
('Architecture'),
('Biomedical Engineering'),
('Nuclear Engineering'),
('Materials Science & Engineering'),
-- Basic Science Departments
('Physics'),
('Chemistry'),
('Mathematics'),
('Humanities')
ON DUPLICATE KEY UPDATE dept_name = dept_name;

-- Insert Semesters (CUET format: 1-1, 1-2, etc.)
INSERT INTO semesters (semester_name) VALUES 
('1-1'),
('1-2'),
('2-1'),
('2-2'),
('3-1'),
('3-2'),
('4-1'),
('4-2')
ON DUPLICATE KEY UPDATE semester_name = semester_name;

-- Insert Courses
-- CSE Courses (Computer Science & Engineering)
INSERT INTO courses (course_code, course_name, dept_id) VALUES 
('CSE-101', 'Introduction to Programming', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-102', 'Programming Language', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-103', 'Discrete Mathematics', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-104', 'Physics', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-105', 'Chemistry', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-106', 'English', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-107', 'Bangla', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-108', 'Social Science', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-201', 'Data Structures', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-202', 'Object Oriented Programming', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-203', 'Digital Logic Design', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-204', 'Electrical Circuits', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-205', 'Calculus', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-206', 'Statistics', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-301', 'Algorithm Design and Analysis', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-302', 'Database Management Systems', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-303', 'Computer Architecture', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-304', 'Operating Systems', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-305', 'Software Engineering', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-306', 'Computer Networks', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-401', 'Artificial Intelligence', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-402', 'Machine Learning', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-403', 'Computer Graphics', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-404', 'Web Technologies', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-405', 'Mobile Application Development', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering')),
('CSE-406', 'Information Security', (SELECT dept_id FROM departments WHERE dept_name = 'Computer Science & Engineering'))
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- EEE Courses (Electrical & Electronics Engineering)
INSERT INTO courses (course_code, course_name, dept_id) VALUES 
('EEE-101', 'Basic Electronics', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering')),
('EEE-102', 'Electrical Circuits I', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering')),
('EEE-103', 'Engineering Drawing', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering')),
('EEE-104', 'Physics', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering')),
('EEE-105', 'Chemistry', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering')),
('EEE-106', 'English', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering')),
('EEE-201', 'Electrical Circuits II', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering')),
('EEE-202', 'Electronics I', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering')),
('EEE-203', 'Digital Electronics', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering')),
('EEE-204', 'Electromagnetic Theory', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering')),
('EEE-205', 'Mathematics', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering')),
('EEE-301', 'Electronics II', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering')),
('EEE-302', 'Electrical Machines', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering')),
('EEE-303', 'Power Systems', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering')),
('EEE-304', 'Control Systems', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering')),
('EEE-305', 'Communication Systems', (SELECT dept_id FROM departments WHERE dept_name = 'Electrical & Electronics Engineering'))
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- CE Courses (Civil Engineering)
INSERT INTO courses (course_code, course_name, dept_id) VALUES 
('CE-101', 'Engineering Drawing', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering')),
('CE-102', 'Engineering Mechanics', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering')),
('CE-103', 'Physics', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering')),
('CE-104', 'Chemistry', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering')),
('CE-105', 'Mathematics', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering')),
('CE-106', 'English', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering')),
('CE-201', 'Surveying', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering')),
('CE-202', 'Strength of Materials', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering')),
('CE-203', 'Fluid Mechanics', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering')),
('CE-204', 'Engineering Geology', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering')),
('CE-205', 'Transportation Engineering', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering')),
('CE-301', 'Structural Analysis', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering')),
('CE-302', 'Reinforced Concrete Design', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering')),
('CE-303', 'Steel Structure Design', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering')),
('CE-304', 'Foundation Engineering', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering')),
('CE-305', 'Water Resources Engineering', (SELECT dept_id FROM departments WHERE dept_name = 'Civil Engineering'))
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- ME Courses (Mechanical Engineering)
INSERT INTO courses (course_code, course_name, dept_id) VALUES 
('ME-101', 'Engineering Drawing', (SELECT dept_id FROM departments WHERE dept_name = 'Mechanical Engineering')),
('ME-102', 'Engineering Mechanics', (SELECT dept_id FROM departments WHERE dept_name = 'Mechanical Engineering')),
('ME-103', 'Workshop Practice', (SELECT dept_id FROM departments WHERE dept_name = 'Mechanical Engineering')),
('ME-104', 'Physics', (SELECT dept_id FROM departments WHERE dept_name = 'Mechanical Engineering')),
('ME-105', 'Chemistry', (SELECT dept_id FROM departments WHERE dept_name = 'Mechanical Engineering')),
('ME-201', 'Thermodynamics', (SELECT dept_id FROM departments WHERE dept_name = 'Mechanical Engineering')),
('ME-202', 'Fluid Mechanics', (SELECT dept_id FROM departments WHERE dept_name = 'Mechanical Engineering')),
('ME-203', 'Strength of Materials', (SELECT dept_id FROM departments WHERE dept_name = 'Mechanical Engineering')),
('ME-204', 'Machine Design', (SELECT dept_id FROM departments WHERE dept_name = 'Mechanical Engineering')),
('ME-205', 'Manufacturing Processes', (SELECT dept_id FROM departments WHERE dept_name = 'Mechanical Engineering'))
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- WRE Courses (Water Resources Engineering)
INSERT INTO courses (course_code, course_name, dept_id) VALUES 
('WRE-101', 'Engineering Drawing', (SELECT dept_id FROM departments WHERE dept_name = 'Water Resources Engineering')),
('WRE-102', 'Engineering Mechanics', (SELECT dept_id FROM departments WHERE dept_name = 'Water Resources Engineering')),
('WRE-103', 'Physics', (SELECT dept_id FROM departments WHERE dept_name = 'Water Resources Engineering')),
('WRE-104', 'Chemistry', (SELECT dept_id FROM departments WHERE dept_name = 'Water Resources Engineering')),
('WRE-105', 'Mathematics', (SELECT dept_id FROM departments WHERE dept_name = 'Water Resources Engineering')),
('WRE-201', 'Hydraulics', (SELECT dept_id FROM departments WHERE dept_name = 'Water Resources Engineering')),
('WRE-202', 'Hydrology', (SELECT dept_id FROM departments WHERE dept_name = 'Water Resources Engineering')),
('WRE-203', 'Water Resources Planning', (SELECT dept_id FROM departments WHERE dept_name = 'Water Resources Engineering')),
('WRE-204', 'Irrigation Engineering', (SELECT dept_id FROM departments WHERE dept_name = 'Water Resources Engineering')),
('WRE-205', 'Drainage Engineering', (SELECT dept_id FROM departments WHERE dept_name = 'Water Resources Engineering'))
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- PME Courses (Petroleum & Mining Engineering)
INSERT INTO courses (course_code, course_name, dept_id) VALUES 
('PME-101', 'Engineering Drawing', (SELECT dept_id FROM departments WHERE dept_name = 'Petroleum & Mining Engineering')),
('PME-102', 'Engineering Mechanics', (SELECT dept_id FROM departments WHERE dept_name = 'Petroleum & Mining Engineering')),
('PME-103', 'Physics', (SELECT dept_id FROM departments WHERE dept_name = 'Petroleum & Mining Engineering')),
('PME-104', 'Chemistry', (SELECT dept_id FROM departments WHERE dept_name = 'Petroleum & Mining Engineering')),
('PME-105', 'Mathematics', (SELECT dept_id FROM departments WHERE dept_name = 'Petroleum & Mining Engineering')),
('PME-201', 'Petroleum Geology', (SELECT dept_id FROM departments WHERE dept_name = 'Petroleum & Mining Engineering')),
('PME-202', 'Drilling Engineering', (SELECT dept_id FROM departments WHERE dept_name = 'Petroleum & Mining Engineering')),
('PME-203', 'Reservoir Engineering', (SELECT dept_id FROM departments WHERE dept_name = 'Petroleum & Mining Engineering')),
('PME-204', 'Mining Engineering', (SELECT dept_id FROM departments WHERE dept_name = 'Petroleum & Mining Engineering')),
('PME-205', 'Petroleum Production', (SELECT dept_id FROM departments WHERE dept_name = 'Petroleum & Mining Engineering'))
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- MIE Courses (Mechatronics and Industrial Engineering)
INSERT INTO courses (course_code, course_name, dept_id) VALUES 
('MIE-101', 'Engineering Drawing', (SELECT dept_id FROM departments WHERE dept_name = 'Mechatronics and Industrial Engineering')),
('MIE-102', 'Engineering Mechanics', (SELECT dept_id FROM departments WHERE dept_name = 'Mechatronics and Industrial Engineering')),
('MIE-103', 'Physics', (SELECT dept_id FROM departments WHERE dept_name = 'Mechatronics and Industrial Engineering')),
('MIE-104', 'Chemistry', (SELECT dept_id FROM departments WHERE dept_name = 'Mechatronics and Industrial Engineering')),
('MIE-105', 'Mathematics', (SELECT dept_id FROM departments WHERE dept_name = 'Mechatronics and Industrial Engineering')),
('MIE-201', 'Mechatronics Systems', (SELECT dept_id FROM departments WHERE dept_name = 'Mechatronics and Industrial Engineering')),
('MIE-202', 'Industrial Automation', (SELECT dept_id FROM departments WHERE dept_name = 'Mechatronics and Industrial Engineering')),
('MIE-203', 'Robotics', (SELECT dept_id FROM departments WHERE dept_name = 'Mechatronics and Industrial Engineering')),
('MIE-204', 'Manufacturing Systems', (SELECT dept_id FROM departments WHERE dept_name = 'Mechatronics and Industrial Engineering')),
('MIE-205', 'Quality Control', (SELECT dept_id FROM departments WHERE dept_name = 'Mechatronics and Industrial Engineering'))
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- ETE Courses (Electronics & Telecommunication Engineering)
INSERT INTO courses (course_code, course_name, dept_id) VALUES 
('ETE-101', 'Basic Electronics', (SELECT dept_id FROM departments WHERE dept_name = 'Electronics & Telecommunication Engineering')),
('ETE-102', 'Electrical Circuits', (SELECT dept_id FROM departments WHERE dept_name = 'Electronics & Telecommunication Engineering')),
('ETE-103', 'Physics', (SELECT dept_id FROM departments WHERE dept_name = 'Electronics & Telecommunication Engineering')),
('ETE-104', 'Chemistry', (SELECT dept_id FROM departments WHERE dept_name = 'Electronics & Telecommunication Engineering')),
('ETE-105', 'Mathematics', (SELECT dept_id FROM departments WHERE dept_name = 'Electronics & Telecommunication Engineering')),
('ETE-201', 'Digital Electronics', (SELECT dept_id FROM departments WHERE dept_name = 'Electronics & Telecommunication Engineering')),
('ETE-202', 'Communication Theory', (SELECT dept_id FROM departments WHERE dept_name = 'Electronics & Telecommunication Engineering')),
('ETE-203', 'Signal Processing', (SELECT dept_id FROM departments WHERE dept_name = 'Electronics & Telecommunication Engineering')),
('ETE-204', 'Telecommunication Systems', (SELECT dept_id FROM departments WHERE dept_name = 'Electronics & Telecommunication Engineering')),
('ETE-205', 'Wireless Communication', (SELECT dept_id FROM departments WHERE dept_name = 'Electronics & Telecommunication Engineering'))
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- URP Courses (Urban & Regional Planning)
INSERT INTO courses (course_code, course_name, dept_id) VALUES 
('URP-101', 'Planning Drawing', (SELECT dept_id FROM departments WHERE dept_name = 'Urban & Regional Planning')),
('URP-102', 'Planning Theory', (SELECT dept_id FROM departments WHERE dept_name = 'Urban & Regional Planning')),
('URP-103', 'Physics', (SELECT dept_id FROM departments WHERE dept_name = 'Urban & Regional Planning')),
('URP-104', 'Chemistry', (SELECT dept_id FROM departments WHERE dept_name = 'Urban & Regional Planning')),
('URP-105', 'Mathematics', (SELECT dept_id FROM departments WHERE dept_name = 'Urban & Regional Planning')),
('URP-201', 'Urban Planning', (SELECT dept_id FROM departments WHERE dept_name = 'Urban & Regional Planning')),
('URP-202', 'Regional Planning', (SELECT dept_id FROM departments WHERE dept_name = 'Urban & Regional Planning')),
('URP-203', 'Transportation Planning', (SELECT dept_id FROM departments WHERE dept_name = 'Urban & Regional Planning')),
('URP-204', 'Environmental Planning', (SELECT dept_id FROM departments WHERE dept_name = 'Urban & Regional Planning')),
('URP-205', 'GIS and Remote Sensing', (SELECT dept_id FROM departments WHERE dept_name = 'Urban & Regional Planning'))
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- ARCH Courses (Architecture)
INSERT INTO courses (course_code, course_name, dept_id) VALUES 
('ARCH-101', 'Architectural Design I', (SELECT dept_id FROM departments WHERE dept_name = 'Architecture')),
('ARCH-102', 'Architectural Drawing', (SELECT dept_id FROM departments WHERE dept_name = 'Architecture')),
('ARCH-103', 'History of Architecture', (SELECT dept_id FROM departments WHERE dept_name = 'Architecture')),
('ARCH-104', 'Building Materials', (SELECT dept_id FROM departments WHERE dept_name = 'Architecture')),
('ARCH-105', 'Mathematics', (SELECT dept_id FROM departments WHERE dept_name = 'Architecture')),
('ARCH-201', 'Architectural Design II', (SELECT dept_id FROM departments WHERE dept_name = 'Architecture')),
('ARCH-202', 'Building Construction', (SELECT dept_id FROM departments WHERE dept_name = 'Architecture')),
('ARCH-203', 'Architectural Graphics', (SELECT dept_id FROM departments WHERE dept_name = 'Architecture')),
('ARCH-204', 'Environmental Science', (SELECT dept_id FROM departments WHERE dept_name = 'Architecture')),
('ARCH-205', 'Structural Systems', (SELECT dept_id FROM departments WHERE dept_name = 'Architecture'))
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- BME Courses (Biomedical Engineering)
INSERT INTO courses (course_code, course_name, dept_id) VALUES 
('BME-101', 'Basic Electronics', (SELECT dept_id FROM departments WHERE dept_name = 'Biomedical Engineering')),
('BME-102', 'Biology', (SELECT dept_id FROM departments WHERE dept_name = 'Biomedical Engineering')),
('BME-103', 'Physics', (SELECT dept_id FROM departments WHERE dept_name = 'Biomedical Engineering')),
('BME-104', 'Chemistry', (SELECT dept_id FROM departments WHERE dept_name = 'Biomedical Engineering')),
('BME-105', 'Mathematics', (SELECT dept_id FROM departments WHERE dept_name = 'Biomedical Engineering')),
('BME-201', 'Biomedical Instrumentation', (SELECT dept_id FROM departments WHERE dept_name = 'Biomedical Engineering')),
('BME-202', 'Medical Imaging', (SELECT dept_id FROM departments WHERE dept_name = 'Biomedical Engineering')),
('BME-203', 'Biomechanics', (SELECT dept_id FROM departments WHERE dept_name = 'Biomedical Engineering')),
('BME-204', 'Biomaterials', (SELECT dept_id FROM departments WHERE dept_name = 'Biomedical Engineering')),
('BME-205', 'Medical Electronics', (SELECT dept_id FROM departments WHERE dept_name = 'Biomedical Engineering'))
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- NE Courses (Nuclear Engineering)
INSERT INTO courses (course_code, course_name, dept_id) VALUES 
('NE-101', 'Basic Physics', (SELECT dept_id FROM departments WHERE dept_name = 'Nuclear Engineering')),
('NE-102', 'Chemistry', (SELECT dept_id FROM departments WHERE dept_name = 'Nuclear Engineering')),
('NE-103', 'Mathematics', (SELECT dept_id FROM departments WHERE dept_name = 'Nuclear Engineering')),
('NE-104', 'Engineering Drawing', (SELECT dept_id FROM departments WHERE dept_name = 'Nuclear Engineering')),
('NE-105', 'English', (SELECT dept_id FROM departments WHERE dept_name = 'Nuclear Engineering')),
('NE-201', 'Nuclear Physics', (SELECT dept_id FROM departments WHERE dept_name = 'Nuclear Engineering')),
('NE-202', 'Nuclear Reactor Theory', (SELECT dept_id FROM departments WHERE dept_name = 'Nuclear Engineering')),
('NE-203', 'Radiation Protection', (SELECT dept_id FROM departments WHERE dept_name = 'Nuclear Engineering')),
('NE-204', 'Nuclear Fuel Cycle', (SELECT dept_id FROM departments WHERE dept_name = 'Nuclear Engineering')),
('NE-205', 'Nuclear Safety', (SELECT dept_id FROM departments WHERE dept_name = 'Nuclear Engineering'))
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- MSE Courses (Materials Science & Engineering)
INSERT INTO courses (course_code, course_name, dept_id) VALUES 
('MSE-101', 'Engineering Drawing', (SELECT dept_id FROM departments WHERE dept_name = 'Materials Science & Engineering')),
('MSE-102', 'Physics', (SELECT dept_id FROM departments WHERE dept_name = 'Materials Science & Engineering')),
('MSE-103', 'Chemistry', (SELECT dept_id FROM departments WHERE dept_name = 'Materials Science & Engineering')),
('MSE-104', 'Mathematics', (SELECT dept_id FROM departments WHERE dept_name = 'Materials Science & Engineering')),
('MSE-105', 'English', (SELECT dept_id FROM departments WHERE dept_name = 'Materials Science & Engineering')),
('MSE-201', 'Materials Science', (SELECT dept_id FROM departments WHERE dept_name = 'Materials Science & Engineering')),
('MSE-202', 'Physical Metallurgy', (SELECT dept_id FROM departments WHERE dept_name = 'Materials Science & Engineering')),
('MSE-203', 'Mechanical Metallurgy', (SELECT dept_id FROM departments WHERE dept_name = 'Materials Science & Engineering')),
('MSE-204', 'Materials Processing', (SELECT dept_id FROM departments WHERE dept_name = 'Materials Science & Engineering')),
('MSE-205', 'Materials Characterization', (SELECT dept_id FROM departments WHERE dept_name = 'Materials Science & Engineering'))
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- Basic Science Courses
INSERT INTO courses (course_code, course_name, dept_id) VALUES 
('PHY-101', 'Physics I', (SELECT dept_id FROM departments WHERE dept_name = 'Physics')),
('PHY-102', 'Physics II', (SELECT dept_id FROM departments WHERE dept_name = 'Physics')),
('PHY-103', 'Physics Lab', (SELECT dept_id FROM departments WHERE dept_name = 'Physics')),
('CHE-101', 'Chemistry I', (SELECT dept_id FROM departments WHERE dept_name = 'Chemistry')),
('CHE-102', 'Chemistry II', (SELECT dept_id FROM departments WHERE dept_name = 'Chemistry')),
('CHE-103', 'Chemistry Lab', (SELECT dept_id FROM departments WHERE dept_name = 'Chemistry')),
('MATH-101', 'Calculus I', (SELECT dept_id FROM departments WHERE dept_name = 'Mathematics')),
('MATH-102', 'Calculus II', (SELECT dept_id FROM departments WHERE dept_name = 'Mathematics')),
('MATH-103', 'Linear Algebra', (SELECT dept_id FROM departments WHERE dept_name = 'Mathematics')),
('MATH-104', 'Differential Equations', (SELECT dept_id FROM departments WHERE dept_name = 'Mathematics')),
('HUM-101', 'English', (SELECT dept_id FROM departments WHERE dept_name = 'Humanities')),
('HUM-102', 'Bangla', (SELECT dept_id FROM departments WHERE dept_name = 'Humanities')),
('HUM-103', 'Social Science', (SELECT dept_id FROM departments WHERE dept_name = 'Humanities')),
('HUM-104', 'Economics', (SELECT dept_id FROM departments WHERE dept_name = 'Humanities'))
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check the data
SELECT 'Departments' as table_name, COUNT(*) as count FROM departments
UNION ALL
SELECT 'Semesters' as table_name, COUNT(*) as count FROM semesters
UNION ALL
SELECT 'Courses' as table_name, COUNT(*) as count FROM courses;

-- Show sample courses by department
SELECT 
    d.dept_name,
    COUNT(c.course_id) as course_count
FROM departments d
LEFT JOIN courses c ON d.dept_id = c.dept_id
GROUP BY d.dept_id, d.dept_name
ORDER BY d.dept_name;

-- Show all courses
SELECT 
    c.course_code,
    c.course_name,
    d.dept_name
FROM courses c
JOIN departments d ON c.dept_id = d.dept_id
ORDER BY d.dept_name, c.course_code;

-- =====================================================
-- NOTES
-- =====================================================

/*
IMPORTANT NOTES:

1. This script is based on actual departments from https://www.cuet.ac.bd/
2. The resources table will be automatically created by JPA/Hibernate when you start the application.
3. Make sure your application.properties has the correct database configuration:
   - spring.jpa.hibernate.ddl-auto=update (or create-drop for first run)
   - spring.jpa.show-sql=true (to see SQL queries)
4. The DataLoader class will automatically populate the database when the application starts.
5. If you prefer to run this SQL script manually:
   - Make sure your database exists
   - Run this script in your database client
   - The script uses ON DUPLICATE KEY UPDATE to avoid errors if data already exists
6. Course codes follow the pattern: [DEPT]-[LEVEL][NUMBER]
   - CSE-101: Computer Science, 1st year, course 01
   - EEE-201: Electrical Engineering, 2nd year, course 01
   - etc.
7. The foreign key relationships ensure data integrity:
   - Courses must belong to existing departments
   - Resources must reference existing users, courses, and semesters
8. Semester format follows CUET standard: 1-1, 1-2, 2-1, 2-2, etc.
*/
