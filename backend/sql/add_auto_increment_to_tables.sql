-- Add AUTO_INCREMENT to all primary key columns that should auto-increment
-- This script fixes the database schema to match the JPA GenerationType.IDENTITY configuration

-- Temporarily disable foreign key checks to allow modifications
SET FOREIGN_KEY_CHECKS = 0;

-- Fix courses table (has foreign keys from resources)
ALTER TABLE courses MODIFY COLUMN course_id BIGINT NOT NULL AUTO_INCREMENT;

-- Fix users table (has foreign keys from various tables)
ALTER TABLE users MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

-- Fix departments table (has foreign keys from courses)
ALTER TABLE departments MODIFY COLUMN dept_id BIGINT NOT NULL AUTO_INCREMENT;

-- Fix semesters table (has foreign keys from courses and resources)
ALTER TABLE semesters MODIFY COLUMN semester_id BIGINT NOT NULL AUTO_INCREMENT;

-- Fix notices table
ALTER TABLE notices MODIFY COLUMN notice_id BIGINT NOT NULL AUTO_INCREMENT;

-- Fix password_reset_otps table
ALTER TABLE password_reset_otps MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

-- Fix resources table (if it exists)
-- Note: You may need to check if this table exists first
-- ALTER TABLE resources MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify the changes
SHOW CREATE TABLE courses;
SHOW CREATE TABLE users;
SHOW CREATE TABLE departments;
SHOW CREATE TABLE semesters;
SHOW CREATE TABLE notices;
SHOW CREATE TABLE password_reset_otps;