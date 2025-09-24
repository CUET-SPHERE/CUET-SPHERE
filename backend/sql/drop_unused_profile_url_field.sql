-- Drop unused profile image URL field from users table
-- This script removes the deprecated u_profile_img_url column
-- The system now consistently uses u_profile_picture field for profile images

-- Use the cuetsphere database
USE cuetsphere;

-- Temporarily disable foreign key checks to allow modifications
SET FOREIGN_KEY_CHECKS = 0;

-- Check if the column exists before dropping it
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'cuetsphere' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'u_profile_img_url';

-- Drop the unused u_profile_img_url column
ALTER TABLE users DROP COLUMN IF EXISTS u_profile_img_url;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify the column has been dropped
DESCRIBE users;

-- Show the remaining profile-related columns
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'cuetsphere' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME IN ('u_profile_picture', 'u_background_image')
ORDER BY COLUMN_NAME;

-- =====================================================
-- SUMMARY
-- =====================================================

/*
PROFILE IMAGE STORAGE STRATEGY:

✅ ACTIVE FIELDS:
- u_profile_picture: Stores profile image URLs (used by profilePicture Java field)
- u_background_image: Stores background image URLs (used by backgroundImage Java field)

❌ REMOVED FIELDS:
- u_profile_img_url: Unused field with no getter/setter methods

FRONTEND USAGE:
- Profile images: user.profilePicture
- Background images: user.backgroundImage

BACKEND USAGE:
- Upload endpoint: /api/upload/profile (saves to u_profile_picture)
- Background endpoint: /api/upload/background (saves to u_background_image)
- Update API: PUT /api/users/profile (updates both fields)
- Retrieval API: GET /api/users/profile (returns both fields)

FILE STORAGE STRUCTURE:
- Profile images: S3/local -> profile/profile_timestamp.jpg
- Background images: S3/local -> backgrounds/background_timestamp.jpg
*/