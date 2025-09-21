-- Update resources table to support folder structure
-- Make r_file_path nullable for folder resources

-- Step 1: Make r_file_path nullable
ALTER TABLE resources MODIFY COLUMN r_file_path TEXT NULL;

-- Step 2: Add is_folder column if it doesn't exist
ALTER TABLE resources ADD COLUMN IF NOT EXISTS is_folder BOOLEAN DEFAULT FALSE;

-- Step 3: Add file_count column if it doesn't exist
ALTER TABLE resources ADD COLUMN IF NOT EXISTS file_count INT DEFAULT 0;

-- Step 4: Create resource_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS resource_files (
    file_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    upload_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE CASCADE
);

-- Step 5: Update existing single-file resources
UPDATE resources 
SET is_folder = FALSE, file_count = 1 
WHERE r_file_path IS NOT NULL AND (is_folder IS NULL OR file_count IS NULL);

-- Step 6: Set folder flag based on file count for any future migrations
UPDATE resources 
SET is_folder = (file_count > 1) 
WHERE file_count > 0;