-- Link Supabase Auth users to core_users table
-- This migration creates the proper relationship between auth.users and core_users

-- First, add auth_user_id column to core_users to link to auth.users
ALTER TABLE core_users 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Add role column if it doesn't exist
ALTER TABLE core_users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Add other essential columns
ALTER TABLE core_users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE core_users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE core_users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_core_users_auth_user_id ON core_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_core_users_role ON core_users(role);

-- Insert/link your auth user to core_users
INSERT INTO core_users (auth_user_id, email, full_name, role, is_active, created_at, updated_at)
SELECT 
  au.id as auth_user_id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  'admin' as role,
  true as is_active,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
WHERE au.email = 'santhoshlal@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM core_users cu WHERE cu.auth_user_id = au.id
  );

-- Update existing core_users if already exists
UPDATE core_users 
SET 
  role = 'admin',
  is_active = true,
  updated_at = NOW()
WHERE auth_user_id = (
  SELECT id FROM auth.users WHERE email = 'santhoshlal@gmail.com'
);

-- Verify the link
SELECT 
  cu.id as core_user_id,
  cu.auth_user_id,
  cu.email,
  cu.role,
  cu.is_active,
  au.email as auth_email
FROM core_users cu
JOIN auth.users au ON cu.auth_user_id = au.id
WHERE cu.email = 'santhoshlal@gmail.com';