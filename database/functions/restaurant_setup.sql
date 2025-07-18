-- HERA Restaurant Setup Functions
-- Complete restaurant registration following Universal Schema pattern
-- Steve Krug Principle: Simple, reliable backend that "just works"

-- Function to create complete restaurant setup
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
        id, 
        client_name, 
        client_code, 
        client_type, 
        is_active,
        created_at,
        updated_at
    ) VALUES (
        v_client_id,
        p_restaurant_name || ' Holdings',
        v_client_code,
        'restaurant_group',
        true,
        NOW(),
        NOW()
    );

    -- Step 2: Create the restaurant organization
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
        v_organization_id,
        v_client_id,
        p_restaurant_name,
        v_org_code,
        'restaurant',
        'US',
        'USD',
        true,
        NOW(),
        NOW()
    );

    -- Step 3: Link user to organization with owner role
    INSERT INTO user_organizations (
        id,
        user_id,
        organization_id,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        v_user_org_id,
        p_auth_user_id,
        v_organization_id,
        'owner',
        true,
        NOW(),
        NOW()
    );

    -- Step 4: Create restaurant entity using universal pattern
    INSERT INTO core_entities (
        id,
        organization_id,
        entity_type,
        entity_name,
        entity_code,
        entity_description,
        entity_status,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        v_restaurant_entity_id,
        v_organization_id,
        'restaurant',
        p_restaurant_name,
        v_entity_code,
        p_cuisine_type || ' restaurant in ' || p_location,
        'active',
        true,
        NOW(),
        NOW()
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

    -- Step 6: Create default metadata for restaurant
    INSERT INTO core_metadata (
        entity_id,
        metadata_key,
        metadata_value,
        metadata_type,
        created_at,
        updated_at
    ) VALUES 
        (v_restaurant_entity_id, 'setup_completed', 'true', 'system', NOW(), NOW()),
        (v_restaurant_entity_id, 'setup_version', '1.0', 'system', NOW(), NOW()),
        (v_restaurant_entity_id, 'created_by', p_auth_user_id::TEXT, 'system', NOW(), NOW());

    -- Return success with all created IDs
    RETURN QUERY
    SELECT 
        true as success,
        'Restaurant setup completed successfully' as message,
        v_client_id as client_id,
        v_organization_id as organization_id,
        v_restaurant_entity_id as restaurant_entity_id,
        true as user_linked;

EXCEPTION WHEN OTHERS THEN
    -- Return error information
    RETURN QUERY
    SELECT 
        false as success,
        'Error: ' || SQLERRM as message,
        NULL::UUID as client_id,
        NULL::UUID as organization_id,
        NULL::UUID as restaurant_entity_id,
        false as user_linked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get restaurant profile for a user
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

-- Function to create sample restaurant data (for testing)
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
    v_menu_item_id UUID;
BEGIN
    -- Create menu categories
    FOR i IN 1..3 LOOP
        v_menu_category_id := gen_random_uuid();
        
        INSERT INTO core_entities (
            id,
            organization_id,
            entity_type,
            entity_name,
            entity_code,
            entity_description,
            parent_entity_id,
            is_active,
            created_at,
            updated_at
        ) 
        SELECT 
            v_menu_category_id,
            ce.organization_id,
            'menu_category',
            CASE i 
                WHEN 1 THEN 'Beverages'
                WHEN 2 THEN 'Main Dishes'
                WHEN 3 THEN 'Desserts'
            END,
            'CAT-' || LPAD(i::TEXT, 3, '0'),
            'Menu category for restaurant',
            p_restaurant_entity_id,
            true,
            NOW(),
            NOW()
        FROM core_entities ce 
        WHERE ce.id = p_restaurant_entity_id;
        
        v_items_created := v_items_created + 1;
    END LOOP;

    -- Return success
    RETURN QUERY
    SELECT 
        true as success,
        'Sample data created successfully' as message,
        v_items_created as items_created;

EXCEPTION WHEN OTHERS THEN
    RETURN QUERY
    SELECT 
        false as success,
        'Error creating sample data: ' || SQLERRM as message,
        0 as items_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_restaurant_complete TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_restaurant_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_sample_restaurant_data TO authenticated;