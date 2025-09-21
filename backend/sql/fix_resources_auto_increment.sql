-- Fix resources table AUTO_INCREMENT issue
-- This script adds AUTO_INCREMENT to the resource_id column to match JPA configuration

-- First, check if the resources table exists and show its current structure
SHOW CREATE TABLE resources;

-- Add AUTO_INCREMENT to resource_id column
ALTER TABLE resources MODIFY COLUMN resource_id BIGINT NOT NULL AUTO_INCREMENT;

-- Verify the change
SHOW CREATE TABLE resources;

-- Check the current data (if any)
SELECT COUNT(*) as total_resources FROM resources;