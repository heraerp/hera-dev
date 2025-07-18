-- ============================================================================
-- Simple Test Function - Minimal version to test the system
-- ============================================================================

-- Create a simple test function first
CREATE OR REPLACE FUNCTION public.test_core_schema_structure()
RETURNS TABLE(
  test_name TEXT,
  test_status TEXT,
  test_message TEXT
) AS $$
BEGIN
  -- Test core_organizations table
  RETURN QUERY
  SELECT 
    'core_organizations_exists'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'core_organizations'
    ) THEN 'PASSED' ELSE 'FAILED' END,
    'Core organizations table check'::TEXT;

  -- Test core_entities table
  RETURN QUERY
  SELECT 
    'core_entities_exists'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'core_entities'
    ) THEN 'PASSED' ELSE 'FAILED' END,
    'Core entities table check'::TEXT;

  -- Test core_dynamic_data table
  RETURN QUERY
  SELECT 
    'core_dynamic_data_exists'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'core_dynamic_data'
    ) THEN 'PASSED' ELSE 'FAILED' END,
    'Core dynamic data table check'::TEXT;

  -- Test core_metadata table
  RETURN QUERY
  SELECT 
    'core_metadata_exists'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'core_metadata'
    ) THEN 'PASSED' ELSE 'FAILED' END,
    'Core metadata table check'::TEXT;

  -- Test core_relationships table
  RETURN QUERY
  SELECT 
    'core_relationships_exists'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'core_relationships'
    ) THEN 'PASSED' ELSE 'FAILED' END,
    'Core relationships table check'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Create a simple run_universal_schema_tests function
CREATE OR REPLACE FUNCTION public.run_universal_schema_tests(
  p_organization_id UUID DEFAULT '11111111-1111-1111-1111-111111111111'::UUID,
  p_executed_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_execution_id UUID := gen_random_uuid();
  v_test_results JSONB := '{"passed": 0, "failed": 0, "total": 0}'::JSONB;
  v_test_record RECORD;
  v_total_tests INTEGER := 0;
  v_passed_tests INTEGER := 0;
  v_failed_tests INTEGER := 0;
BEGIN
  -- Run the simple schema structure test
  FOR v_test_record IN SELECT * FROM test_core_schema_structure()
  LOOP
    v_total_tests := v_total_tests + 1;
    IF v_test_record.test_status = 'PASSED' THEN
      v_passed_tests := v_passed_tests + 1;
    ELSE
      v_failed_tests := v_failed_tests + 1;
    END IF;
  END LOOP;
  
  -- Update test results
  v_test_results := jsonb_build_object(
    'passed', v_passed_tests,
    'failed', v_failed_tests,
    'total', v_total_tests,
    'execution_id', v_execution_id,
    'message', 'Simple schema test completed'
  );
  
  -- Return execution ID
  RETURN v_execution_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.test_core_schema_structure TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_universal_schema_tests TO authenticated;

-- Create test organization if it doesn't exist
INSERT INTO core_organizations (
  id,
  name,
  org_code,
  industry,
  country,
  currency,
  is_active
) VALUES (
  '11111111-1111-1111-1111-111111111111'::UUID,
  'HERA Test Organization',
  'HERA-TEST',
  'testing',
  'US',
  'USD',
  true
)
ON CONFLICT (id) DO NOTHING;