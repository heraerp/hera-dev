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