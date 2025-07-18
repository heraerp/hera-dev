-- ============================================================================
-- HERA Universal Multi-Organization Architecture Functions
-- PostgreSQL RPC Functions for Multi-Organization Support
-- Following HERA Universal Architecture Principles
-- ============================================================================

-- Function 1: Get User Organizations with Solutions
-- Returns all organizations a user has access to with their solutions/modules
CREATE OR REPLACE FUNCTION public.get_user_organizations_with_solutions(
    p_auth_user_id UUID
)
RETURNS TABLE(
    organization_id UUID,
    organization_name TEXT,
    organization_code TEXT,
    client_id UUID,
    client_name TEXT,
    industry TEXT,
    country TEXT,
    currency TEXT,
    user_role TEXT,
    is_active BOOLEAN,
    solutions JSONB,
    permissions JSONB,
    created_at TIMESTAMPTZ,
    last_accessed TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        co.id as organization_id,
        co.name as organization_name,
        co.org_code as organization_code,
        cc.id as client_id,
        cc.client_name as client_name,
        co.industry,
        co.country,
        co.currency,
        uo.role as user_role,
        uo.is_active,
        -- Get available solutions based on organization type and metadata
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'solution_name', cm.metadata_key,
                    'solution_status', cm.metadata_value->>'status',
                    'solution_config', cm.metadata_value
                )
            )
            FROM core_metadata cm
            WHERE cm.organization_id = co.id
            AND cm.metadata_type = 'solution'
            AND cm.metadata_category = 'available_modules'
            ), '[]'::jsonb
        ) as solutions,
        -- Get user permissions for this organization
        COALESCE(
            (SELECT jsonb_build_object(
                'can_read', true,
                'can_write', CASE WHEN uo.role IN ('owner', 'admin', 'manager') THEN true ELSE false END,
                'can_delete', CASE WHEN uo.role IN ('owner', 'admin') THEN true ELSE false END,
                'can_manage_users', CASE WHEN uo.role IN ('owner', 'admin') THEN true ELSE false END,
                'can_manage_settings', CASE WHEN uo.role IN ('owner', 'admin') THEN true ELSE false END,
                'can_view_reports', CASE WHEN uo.role IN ('owner', 'admin', 'manager') THEN true ELSE false END,
                'can_export_data', CASE WHEN uo.role IN ('owner', 'admin', 'manager') THEN true ELSE false END,
                'role_level', CASE 
                    WHEN uo.role = 'owner' THEN 5
                    WHEN uo.role = 'admin' THEN 4
                    WHEN uo.role = 'manager' THEN 3
                    WHEN uo.role = 'user' THEN 2
                    ELSE 1
                END
            )), '{}'::jsonb
        ) as permissions,
        uo.created_at,
        -- Get last accessed timestamp from metadata
        COALESCE(
            (SELECT (cm.metadata_value->>'last_accessed')::timestamptz
            FROM core_metadata cm
            WHERE cm.organization_id = co.id
            AND cm.entity_type = 'user_session'
            AND cm.entity_id = p_auth_user_id::text
            AND cm.metadata_type = 'access_tracking'
            ORDER BY cm.updated_at DESC
            LIMIT 1
            ), uo.created_at
        ) as last_accessed
    FROM core_users cu
    JOIN user_organizations uo ON cu.auth_user_id = uo.user_id
    JOIN core_organizations co ON uo.organization_id = co.id
    JOIN core_clients cc ON co.client_id = cc.id
    WHERE cu.auth_user_id = p_auth_user_id
    AND uo.is_active = true
    AND co.is_active = true
    ORDER BY last_accessed DESC, co.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Check Organization Access Permission
-- Validates if a user can access a specific organization with specified permission level
CREATE OR REPLACE FUNCTION public.check_organization_access(
    p_auth_user_id UUID,
    p_organization_id UUID,
    p_required_permission TEXT DEFAULT 'read'
)
RETURNS TABLE(
    has_access BOOLEAN,
    user_role TEXT,
    permission_level INTEGER,
    organization_name TEXT,
    access_reason TEXT
) AS $$
DECLARE
    v_user_role TEXT;
    v_permission_level INTEGER;
    v_org_name TEXT;
    v_has_access BOOLEAN := false;
    v_access_reason TEXT;
BEGIN
    -- Get user role and organization info
    SELECT 
        uo.role,
        co.name,
        CASE 
            WHEN uo.role = 'owner' THEN 5
            WHEN uo.role = 'admin' THEN 4
            WHEN uo.role = 'manager' THEN 3
            WHEN uo.role = 'user' THEN 2
            ELSE 1
        END
    INTO v_user_role, v_org_name, v_permission_level
    FROM user_organizations uo
    JOIN core_organizations co ON uo.organization_id = co.id
    WHERE uo.user_id = p_auth_user_id
    AND uo.organization_id = p_organization_id
    AND uo.is_active = true
    AND co.is_active = true;
    
    -- Check if user has access to organization
    IF v_user_role IS NOT NULL THEN
        -- Check permission level based on required permission
        CASE p_required_permission
            WHEN 'read' THEN
                v_has_access := true;
                v_access_reason := 'User has read access';
            WHEN 'write' THEN
                v_has_access := v_permission_level >= 2;
                v_access_reason := CASE WHEN v_has_access THEN 'User has write access' ELSE 'Insufficient permissions for write access' END;
            WHEN 'delete' THEN
                v_has_access := v_permission_level >= 4;
                v_access_reason := CASE WHEN v_has_access THEN 'User has delete access' ELSE 'Insufficient permissions for delete access' END;
            WHEN 'admin' THEN
                v_has_access := v_permission_level >= 4;
                v_access_reason := CASE WHEN v_has_access THEN 'User has admin access' ELSE 'Insufficient permissions for admin access' END;
            WHEN 'owner' THEN
                v_has_access := v_permission_level >= 5;
                v_access_reason := CASE WHEN v_has_access THEN 'User has owner access' ELSE 'Insufficient permissions for owner access' END;
            ELSE
                v_has_access := v_permission_level >= 1;
                v_access_reason := 'Basic access granted';
        END CASE;
    ELSE
        v_access_reason := 'User not found in organization or organization inactive';
    END IF;
    
    RETURN QUERY
    SELECT 
        v_has_access,
        v_user_role,
        v_permission_level,
        v_org_name,
        v_access_reason;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Switch Organization Context
-- Updates user's current organization context and logs the switch
CREATE OR REPLACE FUNCTION public.switch_organization_context(
    p_auth_user_id UUID,
    p_organization_id UUID,
    p_session_info JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    organization_id UUID,
    organization_name TEXT,
    client_name TEXT,
    user_role TEXT,
    permissions JSONB,
    context_data JSONB
) AS $$
DECLARE
    v_access_check RECORD;
    v_org_info RECORD;
    v_context_data JSONB;
BEGIN
    -- First check if user has access to the organization
    SELECT * INTO v_access_check
    FROM public.check_organization_access(p_auth_user_id, p_organization_id, 'read');
    
    IF NOT v_access_check.has_access THEN
        RETURN QUERY
        SELECT 
            false as success,
            'Access denied: ' || v_access_check.access_reason as message,
            NULL::UUID as organization_id,
            NULL::TEXT as organization_name,
            NULL::TEXT as client_name,
            NULL::TEXT as user_role,
            NULL::JSONB as permissions,
            NULL::JSONB as context_data;
        RETURN;
    END IF;
    
    -- Get full organization information
    SELECT 
        co.id,
        co.name,
        cc.client_name,
        uo.role,
        co.industry,
        co.country,
        co.currency
    INTO v_org_info
    FROM core_organizations co
    JOIN core_clients cc ON co.client_id = cc.id
    JOIN user_organizations uo ON co.id = uo.organization_id
    WHERE co.id = p_organization_id
    AND uo.user_id = p_auth_user_id;
    
    -- Build context data
    v_context_data := jsonb_build_object(
        'organization_id', v_org_info.id,
        'organization_name', v_org_info.name,
        'client_name', v_org_info.client_name,
        'industry', v_org_info.industry,
        'country', v_org_info.country,
        'currency', v_org_info.currency,
        'switch_timestamp', NOW(),
        'session_info', p_session_info
    );
    
    -- Log the organization switch in metadata
    INSERT INTO core_metadata (
        organization_id,
        entity_type,
        entity_id,
        metadata_type,
        metadata_category,
        metadata_key,
        metadata_value,
        created_at,
        updated_at
    ) VALUES (
        p_organization_id,
        'user_session',
        p_auth_user_id::text,
        'access_tracking',
        'organization_switch',
        'last_accessed',
        jsonb_build_object(
            'last_accessed', NOW(),
            'switch_reason', 'manual_switch',
            'session_info', p_session_info
        ),
        NOW(),
        NOW()
    ) ON CONFLICT (organization_id, entity_type, entity_id, metadata_type, metadata_key) 
    DO UPDATE SET 
        metadata_value = EXCLUDED.metadata_value,
        updated_at = NOW();
    
    -- Return success with full context
    RETURN QUERY
    SELECT 
        true as success,
        'Organization context switched successfully' as message,
        v_org_info.id as organization_id,
        v_org_info.name as organization_name,
        v_org_info.client_name,
        v_org_info.role as user_role,
        jsonb_build_object(
            'can_read', true,
            'can_write', CASE WHEN v_org_info.role IN ('owner', 'admin', 'manager') THEN true ELSE false END,
            'can_delete', CASE WHEN v_org_info.role IN ('owner', 'admin') THEN true ELSE false END,
            'can_manage_users', CASE WHEN v_org_info.role IN ('owner', 'admin') THEN true ELSE false END,
            'can_manage_settings', CASE WHEN v_org_info.role IN ('owner', 'admin') THEN true ELSE false END,
            'role_level', v_access_check.permission_level
        ) as permissions,
        v_context_data as context_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: Get Current Organization Context
-- Retrieves the user's current organization context
CREATE OR REPLACE FUNCTION public.get_current_organization_context(
    p_auth_user_id UUID
)
RETURNS TABLE(
    organization_id UUID,
    organization_name TEXT,
    client_name TEXT,
    user_role TEXT,
    permissions JSONB,
    last_accessed TIMESTAMPTZ,
    context_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        co.id as organization_id,
        co.name as organization_name,
        cc.client_name,
        uo.role as user_role,
        jsonb_build_object(
            'can_read', true,
            'can_write', CASE WHEN uo.role IN ('owner', 'admin', 'manager') THEN true ELSE false END,
            'can_delete', CASE WHEN uo.role IN ('owner', 'admin') THEN true ELSE false END,
            'can_manage_users', CASE WHEN uo.role IN ('owner', 'admin') THEN true ELSE false END,
            'can_manage_settings', CASE WHEN uo.role IN ('owner', 'admin') THEN true ELSE false END,
            'role_level', CASE 
                WHEN uo.role = 'owner' THEN 5
                WHEN uo.role = 'admin' THEN 4
                WHEN uo.role = 'manager' THEN 3
                WHEN uo.role = 'user' THEN 2
                ELSE 1
            END
        ) as permissions,
        (cm.metadata_value->>'last_accessed')::timestamptz as last_accessed,
        cm.metadata_value as context_data
    FROM core_metadata cm
    JOIN core_organizations co ON cm.organization_id = co.id
    JOIN core_clients cc ON co.client_id = cc.id
    JOIN user_organizations uo ON co.id = uo.organization_id AND uo.user_id = p_auth_user_id
    WHERE cm.entity_type = 'user_session'
    AND cm.entity_id = p_auth_user_id::text
    AND cm.metadata_type = 'access_tracking'
    AND cm.metadata_key = 'last_accessed'
    ORDER BY (cm.metadata_value->>'last_accessed')::timestamptz DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 5: Add User to Organization
-- Adds a user to an organization with specified role
CREATE OR REPLACE FUNCTION public.add_user_to_organization(
    p_requesting_user_id UUID,
    p_target_user_email TEXT,
    p_organization_id UUID,
    p_role TEXT DEFAULT 'user'
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    user_id UUID,
    organization_id UUID,
    role TEXT
) AS $$
DECLARE
    v_requesting_access RECORD;
    v_target_user_id UUID;
    v_existing_relationship UUID;
    v_user_org_id UUID;
BEGIN
    -- Check if requesting user has admin/owner access to the organization
    SELECT * INTO v_requesting_access
    FROM public.check_organization_access(p_requesting_user_id, p_organization_id, 'admin');
    
    IF NOT v_requesting_access.has_access THEN
        RETURN QUERY
        SELECT 
            false as success,
            'Access denied: Only admins and owners can add users to organizations' as message,
            NULL::UUID as user_id,
            NULL::UUID as organization_id,
            NULL::TEXT as role;
        RETURN;
    END IF;
    
    -- Find target user
    SELECT auth_user_id INTO v_target_user_id
    FROM core_users
    WHERE email = p_target_user_email;
    
    IF v_target_user_id IS NULL THEN
        RETURN QUERY
        SELECT 
            false as success,
            'User not found: ' || p_target_user_email as message,
            NULL::UUID as user_id,
            NULL::UUID as organization_id,
            NULL::TEXT as role;
        RETURN;
    END IF;
    
    -- Check if user is already in the organization
    SELECT id INTO v_existing_relationship
    FROM user_organizations
    WHERE user_id = v_target_user_id
    AND organization_id = p_organization_id;
    
    IF v_existing_relationship IS NOT NULL THEN
        -- Update existing relationship
        UPDATE user_organizations
        SET 
            role = p_role,
            is_active = true,
            updated_at = NOW()
        WHERE id = v_existing_relationship;
        
        RETURN QUERY
        SELECT 
            true as success,
            'User role updated successfully' as message,
            v_target_user_id as user_id,
            p_organization_id as organization_id,
            p_role as role;
    ELSE
        -- Create new relationship
        v_user_org_id := gen_random_uuid();
        
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
            v_target_user_id,
            p_organization_id,
            p_role,
            true,
            NOW(),
            NOW()
        );
        
        RETURN QUERY
        SELECT 
            true as success,
            'User added to organization successfully' as message,
            v_target_user_id as user_id,
            p_organization_id as organization_id,
            p_role as role;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 6: Remove User from Organization
-- Removes a user from an organization (sets inactive)
CREATE OR REPLACE FUNCTION public.remove_user_from_organization(
    p_requesting_user_id UUID,
    p_target_user_email TEXT,
    p_organization_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    user_id UUID,
    organization_id UUID
) AS $$
DECLARE
    v_requesting_access RECORD;
    v_target_user_id UUID;
    v_existing_relationship UUID;
BEGIN
    -- Check if requesting user has admin/owner access to the organization
    SELECT * INTO v_requesting_access
    FROM public.check_organization_access(p_requesting_user_id, p_organization_id, 'admin');
    
    IF NOT v_requesting_access.has_access THEN
        RETURN QUERY
        SELECT 
            false as success,
            'Access denied: Only admins and owners can remove users from organizations' as message,
            NULL::UUID as user_id,
            NULL::UUID as organization_id;
        RETURN;
    END IF;
    
    -- Find target user
    SELECT auth_user_id INTO v_target_user_id
    FROM core_users
    WHERE email = p_target_user_email;
    
    IF v_target_user_id IS NULL THEN
        RETURN QUERY
        SELECT 
            false as success,
            'User not found: ' || p_target_user_email as message,
            NULL::UUID as user_id,
            NULL::UUID as organization_id;
        RETURN;
    END IF;
    
    -- Check if user is in the organization
    SELECT id INTO v_existing_relationship
    FROM user_organizations
    WHERE user_id = v_target_user_id
    AND organization_id = p_organization_id
    AND is_active = true;
    
    IF v_existing_relationship IS NULL THEN
        RETURN QUERY
        SELECT 
            false as success,
            'User is not active in this organization' as message,
            v_target_user_id as user_id,
            p_organization_id as organization_id;
        RETURN;
    END IF;
    
    -- Deactivate the relationship
    UPDATE user_organizations
    SET 
        is_active = false,
        updated_at = NOW()
    WHERE id = v_existing_relationship;
    
    RETURN QUERY
    SELECT 
        true as success,
        'User removed from organization successfully' as message,
        v_target_user_id as user_id,
        p_organization_id as organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 7: Get Organization Members
-- Returns all members of an organization with their roles and permissions
CREATE OR REPLACE FUNCTION public.get_organization_members(
    p_requesting_user_id UUID,
    p_organization_id UUID
)
RETURNS TABLE(
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    role TEXT,
    permission_level INTEGER,
    is_active BOOLEAN,
    joined_at TIMESTAMPTZ,
    last_accessed TIMESTAMPTZ
) AS $$
DECLARE
    v_requesting_access RECORD;
BEGIN
    -- Check if requesting user has read access to the organization
    SELECT * INTO v_requesting_access
    FROM public.check_organization_access(p_requesting_user_id, p_organization_id, 'read');
    
    IF NOT v_requesting_access.has_access THEN
        RETURN; -- Return empty result set
    END IF;
    
    RETURN QUERY
    SELECT 
        cu.auth_user_id as user_id,
        cu.email as user_email,
        cu.full_name as user_name,
        uo.role,
        CASE 
            WHEN uo.role = 'owner' THEN 5
            WHEN uo.role = 'admin' THEN 4
            WHEN uo.role = 'manager' THEN 3
            WHEN uo.role = 'user' THEN 2
            ELSE 1
        END as permission_level,
        uo.is_active,
        uo.created_at as joined_at,
        COALESCE(
            (SELECT (cm.metadata_value->>'last_accessed')::timestamptz
            FROM core_metadata cm
            WHERE cm.organization_id = p_organization_id
            AND cm.entity_type = 'user_session'
            AND cm.entity_id = cu.auth_user_id::text
            AND cm.metadata_type = 'access_tracking'
            ORDER BY cm.updated_at DESC
            LIMIT 1
            ), uo.created_at
        ) as last_accessed
    FROM user_organizations uo
    JOIN core_users cu ON uo.user_id = cu.auth_user_id
    WHERE uo.organization_id = p_organization_id
    ORDER BY 
        CASE 
            WHEN uo.role = 'owner' THEN 1
            WHEN uo.role = 'admin' THEN 2
            WHEN uo.role = 'manager' THEN 3
            WHEN uo.role = 'user' THEN 4
            ELSE 5
        END,
        cu.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 8: Initialize Organization Solutions
-- Sets up available solutions/modules for an organization
CREATE OR REPLACE FUNCTION public.initialize_organization_solutions(
    p_requesting_user_id UUID,
    p_organization_id UUID,
    p_solutions JSONB DEFAULT '[]'::jsonb
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    solutions_configured INTEGER
) AS $$
DECLARE
    v_requesting_access RECORD;
    v_solution_record RECORD;
    v_solutions_count INTEGER := 0;
    v_default_solutions JSONB := '[
        {"name": "restaurant_pos", "status": "active", "config": {"features": ["orders", "payments", "inventory"]}},
        {"name": "inventory_management", "status": "active", "config": {"features": ["stock_tracking", "low_stock_alerts"]}},
        {"name": "customer_management", "status": "active", "config": {"features": ["customer_profiles", "loyalty_programs"]}},
        {"name": "reporting_analytics", "status": "active", "config": {"features": ["sales_reports", "inventory_reports"]}},
        {"name": "employee_management", "status": "active", "config": {"features": ["staff_scheduling", "time_tracking"]}}
    ]'::jsonb;
BEGIN
    -- Check if requesting user has admin access to the organization
    SELECT * INTO v_requesting_access
    FROM public.check_organization_access(p_requesting_user_id, p_organization_id, 'admin');
    
    IF NOT v_requesting_access.has_access THEN
        RETURN QUERY
        SELECT 
            false as success,
            'Access denied: Only admins and owners can configure organization solutions' as message,
            0 as solutions_configured;
        RETURN;
    END IF;
    
    -- Use provided solutions or default ones
    IF jsonb_array_length(p_solutions) = 0 THEN
        p_solutions := v_default_solutions;
    END IF;
    
    -- Configure each solution
    FOR v_solution_record IN SELECT * FROM jsonb_array_elements(p_solutions) AS solution
    LOOP
        INSERT INTO core_metadata (
            organization_id,
            entity_type,
            entity_id,
            metadata_type,
            metadata_category,
            metadata_key,
            metadata_value,
            created_at,
            updated_at
        ) VALUES (
            p_organization_id,
            'organization',
            p_organization_id::text,
            'solution',
            'available_modules',
            v_solution_record.solution->>'name',
            jsonb_build_object(
                'status', v_solution_record.solution->>'status',
                'config', v_solution_record.solution->'config',
                'initialized_at', NOW(),
                'initialized_by', p_requesting_user_id
            ),
            NOW(),
            NOW()
        ) ON CONFLICT (organization_id, entity_type, entity_id, metadata_type, metadata_key) 
        DO UPDATE SET 
            metadata_value = EXCLUDED.metadata_value,
            updated_at = NOW();
        
        v_solutions_count := v_solutions_count + 1;
    END LOOP;
    
    RETURN QUERY
    SELECT 
        true as success,
        'Organization solutions configured successfully' as message,
        v_solutions_count as solutions_configured;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_organizations_with_solutions TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_organization_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.switch_organization_context TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_organization_context TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_user_to_organization TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_user_from_organization TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_organization_members TO authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_organization_solutions TO authenticated;

-- ============================================================================
-- DOCUMENTATION AND EXAMPLES
-- ============================================================================

-- Example Usage:
-- 1. Get all organizations for a user:
-- SELECT * FROM public.get_user_organizations_with_solutions('user-uuid-here');

-- 2. Check if user can access organization:
-- SELECT * FROM public.check_organization_access('user-uuid', 'org-uuid', 'write');

-- 3. Switch organization context:
-- SELECT * FROM public.switch_organization_context('user-uuid', 'org-uuid', '{"source": "frontend"}');

-- 4. Get current organization context:
-- SELECT * FROM public.get_current_organization_context('user-uuid');

-- 5. Add user to organization:
-- SELECT * FROM public.add_user_to_organization('admin-user-uuid', 'newuser@example.com', 'org-uuid', 'user');

-- 6. Get organization members:
-- SELECT * FROM public.get_organization_members('user-uuid', 'org-uuid');

-- 7. Initialize organization solutions:
-- SELECT * FROM public.initialize_organization_solutions('admin-user-uuid', 'org-uuid');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'HERA Universal Multi-Organization Functions created successfully!';
    RAISE NOTICE 'Functions available: get_user_organizations_with_solutions, check_organization_access, switch_organization_context, get_current_organization_context, add_user_to_organization, remove_user_from_organization, get_organization_members, initialize_organization_solutions';
    RAISE NOTICE 'All functions follow HERA Universal Architecture principles';
    RAISE NOTICE 'Ready for multi-organization usage!';
END $$;