-- ============================================================================
-- HERA UNIVERSAL: SYSTEM ORGANIZATIONS MIGRATION
-- ============================================================================
-- 
-- This migration implements the HERA Self-Development Architecture by creating
-- special system organization IDs that differentiate between:
-- - Client business data (normal org IDs)  
-- - HERA platform development data (system org IDs)
--
-- SYSTEM ORGANIZATION ID PATTERN: 00000000-0000-0000-0000-00000000000X
-- Where X = 1-9 for different HERA development domains
--
-- ============================================================================

-- System Organization IDs (Reserved for HERA Platform Development)
-- These UUIDs follow pattern: 00000000-0000-0000-0000-00000000000X

-- Core Platform Development Organization
INSERT INTO core_organizations (
    id, 
    client_id, 
    org_name, 
    org_code, 
    industry, 
    country, 
    currency, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid, -- System client ID
    'HERA Core Platform Development',
    'HERA-CORE-001',
    'enterprise_software_development',
    'Global',
    'USD',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    org_name = EXCLUDED.org_name,
    updated_at = NOW();

-- AI Models & Intelligence Organization  
INSERT INTO core_organizations (
    id, 
    client_id, 
    org_name, 
    org_code, 
    industry, 
    country, 
    currency, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'HERA AI Models & Intelligence',
    'HERA-AI-002',
    'artificial_intelligence_development',
    'Global',
    'USD',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    org_name = EXCLUDED.org_name,
    updated_at = NOW();

-- Security & Compliance Organization
INSERT INTO core_organizations (
    id, 
    client_id, 
    org_name, 
    org_code, 
    industry, 
    country, 
    currency, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'HERA Security & Compliance',
    'HERA-SEC-003',
    'cybersecurity_compliance',
    'Global',
    'USD',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    org_name = EXCLUDED.org_name,
    updated_at = NOW();

-- Developer Tools & Testing Organization
INSERT INTO core_organizations (
    id, 
    client_id, 
    org_name, 
    org_code, 
    industry, 
    country, 
    currency, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000004'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'HERA Developer Tools & Testing',
    'HERA-DEV-004',
    'software_testing_tools',
    'Global',
    'USD',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    org_name = EXCLUDED.org_name,
    updated_at = NOW();

-- Analytics & Business Intelligence Organization
INSERT INTO core_organizations (
    id, 
    client_id, 
    org_name, 
    org_code, 
    industry, 
    country, 
    currency, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000005'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'HERA Analytics & Business Intelligence',
    'HERA-BI-005',
    'business_intelligence_analytics',
    'Global',
    'USD',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    org_name = EXCLUDED.org_name,
    updated_at = NOW();

-- Integration & API Management Organization
INSERT INTO core_organizations (
    id, 
    client_id, 
    org_name, 
    org_code, 
    industry, 
    country, 
    currency, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000006'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'HERA Integration & API Management',
    'HERA-API-006',
    'api_integration_management',
    'Global',
    'USD',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    org_name = EXCLUDED.org_name,
    updated_at = NOW();

-- ============================================================================
-- SYSTEM ENTITY TYPES FOR HERA DEVELOPMENT
-- ============================================================================

-- Define entity types specific to HERA platform development
-- These represent different aspects of developing HERA itself

-- Core Platform Entities (Organization ID: 00000000-0000-0000-0000-000000000001)
INSERT INTO core_entities (
    id,
    organization_id,
    entity_type,
    entity_name,
    entity_code,
    is_active,
    created_at,
    updated_at
) VALUES 
    -- Platform Features
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'platform_feature', 'Universal Transaction System', 'FEAT-UTS-001', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'platform_feature', 'Real-Time Subscriptions', 'FEAT-RTS-002', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'platform_feature', 'Universal Schema', 'FEAT-US-003', true, NOW(), NOW()),
    
    -- Development Tasks
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'development_task', 'Implement Mobile Scanner', 'TASK-MS-001', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'development_task', 'Enhance AI Engine', 'TASK-AI-002', true, NOW(), NOW()),
    
    -- Architecture Components
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'architecture_component', 'Universal Naming Convention', 'ARCH-UNC-001', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'architecture_component', 'Organization Isolation', 'ARCH-OI-002', true, NOW(), NOW());

-- AI Development Entities (Organization ID: 00000000-0000-0000-0000-000000000002)  
INSERT INTO core_entities (
    id,
    organization_id,
    entity_type,
    entity_name,
    entity_code,
    is_active,
    created_at,
    updated_at
) VALUES 
    -- AI Models
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000002'::uuid, 'ai_model', 'Test Generation Model', 'AI-TGM-001', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000002'::uuid, 'ai_model', 'Visual Analysis Model', 'AI-VAM-002', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000002'::uuid, 'ai_model', 'Business Logic Validator', 'AI-BLV-003', true, NOW(), NOW()),
    
    -- AI Training Data
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000002'::uuid, 'training_dataset', 'Restaurant UI Patterns', 'DATA-RUI-001', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000002'::uuid, 'training_dataset', 'API Test Scenarios', 'DATA-API-002', true, NOW(), NOW()),
    
    -- AI Performance Metrics
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000002'::uuid, 'ai_metric', 'Model Accuracy Score', 'METRIC-ACC-001', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000002'::uuid, 'ai_metric', 'Test Success Rate', 'METRIC-TSR-002', true, NOW(), NOW());

-- Developer Tools Entities (Organization ID: 00000000-0000-0000-0000-000000000004)
INSERT INTO core_entities (
    id,
    organization_id,
    entity_type,
    entity_name,
    entity_code,
    is_active,
    created_at,
    updated_at
) VALUES 
    -- Development Tools
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000004'::uuid, 'dev_tool', 'AI Test Orchestrator', 'TOOL-ATO-001', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000004'::uuid, 'dev_tool', 'Visual AI Tester', 'TOOL-VAT-002', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000004'::uuid, 'dev_tool', 'Universal CRUD Service', 'TOOL-UCS-003', true, NOW(), NOW()),
    
    -- Test Suites
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000004'::uuid, 'test_suite', 'Master AI Test Suite', 'SUITE-MATS-001', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000004'::uuid, 'test_suite', 'Integration Test Suite', 'SUITE-ITS-002', true, NOW(), NOW()),
    
    -- Quality Gates
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000004'::uuid, 'quality_gate', 'Minimum Pass Rate Gate', 'GATE-MPR-001', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000004'::uuid, 'quality_gate', 'Accessibility Score Gate', 'GATE-AS-002', true, NOW(), NOW());

-- ============================================================================
-- SYSTEM DATA IDENTIFICATION FUNCTIONS
-- ============================================================================

-- Function to check if an organization ID is a system organization
CREATE OR REPLACE FUNCTION is_system_organization(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if organization ID follows system pattern: 00000000-0000-0000-0000-00000000000X
    RETURN org_id::text LIKE '00000000-0000-0000-0000-00000000000_';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get system organization type
CREATE OR REPLACE FUNCTION get_system_organization_type(org_id UUID)
RETURNS TEXT AS $$
BEGIN
    CASE 
        WHEN org_id = '00000000-0000-0000-0000-000000000001'::uuid THEN RETURN 'core_platform';
        WHEN org_id = '00000000-0000-0000-0000-000000000002'::uuid THEN RETURN 'ai_intelligence';
        WHEN org_id = '00000000-0000-0000-0000-000000000003'::uuid THEN RETURN 'security_compliance';
        WHEN org_id = '00000000-0000-0000-0000-000000000004'::uuid THEN RETURN 'developer_tools';
        WHEN org_id = '00000000-0000-0000-0000-000000000005'::uuid THEN RETURN 'analytics_bi';
        WHEN org_id = '00000000-0000-0000-0000-000000000006'::uuid THEN RETURN 'integration_api';
        ELSE RETURN 'client_business';
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get all client (non-system) data
CREATE OR REPLACE FUNCTION get_client_entities(table_name TEXT DEFAULT 'core_entities')
RETURNS TABLE(result_row JSON) AS $$
BEGIN
    -- Dynamic query to get client data only
    RETURN QUERY EXECUTE format('
        SELECT row_to_json(t.*) as result_row
        FROM %I t
        WHERE NOT is_system_organization(organization_id)
    ', table_name);
END;
$$ LANGUAGE plpgsql;

-- Function to get system development data
CREATE OR REPLACE FUNCTION get_system_entities(system_type TEXT DEFAULT NULL, table_name TEXT DEFAULT 'core_entities')
RETURNS TABLE(result_row JSON) AS $$
BEGIN
    IF system_type IS NULL THEN
        -- Get all system data
        RETURN QUERY EXECUTE format('
            SELECT row_to_json(t.*) as result_row
            FROM %I t
            WHERE is_system_organization(organization_id)
        ', table_name);
    ELSE
        -- Get specific system type data
        RETURN QUERY EXECUTE format('
            SELECT row_to_json(t.*) as result_row
            FROM %I t
            WHERE is_system_organization(organization_id)
            AND get_system_organization_type(organization_id) = %L
        ', table_name, system_type);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SYSTEM METADATA FOR HERA DEVELOPMENT
-- ============================================================================

-- Add metadata for HERA development entities to demonstrate the pattern

-- Core Platform Development Metadata
INSERT INTO core_metadata (
    organization_id,
    entity_type,
    entity_id,
    metadata_type,
    metadata_category,
    metadata_key,
    metadata_value
) SELECT 
    e.organization_id,
    'platform_feature',
    e.id,
    'development_context',
    'feature_specifications',
    'implementation_status',
    jsonb_build_object(
        'status', 'completed',
        'version', '1.0.0',
        'priority', 'critical',
        'dependencies', ARRAY['universal_schema', 'organization_isolation'],
        'test_coverage', 95,
        'documentation_complete', true,
        'ai_enhanced', true
    )
FROM core_entities e
WHERE e.organization_id = '00000000-0000-0000-0000-000000000001'::uuid
AND e.entity_type = 'platform_feature'
AND e.entity_name = 'Universal Transaction System';

-- AI Development Metadata
INSERT INTO core_metadata (
    organization_id,
    entity_type,
    entity_id,
    metadata_type,
    metadata_category,
    metadata_key,
    metadata_value
) SELECT 
    e.organization_id,
    'ai_model',
    e.id,
    'model_performance',
    'ai_metrics',
    'performance_stats',
    jsonb_build_object(
        'accuracy', 0.94,
        'precision', 0.92,
        'recall', 0.96,
        'f1_score', 0.94,
        'training_examples', 10000,
        'last_trained', '2024-01-15T10:30:00Z',
        'model_version', 'v2.1.0',
        'deployment_status', 'production'
    )
FROM core_entities e
WHERE e.organization_id = '00000000-0000-0000-0000-000000000002'::uuid
AND e.entity_type = 'ai_model'
AND e.entity_name = 'Test Generation Model';

-- ============================================================================
-- SYSTEM ORGANIZATION SUMMARY VIEW
-- ============================================================================

-- Create a view to easily see system vs client data distribution
CREATE OR REPLACE VIEW system_data_summary AS
SELECT 
    get_system_organization_type(organization_id) as organization_type,
    organization_id,
    org_name,
    COUNT(e.id) as entity_count,
    COUNT(DISTINCT e.entity_type) as entity_types,
    COUNT(m.id) as metadata_records,
    CASE 
        WHEN is_system_organization(organization_id) THEN 'HERA_SYSTEM' 
        ELSE 'CLIENT_BUSINESS' 
    END as data_classification
FROM core_organizations o
LEFT JOIN core_entities e ON o.id = e.organization_id
LEFT JOIN core_metadata m ON o.id = m.organization_id
GROUP BY organization_id, org_name
ORDER BY 
    CASE WHEN is_system_organization(organization_id) THEN 0 ELSE 1 END,
    organization_id;

-- ============================================================================
-- VALIDATION AND TESTING
-- ============================================================================

-- Test the system organization detection
DO $$
BEGIN
    -- Test system organization detection
    ASSERT is_system_organization('00000000-0000-0000-0000-000000000001'::uuid) = true, 'System org detection failed';
    ASSERT is_system_organization('f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid) = false, 'Client org detection failed';
    
    -- Test system type identification  
    ASSERT get_system_organization_type('00000000-0000-0000-0000-000000000001'::uuid) = 'core_platform', 'System type detection failed';
    ASSERT get_system_organization_type('00000000-0000-0000-0000-000000000002'::uuid) = 'ai_intelligence', 'AI type detection failed';
    
    RAISE NOTICE 'All HERA System Organization tests passed successfully!';
END;
$$;

-- Display summary of system organizations created
SELECT 
    organization_type,
    org_name,
    entity_count,
    entity_types,
    metadata_records,
    data_classification
FROM system_data_summary
WHERE data_classification = 'HERA_SYSTEM'
ORDER BY organization_id;

-- ============================================================================
-- COMPLETION SUMMARY
-- ============================================================================

/*
HERA SELF-DEVELOPMENT ARCHITECTURE IMPLEMENTED

✅ System Organizations Created:
   - Core Platform Development (001)
   - AI Models & Intelligence (002)  
   - Security & Compliance (003)
   - Developer Tools & Testing (004)
   - Analytics & Business Intelligence (005)
   - Integration & API Management (006)

✅ System Entity Types Defined:
   - platform_feature, development_task, architecture_component
   - ai_model, training_dataset, ai_metric
   - dev_tool, test_suite, quality_gate

✅ Differentiation Functions Created:
   - is_system_organization() - Identifies system vs client data
   - get_system_organization_type() - Returns system domain type
   - get_client_entities() - Retrieves only client business data
   - get_system_entities() - Retrieves HERA development data

✅ Sample Data Added:
   - Platform features, AI models, development tools
   - Rich metadata following same patterns as client data
   - Complete demonstration of self-referential architecture

✅ Views and Utilities:
   - system_data_summary view for easy data classification
   - Validation tests for system detection
   - Query examples for differentiation

NEXT STEPS:
1. Update application services to use system organizations for HERA development
2. Create UI interfaces for HERA self-development using restaurant metaphors
3. Implement AI-powered self-improvement features
4. Set up analytics for HERA development metrics
5. Enable HERA to track its own development as "orders" and "inventory"
*/