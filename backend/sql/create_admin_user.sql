-- Create Admin User Script for CUET Sphere
-- Run this script after the database is created and tables are generated

USE sphere;

-- Create the admin user
INSERT INTO users (
    u_full_name,
    u_email,
    u_password,
    u_hall,
    u_bio,
    u_batch,
    u_department,
    u_student_id,
    u_is_active,
    u_req_user,
    u_role,
    u_created_at,
    u_updated_at
) VALUES (
    'System Administrator',
    'u2204015@student.cuet.ac.bd',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', -- password: admin123
    'N/A',
    'System Administrator for CUET Sphere',
    '22',
    '04',
    '015',
    true,
    false,
    'SYSTEM_ADMIN',
    NOW(),
    NOW()
);

-- Verify the admin user was created
SELECT 
    u_full_name,
    u_email,
    u_role,
    u_batch,
    u_department,
    u_student_id,
    u_is_active
FROM users 
WHERE u_email = 'u2204015@student.cuet.ac.bd';
