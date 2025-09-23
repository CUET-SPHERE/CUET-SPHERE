-- Debug script to check users table schema and current data
-- This will help us understand if there are any column mapping issues

-- Show table structure
DESCRIBE users;

-- Show column information for profile and background image fields
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM 
    INFORMATION_SCHEMA.COLUMNS 
WHERE 
    TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME IN ('u_profile_picture', 'u_background_image');

-- Show sample data to see if there's cross-contamination
SELECT 
    id,
    u_email,
    u_full_name,
    u_profile_picture,
    u_background_image,
    CHAR_LENGTH(u_profile_picture) as profile_pic_length,
    CHAR_LENGTH(u_background_image) as bg_img_length
FROM users 
WHERE u_profile_picture IS NOT NULL OR u_background_image IS NOT NULL
ORDER BY id DESC 
LIMIT 5;

-- Check if there are any users where both fields have the same value
SELECT 
    COUNT(*) as users_with_same_values
FROM users 
WHERE u_profile_picture IS NOT NULL 
    AND u_background_image IS NOT NULL 
    AND u_profile_picture = u_background_image;