-- Fix for CUET Sphere image URL column size issue
-- This script increases the column size for profile picture and background image fields
-- to accommodate long S3 URLs

-- Use the cuetsphere database
USE cuetsphere;

-- Check current structure (for reference)
DESCRIBE users;

-- Show current column definitions for image fields
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

-- Temporarily disable foreign key checks to allow modifications
SET FOREIGN_KEY_CHECKS = 0;

-- Increase the size of profile picture column to TEXT to handle long S3 URLs
ALTER TABLE users MODIFY COLUMN u_profile_picture TEXT;

-- Increase the size of background image column to TEXT to handle long S3 URLs  
ALTER TABLE users MODIFY COLUMN u_background_image TEXT;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify the fix - check new column definitions
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

-- Show the updated table structure
DESCRIBE users;

-- Optional: Show sample of current image URLs to verify they fit
SELECT 
    id,
    u_email,
    CHAR_LENGTH(u_profile_picture) as profile_pic_length,
    CHAR_LENGTH(u_background_image) as bg_img_length,
    u_profile_picture,
    u_background_image
FROM users 
WHERE u_profile_picture IS NOT NULL OR u_background_image IS NOT NULL
LIMIT 5;