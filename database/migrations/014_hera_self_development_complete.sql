-- ============================================================================
-- HERA Self-Development Architecture - Complete System Setup
-- ============================================================================
-- This creates the revolutionary system where HERA develops itself using its own universal schema
-- 
-- This migration:
-- 1. Creates system client and organizations
-- 2. Populates system entities (features, AI models, tasks, metrics)
-- 3. Adds metadata for enhanced functionality
-- 4. Sets up the complete self-referential architecture
-- ============================================================================

-- Step 1: Create System Client (if not exists)
INSERT INTO core_clients (
    id, 
    client_name, 
    client_code, 
    client_type, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'HERA Universal System',
    'HERA-SYSTEM',
    'internal_system',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    updated_at = NOW();

-- Step 2: Create System Organizations (if not exists)
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
) VALUES 
    ('00000001-0001-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'HERA Core Platform Development', 'HERA-CORE-001', 'enterprise_software_development', 'Global', 'USD', true, NOW(), NOW()),
    ('00000001-0002-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'HERA AI Models & Intelligence', 'HERA-AI-002', 'artificial_intelligence_development', 'Global', 'USD', true, NOW(), NOW()),
    ('00000001-0003-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'HERA Security & Compliance', 'HERA-SEC-003', 'cybersecurity_compliance', 'Global', 'USD', true, NOW(), NOW()),
    ('00000001-0004-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'HERA Developer Tools & Testing', 'HERA-DEV-004', 'software_testing_tools', 'Global', 'USD', true, NOW(), NOW()),
    ('00000001-0005-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'HERA Analytics & Business Intelligence', 'HERA-BI-005', 'business_intelligence_analytics', 'Global', 'USD', true, NOW(), NOW()),
    ('00000001-0006-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'HERA Integration & API Management', 'HERA-API-006', 'api_integration_management', 'Global', 'USD', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    org_name = EXCLUDED.org_name,
    updated_at = NOW();

-- Step 3: Check if system organizations were created successfully
SELECT 'System Organizations Check' as status, id, org_name, org_code 
FROM core_organizations 
WHERE client_id = '00000000-0000-0000-0000-000000000001'::uuid
ORDER BY org_code;

-- Step 4: Add all system entities for HERA self-development

-- Platform Features (00000002-XXXX = Platform Features)
INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active, created_at, updated_at) VALUES
('00000002-0001-0000-0000-000000000000'::uuid, '00000001-0001-0000-0000-000000000000'::uuid, 'platform_feature', 'Universal Transaction System', 'UTS-CORE', true, NOW(), NOW()),
('00000002-0002-0000-0000-000000000000'::uuid, '00000001-0001-0000-0000-000000000000'::uuid, 'platform_feature', 'Smart Procurement Module', 'PROC-SMART', true, NOW(), NOW()),
('00000002-0003-0000-0000-000000000000'::uuid, '00000001-0001-0000-0000-000000000000'::uuid, 'platform_feature', 'AI-Powered Inventory Management', 'INV-AI', true, NOW(), NOW()),
('00000002-0004-0000-0000-000000000000'::uuid, '00000001-0001-0000-0000-000000000000'::uuid, 'platform_feature', 'Mobile Scanner Ecosystem', 'SCAN-MOBILE', true, NOW(), NOW()),
('00000002-0005-0000-0000-000000000000'::uuid, '00000001-0001-0000-0000-000000000000'::uuid, 'platform_feature', 'Self-Development Architecture', 'SELF-DEV', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- AI Models (00000003-XXXX = AI Models)
INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active, created_at, updated_at) VALUES
('00000003-0001-0000-0000-000000000000'::uuid, '00000001-0002-0000-0000-000000000000'::uuid, 'ai_model', 'Invoice Classification Model v2.1', 'ICM-v2.1', true, NOW(), NOW()),
('00000003-0002-0000-0000-000000000000'::uuid, '00000001-0002-0000-0000-000000000000'::uuid, 'ai_model', 'Demand Forecasting Engine', 'DFE-v1.3', true, NOW(), NOW()),
('00000003-0003-0000-0000-000000000000'::uuid, '00000001-0002-0000-0000-000000000000'::uuid, 'ai_model', 'Fraud Detection System', 'FDS-v2.0', true, NOW(), NOW()),
('00000003-0004-0000-0000-000000000000'::uuid, '00000001-0002-0000-0000-000000000000'::uuid, 'ai_model', 'Natural Language Query Processor', 'NLQP-v1.0', true, NOW(), NOW()),
('00000003-0005-0000-0000-000000000000'::uuid, '00000001-0002-0000-0000-000000000000'::uuid, 'ai_model', 'Self-Improvement Analysis Engine', 'SIAE-v1.0', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Development Tasks (00000004-XXXX = Development Tasks)
INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active, created_at, updated_at) VALUES
('00000004-0001-0000-0000-000000000000'::uuid, '00000001-0004-0000-0000-000000000000'::uuid, 'development_task', 'Implement Self-Development Architecture', 'TASK-SELF-DEV', true, NOW(), NOW()),
('00000004-0002-0000-0000-000000000000'::uuid, '00000001-0004-0000-0000-000000000000'::uuid, 'development_task', 'Create Universal Module Generator', 'TASK-MOD-GEN', true, NOW(), NOW()),
('00000004-0003-0000-0000-000000000000'::uuid, '00000001-0004-0000-0000-000000000000'::uuid, 'development_task', 'Build AI Context Manager', 'TASK-AI-CTX', true, NOW(), NOW()),
('00000004-0004-0000-0000-000000000000'::uuid, '00000001-0004-0000-0000-000000000000'::uuid, 'development_task', 'Enhance Mobile Scanner Performance', 'TASK-SCAN-PERF', true, NOW(), NOW()),
('00000004-0005-0000-0000-000000000000'::uuid, '00000001-0004-0000-0000-000000000000'::uuid, 'development_task', 'Implement CI/CD Pipeline', 'TASK-CICD', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Performance Metrics (00000005-XXXX = Performance Metrics)
INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active, created_at, updated_at) VALUES
('00000005-0001-0000-0000-000000000000'::uuid, '00000001-0005-0000-0000-000000000000'::uuid, 'performance_metric', 'Platform Response Time', 'PERF-RESPONSE', true, NOW(), NOW()),
('00000005-0002-0000-0000-000000000000'::uuid, '00000001-0005-0000-0000-000000000000'::uuid, 'performance_metric', 'AI Processing Accuracy', 'PERF-AI-ACC', true, NOW(), NOW()),
('00000005-0003-0000-0000-000000000000'::uuid, '00000001-0005-0000-0000-000000000000'::uuid, 'performance_metric', 'User Satisfaction Score', 'PERF-USER-SAT', true, NOW(), NOW()),
('00000005-0004-0000-0000-000000000000'::uuid, '00000001-0005-0000-0000-000000000000'::uuid, 'performance_metric', 'Development Velocity', 'PERF-DEV-VEL', true, NOW(), NOW()),
('00000005-0005-0000-0000-000000000000'::uuid, '00000001-0005-0000-0000-000000000000'::uuid, 'performance_metric', 'Self-Improvement Rate', 'PERF-SELF-IMP', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Security Policies (00000006-XXXX = Security Policies)
INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active, created_at, updated_at) VALUES
('00000006-0001-0000-0000-000000000000'::uuid, '00000001-0003-0000-0000-000000000000'::uuid, 'security_policy', 'Data Encryption Policy', 'SEC-ENCRYPT', true, NOW(), NOW()),
('00000006-0002-0000-0000-000000000000'::uuid, '00000001-0003-0000-0000-000000000000'::uuid, 'security_policy', 'Access Control Matrix', 'SEC-ACCESS', true, NOW(), NOW()),
('00000006-0003-0000-0000-000000000000'::uuid, '00000001-0003-0000-0000-000000000000'::uuid, 'security_policy', 'AI Model Security Standards', 'SEC-AI-STD', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Integration Configurations (00000007-XXXX = Integration Configs)
INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active, created_at, updated_at) VALUES
('00000007-0001-0000-0000-000000000000'::uuid, '00000001-0006-0000-0000-000000000000'::uuid, 'integration_config', 'Supabase Real-time Integration', 'INT-SUPABASE', true, NOW(), NOW()),
('00000007-0002-0000-0000-000000000000'::uuid, '00000001-0006-0000-0000-000000000000'::uuid, 'integration_config', 'OpenAI API Integration', 'INT-OPENAI', true, NOW(), NOW()),
('00000007-0003-0000-0000-000000000000'::uuid, '00000001-0006-0000-0000-000000000000'::uuid, 'integration_config', 'Claude API Integration', 'INT-CLAUDE', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 5: Add core metadata for enhanced functionality
INSERT INTO core_metadata (id, organization_id, entity_type, entity_id, metadata_type, metadata_category, metadata_key, metadata_value, is_active, created_at, created_by) VALUES
-- Platform Feature Metadata
(gen_random_uuid(), '00000001-0001-0000-0000-000000000000'::uuid, 'platform_feature', '00000002-0001-0000-0000-000000000000'::uuid, 'feature_details', 'technical', 'status', '{"development_status": "production", "version": "2.1.0", "last_updated": "2024-01-15"}', true, NOW(), '00000000-0000-0000-0000-000000000002'::uuid),
(gen_random_uuid(), '00000001-0001-0000-0000-000000000000'::uuid, 'platform_feature', '00000002-0002-0000-0000-000000000000'::uuid, 'feature_details', 'technical', 'status', '{"development_status": "beta", "version": "1.5.0", "last_updated": "2024-01-10"}', true, NOW(), '00000000-0000-0000-0000-000000000002'::uuid),

-- AI Model Performance Metadata
(gen_random_uuid(), '00000001-0002-0000-0000-000000000000'::uuid, 'ai_model', '00000003-0001-0000-0000-000000000000'::uuid, 'performance', 'metrics', 'accuracy', '{"accuracy": 0.94, "precision": 0.92, "recall": 0.96, "f1_score": 0.94}', true, NOW(), '00000000-0000-0000-0000-000000000002'::uuid),
(gen_random_uuid(), '00000001-0002-0000-0000-000000000000'::uuid, 'ai_model', '00000003-0002-0000-0000-000000000000'::uuid, 'performance', 'metrics', 'accuracy', '{"accuracy": 0.89, "mae": 0.12, "rmse": 0.18, "confidence": 0.87}', true, NOW(), '00000000-0000-0000-0000-000000000002'::uuid),

-- Development Task Metadata
(gen_random_uuid(), '00000001-0004-0000-0000-000000000000'::uuid, 'development_task', '00000004-0001-0000-0000-000000000000'::uuid, 'task_details', 'project', 'progress', '{"status": "completed", "completion": 100, "start_date": "2024-01-01", "end_date": "2024-01-15"}', true, NOW(), '00000000-0000-0000-0000-000000000002'::uuid),
(gen_random_uuid(), '00000001-0004-0000-0000-000000000000'::uuid, 'development_task', '00000004-0002-0000-0000-000000000000'::uuid, 'task_details', 'project', 'progress', '{"status": "in_progress", "completion": 65, "start_date": "2024-01-10", "estimated_end": "2024-02-01"}', true, NOW(), '00000000-0000-0000-0000-000000000002'::uuid),

-- Performance Metric Values
(gen_random_uuid(), '00000001-0005-0000-0000-000000000000'::uuid, 'performance_metric', '00000005-0001-0000-0000-000000000000'::uuid, 'metric_values', 'performance', 'current', '{"value": 245, "unit": "ms", "target": 200, "trend": "improving"}', true, NOW(), '00000000-0000-0000-0000-000000000002'::uuid),
(gen_random_uuid(), '00000001-0005-0000-0000-000000000000'::uuid, 'performance_metric', '00000005-0002-0000-0000-000000000000'::uuid, 'metric_values', 'performance', 'current', '{"value": 94.2, "unit": "percent", "target": 95, "trend": "stable"}', true, NOW(), '00000000-0000-0000-0000-000000000002'::uuid)
ON CONFLICT (id) DO NOTHING;

-- Step 6: Create system function to check if organization is a system organization
CREATE OR REPLACE FUNCTION is_system_organization(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if organization belongs to system client
    RETURN EXISTS (
        SELECT 1 FROM core_organizations 
        WHERE id = org_id 
        AND client_id = '00000000-0000-0000-0000-000000000001'::uuid
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 7: Create view for system vs client data separation
CREATE OR REPLACE VIEW v_system_entities AS
SELECT 
    co.org_name as system_organization,
    ce.entity_type,
    ce.entity_name,
    ce.entity_code,
    ce.is_active,
    ce.created_at,
    CASE 
        WHEN cm.metadata_value IS NOT NULL 
        THEN jsonb_object_agg(cm.metadata_key, cm.metadata_value) 
        ELSE '{}'::jsonb 
    END as metadata
FROM core_entities ce
JOIN core_organizations co ON ce.organization_id = co.id
LEFT JOIN core_metadata cm ON cm.entity_id = ce.id
WHERE is_system_organization(co.id)
GROUP BY co.org_name, ce.entity_type, ce.entity_name, ce.entity_code, ce.is_active, ce.created_at, cm.metadata_value;

-- Step 8: Verify everything was created
SELECT 'Summary' as type, 
       COUNT(*) as count,
       entity_type
FROM core_entities 
WHERE organization_id IN (
    SELECT id FROM core_organizations 
    WHERE client_id = '00000000-0000-0000-0000-000000000001'::uuid
)
GROUP BY entity_type
ORDER BY entity_type;

-- Step 9: Show complete system overview
SELECT 
    co.org_name as system_organization,
    ce.entity_type,
    ce.entity_name,
    ce.entity_code,
    ce.created_at
FROM core_entities ce
JOIN core_organizations co ON ce.organization_id = co.id
WHERE co.client_id = '00000000-0000-0000-0000-000000000001'::uuid
ORDER BY co.org_name, ce.entity_type, ce.entity_name;

-- Step 10: Grant permissions (adjust based on your security requirements)
-- Example: Grant read access to authenticated users
-- GRANT SELECT ON v_system_entities TO authenticated;

-- ============================================================================
-- COMPLETION SUMMARY
-- ============================================================================
/*
This migration creates:
✅ 1 System Client: HERA Universal System
✅ 6 System Organizations: Core Platform, AI Models, Security, Dev Tools, Analytics, Integration
✅ 23 System Entities: Features, AI Models, Tasks, Metrics, Policies, Integrations
✅ 8 Metadata Records: Status tracking, performance metrics, progress updates
✅ Helper Functions: is_system_organization() for easy filtering
✅ System View: v_system_entities for system data access

The HERA Self-Development Architecture is now fully operational!

To use:
1. System data is isolated from client data through special UUIDs
2. Use is_system_organization() to filter system vs client data
3. Access v_system_entities view for system overview
4. HERA can now develop itself using its own universal schema!
*/