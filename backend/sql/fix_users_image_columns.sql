-- Fix users table image columns to support longer URLs
-- This script increases the column size for u_profile_picture and u_background_image
-- to support full S3 URLs which can be very long

-- Use the cuetsphere database
USE cuetsphere;

-- Temporarily disable foreign key checks to allow modifications
SET FOREIGN_KEY_CHECKS = 0;

-- Check current column types
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'cuetsphere' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME IN ('u_profile_picture', 'u_background_image')
ORDER BY COLUMN_NAME;

-- Increase column size to TEXT to support long S3 URLs
-- S3 URLs can be very long, especially with custom domains and long filenames
ALTER TABLE users MODIFY COLUMN u_profile_picture TEXT NULL;
ALTER TABLE users MODIFY COLUMN u_background_image TEXT NULL;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify the changes
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'cuetsphere' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME IN ('u_profile_picture', 'u_background_image')
ORDER BY COLUMN_NAME;

-- Show sample data to ensure no truncation occurred
SELECT 
    id,
    u_email,
    LENGTH(u_profile_picture) as profile_pic_length,
    LENGTH(u_background_image) as background_img_length,
    SUBSTRING(u_profile_picture, 1, 50) as profile_pic_preview,
    SUBSTRING(u_background_image, 1, 50) as background_img_preview
FROM users 
WHERE u_profile_picture IS NOT NULL OR u_background_image IS NOT NULL
LIMIT 10;

-- =====================================================
-- SUMMARY
-- =====================================================

/*
IMAGE URL COLUMN FIXES:

BEFORE:
- u_profile_picture: Probably VARCHAR(255) or similar (too small for S3 URLs)
- u_background_image: Probably VARCHAR(255) or similar (too small for S3 URLs)

AFTER:
- u_profile_picture: TEXT (supports very long URLs)
- u_background_image: TEXT (supports very long URLs)

WHY THIS FIX IS NEEDED:
- S3 URLs can be very long: https://bucket-name.s3.region.amazonaws.com/folder/very-long-filename-with-timestamp.jpg
- Local storage URLs can also be long with full paths
- TEXT type supports up to 65,535 characters, which is more than enough for any URL

EXAMPLES OF LONG URLS:
- S3: https://cuet-sphere-bucket.s3.us-east-1.amazonaws.com/backgrounds/background_1695456789123_user_uploaded_very_long_original_filename.jpg
- Local: http://localhost:8080/api/files/backgrounds/background_1695456789123_user_uploaded_very_long_original_filename.jpg

ERROR THAT WAS OCCURRING:
"Data truncation: Data too long for column 'u_background_image' at row 1"

THIS FIX RESOLVES:
✅ Background image upload and database storage
✅ Profile picture upload and database storage
✅ Support for any length of S3 or local URLs
✅ No data truncation errors
*/