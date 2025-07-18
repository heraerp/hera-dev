-- Enhanced core_users management functions
-- Provides robust user management with error handling and logging

-- Function to safely create or update core_users
CREATE OR REPLACE FUNCTION public.ensure_core_user(
    p_auth_user_id UUID,
    p_email TEXT,
    p_full_name TEXT DEFAULT NULL,
    p_role TEXT DEFAULT 'user'
)
RETURNS TABLE(
    core_user_id UUID,
    auth_user_id UUID,
    email TEXT,
    role TEXT,
    created BOOLEAN
) AS $$
DECLARE
    v_core_user_id UUID;
    v_created BOOLEAN := false;
BEGIN
    -- Try to find existing core_user
    SELECT id INTO v_core_user_id
    FROM core_users
    WHERE core_users.auth_user_id = p_auth_user_id;
    
    IF v_core_user_id IS NULL THEN
        -- Create new core_user
        INSERT INTO core_users (
            auth_user_id,
            email,
            full_name,
            role,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            p_auth_user_id,
            p_email,
            COALESCE(p_full_name, p_email),
            p_role,
            true,
            NOW(),
            NOW()
        )
        RETURNING id INTO v_core_user_id;
        
        v_created := true;
    ELSE
        -- Update existing core_user
        UPDATE core_users
        SET 
            email = p_email,
            full_name = COALESCE(p_full_name, p_email),
            updated_at = NOW()
        WHERE id = v_core_user_id;
    END IF;
    
    -- Return the result
    RETURN QUERY
    SELECT 
        v_core_user_id,
        p_auth_user_id,
        p_email,
        p_role,
        v_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    v_count INTEGER;
BEGIN
    -- Find the user
    SELECT cu.id INTO v_user_id
    FROM core_users cu
    WHERE cu.email = p_email;
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT false, 'User not found', NULL::UUID;
        RETURN;
    END IF;
    
    -- Update role to admin
    UPDATE core_users
    SET 
        role = 'admin',
        updated_at = NOW()
    WHERE id = v_user_id;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    IF v_count > 0 THEN
        RETURN QUERY SELECT true, 'User promoted to admin successfully', v_user_id;
    ELSE
        RETURN QUERY SELECT false, 'Failed to update user role', v_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user profile with auth info
CREATE OR REPLACE FUNCTION public.get_user_profile(
    p_auth_user_id UUID
)
RETURNS TABLE(
    core_user_id UUID,
    auth_user_id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    auth_created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cu.id,
        cu.auth_user_id,
        cu.email,
        cu.full_name,
        cu.role,
        cu.is_active,
        cu.created_at,
        cu.updated_at,
        au.created_at as auth_created_at,
        au.last_sign_in_at
    FROM core_users cu
    JOIN auth.users au ON au.id = cu.auth_user_id
    WHERE cu.auth_user_id = p_auth_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test and setup functions
-- 1. Ensure your user exists and is admin
SELECT * FROM public.ensure_core_user(
    (SELECT id FROM auth.users WHERE email = 'santhoshlal@gmail.com'),
    'santhoshlal@gmail.com',
    'Santhosh Lal',
    'admin'
);

-- 2. Alternative: Promote existing user to admin
SELECT * FROM public.promote_to_admin('santhoshlal@gmail.com');

-- 3. Test getting user profile
SELECT * FROM public.get_user_profile(
    (SELECT id FROM auth.users WHERE email = 'santhoshlal@gmail.com')
);