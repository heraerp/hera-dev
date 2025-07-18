-- Fixed version of get_user_restaurant_profile function
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