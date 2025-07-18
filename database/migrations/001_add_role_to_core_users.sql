-- Add role column to core_users table for admin panel access control
-- This migration adds the role column needed for the integrated admin panel

-- Add role column to core_users table
ALTER TABLE core_users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Add index for better performance on role queries
CREATE INDEX IF NOT EXISTS idx_core_users_role ON core_users(role);

-- Update existing users to have 'user' role if they don't have one
UPDATE core_users 
SET role = 'user' 
WHERE role IS NULL;

-- Add constraint to ensure valid roles
ALTER TABLE core_users 
ADD CONSTRAINT check_valid_role 
CHECK (role IN ('user', 'admin', 'moderator'));

-- Set your specific user as admin
UPDATE core_users 
SET role = 'admin' 
WHERE email = 'santhoshlal@gmail.com';

-- Verify the update
SELECT id, email, role, created_at 
FROM core_users 
WHERE email = 'santhoshlal@gmail.com';