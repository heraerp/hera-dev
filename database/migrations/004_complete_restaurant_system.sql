-- Complete Restaurant System Setup
-- Steve Krug-inspired restaurant registration following HERA Universal Schema
-- Run this migration to set up the complete restaurant management system

-- ============================================================================
-- STEP 1: Ensure core_users has proper structure
-- ============================================================================

-- Add missing columns to core_users if they don't exist
ALTER TABLE core_users 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_core_users_auth_user_id ON core_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_core_users_role ON core_users(role);
CREATE INDEX IF NOT EXISTS idx_core_users_email ON core_users(email);

-- ============================================================================
-- STEP 2: Auto-user creation trigger
-- ============================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.core_users (
    auth_user_id,
    email,
    full_name,
    role,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user',
    true,
    NEW.created_at,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 3: Complete restaurant setup function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_restaurant_complete(
    p_auth_user_id UUID,
    p_user_email TEXT,
    p_user_name TEXT,
    p_user_phone TEXT,
    p_restaurant_name TEXT,
    p_business_type TEXT,
    p_cuisine_type TEXT,
    p_location TEXT,
    p_seating_capacity TEXT,
    p_opening_date DATE DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    client_id UUID,
    organization_id UUID,
    restaurant_entity_id UUID,
    user_linked BOOLEAN
) AS $$
DECLARE
    v_client_id UUID;
    v_organization_id UUID;
    v_restaurant_entity_id UUID;
    v_user_org_id UUID;
    v_client_code TEXT;
    v_org_code TEXT;
    v_entity_code TEXT;
BEGIN
    -- Generate unique codes
    v_client_code := UPPER(SUBSTRING(p_restaurant_name FROM 1 FOR 3)) || EXTRACT(epoch FROM NOW())::TEXT::SUBSTRING(8,3);
    v_org_code := UPPER(SUBSTRING(p_restaurant_name FROM 1 FOR 3)) || EXTRACT(epoch FROM NOW())::TEXT::SUBSTRING(8,3);
    v_entity_code := 'REST-' || EXTRACT(epoch FROM NOW())::TEXT::SUBSTRING(8,6);
    
    -- Generate UUIDs
    v_client_id := gen_random_uuid();
    v_organization_id := gen_random_uuid();
    v_restaurant_entity_id := gen_random_uuid();
    v_user_org_id := gen_random_uuid();

    -- Step 1: Create the client (umbrella company/group)
    INSERT INTO core_clients (
        id, client_name, client_code, client_type, is_active, created_at, updated_at
    ) VALUES (
        v_client_id, p_restaurant_name || ' Holdings', v_client_code, 'restaurant_group', true, NOW(), NOW()
    );

    -- Step 2: Create the restaurant organization
    INSERT INTO core_organizations (
        id, client_id, name, org_code, industry, country, currency, is_active, created_at, updated_at
    ) VALUES (
        v_organization_id, v_client_id, p_restaurant_name, v_org_code, 'restaurant', 'US', 'USD', true, NOW(), NOW()
    );

    -- Step 3: Link user to organization with owner role
    INSERT INTO user_organizations (
        id, user_id, organization_id, role, is_active, created_at, updated_at
    ) VALUES (
        v_user_org_id, p_auth_user_id, v_organization_id, 'owner', true, NOW(), NOW()
    );

    -- Step 4: Create restaurant entity using universal pattern
    INSERT INTO core_entities (
        id, organization_id, entity_type, entity_name, entity_code, entity_description, entity_status, is_active, created_at, updated_at
    ) VALUES (
        v_restaurant_entity_id, v_organization_id, 'restaurant', p_restaurant_name, v_entity_code,
        p_cuisine_type || ' restaurant in ' || p_location, 'active', true, NOW(), NOW()
    );

    -- Step 5: Store restaurant details in dynamic data
    INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type, is_encrypted, created_at, updated_at)
    VALUES 
        (v_restaurant_entity_id, 'business_type', p_business_type, 'text', false, NOW(), NOW()),
        (v_restaurant_entity_id, 'cuisine_type', p_cuisine_type, 'text', false, NOW(), NOW()),
        (v_restaurant_entity_id, 'location', p_location, 'text', false, NOW(), NOW()),
        (v_restaurant_entity_id, 'seating_capacity', p_seating_capacity, 'text', false, NOW(), NOW()),
        (v_restaurant_entity_id, 'owner_name', p_user_name, 'text', false, NOW(), NOW()),
        (v_restaurant_entity_id, 'owner_phone', p_user_phone, 'text', false, NOW(), NOW()),
        (v_restaurant_entity_id, 'owner_email', p_user_email, 'text', false, NOW(), NOW()),
        (v_restaurant_entity_id, 'registration_date', NOW()::TEXT, 'timestamp', false, NOW(), NOW());

    -- Add opening date if provided
    IF p_opening_date IS NOT NULL THEN
        INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type, is_encrypted, created_at, updated_at)
        VALUES (v_restaurant_entity_id, 'opening_date', p_opening_date::TEXT, 'date', false, NOW(), NOW());
    END IF;

    -- Step 6: Create metadata
    INSERT INTO core_metadata (entity_id, metadata_key, metadata_value, metadata_type, created_at, updated_at)
    VALUES 
        (v_restaurant_entity_id, 'setup_completed', 'true', 'system', NOW(), NOW()),
        (v_restaurant_entity_id, 'setup_version', '1.0', 'system', NOW(), NOW()),
        (v_restaurant_entity_id, 'created_by', p_auth_user_id::TEXT, 'system', NOW(), NOW());

    -- Return success
    RETURN QUERY
    SELECT true, 'Restaurant setup completed successfully', v_client_id, v_organization_id, v_restaurant_entity_id, true;

EXCEPTION WHEN OTHERS THEN
    RETURN QUERY
    SELECT false, 'Error: ' || SQLERRM, NULL::UUID, NULL::UUID, NULL::UUID, false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: Get user restaurant profile function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_restaurant_profile(
    p_auth_user_id UUID
)
RETURNS TABLE(
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    user_role TEXT,
    organization_id UUID,
    organization_name TEXT,
    client_id UUID,
    client_name TEXT,
    restaurant_entity_id UUID,
    restaurant_name TEXT,
    business_type TEXT,
    cuisine_type TEXT,
    location TEXT,
    seating_capacity TEXT,
    opening_date TEXT,
    setup_completed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cu.auth_user_id as user_id,
        cu.email as user_email,
        cu.full_name as user_name,
        uo.role as user_role,
        co.id as organization_id,
        co.name as organization_name,
        cc.id as client_id,
        cc.client_name as client_name,
        ce.id as restaurant_entity_id,
        ce.entity_name as restaurant_name,
        MAX(CASE WHEN cdd.field_name = 'business_type' THEN cdd.field_value END) as business_type,
        MAX(CASE WHEN cdd.field_name = 'cuisine_type' THEN cdd.field_value END) as cuisine_type,
        MAX(CASE WHEN cdd.field_name = 'location' THEN cdd.field_value END) as location,
        MAX(CASE WHEN cdd.field_name = 'seating_capacity' THEN cdd.field_value END) as seating_capacity,
        MAX(CASE WHEN cdd.field_name = 'opening_date' THEN cdd.field_value END) as opening_date,
        COALESCE(
            (SELECT cm.metadata_value = 'true' 
             FROM core_metadata cm 
             WHERE cm.entity_id = ce.id 
             AND cm.metadata_key = 'setup_completed'), 
            false
        ) as setup_completed
    FROM core_users cu
    JOIN user_organizations uo ON cu.auth_user_id = uo.user_id
    JOIN core_organizations co ON uo.organization_id = co.id
    JOIN core_clients cc ON co.client_id = cc.id
    LEFT JOIN core_entities ce ON co.id = ce.organization_id AND ce.entity_type = 'restaurant'
    LEFT JOIN core_dynamic_data cdd ON ce.id = cdd.entity_id
    WHERE cu.auth_user_id = p_auth_user_id
    AND uo.is_active = true
    GROUP BY cu.auth_user_id, cu.email, cu.full_name, uo.role, 
             co.id, co.name, cc.id, cc.client_name, ce.id, ce.entity_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: User management functions
-- ============================================================================

-- Function to promote user to admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(
    p_email TEXT
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    user_id UUID
) AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Find and update user
    UPDATE core_users 
    SET role = 'admin', updated_at = NOW()
    WHERE email = p_email
    RETURNING auth_user_id INTO v_user_id;
    
    IF v_user_id IS NOT NULL THEN
        RETURN QUERY SELECT true, 'User promoted to admin successfully', v_user_id;
    ELSE
        RETURN QUERY SELECT false, 'User not found', NULL::UUID;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    )::text,
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
-- STEP 9: Verification query
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