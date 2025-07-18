-- ===================================================================
-- SETUP DEMO USER FOR TESTING PRODUCTS
-- ===================================================================

-- Insert demo user into user_organizations table (if not exists)
INSERT INTO user_organizations (
  id,
  user_id,
  organization_id,
  role,
  is_active,
  joined_at,
  created_at,
  updated_at
) VALUES (
  'demo-user-org-001',
  '550e8400-e29b-41d4-a716-446655440002', -- demo user id
  'f47ac10b-58cc-4372-a567-0e02b2c3d479', -- restaurant organization id
  'manager',
  true,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Also add the existing demo organization if needed
INSERT INTO core_organizations (
  id,
  client_id,
  name,
  org_code,
  industry,
  country,
  currency,
  is_active,
  created_at,
  updated_at
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '550e8400-e29b-41d4-a716-446655440000',
  'First Floor Restaurant',
  'FFR001',
  'restaurant',
  'US',
  'USD',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the setup
SELECT 'User Organizations:' as info;
SELECT * FROM user_organizations WHERE user_id = '550e8400-e29b-41d4-a716-446655440002';

SELECT 'Organizations:' as info;
SELECT * FROM core_organizations WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';