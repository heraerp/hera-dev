-- Fixed version of create_restaurant_complete function
-- Corrects the SUBSTRING syntax error

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
    v_timestamp TEXT;
BEGIN
    -- Get timestamp part for unique codes
    v_timestamp := SUBSTRING(EXTRACT(epoch FROM NOW())::TEXT FROM 8 FOR 3);
    
    -- Generate unique codes
    v_client_code := UPPER(SUBSTRING(p_restaurant_name FROM 1 FOR 3)) || v_timestamp;
    v_org_code := UPPER(SUBSTRING(p_restaurant_name FROM 1 FOR 3)) || v_timestamp;
    v_entity_code := 'REST-' || SUBSTRING(EXTRACT(epoch FROM NOW())::TEXT FROM 8 FOR 6);
    
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