-- Add a semester_id column to the courses table
ALTER TABLE courses ADD COLUMN semester_id BIGINT DEFAULT NULL;

-- Add foreign key constraint
ALTER TABLE courses ADD CONSTRAINT fk_course_semester 
    FOREIGN KEY (semester_id) REFERENCES current_semester(semester_id)
    ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_course_semester ON courses(semester_id);