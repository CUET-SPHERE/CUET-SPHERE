-- Fix for CUET Sphere signup issue
-- This script adds AUTO_INCREMENT to the users table id column

-- Use the cuetsphere database
USE cuetsphere;

-- Check current structure (for reference)
-- SHOW CREATE TABLE users;

-- Temporarily disable foreign key checks to allow modifications
SET FOREIGN_KEY_CHECKS = 0;

-- Fix users table to add AUTO_INCREMENT to id column
-- This assumes the id column exists but doesn't have AUTO_INCREMENT
ALTER TABLE users MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

-- If the table doesn't have a primary key constraint, add it
-- ALTER TABLE users ADD PRIMARY KEY (id);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify the fix
SHOW CREATE TABLE users;

-- Optional: Check if there are any existing users and reset auto increment
-- SELECT COUNT(*) as user_count FROM users;
-- If there are existing users, you might want to set the auto increment to start after the highest existing id
-- SELECT MAX(id) as max_id FROM users;
-- ALTER TABLE users AUTO_INCREMENT = <max_id + 1>;

DESCRIBE users;