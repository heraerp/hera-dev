-- Add missing client for First Floor Restaurant
-- This resolves the foreign key constraint error in restaurant-entities-setup.sql

INSERT INTO core_clients (
  id,
  client_name,
  client_code,
  client_type,
  is_active,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'First Floor',
  'FIRST-FLOOR-RES',
  'restaurant',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  client_name = EXCLUDED.client_name,
  client_code = EXCLUDED.client_code,
  client_type = EXCLUDED.client_type,
  updated_at = NOW();