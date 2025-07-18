-- Complete Restaurant System Setup
-- Steve Krug-inspired restaurant registration following HERA Universal Schema
-- USES ONLY EXISTING CORE TABLES - NO NEW TABLES OR COLUMNS ALLOWED

-- ============================================================================
-- STEP 1: Link Auth Users to Universal Schema
-- ============================================================================

-- Create a function to ensure auth user exists in core_entities as a user entity
CREATE OR REPLACE FUNCTION public.ensure_user_entity(
    p_auth_user_id UUID,
    p_email TEXT,
    p_full_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_user_entity_id UUID;
    v_hera_admin_org_id UUID;
BEGIN
    -- Get or create HERA admin org for user management
    SELECT id INTO v_hera_admin_org_id
    FROM core_organizations
    WHERE org_code = 'HERA-ADMIN';
    
    IF v_hera_admin_org_id IS NULL THEN
        -- Create HERA admin org if it doesn't exist
        INSERT INTO core_organizations (id, name, org_code, industry, country, currency, is_active)
        VALUES (gen_random_uuid(), 'HERA Admin Organization', 'HERA-ADMIN', 'system', 'US', 'USD', true)
        RETURNING id INTO v_hera_admin_org_id;
    END IF;

    -- Check if user entity already exists
    SELECT ce.id INTO v_user_entity_id
    FROM core_entities ce
    JOIN core_dynamic_data cdd ON ce.id = cdd.entity_id
    WHERE ce.entity_type = 'system_user'
    AND cdd.field_name = 'auth_user_id'
    AND cdd.field_value = p_auth_user_id::TEXT;

    IF v_user_entity_id IS NULL THEN
        -- Create user entity
        v_user_entity_id := gen_random_uuid();
        
        INSERT INTO core_entities (
            id, organization_id, entity_type, entity_name, entity_code, entity_status, is_active
        ) VALUES (
            v_user_entity_id, v_hera_admin_org_id, 'system_user', 
            COALESCE(p_full_name, p_email), 
            'USER-' || SUBSTRING(p_auth_user_id::TEXT, 1, 8),
            'active', true
        );

        -- Store user data in dynamic fields
        INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type, is_encrypted)
        VALUES 
            (v_user_entity_id, 'auth_user_id', p_auth_user_id::TEXT, 'text', false),
            (v_user_entity_id, 'email', p_email, 'text', false),
            (v_user_entity_id, 'full_name', COALESCE(p_full_name, p_email), 'text', false),
            (v_user_entity_id, 'role', 'user', 'text', false),
            (v_user_entity_id, 'created_at', NOW()::TEXT, 'timestamp', false);
    END IF;

    RETURN v_user_entity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 2: Auto-user creation trigger using Universal Schema
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_universal()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user entity in universal schema
    PERFORM public.ensure_user_entity(
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_universal ON auth.users;
CREATE TRIGGER on_auth_user_created_universal
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_universal();

-- ============================================================================
-- STEP 3: Complete restaurant setup function using ONLY Universal Schema
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_restaurant_complete_universal(
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
    user_entity_id UUID
) AS $$
DECLARE
    v_client_id UUID;
    v_organization_id UUID;
    v_restaurant_entity_id UUID;
    v_user_entity_id UUID;
    v_user_org_id UUID;
    v_client_code TEXT;
    v_org_code TEXT;
    v_entity_code TEXT;
BEGIN
    -- Ensure user entity exists
    v_user_entity_id := public.ensure_user_entity(p_auth_user_id, p_user_email, p_user_name);

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
        id, client_name, client_code, client_type, is_active
    ) VALUES (
        v_client_id, 
        p_restaurant_name || ' Holdings', 
        v_client_code, 
        'restaurant_group', 
        true
    );

    -- Step 2: Create the restaurant organization
    INSERT INTO core_organizations (
        id, client_id, name, org_code, industry, country, currency, is_active
    ) VALUES (
        v_organization_id, 
        v_client_id, 
        p_restaurant_name, 
        v_org_code, 
        'restaurant', 
        'US', 
        'USD', 
        true
    );

    -- Step 3: Link user to organization with owner role
    INSERT INTO user_organizations (
        id, user_id, organization_id, role, is_active
    ) VALUES (
        v_user_org_id, 
        p_auth_user_id, 
        v_organization_id, 
        'owner', 
        true
    );

    -- Step 4: Create restaurant entity using universal pattern
    INSERT INTO core_entities (
        id, organization_id, entity_type, entity_name, entity_code, entity_description, entity_status, is_active
    ) VALUES (
        v_restaurant_entity_id, 
        v_organization_id, 
        'restaurant', 
        p_restaurant_name, 
        v_entity_code,
        p_cuisine_type || ' restaurant in ' || p_location, 
        'active', 
        true
    );

    -- Step 5: Store restaurant details in dynamic data
    INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type, is_encrypted)
    VALUES 
        (v_restaurant_entity_id, 'business_type', p_business_type, 'text', false),
        (v_restaurant_entity_id, 'cuisine_type', p_cuisine_type, 'text', false),
        (v_restaurant_entity_id, 'location', p_location, 'text', false),
        (v_restaurant_entity_id, 'seating_capacity', p_seating_capacity, 'text', false),
        (v_restaurant_entity_id, 'owner_name', p_user_name, 'text', false),
        (v_restaurant_entity_id, 'owner_phone', p_user_phone, 'text', false),
        (v_restaurant_entity_id, 'owner_email', p_user_email, 'text', false),
        (v_restaurant_entity_id, 'registration_date', NOW()::TEXT, 'timestamp', false);

    -- Add opening date if provided
    IF p_opening_date IS NOT NULL THEN
        INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type, is_encrypted)
        VALUES (v_restaurant_entity_id, 'opening_date', p_opening_date::TEXT, 'date', false);
    END IF;

    -- Step 6: Create metadata
    INSERT INTO core_metadata (entity_id, metadata_key, metadata_value, metadata_type)
    VALUES 
        (v_restaurant_entity_id, 'setup_completed', 'true', 'system'),
        (v_restaurant_entity_id, 'setup_version', '1.0', 'system'),
        (v_restaurant_entity_id, 'created_by', p_auth_user_id::TEXT, 'system');

    -- Return success
    RETURN QUERY
    SELECT 
        true as success, 
        'Restaurant setup completed successfully' as message, 
        v_client_id, 
        v_organization_id, 
        v_restaurant_entity_id,
        v_user_entity_id;

EXCEPTION WHEN OTHERS THEN
    RETURN QUERY
    SELECT 
        false as success, 
        'Error: ' || SQLERRM as message, 
        NULL::UUID, 
        NULL::UUID, 
        NULL::UUID,
        NULL::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: Get user restaurant profile from Universal Schema
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_restaurant_profile_universal(
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
        p_auth_user_id as user_id,
        MAX(CASE WHEN cdd_user.field_name = 'email' THEN cdd_user.field_value END) as user_email,
        MAX(CASE WHEN cdd_user.field_name = 'full_name' THEN cdd_user.field_value END) as user_name,
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
    FROM user_organizations uo
    JOIN core_organizations co ON uo.organization_id = co.id
    JOIN core_clients cc ON co.client_id = cc.id
    LEFT JOIN core_entities ce ON co.id = ce.organization_id AND ce.entity_type = 'restaurant'
    LEFT JOIN core_dynamic_data cdd ON ce.id = cdd.entity_id
    LEFT JOIN core_entities ce_user ON ce_user.entity_type = 'system_user'
    LEFT JOIN core_dynamic_data cdd_user ON ce_user.id = cdd_user.entity_id 
        AND cdd_user.field_name IN ('email', 'full_name', 'auth_user_id')
        AND cdd_user.field_value = p_auth_user_id::TEXT
    WHERE uo.user_id = p_auth_user_id
    AND uo.is_active = true
    GROUP BY uo.role, co.id, co.name, cc.id, cc.client_name, ce.id, ce.entity_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: User role management using Universal Schema
-- ============================================================================

-- Function to get user role from universal schema
CREATE OR REPLACE FUNCTION public.get_user_role_universal(
    p_auth_user_id UUID
)
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- Get role from dynamic data
    SELECT cdd.field_value INTO v_role
    FROM core_entities ce
    JOIN core_dynamic_data cdd ON ce.id = cdd.entity_id
    WHERE ce.entity_type = 'system_user'
    AND cdd.field_name = 'auth_user_id'
    AND cdd.field_value = p_auth_user_id::TEXT
    AND EXISTS (
        SELECT 1 FROM core_dynamic_data cdd2 
        WHERE cdd2.entity_id = ce.id 
        AND cdd2.field_name = 'role'
    );
    
    RETURN COALESCE(v_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user role in universal schema
CREATE OR REPLACE FUNCTION public.update_user_role_universal(
    p_email TEXT,
    p_new_role TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_entity_id UUID;
BEGIN
    -- Find user entity by email
    SELECT ce.id INTO v_entity_id
    FROM core_entities ce
    JOIN core_dynamic_data cdd ON ce.id = cdd.entity_id
    WHERE ce.entity_type = 'system_user'
    AND cdd.field_name = 'email'
    AND cdd.field_value = p_email;
    
    IF v_entity_id IS NOT NULL THEN
        -- Update or insert role
        INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type, is_encrypted)
        VALUES (v_entity_id, 'role', p_new_role, 'text', false)
        ON CONFLICT (entity_id, field_name) 
        DO UPDATE SET field_value = p_new_role, updated_at = NOW();
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 6: Sample data creation function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_sample_restaurant_data_universal(
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
            entity_description, parent_entity_id, is_active
        ) VALUES (
            v_menu_category_id, v_organization_id, 'menu_category', category_name,
            'CAT-' || LPAD((v_items_created + 1)::TEXT, 3, '0'),
            'Menu category for restaurant', p_restaurant_entity_id, true
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

GRANT EXECUTE ON FUNCTION public.ensure_user_entity TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user_universal TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_restaurant_complete_universal TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_restaurant_profile_universal TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role_universal TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_role_universal TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_sample_restaurant_data_universal TO authenticated;

-- ============================================================================
-- STEP 8: Setup existing users in Universal Schema
-- ============================================================================

-- Create user entities for existing auth users
DO $$
DECLARE
    auth_user_record RECORD;
BEGIN
    FOR auth_user_record IN 
        SELECT au.* FROM auth.users au
    LOOP
        PERFORM public.ensure_user_entity(
            auth_user_record.id,
            auth_user_record.email,
            auth_user_record.raw_user_meta_data->>'full_name'
        );
    END LOOP;
END $$;

-- Set admin role for specific user
SELECT public.update_user_role_universal('santhoshlal@gmail.com', 'admin');

-- ============================================================================
-- STEP 9: Demo Restaurant Setup (Optional)
-- ============================================================================

-- Create Zen Tea Garden demo restaurant
DO $$
DECLARE
    v_result RECORD;
BEGIN
    -- Check if demo restaurant already exists
    IF NOT EXISTS (
        SELECT 1 FROM core_entities 
        WHERE entity_name = 'Zen Tea Garden' 
        AND entity_type = 'restaurant'
    ) THEN
        -- Create demo restaurant
        SELECT * INTO v_result FROM public.create_restaurant_complete_universal(
            '550e8400-e29b-41d4-a716-446655440012'::uuid,  -- Demo user ID
            'sarah@zenteagarden.com',
            'Sarah Chen',
            '+1 (555) 123-4567',
            'Zen Tea Garden',
            'restaurant',
            'Tea House',
            'New York, NY',
            '26-75',
            '2024-01-01'::date
        );
        
        RAISE NOTICE 'Demo restaurant created: %', v_result.message;
    END IF;
END $$;

-- ============================================================================
-- STEP 10: Verification queries
-- ============================================================================

-- Verify user entities
SELECT 
    ce.entity_name as user_name,
    MAX(CASE WHEN cdd.field_name = 'email' THEN cdd.field_value END) as email,
    MAX(CASE WHEN cdd.field_name = 'role' THEN cdd.field_value END) as role,
    ce.created_at
FROM core_entities ce
JOIN core_dynamic_data cdd ON ce.id = cdd.entity_id
WHERE ce.entity_type = 'system_user'
GROUP BY ce.id, ce.entity_name, ce.created_at
ORDER BY ce.created_at DESC
LIMIT 10;

-- Verify restaurant setup
SELECT 
    ce.entity_name as restaurant_name,
    co.name as organization_name,
    cc.client_name,
    ce.entity_code,
    ce.created_at
FROM core_entities ce
JOIN core_organizations co ON ce.organization_id = co.id
JOIN core_clients cc ON co.client_id = cc.id
WHERE ce.entity_type = 'restaurant'
ORDER BY ce.created_at DESC
LIMIT 10;