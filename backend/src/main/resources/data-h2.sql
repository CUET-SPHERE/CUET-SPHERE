-- This file will be executed after Hibernate creates the schema for H2 profile
-- Update specific user to SYSTEM_ADMIN role if exists
UPDATE users SET u_role = 'SYSTEM_ADMIN' WHERE u_email = 'u2204015@student.cuet.ac.bd';