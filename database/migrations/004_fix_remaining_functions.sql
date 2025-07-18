-- ============================================================================
-- STEP 6: Sample data creation function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_sample_restaurant_data(
    p_restaurant_entity_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    items_created INTEGER
) AS $$
DECLARE
    v_items_created INTEGER := 0;
    v_menu_category_id UUID;
    v_organization_id UUID;
    category_names TEXT[] := ARRAY['Beverages', 'Main Dishes', 'Desserts', 'Appetizers'];
    category_name TEXT;
BEGIN
    -- Get organization ID
    SELECT organization_id INTO v_organization_id
    FROM core_entities 
    WHERE id = p_restaurant_entity_id;
    
    -- Create menu categories
    FOREACH category_name IN ARRAY category_names LOOP
        v_menu_category_id := gen_random_uuid();
        
        INSERT INTO core_entities (
            id, organization_id, entity_type, entity_name, entity_code, 
            entity_description, parent_entity_id, is_active, created_at, updated_at
        ) VALUES (
            v_menu_category_id, v_organization_id, 'menu_category', category_name,
            'CAT-' || LPAD((v_items_created + 1)::TEXT, 3, '0'),
            'Menu category for restaurant', p_restaurant_entity_id,
            true, NOW(), NOW()
        );
        
        v_items_created := v_items_created + 1;
    END LOOP;

    RETURN QUERY SELECT true, 'Sample data created successfully', v_items_created;

EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false, 'Error creating sample data: ' || SQLERRM, 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 7: Grant permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.handle_new_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_restaurant_complete TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_restaurant_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_sample_restaurant_data TO authenticated;

-- ============================================================================
-- STEP 8: Create necessary entity types in metadata
-- ============================================================================

-- Ensure we have the restaurant-related entity types documented
INSERT INTO core_metadata (entity_id, metadata_key, metadata_value, metadata_type)
SELECT 
    '00000000-0000-0000-0000-000000000000'::uuid,
    'entity_type_definition',
    jsonb_build_object(
        'restaurant_group', 'Restaurant holding company or group',
        'restaurant', 'Individual restaurant entity',
        'menu_category', 'Restaurant menu category',
        'menu_item', 'Individual menu item',
        'restaurant_order', 'Customer order',
        'restaurant_table', 'Restaurant table or seating',
        'restaurant_staff', 'Restaurant employee',
        'restaurant_inventory', 'Inventory item'
    ),
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM core_metadata 
    WHERE metadata_key = 'entity_type_definition' 
    AND metadata_type = 'system'
);

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