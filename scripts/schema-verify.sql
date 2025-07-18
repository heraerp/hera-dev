-- ============================================================================
-- HERA Schema Verification Script
-- ============================================================================
-- Run this BEFORE any database operations to verify actual schema structure
-- This prevents assumptions and ensures code works with reality
-- ============================================================================

\echo '🔍 HERA SCHEMA VERIFICATION STARTING...'
\echo '======================================'

-- 1. Check what tables actually exist
\echo ''
\echo '📋 EXISTING TABLES:'
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name LIKE '%core_%' 
  OR table_name LIKE '%universal_%'
  OR table_name LIKE '%user_%'
ORDER BY table_name;

-- 2. Core Entities Schema
\echo ''
\echo '🏗️ CORE_ENTITIES SCHEMA:'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'core_entities'
ORDER BY ordinal_position;

-- 3. Core Organizations Schema
\echo ''
\echo '🏢 CORE_ORGANIZATIONS SCHEMA:'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'core_organizations'
ORDER BY ordinal_position;

-- 4. Core Users Schema
\echo ''
\echo '👥 CORE_USERS SCHEMA:'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'core_users'
ORDER BY ordinal_position;

-- 5. Universal Transactions Schema
\echo ''
\echo '💰 UNIVERSAL_TRANSACTIONS SCHEMA:'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'universal_transactions'
ORDER BY ordinal_position;

-- 6. Core Metadata Schema
\echo ''
\echo '📊 CORE_METADATA SCHEMA:'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'core_metadata'
ORDER BY ordinal_position;

-- 7. Core Dynamic Data Schema
\echo ''
\echo '🔄 CORE_DYNAMIC_DATA SCHEMA:'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'core_dynamic_data'
ORDER BY ordinal_position;

-- 8. User Organizations Schema
\echo ''
\echo '🔗 USER_ORGANIZATIONS SCHEMA:'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_organizations'
ORDER BY ordinal_position;

-- 9. Universal Transaction Lines Schema
\echo ''
\echo '📝 UNIVERSAL_TRANSACTION_LINES SCHEMA:'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'universal_transaction_lines'
ORDER BY ordinal_position;

-- 10. Foreign Key Relationships
\echo ''
\echo '🔗 FOREIGN KEY RELATIONSHIPS:'
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND (tc.table_name LIKE '%core_%' 
       OR tc.table_name LIKE '%universal_%'
       OR tc.table_name LIKE '%user_%')
ORDER BY tc.table_name;

-- 11. Check for System Organizations (HERA Self-Development)
\echo ''
\echo '🏗️ HERA SYSTEM ORGANIZATIONS:'
SELECT 
    id,
    org_name,
    org_code,
    client_id
FROM core_organizations 
WHERE client_id = '00000000-0000-0000-0000-000000000001'
ORDER BY org_code;

-- 12. Sample Data Check
\echo ''
\echo '📊 SAMPLE DATA COUNTS:'
SELECT 
    'core_entities' as table_name,
    COUNT(*) as record_count
FROM core_entities
UNION ALL
SELECT 
    'core_organizations' as table_name,
    COUNT(*) as record_count
FROM core_organizations
UNION ALL
SELECT 
    'core_users' as table_name,
    COUNT(*) as record_count
FROM core_users
UNION ALL
SELECT 
    'universal_transactions' as table_name,
    COUNT(*) as record_count
FROM universal_transactions
UNION ALL
SELECT 
    'core_metadata' as table_name,
    COUNT(*) as record_count
FROM core_metadata
ORDER BY table_name;

-- 13. Naming Convention Check
\echo ''
\echo '🎯 NAMING CONVENTION VERIFICATION:'
\echo 'Checking if tables follow HERA Universal Naming Convention...'

-- Check for expected naming patterns
SELECT 
    table_name,
    CASE 
        WHEN table_name LIKE 'core_%' THEN '✅ Follows core_ pattern'
        WHEN table_name LIKE 'universal_%' THEN '✅ Follows universal_ pattern'
        WHEN table_name LIKE 'user_%' THEN '✅ Follows user_ pattern'
        ELSE '⚠️  Non-standard naming'
    END as naming_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND (table_name LIKE '%core_%' 
       OR table_name LIKE '%universal_%'
       OR table_name LIKE '%user_%')
ORDER BY table_name;

\echo ''
\echo '✅ SCHEMA VERIFICATION COMPLETE!'
\echo '================================='
\echo ''
\echo '📋 NEXT STEPS:'
\echo '1. Review the actual column names above'
\echo '2. Note any differences from assumptions'
\echo '3. Use exact column names in your queries'
\echo '4. Verify foreign key relationships'
\echo '5. Follow HERA Universal Naming Convention'
\echo ''
\echo '🚨 REMEMBER: Never assume schema - always verify first!'