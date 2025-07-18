-- ============================================================================
-- HERA Universal Multi-Organization Functions Test Suite
-- Comprehensive testing of multi-organization architecture
-- ============================================================================

-- Function to run all multi-organization tests
CREATE OR REPLACE FUNCTION public.test_multi_organization_functions()
RETURNS TABLE(
    test_name TEXT,
    test_status TEXT,
    test_message TEXT,
    test_details JSONB
) AS $$
DECLARE
    v_test_user_id UUID;
    v_test_org_id UUID;
    v_test_client_id UUID;
    v_test_result RECORD;
    v_test_count INTEGER := 0;
    v_passed_count INTEGER := 0;
    v_failed_count INTEGER := 0;
BEGIN
    -- Initialize test data
    v_test_user_id := '12345678-1234-1234-1234-123456789012'::UUID;
    v_test_org_id := '87654321-4321-4321-4321-210987654321'::UUID;
    v_test_client_id := '11111111-2222-3333-4444-555555555555'::UUID;
    
    -- Test 1: Test get_user_organizations_with_solutions function
    v_test_count := v_test_count + 1;
    BEGIN
        -- This should not fail even with non-existent user
        SELECT COUNT(*) INTO v_test_result
        FROM public.get_user_organizations_with_solutions(v_test_user_id);
        
        v_passed_count := v_passed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 1: get_user_organizations_with_solutions' as test_name,
            'PASS' as test_status,
            'Function executed successfully' as test_message,
            jsonb_build_object('result_count', v_test_result) as test_details;
    EXCEPTION WHEN OTHERS THEN
        v_failed_count := v_failed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 1: get_user_organizations_with_solutions' as test_name,
            'FAIL' as test_status,
            'Error: ' || SQLERRM as test_message,
            jsonb_build_object('error_code', SQLSTATE) as test_details;
    END;
    
    -- Test 2: Test check_organization_access function
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT * INTO v_test_result
        FROM public.check_organization_access(v_test_user_id, v_test_org_id, 'read');
        
        v_passed_count := v_passed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 2: check_organization_access' as test_name,
            'PASS' as test_status,
            'Function executed successfully' as test_message,
            jsonb_build_object('has_access', v_test_result.has_access, 'access_reason', v_test_result.access_reason) as test_details;
    EXCEPTION WHEN OTHERS THEN
        v_failed_count := v_failed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 2: check_organization_access' as test_name,
            'FAIL' as test_status,
            'Error: ' || SQLERRM as test_message,
            jsonb_build_object('error_code', SQLSTATE) as test_details;
    END;
    
    -- Test 3: Test switch_organization_context function
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT * INTO v_test_result
        FROM public.switch_organization_context(v_test_user_id, v_test_org_id, '{"test": true}'::jsonb);
        
        v_passed_count := v_passed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 3: switch_organization_context' as test_name,
            'PASS' as test_status,
            'Function executed successfully' as test_message,
            jsonb_build_object('success', v_test_result.success, 'message', v_test_result.message) as test_details;
    EXCEPTION WHEN OTHERS THEN
        v_failed_count := v_failed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 3: switch_organization_context' as test_name,
            'FAIL' as test_status,
            'Error: ' || SQLERRM as test_message,
            jsonb_build_object('error_code', SQLSTATE) as test_details;
    END;
    
    -- Test 4: Test get_current_organization_context function
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT COUNT(*) INTO v_test_result
        FROM public.get_current_organization_context(v_test_user_id);
        
        v_passed_count := v_passed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 4: get_current_organization_context' as test_name,
            'PASS' as test_status,
            'Function executed successfully' as test_message,
            jsonb_build_object('result_count', v_test_result) as test_details;
    EXCEPTION WHEN OTHERS THEN
        v_failed_count := v_failed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 4: get_current_organization_context' as test_name,
            'FAIL' as test_status,
            'Error: ' || SQLERRM as test_message,
            jsonb_build_object('error_code', SQLSTATE) as test_details;
    END;
    
    -- Test 5: Test add_user_to_organization function
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT * INTO v_test_result
        FROM public.add_user_to_organization(v_test_user_id, 'test@example.com', v_test_org_id, 'user');
        
        v_passed_count := v_passed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 5: add_user_to_organization' as test_name,
            'PASS' as test_status,
            'Function executed successfully' as test_message,
            jsonb_build_object('success', v_test_result.success, 'message', v_test_result.message) as test_details;
    EXCEPTION WHEN OTHERS THEN
        v_failed_count := v_failed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 5: add_user_to_organization' as test_name,
            'FAIL' as test_status,
            'Error: ' || SQLERRM as test_message,
            jsonb_build_object('error_code', SQLSTATE) as test_details;
    END;
    
    -- Test 6: Test remove_user_from_organization function
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT * INTO v_test_result
        FROM public.remove_user_from_organization(v_test_user_id, 'test@example.com', v_test_org_id);
        
        v_passed_count := v_passed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 6: remove_user_from_organization' as test_name,
            'PASS' as test_status,
            'Function executed successfully' as test_message,
            jsonb_build_object('success', v_test_result.success, 'message', v_test_result.message) as test_details;
    EXCEPTION WHEN OTHERS THEN
        v_failed_count := v_failed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 6: remove_user_from_organization' as test_name,
            'FAIL' as test_status,
            'Error: ' || SQLERRM as test_message,
            jsonb_build_object('error_code', SQLSTATE) as test_details;
    END;
    
    -- Test 7: Test get_organization_members function
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT COUNT(*) INTO v_test_result
        FROM public.get_organization_members(v_test_user_id, v_test_org_id);
        
        v_passed_count := v_passed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 7: get_organization_members' as test_name,
            'PASS' as test_status,
            'Function executed successfully' as test_message,
            jsonb_build_object('result_count', v_test_result) as test_details;
    EXCEPTION WHEN OTHERS THEN
        v_failed_count := v_failed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 7: get_organization_members' as test_name,
            'FAIL' as test_status,
            'Error: ' || SQLERRM as test_message,
            jsonb_build_object('error_code', SQLSTATE) as test_details;
    END;
    
    -- Test 8: Test initialize_organization_solutions function
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT * INTO v_test_result
        FROM public.initialize_organization_solutions(v_test_user_id, v_test_org_id, '[]'::jsonb);
        
        v_passed_count := v_passed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 8: initialize_organization_solutions' as test_name,
            'PASS' as test_status,
            'Function executed successfully' as test_message,
            jsonb_build_object('success', v_test_result.success, 'message', v_test_result.message) as test_details;
    EXCEPTION WHEN OTHERS THEN
        v_failed_count := v_failed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 8: initialize_organization_solutions' as test_name,
            'FAIL' as test_status,
            'Error: ' || SQLERRM as test_message,
            jsonb_build_object('error_code', SQLSTATE) as test_details;
    END;
    
    -- Test 9: Test RLS helper functions
    v_test_count := v_test_count + 1;
    BEGIN
        -- Test get_user_organization_ids
        SELECT array_length(public.get_user_organization_ids(), 1) INTO v_test_result;
        
        v_passed_count := v_passed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 9: RLS helper functions' as test_name,
            'PASS' as test_status,
            'RLS helper functions executed successfully' as test_message,
            jsonb_build_object('org_ids_count', COALESCE(v_test_result, 0)) as test_details;
    EXCEPTION WHEN OTHERS THEN
        v_failed_count := v_failed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 9: RLS helper functions' as test_name,
            'FAIL' as test_status,
            'Error: ' || SQLERRM as test_message,
            jsonb_build_object('error_code', SQLSTATE) as test_details;
    END;
    
    -- Test 10: Test with real user data (if available)
    v_test_count := v_test_count + 1;
    BEGIN
        -- Try to find a real user
        SELECT auth_user_id INTO v_test_user_id
        FROM core_users
        WHERE email = 'santhoshlal@gmail.com'
        LIMIT 1;
        
        IF v_test_user_id IS NOT NULL THEN
            SELECT COUNT(*) INTO v_test_result
            FROM public.get_user_organizations_with_solutions(v_test_user_id);
            
            v_passed_count := v_passed_count + 1;
            RETURN QUERY
            SELECT 
                'Test 10: Real user data test' as test_name,
                'PASS' as test_status,
                'Real user test executed successfully' as test_message,
                jsonb_build_object('user_id', v_test_user_id, 'organizations_count', v_test_result) as test_details;
        ELSE
            v_passed_count := v_passed_count + 1;
            RETURN QUERY
            SELECT 
                'Test 10: Real user data test' as test_name,
                'SKIP' as test_status,
                'No real user data available for testing' as test_message,
                jsonb_build_object('reason', 'no_real_user_data') as test_details;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_failed_count := v_failed_count + 1;
        RETURN QUERY
        SELECT 
            'Test 10: Real user data test' as test_name,
            'FAIL' as test_status,
            'Error: ' || SQLERRM as test_message,
            jsonb_build_object('error_code', SQLSTATE) as test_details;
    END;
    
    -- Summary
    RETURN QUERY
    SELECT 
        'Test Summary' as test_name,
        CASE 
            WHEN v_failed_count = 0 THEN 'ALL PASS'
            WHEN v_passed_count > v_failed_count THEN 'MOSTLY PASS'
            ELSE 'MOSTLY FAIL'
        END as test_status,
        format('Total: %s, Passed: %s, Failed: %s', v_test_count, v_passed_count, v_failed_count) as test_message,
        jsonb_build_object(
            'total_tests', v_test_count,
            'passed', v_passed_count,
            'failed', v_failed_count,
            'success_rate', round((v_passed_count::decimal / v_test_count::decimal) * 100, 2)
        ) as test_details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create test data for multi-organization testing
CREATE OR REPLACE FUNCTION public.create_test_multi_org_data()
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    test_data JSONB
) AS $$
DECLARE
    v_test_client_id UUID := '11111111-2222-3333-4444-555555555555'::UUID;
    v_test_org_id UUID := '87654321-4321-4321-4321-210987654321'::UUID;
    v_test_user_id UUID := '12345678-1234-1234-1234-123456789012'::UUID;
    v_test_user_org_id UUID := gen_random_uuid();
BEGIN
    -- Create test client
    INSERT INTO core_clients (
        id, client_name, client_code, client_type, is_active
    ) VALUES (
        v_test_client_id, 'Test Multi-Org Client', 'TEST-MULTI', 'test', true
    ) ON CONFLICT (id) DO UPDATE SET
        client_name = EXCLUDED.client_name,
        updated_at = NOW();
    
    -- Create test organization
    INSERT INTO core_organizations (
        id, client_id, name, org_code, industry, country, currency, is_active
    ) VALUES (
        v_test_org_id, v_test_client_id, 'Test Multi-Org Organization', 'TEST-ORG', 'testing', 'US', 'USD', true
    ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = NOW();
    
    -- Create test user
    INSERT INTO core_users (
        id, auth_user_id, email, full_name, role, is_active
    ) VALUES (
        v_test_user_id::text, v_test_user_id, 'test-multi-org@example.com', 'Test Multi-Org User', 'admin', true
    ) ON CONFLICT (auth_user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
    
    -- Create user-organization relationship
    INSERT INTO user_organizations (
        id, user_id, organization_id, role, is_active
    ) VALUES (
        v_test_user_org_id, v_test_user_id, v_test_org_id, 'owner', true
    ) ON CONFLICT (user_id, organization_id) DO UPDATE SET
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    
    RETURN QUERY
    SELECT 
        true as success,
        'Test multi-organization data created successfully' as message,
        jsonb_build_object(
            'client_id', v_test_client_id,
            'organization_id', v_test_org_id,
            'user_id', v_test_user_id,
            'user_org_id', v_test_user_org_id
        ) as test_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up test data
CREATE OR REPLACE FUNCTION public.cleanup_test_multi_org_data()
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_test_client_id UUID := '11111111-2222-3333-4444-555555555555'::UUID;
    v_test_org_id UUID := '87654321-4321-4321-4321-210987654321'::UUID;
    v_test_user_id UUID := '12345678-1234-1234-1234-123456789012'::UUID;
BEGIN
    -- Delete in reverse order due to foreign key constraints
    DELETE FROM core_metadata WHERE organization_id = v_test_org_id;
    DELETE FROM user_organizations WHERE organization_id = v_test_org_id;
    DELETE FROM core_entities WHERE organization_id = v_test_org_id;
    DELETE FROM core_organizations WHERE id = v_test_org_id;
    DELETE FROM core_users WHERE auth_user_id = v_test_user_id;
    DELETE FROM core_clients WHERE id = v_test_client_id;
    
    RETURN QUERY
    SELECT 
        true as success,
        'Test multi-organization data cleaned up successfully' as message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.test_multi_organization_functions TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_test_multi_org_data TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_test_multi_org_data TO authenticated;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Example 1: Create test data
-- SELECT * FROM public.create_test_multi_org_data();

-- Example 2: Run all tests
-- SELECT * FROM public.test_multi_organization_functions();

-- Example 3: Clean up test data
-- SELECT * FROM public.cleanup_test_multi_org_data();

-- Example 4: Test with real user
-- SELECT * FROM public.get_user_organizations_with_solutions(
--     (SELECT auth_user_id FROM core_users WHERE email = 'santhoshlal@gmail.com')
-- );

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'HERA Universal Multi-Organization Test Functions created successfully!';
    RAISE NOTICE 'Test functions available:';
    RAISE NOTICE '  - test_multi_organization_functions(): Run comprehensive test suite';
    RAISE NOTICE '  - create_test_multi_org_data(): Create test data';
    RAISE NOTICE '  - cleanup_test_multi_org_data(): Clean up test data';
    RAISE NOTICE 'Use these functions to validate multi-organization functionality';
END $$;