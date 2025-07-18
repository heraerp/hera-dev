-- ============================================================================
-- HERA Universal Testing Framework - Complete Implementation
-- Following Universal Schema Principles - NO separate testing tables
-- ============================================================================

-- ============================================================================
-- STEP 1: Enhanced Data Validation Functions
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

-- ============================================================================
-- STEP 2: Enhanced Schema Testing Functions
-- ============================================================================

-- Enhanced schema structure testing
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
    'Core organizations table exists'::TEXT;

  -- Test core_entities table and required columns
  RETURN QUERY
  SELECT 
    'core_entities_structure'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'core_entities'
      AND column_name IN ('id', 'organization_id', 'entity_type', 'entity_name', 'entity_code')
    ) THEN 'PASSED' ELSE 'FAILED' END,
    'Core entities table has required columns'::TEXT;

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
    'Core dynamic data table has required columns'::TEXT;

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
    'Core metadata table has required columns'::TEXT;

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
    'Core relationships table has required columns'::TEXT;

  -- Test core_users table
  RETURN QUERY
  SELECT 
    'core_users_structure'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'core_users'
      AND column_name IN ('id', 'auth_user_id', 'email', 'role')
    ) THEN 'PASSED' ELSE 'FAILED' END,
    'Core users table has required columns'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 3: Foreign Key Constraint Testing
-- ============================================================================

CREATE OR REPLACE FUNCTION public.test_foreign_key_constraints()
RETURNS TABLE(
  test_name TEXT,
  test_status TEXT,
  test_message TEXT
) AS $$
DECLARE
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

  -- Test core_metadata.entity_id FK
  SELECT COUNT(*) INTO v_violation_count
  FROM core_metadata m
  WHERE m.entity_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM core_entities e WHERE e.id = m.entity_id
  );
  
  RETURN QUERY
  SELECT 
    'core_metadata_entity_fk'::TEXT,
    CASE WHEN v_violation_count = 0 THEN 'PASSED' ELSE 'FAILED' END,
    FORMAT('Metadata FK violations: %s', v_violation_count)::TEXT;

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
-- STEP 4: Business Logic Testing
-- ============================================================================

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
  v_test_code TEXT;
BEGIN
  -- Generate unique test code
  v_test_code := 'TEST-LIFECYCLE-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
  
  -- Test entity creation
  BEGIN
    INSERT INTO core_entities (
      organization_id,
      entity_type,
      entity_name,
      entity_code,
      entity_description,
      entity_status,
      is_active
    ) VALUES (
      v_test_org_id,
      'test_entity',
      'test_entity_lifecycle_' || TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS'),
      v_test_code,
      'Test entity for lifecycle testing',
      'active',
      true
    ) RETURNING id INTO v_entity_id;
    
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
      INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type)
      VALUES 
        (v_entity_id, 'test_field_1', 'test_value_1', 'text'),
        (v_entity_id, 'test_field_2', '123', 'number'),
        (v_entity_id, 'test_field_3', 'true', 'boolean');
      
      -- Check if fields were inserted
      SELECT COUNT(*) = 3 INTO v_test_passed
      FROM core_dynamic_data
      WHERE entity_id = v_entity_id;
      
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

  -- Test cleanup
  BEGIN
    IF v_entity_id IS NOT NULL THEN
      DELETE FROM core_dynamic_data WHERE entity_id = v_entity_id;
      DELETE FROM core_entities WHERE id = v_entity_id;
      
      v_test_passed := NOT EXISTS (
        SELECT 1 FROM core_entities WHERE id = v_entity_id
      );
      
      RETURN QUERY
      SELECT 
        'entity_cleanup'::TEXT,
        CASE WHEN v_test_passed THEN 'PASSED' ELSE 'FAILED' END,
        'Entity cleanup test'::TEXT;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY
    SELECT 
      'entity_cleanup'::TEXT,
      'FAILED'::TEXT,
      FORMAT('Entity cleanup failed: %s', SQLERRM)::TEXT;
  END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 5: Performance Testing
-- ============================================================================

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
  WHERE e.entity_type = 'test_entity'
  AND dd.field_name = 'test_field_1';
  
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

  -- Test 4: Organization data access
  v_start_time := clock_timestamp();
  
  SELECT COUNT(*) INTO v_row_count
  FROM core_organizations
  WHERE is_active = true;
  
  v_end_time := clock_timestamp();
  v_execution_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;
  
  RETURN QUERY
  SELECT 
    'organization_lookup'::TEXT,
    v_execution_ms,
    v_row_count,
    CASE WHEN v_execution_ms < 50 THEN 'GOOD' 
         WHEN v_execution_ms < 200 THEN 'ACCEPTABLE'
         ELSE 'SLOW' END::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 6: Data Integrity Testing
-- ============================================================================

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
    'Check for duplicate entity codes within organization'::TEXT,
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
    'Check for orphaned dynamic data records'::TEXT,
    v_count;

  -- Test 3: Check for orphaned metadata
  SELECT COUNT(*) INTO v_count
  FROM core_metadata m
  WHERE m.entity_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM core_entities e WHERE e.id = m.entity_id
  );
  
  RETURN QUERY
  SELECT 
    'orphaned_metadata'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASSED' ELSE 'FAILED' END,
    'Check for orphaned metadata records'::TEXT,
    v_count;

  -- Test 4: Check for invalid field types
  SELECT COUNT(*) INTO v_count
  FROM core_dynamic_data
  WHERE field_type NOT IN ('text', 'number', 'boolean', 'date', 'json', 'uuid', 'timestamp');
  
  RETURN QUERY
  SELECT 
    'invalid_field_types'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASSED' ELSE 'FAILED' END,
    'Check for invalid field types in dynamic data'::TEXT,
    v_count;

  -- Test 5: Check for empty entity codes
  SELECT COUNT(*) INTO v_count
  FROM core_entities
  WHERE entity_code IS NULL OR entity_code = '' OR LENGTH(entity_code) < 3;
  
  RETURN QUERY
  SELECT 
    'empty_entity_codes'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASSED' ELSE 'FAILED' END,
    'Check for empty or invalid entity codes'::TEXT,
    v_count;

  -- Test 6: Check for missing entity names
  SELECT COUNT(*) INTO v_count
  FROM core_entities
  WHERE entity_name IS NULL OR entity_name = '';
  
  RETURN QUERY
  SELECT 
    'missing_entity_names'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASSED' ELSE 'FAILED' END,
    'Check for missing entity names'::TEXT,
    v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 7: Universal Schema Compliance Testing
-- ============================================================================

CREATE OR REPLACE FUNCTION public.test_universal_schema_compliance()
RETURNS TABLE(
  test_name TEXT,
  test_status TEXT,
  test_message TEXT,
  violation_count INTEGER
) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Test 1: Check entity naming conventions
  SELECT COUNT(*) INTO v_count
  FROM core_entities
  WHERE entity_type IS NOT NULL 
  AND entity_name IS NOT NULL
  AND NOT (entity_name LIKE entity_type || '_%' OR entity_name = entity_type);
  
  RETURN QUERY
  SELECT 
    'entity_naming_convention'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASSED' ELSE 'WARNING' END,
    'Check entity naming follows type_name convention'::TEXT,
    v_count;

  -- Test 2: Check for consistent field naming in dynamic data
  SELECT COUNT(*) INTO v_count
  FROM core_dynamic_data
  WHERE field_name IS NULL OR field_name = '' OR field_name LIKE '% %';
  
  RETURN QUERY
  SELECT 
    'dynamic_field_naming'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASSED' ELSE 'FAILED' END,
    'Check dynamic field names are valid (no spaces, not empty)'::TEXT,
    v_count;

  -- Test 3: Check organization assignment
  SELECT COUNT(*) INTO v_count
  FROM core_entities
  WHERE organization_id IS NULL;
  
  RETURN QUERY
  SELECT 
    'organization_assignment'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASSED' ELSE 'FAILED' END,
    'Check all entities are assigned to an organization'::TEXT,
    v_count;

  -- Test 4: Check relationship consistency
  SELECT COUNT(*) INTO v_count
  FROM core_relationships
  WHERE relationship_type IS NULL OR relationship_type = '';
  
  RETURN QUERY
  SELECT 
    'relationship_consistency'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASSED' ELSE 'FAILED' END,
    'Check all relationships have valid types'::TEXT,
    v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 8: Enhanced Main Test Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.run_universal_schema_tests(
  p_organization_id UUID DEFAULT '11111111-1111-1111-1111-111111111111'::UUID,
  p_executed_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_execution_id UUID := gen_random_uuid();
  v_test_results JSONB := '{"passed": 0, "failed": 0, "warnings": 0, "total": 0}'::JSONB;
  v_test_details JSONB := '[]'::JSONB;
  v_test_record RECORD;
  v_total_tests INTEGER := 0;
  v_passed_tests INTEGER := 0;
  v_failed_tests INTEGER := 0;
  v_warning_tests INTEGER := 0;
  v_start_time TIMESTAMP := NOW();
  v_end_time TIMESTAMP;
  v_duration_ms NUMERIC;
BEGIN
  -- Store execution start
  INSERT INTO core_entities (
    id,
    organization_id,
    entity_type,
    entity_name,
    entity_code,
    entity_description,
    entity_status,
    is_active
  ) VALUES (
    v_execution_id,
    p_organization_id,
    'test_execution',
    'test_execution_' || TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS'),
    'EXEC-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS'),
    'Universal schema test execution',
    'running',
    true
  );

  -- Run schema structure tests
  FOR v_test_record IN SELECT * FROM test_core_schema_structure()
  LOOP
    v_total_tests := v_total_tests + 1;
    IF v_test_record.test_status = 'PASSED' THEN
      v_passed_tests := v_passed_tests + 1;
    ELSIF v_test_record.test_status = 'WARNING' THEN
      v_warning_tests := v_warning_tests + 1;
    ELSE
      v_failed_tests := v_failed_tests + 1;
    END IF;
    
    v_test_details := v_test_details || jsonb_build_object(
      'test_name', v_test_record.test_name,
      'status', v_test_record.test_status,
      'message', v_test_record.test_message,
      'category', 'schema_structure'
    );
  END LOOP;
  
  -- Run constraint tests
  FOR v_test_record IN SELECT * FROM test_foreign_key_constraints()
  LOOP
    v_total_tests := v_total_tests + 1;
    IF v_test_record.test_status = 'PASSED' THEN
      v_passed_tests := v_passed_tests + 1;
    ELSIF v_test_record.test_status = 'WARNING' THEN
      v_warning_tests := v_warning_tests + 1;
    ELSE
      v_failed_tests := v_failed_tests + 1;
    END IF;
    
    v_test_details := v_test_details || jsonb_build_object(
      'test_name', v_test_record.test_name,
      'status', v_test_record.test_status,
      'message', v_test_record.test_message,
      'category', 'constraints'
    );
  END LOOP;
  
  -- Run business logic tests
  FOR v_test_record IN SELECT * FROM test_entity_lifecycle()
  LOOP
    v_total_tests := v_total_tests + 1;
    IF v_test_record.test_status = 'PASSED' THEN
      v_passed_tests := v_passed_tests + 1;
    ELSIF v_test_record.test_status = 'WARNING' THEN
      v_warning_tests := v_warning_tests + 1;
    ELSE
      v_failed_tests := v_failed_tests + 1;
    END IF;
    
    v_test_details := v_test_details || jsonb_build_object(
      'test_name', v_test_record.test_name,
      'status', v_test_record.test_status,
      'message', v_test_record.test_message,
      'category', 'business_logic'
    );
  END LOOP;
  
  -- Run performance tests
  FOR v_test_record IN SELECT * FROM test_query_performance()
  LOOP
    v_total_tests := v_total_tests + 1;
    IF v_test_record.performance_status = 'GOOD' THEN
      v_passed_tests := v_passed_tests + 1;
    ELSIF v_test_record.performance_status = 'ACCEPTABLE' THEN
      v_warning_tests := v_warning_tests + 1;
    ELSE
      v_failed_tests := v_failed_tests + 1;
    END IF;
    
    v_test_details := v_test_details || jsonb_build_object(
      'test_name', v_test_record.test_name,
      'status', v_test_record.performance_status,
      'message', FORMAT('%s ms (%s rows)', v_test_record.execution_time_ms, v_test_record.row_count),
      'category', 'performance',
      'execution_time_ms', v_test_record.execution_time_ms,
      'row_count', v_test_record.row_count
    );
  END LOOP;
  
  -- Run data integrity tests
  FOR v_test_record IN SELECT * FROM test_data_integrity()
  LOOP
    v_total_tests := v_total_tests + 1;
    IF v_test_record.test_status = 'PASSED' THEN
      v_passed_tests := v_passed_tests + 1;
    ELSIF v_test_record.test_status = 'WARNING' THEN
      v_warning_tests := v_warning_tests + 1;
    ELSE
      v_failed_tests := v_failed_tests + 1;
    END IF;
    
    v_test_details := v_test_details || jsonb_build_object(
      'test_name', v_test_record.test_name,
      'status', v_test_record.test_status,
      'message', v_test_record.test_message,
      'category', 'data_integrity',
      'violation_count', v_test_record.violation_count
    );
  END LOOP;
  
  -- Run universal schema compliance tests
  FOR v_test_record IN SELECT * FROM test_universal_schema_compliance()
  LOOP
    v_total_tests := v_total_tests + 1;
    IF v_test_record.test_status = 'PASSED' THEN
      v_passed_tests := v_passed_tests + 1;
    ELSIF v_test_record.test_status = 'WARNING' THEN
      v_warning_tests := v_warning_tests + 1;
    ELSE
      v_failed_tests := v_failed_tests + 1;
    END IF;
    
    v_test_details := v_test_details || jsonb_build_object(
      'test_name', v_test_record.test_name,
      'status', v_test_record.test_status,
      'message', v_test_record.test_message,
      'category', 'universal_schema_compliance',
      'violation_count', v_test_record.violation_count
    );
  END LOOP;
  
  -- Calculate final results
  v_end_time := NOW();
  v_duration_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;
  
  v_test_results := jsonb_build_object(
    'passed', v_passed_tests,
    'failed', v_failed_tests,
    'warnings', v_warning_tests,
    'total', v_total_tests,
    'duration', v_duration_ms,
    'test_details', v_test_details,
    'success_rate', CASE WHEN v_total_tests > 0 THEN (v_passed_tests::NUMERIC / v_total_tests::NUMERIC) * 100 ELSE 0 END
  );
  
  -- Store execution results
  INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type)
  VALUES 
    (v_execution_id, 'test_results', v_test_results::TEXT, 'json'),
    (v_execution_id, 'executed_by', COALESCE(p_executed_by::TEXT, 'system'), 'uuid'),
    (v_execution_id, 'execution_status', 'completed', 'text'),
    (v_execution_id, 'start_time', v_start_time::TEXT, 'timestamp'),
    (v_execution_id, 'end_time', v_end_time::TEXT, 'timestamp'),
    (v_execution_id, 'duration_ms', v_duration_ms::TEXT, 'number'),
    (v_execution_id, 'total_tests', v_total_tests::TEXT, 'number'),
    (v_execution_id, 'passed_tests', v_passed_tests::TEXT, 'number'),
    (v_execution_id, 'failed_tests', v_failed_tests::TEXT, 'number'),
    (v_execution_id, 'warning_tests', v_warning_tests::TEXT, 'number');
  
  -- Update entity status
  UPDATE core_entities 
  SET entity_status = 'completed', updated_at = NOW()
  WHERE id = v_execution_id;
  
  RETURN v_execution_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 9: Enhanced Test Report Function
-- ============================================================================

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
DECLARE
  v_test_results JSONB;
  v_execution_status TEXT;
  v_duration_ms NUMERIC;
BEGIN
  -- Get execution data
  SELECT 
    MAX(CASE WHEN dd.field_name = 'test_results' THEN dd.field_value::JSONB END),
    MAX(CASE WHEN dd.field_name = 'execution_status' THEN dd.field_value END),
    MAX(CASE WHEN dd.field_name = 'duration_ms' THEN dd.field_value::NUMERIC END)
  INTO v_test_results, v_execution_status, v_duration_ms
  FROM core_dynamic_data dd
  WHERE dd.entity_id = p_execution_id;
  
  -- Return execution report
  RETURN QUERY
  SELECT 
    p_execution_id as execution_id,
    'Universal Schema Test Suite'::TEXT as suite_name,
    COALESCE(v_execution_status, 'completed')::TEXT as execution_status,
    COALESCE((v_test_results->>'total')::INTEGER, 0) as total_tests,
    COALESCE((v_test_results->>'passed')::INTEGER, 0) as passed_tests,
    COALESCE((v_test_results->>'failed')::INTEGER, 0) as failed_tests,
    COALESCE(v_duration_ms, 0.0) as execution_time_ms,
    COALESCE(v_test_results->'test_details', '[]'::JSONB) as test_details;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 10: Enhanced Analytics Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_test_analytics(
  p_organization_id UUID,
  p_date_from DATE DEFAULT NULL,
  p_date_to DATE DEFAULT NULL
)
RETURNS TABLE(
  total_executions BIGINT,
  total_passed BIGINT,
  total_failed BIGINT,
  average_duration NUMERIC,
  success_rate NUMERIC
) AS $$
DECLARE
  v_executions BIGINT;
  v_total_passed BIGINT := 0;
  v_total_failed BIGINT := 0;
  v_avg_duration NUMERIC := 0;
  v_success_rate NUMERIC := 0;
BEGIN
  -- Get execution count
  SELECT COUNT(*) INTO v_executions
  FROM core_entities e
  WHERE e.organization_id = p_organization_id
  AND e.entity_type = 'test_execution'
  AND e.is_active = true
  AND (p_date_from IS NULL OR e.created_at >= p_date_from)
  AND (p_date_to IS NULL OR e.created_at <= p_date_to);
  
  -- Get aggregated test results
  SELECT 
    COALESCE(SUM((dd_passed.field_value)::BIGINT), 0),
    COALESCE(SUM((dd_failed.field_value)::BIGINT), 0),
    COALESCE(AVG((dd_duration.field_value)::NUMERIC), 0)
  INTO v_total_passed, v_total_failed, v_avg_duration
  FROM core_entities e
  LEFT JOIN core_dynamic_data dd_passed ON e.id = dd_passed.entity_id AND dd_passed.field_name = 'passed_tests'
  LEFT JOIN core_dynamic_data dd_failed ON e.id = dd_failed.entity_id AND dd_failed.field_name = 'failed_tests'
  LEFT JOIN core_dynamic_data dd_duration ON e.id = dd_duration.entity_id AND dd_duration.field_name = 'duration_ms'
  WHERE e.organization_id = p_organization_id
  AND e.entity_type = 'test_execution'
  AND e.is_active = true
  AND (p_date_from IS NULL OR e.created_at >= p_date_from)
  AND (p_date_to IS NULL OR e.created_at <= p_date_to);
  
  -- Calculate success rate
  IF (v_total_passed + v_total_failed) > 0 THEN
    v_success_rate := (v_total_passed::NUMERIC / (v_total_passed + v_total_failed)::NUMERIC) * 100;
  END IF;
  
  RETURN QUERY
  SELECT 
    v_executions,
    v_total_passed,
    v_total_failed,
    v_avg_duration,
    v_success_rate;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 11: Grant Permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.check_entity_duplicates TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_entity_description TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_dynamic_data_integrity TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_core_schema_structure TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_foreign_key_constraints TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_entity_lifecycle TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_query_performance TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_data_integrity TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_universal_schema_compliance TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_universal_schema_tests TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_test_execution_report TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_test_analytics TO authenticated;