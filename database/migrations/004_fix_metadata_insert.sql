-- ============================================================================
-- STEP 8: Create necessary entity types in metadata (SKIP - requires org_id)
-- ============================================================================
-- Note: core_metadata requires organization_id, so we'll document entity types differently
-- This can be added to a specific organization's metadata later if needed

-- ============================================================================
-- STEP 9: Setup existing users (backfill)
-- ============================================================================

-- Create core_users records for existing auth users who don't have them
DO $$
DECLARE
    auth_user_record RECORD;
BEGIN
    FOR auth_user_record IN 
        SELECT au.* 
        FROM auth.users au
        LEFT JOIN core_users cu ON cu.auth_user_id = au.id
        WHERE cu.auth_user_id IS NULL
    LOOP
        INSERT INTO core_users (
            auth_user_id, email, full_name, role, is_active, created_at, updated_at
        )
        VALUES (
            auth_user_record.id,
            auth_user_record.email,
            COALESCE(auth_user_record.raw_user_meta_data->>'full_name', auth_user_record.email),
            CASE 
                WHEN auth_user_record.email = 'santhoshlal@gmail.com' THEN 'admin'
                ELSE 'user'
            END,
            true,
            auth_user_record.created_at,
            NOW()
        );
    END LOOP;
END $$;

-- ============================================================================
-- STEP 10: Verification query
-- ============================================================================

-- Verify setup
SELECT 
    'Setup completed successfully' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users
FROM core_users;

-- Show admin user
SELECT 
    email, 
    full_name, 
    role,
    created_at
FROM core_users 
WHERE role = 'admin'
LIMIT 5;

-- Show existing organizations and restaurants
SELECT 
    co.name as organization_name,
    ce.entity_name as restaurant_name,
    ce.entity_type,
    ce.created_at
FROM core_organizations co
LEFT JOIN core_entities ce ON co.id = ce.organization_id AND ce.entity_type = 'restaurant'
WHERE co.industry = 'restaurant'
ORDER BY co.created_at DESC
LIMIT 10;