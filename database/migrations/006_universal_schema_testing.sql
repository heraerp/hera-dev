-- ============================================================================
-- HERA Universal Schema Database Testing Implementation
-- Step 2: Comprehensive Database Testing Following Universal Principles
-- ============================================================================

-- ============================================================================
-- PART 1: Schema Validation Testing
-- ============================================================================

-- Function to validate all core tables exist and have correct structure
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

  -- Test core_entities table and columns
  RETURN QUERY
  SELECT 
    'core_entities_structure'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'core_entities'
      AND column_name IN ('id', 'organization_id', 'entity_type', 'entity_name', 'entity_code')
    ) THEN 'PASSED' ELSE 'FAILED' END,
    'Core entities table structure check'::TEXT;

  -- Test core_dynamic_data table
  RETURN QUERY
  SELECT 
    'core_dynamic_data_structure'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'core_dynamic_data'
      AND column_name IN ('entity_id', 'field_name', 'field_value', 'field_type')
    ) THEN 'PASSED' ELSE 'FAILED' END,
    'Core dynamic data table structure check'::TEXT;

  -- Test core_metadata table
  RETURN QUERY
  SELECT 
    'core_metadata_structure'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'core_metadata'
      AND column_name IN ('entity_id', 'metadata_key', 'metadata_value', 'metadata_type')
    ) THEN 'PASSED' ELSE 'FAILED' END,
    'Core metadata table structure check'::TEXT;

  -- Test core_relationships table
  RETURN QUERY
  SELECT 
    'core_relationships_structure'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'core_relationships'
      AND column_name IN ('from_entity_id', 'to_entity_id', 'relationship_type')
    ) THEN 'PASSED' ELSE 'FAILED' END,
    'Core relationships table structure check'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 2: Constraint Validation Testing
-- ============================================================================

-- Function to test all foreign key constraints
CREATE OR REPLACE FUNCTION public.test_foreign_key_constraints()
RETURNS TABLE(
  test_name TEXT,
  test_status TEXT,
  test_message TEXT
) AS $$
DECLARE
  v_constraint RECORD;
  v_violation_count INTEGER;
BEGIN
  -- Test core_entities.organization_id FK
  SELECT COUNT(*) INTO v_violation_count
  FROM core_entities e
  WHERE NOT EXISTS (
    SELECT 1 FROM core_organizations o WHERE o.id = e.organization_id
  );
  
  RETURN QUERY
  SELECT 
    'core_entities_organization_fk'::TEXT,
    CASE WHEN v_violation_count = 0 THEN 'PASSED' ELSE 'FAILED' END,
    FORMAT('Organization FK violations: %s', v_violation_count)::TEXT;

  -- Test core_dynamic_data.entity_id FK
  SELECT COUNT(*) INTO v_violation_count
  FROM core_dynamic_data dd
  WHERE NOT EXISTS (
    SELECT 1 FROM core_entities e WHERE e.id = dd.entity_id
  );
  
  RETURN QUERY
  SELECT 
    'core_dynamic_data_entity_fk'::TEXT,
    CASE WHEN v_violation_count = 0 THEN 'PASSED' ELSE 'FAILED' END,
    FORMAT('Dynamic data FK violations: %s', v_violation_count)::TEXT;

  -- Test core_relationships FKs
  SELECT COUNT(*) INTO v_violation_count
  FROM core_relationships r
  WHERE NOT EXISTS (
    SELECT 1 FROM core_entities e WHERE e.id = r.from_entity_id
  ) OR NOT EXISTS (
    SELECT 1 FROM core_entities e WHERE e.id = r.to_entity_id
  );
  
  RETURN QUERY
  SELECT 
    'core_relationships_entity_fks'::TEXT,
    CASE WHEN v_violation_count = 0 THEN 'PASSED' ELSE 'FAILED' END,
    FORMAT('Relationships FK violations: %s', v_violation_count)::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 3: Business Logic Testing
-- ============================================================================

-- Function to test entity lifecycle operations
CREATE OR REPLACE FUNCTION public.test_entity_lifecycle()
RETURNS TABLE(
  test_name TEXT,
  test_status TEXT,
  test_message TEXT
) AS $$
DECLARE
  v_test_org_id UUID := '11111111-1111-1111-1111-111111111111'::UUID;
  v_entity_id UUID;
  v_test_passed BOOLEAN;
BEGIN
  -- Test entity creation
  BEGIN
    v_entity_id := create_universal_test_entity(
      v_test_org_id,
      'test_entity',
      'test_entity_lifecycle_' || TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS'),
      'TEST-LIFECYCLE-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6),
      'Test entity for lifecycle testing'
    );
    
    v_test_passed := v_entity_id IS NOT NULL;
    
    RETURN QUERY
    SELECT 
      'entity_creation'::TEXT,
      CASE WHEN v_test_passed THEN 'PASSED' ELSE 'FAILED' END,
      'Entity creation test'::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY
    SELECT 
      'entity_creation'::TEXT,
      'FAILED'::TEXT,
      FORMAT('Entity creation failed: %s', SQLERRM)::TEXT;
  END;

  -- Test adding dynamic fields
  BEGIN
    IF v_entity_id IS NOT NULL THEN
      v_test_passed := add_test_entity_fields(
        v_entity_id,
        jsonb_build_array(
          jsonb_build_object('field_name', 'test_field_1', 'field_value', 'test_value_1', 'field_type', 'text'),
          jsonb_build_object('field_name', 'test_field_2', 'field_value', '123', 'field_type', 'number')
        )
      );
      
      RETURN QUERY
      SELECT 
        'dynamic_fields_addition'::TEXT,
        CASE WHEN v_test_passed THEN 'PASSED' ELSE 'FAILED' END,
        'Dynamic fields addition test'::TEXT;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY
    SELECT 
      'dynamic_fields_addition'::TEXT,
      'FAILED'::TEXT,
      FORMAT('Dynamic fields addition failed: %s', SQLERRM)::TEXT;
  END;

  -- Test entity deactivation
  BEGIN
    IF v_entity_id IS NOT NULL THEN
      UPDATE core_entities 
      SET is_active = false, entity_status = 'inactive'
      WHERE id = v_entity_id;
      
      v_test_passed := EXISTS (
        SELECT 1 FROM core_entities 
        WHERE id = v_entity_id AND is_active = false
      );
      
      RETURN QUERY
      SELECT 
        'entity_deactivation'::TEXT,
        CASE WHEN v_test_passed THEN 'PASSED' ELSE 'FAILED' END,
        'Entity deactivation test'::TEXT;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY
    SELECT 
      'entity_deactivation'::TEXT,
      'FAILED'::TEXT,
      FORMAT('Entity deactivation failed: %s', SQLERRM)::TEXT;
  END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 4: Performance Testing
-- ============================================================================

-- Function to test query performance
CREATE OR REPLACE FUNCTION public.test_query_performance()
RETURNS TABLE(
  test_name TEXT,
  execution_time_ms NUMERIC,
  row_count BIGINT,
  performance_status TEXT
) AS $$
DECLARE
  v_start_time TIMESTAMP;
  v_end_time TIMESTAMP;
  v_row_count BIGINT;
  v_execution_ms NUMERIC;
BEGIN
  -- Test 1: Entity lookup by code
  v_start_time := clock_timestamp();
  
  SELECT COUNT(*) INTO v_row_count
  FROM core_entities
  WHERE entity_code LIKE 'TEST-%'
  AND is_active = true;
  
  v_end_time := clock_timestamp();
  v_execution_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;
  
  RETURN QUERY
  SELECT 
    'entity_lookup_by_code'::TEXT,
    v_execution_ms,
    v_row_count,
    CASE WHEN v_execution_ms < 100 THEN 'GOOD' 
         WHEN v_execution_ms < 500 THEN 'ACCEPTABLE'
         ELSE 'SLOW' END::TEXT;

  -- Test 2: Dynamic data retrieval
  v_start_time := clock_timestamp();
  
  SELECT COUNT(*) INTO v_row_count
  FROM core_entities e
  JOIN core_dynamic_data dd ON e.id = dd.entity_id
  WHERE e.entity_type = 'test_case'
  AND dd.field_name = 'test_status';
  
  v_end_time := clock_timestamp();
  v_execution_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;
  
  RETURN QUERY
  SELECT 
    'dynamic_data_join'::TEXT,
    v_execution_ms,
    v_row_count,
    CASE WHEN v_execution_ms < 200 THEN 'GOOD' 
         WHEN v_execution_ms < 1000 THEN 'ACCEPTABLE'
         ELSE 'SLOW' END::TEXT;

  -- Test 3: Relationship traversal
  v_start_time := clock_timestamp();
  
  SELECT COUNT(*) INTO v_row_count
  FROM core_relationships r
  JOIN core_entities e1 ON r.from_entity_id = e1.id
  JOIN core_entities e2 ON r.to_entity_id = e2.id
  WHERE r.relationship_type = 'contains';
  
  v_end_time := clock_timestamp();
  v_execution_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;
  
  RETURN QUERY
  SELECT 
    'relationship_traversal'::TEXT,
    v_execution_ms,
    v_row_count,
    CASE WHEN v_execution_ms < 300 THEN 'GOOD' 
         WHEN v_execution_ms < 1500 THEN 'ACCEPTABLE'
         ELSE 'SLOW' END::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 5: Data Integrity Testing
-- ============================================================================

-- Function to test data integrity rules
CREATE OR REPLACE FUNCTION public.test_data_integrity()
RETURNS TABLE(
  test_name TEXT,
  test_status TEXT,
  test_message TEXT,
  violation_count INTEGER
) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Test 1: Check for duplicate entity codes within organization
  SELECT COUNT(*) INTO v_count
  FROM (
    SELECT organization_id, entity_type, entity_code, COUNT(*) as cnt
    FROM core_entities
    WHERE is_active = true
    GROUP BY organization_id, entity_type, entity_code
    HAVING COUNT(*) > 1
  ) duplicates;
  
  RETURN QUERY
  SELECT 
    'duplicate_entity_codes'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASSED' ELSE 'FAILED' END,
    'Check for duplicate entity codes'::TEXT,
    v_count;

  -- Test 2: Check for orphaned dynamic data
  SELECT COUNT(*) INTO v_count
  FROM core_dynamic_data dd
  WHERE NOT EXISTS (
    SELECT 1 FROM core_entities e WHERE e.id = dd.entity_id
  );
  
  RETURN QUERY
  SELECT 
    'orphaned_dynamic_data'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASSED' ELSE 'FAILED' END,
    'Check for orphaned dynamic data'::TEXT,
    v_count;

  -- Test 3: Check for invalid field types
  SELECT COUNT(*) INTO v_count
  FROM core_dynamic_data
  WHERE field_type NOT IN ('text', 'number', 'boolean', 'date', 'json', 'uuid', 'timestamp');
  
  RETURN QUERY
  SELECT 
    'invalid_field_types'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASSED' ELSE 'FAILED' END,
    'Check for invalid field types'::TEXT,
    v_count;

  -- Test 4: Check for circular relationships
  WITH RECURSIVE relationship_chain AS (
    SELECT from_entity_id, to_entity_id, ARRAY[from_entity_id] as path
    FROM core_relationships
    UNION ALL
    SELECT r.from_entity_id, r.to_entity_id, rc.path || r.from_entity_id
    FROM core_relationships r
    JOIN relationship_chain rc ON r.from_entity_id = rc.to_entity_id
    WHERE NOT r.from_entity_id = ANY(rc.path)
  )
  SELECT COUNT(*) INTO v_count
  FROM relationship_chain
  WHERE from_entity_id = to_entity_id;
  
  RETURN QUERY
  SELECT 
    'circular_relationships'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASSED' ELSE 'WARNING' END,
    'Check for circular relationships'::TEXT,
    v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 6: Test Execution Orchestration
-- ============================================================================

-- Function to run all tests and create execution record
CREATE OR REPLACE FUNCTION public.run_universal_schema_tests(
  p_organization_id UUID DEFAULT '11111111-1111-1111-1111-111111111111'::UUID,
  p_executed_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_suite_id UUID;
  v_execution_id UUID;
  v_test_results JSONB := '{"passed": 0, "failed": 0, "warnings": 0}'::JSONB;
  v_test_details JSONB := '[]'::JSONB;
  v_test_record RECORD;
  v_total_tests INTEGER := 0;
  v_passed_tests INTEGER := 0;
  v_failed_tests INTEGER := 0;
  v_start_time TIMESTAMP := NOW();
BEGIN
  -- Create test suite if it doesn't exist
  SELECT id INTO v_suite_id
  FROM core_entities
  WHERE entity_type = 'test_suite'
  AND entity_code = 'UNIVERSAL-SCHEMA-TESTS'
  AND organization_id = p_organization_id;
  
  IF v_suite_id IS NULL THEN
    v_suite_id := create_test_suite(
      p_organization_id,
      'Universal Schema Tests',
      'database_validation',
      jsonb_build_object(
        'test_categories', ARRAY['schema', 'constraints', 'business_logic', 'performance', 'integrity'],
        'auto_cleanup', true
      )
    );
  END IF;
  
  -- Create test execution
  v_execution_id := create_test_execution(
    p_organization_id,
    v_suite_id,
    'automated_test_run',
    COALESCE(p_executed_by, '00000000-0000-0000-0000-000000000000'::UUID)
  );
  
  -- Run schema structure tests
  FOR v_test_record IN SELECT * FROM test_core_schema_structure()
  LOOP
    v_total_tests := v_total_tests + 1;
    IF v_test_record.test_status = 'PASSED' THEN
      v_passed_tests := v_passed_tests + 1;
    ELSE
      v_failed_tests := v_failed_tests + 1;
    END IF;
    
    v_test_details := v_test_details || jsonb_build_object(
      'test_name', v_test_record.test_name,
      'test_status', v_test_record.test_status,
      'test_message', v_test_record.test_message,
      'test_category', 'schema_structure'
    );
  END LOOP;
  
  -- Run constraint tests
  FOR v_test_record IN SELECT * FROM test_foreign_key_constraints()
  LOOP
    v_total_tests := v_total_tests + 1;
    IF v_test_record.test_status = 'PASSED' THEN
      v_passed_tests := v_passed_tests + 1;
    ELSE
      v_failed_tests := v_failed_tests + 1;
    END IF;
    
    v_test_details := v_test_details || jsonb_build_object(
      'test_name', v_test_record.test_name,
      'test_status', v_test_record.test_status,
      'test_message', v_test_record.test_message,
      'test_category', 'constraints'
    );
  END LOOP;
  
  -- Run business logic tests
  FOR v_test_record IN SELECT * FROM test_entity_lifecycle()
  LOOP
    v_total_tests := v_total_tests + 1;
    IF v_test_record.test_status = 'PASSED' THEN
      v_passed_tests := v_passed_tests + 1;
    ELSE
      v_failed_tests := v_failed_tests + 1;
    END IF;
    
    v_test_details := v_test_details || jsonb_build_object(
      'test_name', v_test_record.test_name,
      'test_status', v_test_record.test_status,
      'test_message', v_test_record.test_message,
      'test_category', 'business_logic'
    );
  END LOOP;
  
  -- Run data integrity tests
  FOR v_test_record IN SELECT * FROM test_data_integrity()
  LOOP
    v_total_tests := v_total_tests + 1;
    IF v_test_record.test_status = 'PASSED' THEN
      v_passed_tests := v_passed_tests + 1;
    ELSIF v_test_record.test_status = 'WARNING' THEN
      -- Count warnings separately if needed
      v_passed_tests := v_passed_tests + 1;
    ELSE
      v_failed_tests := v_failed_tests + 1;
    END IF;
    
    v_test_details := v_test_details || jsonb_build_object(
      'test_name', v_test_record.test_name,
      'test_status', v_test_record.test_status,
      'test_message', v_test_record.test_message,
      'test_category', 'data_integrity',
      'violation_count', v_test_record.violation_count
    );
  END LOOP;
  
  -- Update test results
  v_test_results := jsonb_build_object(
    'passed', v_passed_tests,
    'failed', v_failed_tests,
    'total', v_total_tests,
    'duration', EXTRACT(EPOCH FROM (NOW() - v_start_time)) * 1000,
    'test_details', v_test_details
  );
  
  -- Update execution with results
  PERFORM update_test_execution_result(
    v_execution_id,
    CASE WHEN v_failed_tests = 0 THEN 'passed' ELSE 'failed' END,
    v_test_results
  );
  
  RETURN v_execution_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 7: Test Result Reporting
-- ============================================================================

-- Function to get detailed test results
CREATE OR REPLACE FUNCTION public.get_test_execution_report(
  p_execution_id UUID
)
RETURNS TABLE(
  execution_id UUID,
  suite_name TEXT,
  execution_status TEXT,
  total_tests INTEGER,
  passed_tests INTEGER,
  failed_tests INTEGER,
  execution_time_ms NUMERIC,
  test_details JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as execution_id,
    s.entity_name as suite_name,
    MAX(CASE WHEN dd.field_name = 'execution_status' THEN dd.field_value END) as execution_status,
    (MAX(CASE WHEN dd.field_name = 'test_results' THEN dd.field_value END)::JSONB->>'total')::INTEGER as total_tests,
    (MAX(CASE WHEN dd.field_name = 'test_results' THEN dd.field_value END)::JSONB->>'passed')::INTEGER as passed_tests,
    (MAX(CASE WHEN dd.field_name = 'test_results' THEN dd.field_value END)::JSONB->>'failed')::INTEGER as failed_tests,
    (MAX(CASE WHEN dd.field_name = 'test_results' THEN dd.field_value END)::JSONB->>'duration')::NUMERIC as execution_time_ms,
    MAX(CASE WHEN dd.field_name = 'test_results' THEN dd.field_value END)::JSONB->'test_details' as test_details
  FROM core_entities e
  JOIN core_dynamic_data dd ON e.id = dd.entity_id
  JOIN core_relationships r ON e.id = r.to_entity_id
  JOIN core_entities s ON r.from_entity_id = s.id
  WHERE e.id = p_execution_id
  AND e.entity_type = 'test_execution'
  GROUP BY e.id, s.entity_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 8: Grant Permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.test_core_schema_structure TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_foreign_key_constraints TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_entity_lifecycle TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_query_performance TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_data_integrity TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_universal_schema_tests TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_test_execution_report TO authenticated;

-- ============================================================================
-- PART 9: Create Initial Test Data
-- ============================================================================

-- Create sample test cases for the testing framework
DO $$
DECLARE
  v_test_org_id UUID := '11111111-1111-1111-1111-111111111111'::UUID;
  v_suite_id UUID;
  v_test_id UUID;
BEGIN
  -- Create validation test suite
  v_suite_id := create_test_suite(
    v_test_org_id,
    'Schema Validation Suite',
    'validation',
    jsonb_build_object('auto_run', true, 'frequency', 'daily')
  );
  
  -- Create test cases
  v_test_id := create_test_case(
    v_test_org_id,
    v_suite_id,
    'Validate Core Tables',
    'schema_validation',
    jsonb_build_object('tables', ARRAY['core_entities', 'core_dynamic_data', 'core_metadata'])
  );
  
  v_test_id := create_test_case(
    v_test_org_id,
    v_suite_id,
    'Validate Constraints',
    'constraint_validation',
    jsonb_build_object('constraint_types', ARRAY['foreign_key', 'unique', 'check'])
  );
  
  v_test_id := create_test_case(
    v_test_org_id,
    v_suite_id,
    'Validate Business Logic',
    'business_logic_validation',
    jsonb_build_object('test_scenarios', ARRAY['entity_lifecycle', 'data_consistency'])
  );
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Run the tests and show results
DO $$
DECLARE
  v_execution_id UUID;
  v_report RECORD;
BEGIN
  -- Run all tests
  v_execution_id := run_universal_schema_tests();
  
  -- Get report
  SELECT * INTO v_report FROM get_test_execution_report(v_execution_id);
  
  -- Display summary
  RAISE NOTICE 'Test Execution Summary:';
  RAISE NOTICE '- Total Tests: %', v_report.total_tests;
  RAISE NOTICE '- Passed: %', v_report.passed_tests;
  RAISE NOTICE '- Failed: %', v_report.failed_tests;
  RAISE NOTICE '- Execution Time: % ms', v_report.execution_time_ms;
END $$;