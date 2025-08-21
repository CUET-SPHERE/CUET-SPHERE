-- CUET Sphere Database Setup Script
-- Run this script in MySQL to set up the database

-- Create the database
CREATE DATABASE IF NOT EXISTS sphere;
USE sphere;

-- The tables will be automatically created by Hibernate when the application starts
-- with spring.jpa.hibernate.ddl-auto=update

-- Optional: Create some initial data for testing
-- Note: This will be handled by the DataLoader class in the backend

-- Check if tables exist (after running the application)
SHOW TABLES;

-- Verify the user table structure (after running the application)
DESCRIBE user;
