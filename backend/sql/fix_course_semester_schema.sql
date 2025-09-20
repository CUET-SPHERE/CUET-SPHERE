-- Fix course-semester schema to match the new model
-- This script aligns the database schema with the updated Java models

-- 1. First, drop the incorrect foreign key constraint if it exists
ALTER TABLE courses DROP FOREIGN KEY IF EXISTS fk_course_semester;

-- 2. Drop the semester_name column from courses table since we get this via relationship
ALTER TABLE courses DROP COLUMN IF EXISTS semester_name;

-- 3. Ensure the semester_id column exists and points to the correct table
-- Update the foreign key to point to semesters table instead of current_semester
ALTER TABLE courses ADD CONSTRAINT fk_course_semester 
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
    ON DELETE SET NULL;

-- 4. Update any existing courses to have valid semester_ids
-- This sets semester_id to 4 (which should be '2-2') for any courses that don't have one
UPDATE courses 
SET semester_id = 4 
WHERE semester_id IS NULL;

-- 5. Create the current_semester table with the correct schema if it doesn't exist
CREATE TABLE IF NOT EXISTS current_semester (
    batch VARCHAR(10) PRIMARY KEY,
    semester_id BIGINT NOT NULL,
    dept_id BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id),
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id),
    UNIQUE KEY unique_active_dept_batch (dept_id, batch, is_active)
);

-- 6. Insert some sample current_semester data for testing
INSERT IGNORE INTO current_semester (batch, semester_id, dept_id, is_active) VALUES
('21', 8, 4, FALSE),  -- CSE batch 21 in semester 4-2
('22', 4, 4, TRUE),   -- CSE batch 22 in semester 2-2 (active)
('23', 2, 4, FALSE);  -- CSE batch 23 in semester 1-2

-- 7. Verification queries
SELECT 'Courses with semester info' as description;
SELECT 
    c.course_id,
    c.course_code,
    c.course_name,
    c.semester_id,
    s.semester_name,
    d.dept_name
FROM courses c
LEFT JOIN semesters s ON c.semester_id = s.semester_id
LEFT JOIN departments d ON c.dept_id = d.dept_id
WHERE c.course_id IN (502, 503, 504)  -- Check a few specific courses
ORDER BY c.course_id;

SELECT 'Current semester info' as description;
SELECT 
    cs.batch,
    s.semester_name,
    d.dept_name,
    cs.is_active
FROM current_semester cs
JOIN semesters s ON cs.semester_id = s.semester_id
JOIN departments d ON cs.dept_id = d.dept_id
ORDER BY cs.batch;