-- ============================================================================
-- HERA Universal Testing Framework - Database Foundation
-- Follows HERA Universal Schema Principles - NO separate testing tables
-- ============================================================================

-- ============================================================================
-- STEP 1: Data Sanity Validation Functions
-- ============================================================================

-- Function to check for entity duplicates before creation
CREATE OR REPLACE FUNCTION public.check_entity_duplicates(
  p_entity_type TEXT,
  p_entity_code TEXT,
  p_organization_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM core_entities 
    WHERE entity_type = p_entity_type 
    AND entity_code = p_entity_code
    AND organization_id = p_organization_id
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- Function to validate entity description consistency
CREATE OR REPLACE FUNCTION public.validate_entity_description(
  p_entity_type TEXT,
  p_entity_name TEXT,
  p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  existing_pattern TEXT;
BEGIN
  -- Get existing naming pattern for this entity type
  SELECT DISTINCT substring(entity_name from '^[^_]+_[^_]+') 
  INTO existing_pattern
  FROM core_entities 
  WHERE entity_type = p_entity_type 
  LIMIT 1;
  
  -- If pattern exists, validate consistency
  IF existing_pattern IS NOT NULL THEN
    RETURN p_entity_name LIKE existing_pattern || '%';
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to validate dynamic data integrity
CREATE OR REPLACE FUNCTION public.validate_dynamic_data_integrity(
  p_entity_id UUID,
  p_field_name TEXT,
  p_field_value TEXT,
  p_field_type TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check entity exists
  IF NOT EXISTS (SELECT 1 FROM core_entities WHERE id = p_entity_id) THEN
    RETURN false;
  END IF;
  
  -- Validate field type consistency
  IF EXISTS (
    SELECT 1 FROM core_dynamic_data 
    WHERE entity_id = p_entity_id 
    AND field_name = p_field_name 
    AND field_type != p_field_type
  ) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup orphaned test data
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_test_data(
  p_days_old INTEGER DEFAULT 7
) RETURNS TABLE(
  deleted_dynamic_data INTEGER,
  deleted_metadata INTEGER,
  deleted_relationships INTEGER
) AS $$
DECLARE
  v_deleted_dynamic INTEGER := 0;
  v_deleted_metadata INTEGER := 0;
  v_deleted_relationships INTEGER := 0;
BEGIN
  -- Delete orphaned dynamic data
  DELETE FROM core_dynamic_data dd
  WHERE NOT EXISTS (
    SELECT 1 FROM core_entities e WHERE e.id = dd.entity_id
  )
  AND dd.created_at < NOW() - INTERVAL '1 day' * p_days_old;
  GET DIAGNOSTICS v_deleted_dynamic = ROW_COUNT;
  
  -- Delete orphaned metadata
  DELETE FROM core_metadata m
  WHERE NOT EXISTS (
    SELECT 1 FROM core_entities e WHERE e.id = m.entity_id
  )
  AND m.created_at < NOW() - INTERVAL '1 day' * p_days_old;
  GET DIAGNOSTICS v_deleted_metadata = ROW_COUNT;
  
  -- Delete orphaned relationships
  DELETE FROM core_relationships r
  WHERE (
    NOT EXISTS (SELECT 1 FROM core_entities e WHERE e.id = r.from_entity_id)
    OR NOT EXISTS (SELECT 1 FROM core_entities e WHERE e.id = r.to_entity_id)
  )
  AND r.created_at < NOW() - INTERVAL '1 day' * p_days_old;
  GET DIAGNOSTICS v_deleted_relationships = ROW_COUNT;
  
  RETURN QUERY SELECT v_deleted_dynamic, v_deleted_metadata, v_deleted_relationships;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 2: Universal Test Entity Creation Functions
-- ============================================================================

-- Function to create test entity with full validation
CREATE OR REPLACE FUNCTION public.create_universal_test_entity(
  p_organization_id UUID,
  p_entity_type TEXT,
  p_entity_name TEXT,
  p_entity_code TEXT,
  p_entity_description TEXT DEFAULT NULL,
  p_parent_entity_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_entity_id UUID;
  v_is_duplicate BOOLEAN;
  v_is_description_valid BOOLEAN;
BEGIN
  -- Check for duplicates
  v_is_duplicate := NOT check_entity_duplicates(p_entity_type, p_entity_code, p_organization_id);
  IF v_is_duplicate THEN
    RAISE EXCEPTION 'Duplicate entity: % already exists', p_entity_code;
  END IF;
  
  -- Validate description consistency
  v_is_description_valid := validate_entity_description(p_entity_type, p_entity_name, p_entity_description);
  IF NOT v_is_description_valid THEN
    RAISE EXCEPTION 'Inconsistent description pattern for entity: %', p_entity_name;
  END IF;
  
  -- Create entity
  INSERT INTO core_entities (
    organization_id,
    entity_type,
    entity_name,
    entity_code,
    entity_description,
    parent_entity_id,
    entity_status,
    is_active
  ) VALUES (
    p_organization_id,
    p_entity_type,
    p_entity_name,
    p_entity_code,
    p_entity_description,
    p_parent_entity_id,
    'active',
    true
  ) RETURNING id INTO v_entity_id;
  
  RETURN v_entity_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add dynamic fields to test entity
CREATE OR REPLACE FUNCTION public.add_test_entity_fields(
  p_entity_id UUID,
  p_fields JSONB
) RETURNS BOOLEAN AS $$
DECLARE
  v_field JSONB;
  v_is_valid BOOLEAN;
BEGIN
  -- Validate and insert each field
  FOR v_field IN SELECT * FROM jsonb_array_elements(p_fields)
  LOOP
    -- Validate data integrity
    v_is_valid := validate_dynamic_data_integrity(
      p_entity_id,
      v_field->>'field_name',
      v_field->>'field_value',
      v_field->>'field_type'
    );
    
    IF NOT v_is_valid THEN
      RAISE EXCEPTION 'Invalid dynamic data for field: %', v_field->>'field_name';
    END IF;
    
    -- Insert or update field
    INSERT INTO core_dynamic_data (
      entity_id,
      field_name,
      field_value,
      field_type,
      is_encrypted
    ) VALUES (
      p_entity_id,
      v_field->>'field_name',
      v_field->>'field_value',
      v_field->>'field_type',
      COALESCE((v_field->>'is_encrypted')::BOOLEAN, false)
    )
    ON CONFLICT (entity_id, field_name) 
    DO UPDATE SET 
      field_value = EXCLUDED.field_value,
      field_type = EXCLUDED.field_type,
      updated_at = NOW();
  END LOOP;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 3: Test Suite Management Functions
-- ============================================================================

-- Function to create test suite
CREATE OR REPLACE FUNCTION public.create_test_suite(
  p_organization_id UUID,
  p_suite_name TEXT,
  p_suite_type TEXT,
  p_suite_config JSONB DEFAULT '{}'::JSONB
) RETURNS UUID AS $$
DECLARE
  v_suite_id UUID;
  v_suite_code TEXT;
BEGIN
  -- Generate unique suite code
  v_suite_code := 'TEST-SUITE-' || UPPER(p_suite_type) || '-' || 
                  SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6);
  
  -- Create test suite entity
  v_suite_id := create_universal_test_entity(
    p_organization_id,
    'test_suite',
    'test_suite_' || LOWER(p_suite_type) || '_' || p_suite_name,
    v_suite_code,
    p_suite_type || ' test suite for ' || p_suite_name
  );
  
  -- Add suite configuration fields
  PERFORM add_test_entity_fields(v_suite_id, jsonb_build_array(
    jsonb_build_object('field_name', 'suite_type', 'field_value', p_suite_type, 'field_type', 'text'),
    jsonb_build_object('field_name', 'suite_status', 'field_value', 'active', 'field_type', 'text'),
    jsonb_build_object('field_name', 'configuration', 'field_value', p_suite_config::TEXT, 'field_type', 'json')
  ));
  
  RETURN v_suite_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create test case
CREATE OR REPLACE FUNCTION public.create_test_case(
  p_organization_id UUID,
  p_suite_id UUID,
  p_test_name TEXT,
  p_test_type TEXT,
  p_test_config JSONB DEFAULT '{}'::JSONB
) RETURNS UUID AS $$
DECLARE
  v_test_id UUID;
  v_test_code TEXT;
BEGIN
  -- Generate unique test code
  v_test_code := 'TEST-CASE-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
  
  -- Create test case entity
  v_test_id := create_universal_test_entity(
    p_organization_id,
    'test_case',
    'test_case_' || LOWER(p_test_type) || '_' || p_test_name,
    v_test_code,
    p_test_type || ' test case: ' || p_test_name,
    p_suite_id
  );
  
  -- Add test case fields
  PERFORM add_test_entity_fields(v_test_id, jsonb_build_array(
    jsonb_build_object('field_name', 'test_type', 'field_value', p_test_type, 'field_type', 'text'),
    jsonb_build_object('field_name', 'test_status', 'field_value', 'active', 'field_type', 'text'),
    jsonb_build_object('field_name', 'configuration', 'field_value', p_test_config::TEXT, 'field_type', 'json')
  ));
  
  -- Create relationship to suite
  INSERT INTO core_relationships (
    organization_id,
    from_entity_id,
    to_entity_id,
    relationship_type,
    relationship_name
  ) VALUES (
    p_organization_id,
    p_suite_id,
    v_test_id,
    'contains',
    'test_suite_contains_test'
  );
  
  RETURN v_test_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 4: Test Execution Functions
-- ============================================================================

-- Function to create test execution
CREATE OR REPLACE FUNCTION public.create_test_execution(
  p_organization_id UUID,
  p_suite_id UUID,
  p_execution_type TEXT,
  p_executed_by UUID
) RETURNS UUID AS $$
DECLARE
  v_execution_id UUID;
  v_execution_code TEXT;
BEGIN
  -- Generate unique execution code
  v_execution_code := 'TEST-EXEC-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS');
  
  -- Create test execution entity
  v_execution_id := create_universal_test_entity(
    p_organization_id,
    'test_execution',
    'test_execution_' || p_execution_type || '_' || TO_CHAR(NOW(), 'YYYYMMDD'),
    v_execution_code,
    'Test execution for ' || p_execution_type
  );
  
  -- Add execution fields
  PERFORM add_test_entity_fields(v_execution_id, jsonb_build_array(
    jsonb_build_object('field_name', 'suite_id', 'field_value', p_suite_id::TEXT, 'field_type', 'uuid'),
    jsonb_build_object('field_name', 'execution_type', 'field_value', p_execution_type, 'field_type', 'text'),
    jsonb_build_object('field_name', 'executed_by', 'field_value', p_executed_by::TEXT, 'field_type', 'uuid'),
    jsonb_build_object('field_name', 'execution_status', 'field_value', 'running', 'field_type', 'text'),
    jsonb_build_object('field_name', 'start_time', 'field_value', NOW()::TEXT, 'field_type', 'timestamp')
  ));
  
  -- Create relationship to suite
  INSERT INTO core_relationships (
    organization_id,
    from_entity_id,
    to_entity_id,
    relationship_type,
    relationship_name
  ) VALUES (
    p_organization_id,
    p_suite_id,
    v_execution_id,
    'executed',
    'test_suite_executed'
  );
  
  RETURN v_execution_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update test execution result
CREATE OR REPLACE FUNCTION public.update_test_execution_result(
  p_execution_id UUID,
  p_status TEXT,
  p_results JSONB
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update execution status and results
  PERFORM add_test_entity_fields(p_execution_id, jsonb_build_array(
    jsonb_build_object('field_name', 'execution_status', 'field_value', p_status, 'field_type', 'text'),
    jsonb_build_object('field_name', 'end_time', 'field_value', NOW()::TEXT, 'field_type', 'timestamp'),
    jsonb_build_object('field_name', 'test_results', 'field_value', p_results::TEXT, 'field_type', 'json')
  ));
  
  -- Add individual result fields
  PERFORM add_test_entity_fields(p_execution_id, jsonb_build_array(
    jsonb_build_object('field_name', 'tests_passed', 'field_value', (p_results->>'passed')::TEXT, 'field_type', 'number'),
    jsonb_build_object('field_name', 'tests_failed', 'field_value', (p_results->>'failed')::TEXT, 'field_type', 'number'),
    jsonb_build_object('field_name', 'tests_skipped', 'field_value', (p_results->>'skipped')::TEXT, 'field_type', 'number'),
    jsonb_build_object('field_name', 'execution_time_ms', 'field_value', (p_results->>'duration')::TEXT, 'field_type', 'number')
  ));
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 5: UAT Session Management
-- ============================================================================

-- Function to create UAT session
CREATE OR REPLACE FUNCTION public.create_uat_session(
  p_organization_id UUID,
  p_session_name TEXT,
  p_test_suite_id UUID,
  p_created_by UUID
) RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_session_code TEXT;
BEGIN
  -- Generate unique session code
  v_session_code := 'UAT-SESSION-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS');
  
  -- Create UAT session entity
  v_session_id := create_universal_test_entity(
    p_organization_id,
    'uat_session',
    'uat_session_' || REPLACE(LOWER(p_session_name), ' ', '_'),
    v_session_code,
    'UAT session for ' || p_session_name
  );
  
  -- Add session fields
  PERFORM add_test_entity_fields(v_session_id, jsonb_build_array(
    jsonb_build_object('field_name', 'test_suite_id', 'field_value', p_test_suite_id::TEXT, 'field_type', 'uuid'),
    jsonb_build_object('field_name', 'created_by', 'field_value', p_created_by::TEXT, 'field_type', 'uuid'),
    jsonb_build_object('field_name', 'session_status', 'field_value', 'active', 'field_type', 'text'),
    jsonb_build_object('field_name', 'start_time', 'field_value', NOW()::TEXT, 'field_type', 'timestamp')
  ));
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 6: Test Analytics Functions
-- ============================================================================

-- Function to get test execution analytics
CREATE OR REPLACE FUNCTION public.get_test_analytics(
  p_organization_id UUID,
  p_date_from DATE DEFAULT NULL,
  p_date_to DATE DEFAULT NULL
) RETURNS TABLE(
  total_executions BIGINT,
  total_passed BIGINT,
  total_failed BIGINT,
  average_duration NUMERIC,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT e.id) as total_executions,
    SUM((dd_passed.field_value)::BIGINT) as total_passed,
    SUM((dd_failed.field_value)::BIGINT) as total_failed,
    AVG((dd_duration.field_value)::NUMERIC) as average_duration,
    CASE 
      WHEN SUM((dd_passed.field_value)::BIGINT + (dd_failed.field_value)::BIGINT) > 0
      THEN (SUM((dd_passed.field_value)::BIGINT)::NUMERIC / 
            SUM((dd_passed.field_value)::BIGINT + (dd_failed.field_value)::BIGINT)::NUMERIC) * 100
      ELSE 0
    END as success_rate
  FROM core_entities e
  LEFT JOIN core_dynamic_data dd_passed ON e.id = dd_passed.entity_id AND dd_passed.field_name = 'tests_passed'
  LEFT JOIN core_dynamic_data dd_failed ON e.id = dd_failed.entity_id AND dd_failed.field_name = 'tests_failed'
  LEFT JOIN core_dynamic_data dd_duration ON e.id = dd_duration.entity_id AND dd_duration.field_name = 'execution_time_ms'
  WHERE e.organization_id = p_organization_id
  AND e.entity_type = 'test_execution'
  AND e.is_active = true
  AND (p_date_from IS NULL OR e.created_at >= p_date_from)
  AND (p_date_to IS NULL OR e.created_at <= p_date_to);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 7: Grant Permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.check_entity_duplicates TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_entity_description TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_dynamic_data_integrity TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_orphaned_test_data TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_universal_test_entity TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_test_entity_fields TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_test_suite TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_test_case TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_test_execution TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_test_execution_result TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_uat_session TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_test_analytics TO authenticated;

-- ============================================================================
-- STEP 8: Create Test Organization
-- ============================================================================

-- Create test organization for framework testing
DO $$
DECLARE
  v_test_org_id UUID := '11111111-1111-1111-1111-111111111111'::UUID;
BEGIN
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
    v_test_org_id,
    'HERA Test Organization',
    'HERA-TEST',
    'testing',
    'US',
    'USD',
    true
  )
  ON CONFLICT (id) DO NOTHING;
END $$;