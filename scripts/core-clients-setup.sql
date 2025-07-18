-- Core Clients Table Setup for HERA Universal Schema
-- This script creates the core_clients table and populates it with sample data

-- 1. Create core_clients table (if not exists)
CREATE TABLE IF NOT EXISTS core_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(255) NOT NULL,
    client_code VARCHAR(100) NOT NULL UNIQUE,
    client_type VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT core_clients_client_code_key UNIQUE (client_code)
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_core_clients_type ON core_clients(client_type);
CREATE INDEX IF NOT EXISTS idx_core_clients_active ON core_clients(is_active);
CREATE INDEX IF NOT EXISTS idx_core_clients_created_at ON core_clients(created_at);
CREATE INDEX IF NOT EXISTS idx_core_clients_name ON core_clients(client_name);

-- 3. Add sample clients (if table is empty)
INSERT INTO core_clients (client_name, client_code, client_type, is_active, created_at, updated_at)
SELECT * FROM (VALUES
    ('Pizza Palace Restaurant', 'PIZZA-PALACE', 'restaurant', true, NOW(), NOW()),
    ('Fashion Store Inc', 'FASHION-STORE', 'retail', true, NOW(), NOW()),
    ('Tech Solutions Inc', 'TECH-SOL', 'technology', true, NOW(), NOW()),
    ('Green Market Store', 'GREEN-MKT', 'retail', true, NOW(), NOW()),
    ('Legal Partners LLC', 'LEGAL-PART', 'legal', true, NOW(), NOW()),
    ('Modern Cafe & Bistro', 'MOD-CAFE', 'restaurant', true, NOW(), NOW()),
    ('Healthcare Plus Clinic', 'HEALTH-PLUS', 'healthcare', true, NOW(), NOW()),
    ('Global Manufacturing Corp', 'GLOBAL-MFG', 'manufacturing', true, NOW(), NOW()),
    ('Quick Clean Services', 'QUICK-CLEAN', 'service', true, NOW(), NOW()),
    ('Bright Future Academy', 'BRIGHT-ACADEMY', 'education', true, NOW(), NOW()),
    ('Strategic Business Consultants', 'STRAT-CONSULT', 'consulting', true, NOW(), NOW()),
    ('Local Flower Shop', 'LOCAL-FLOWERS', 'retail', false, NOW(), NOW()),
    ('Premier Financial Advisors', 'PREMIER-FIN', 'finance', true, NOW(), NOW()),
    ('Digital Marketing Agency', 'DIGITAL-MKT', 'marketing', true, NOW(), NOW()),
    ('Auto Repair Specialists', 'AUTO-REPAIR', 'automotive', true, NOW(), NOW()),
    ('Fitness First Gym', 'FITNESS-FIRST', 'fitness', true, NOW(), NOW()),
    ('Creative Design Studio', 'CREATIVE-DESIGN', 'design', true, NOW(), NOW()),
    ('Fresh Food Catering', 'FRESH-CATERING', 'catering', true, NOW(), NOW()),
    ('Real Estate Experts', 'REAL-ESTATE', 'realestate', true, NOW(), NOW()),
    ('Mobile App Developers', 'MOBILE-DEV', 'technology', true, NOW(), NOW())
) AS new_clients(client_name, client_code, client_type, is_active, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM core_clients LIMIT 1);

-- 4. Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_core_clients_updated_at ON core_clients;
CREATE TRIGGER update_core_clients_updated_at 
    BEFORE UPDATE ON core_clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Create a view for client analytics
CREATE OR REPLACE VIEW client_analytics AS
SELECT 
    COUNT(*) as total_clients,
    COUNT(*) FILTER (WHERE is_active = true) as active_clients,
    COUNT(*) FILTER (WHERE is_active = false) as inactive_clients,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_clients,
    client_type,
    COUNT(*) as type_count
FROM core_clients 
GROUP BY ROLLUP(client_type);

-- 6. Create a function to generate client codes automatically
CREATE OR REPLACE FUNCTION generate_client_code(
    p_client_name TEXT,
    p_client_type TEXT
) RETURNS TEXT AS $$
DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INTEGER := 1;
BEGIN
    -- Generate base code from name and type
    base_code := UPPER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(p_client_name, '[^A-Za-z0-9\s]', '', 'g'),
            '\s+', '-', 'g'
        )
    );
    
    -- Limit to 15 characters and add type suffix
    base_code := LEFT(base_code, 15) || '-' || UPPER(LEFT(p_client_type, 3));
    
    -- Check for uniqueness and add counter if needed
    final_code := base_code;
    
    WHILE EXISTS (SELECT 1 FROM core_clients WHERE client_code = final_code) LOOP
        final_code := base_code || '-' || counter::TEXT;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- 7. Create RLS (Row Level Security) policies if needed
-- Uncomment these if you want to enable RLS
/*
ALTER TABLE core_clients ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to see all clients
CREATE POLICY "Users can view all clients" ON core_clients
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for authenticated users to insert clients
CREATE POLICY "Users can insert clients" ON core_clients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for authenticated users to update clients
CREATE POLICY "Users can update clients" ON core_clients
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for authenticated users to delete clients
CREATE POLICY "Users can delete clients" ON core_clients
    FOR DELETE USING (auth.role() = 'authenticated');
*/

-- 8. Add some additional useful functions

-- Function to get client statistics
CREATE OR REPLACE FUNCTION get_client_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_clients', COUNT(*),
        'active_clients', COUNT(*) FILTER (WHERE is_active = true),
        'inactive_clients', COUNT(*) FILTER (WHERE is_active = false),
        'recent_clients', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
        'growth_rate', CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0 
        END,
        'clients_by_type', (
            SELECT json_object_agg(client_type, type_count)
            FROM (
                SELECT client_type, COUNT(*) as type_count
                FROM core_clients
                WHERE is_active = true
                GROUP BY client_type
                ORDER BY type_count DESC
            ) t
        )
    ) INTO result
    FROM core_clients;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 9. Verification queries

-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'core_clients' 
ORDER BY ordinal_position;

-- Check sample data
SELECT 
    client_type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM core_clients 
GROUP BY client_type 
ORDER BY count DESC;

-- Test the analytics view
SELECT * FROM client_analytics ORDER BY type_count DESC NULLS LAST;

-- Test the client code generator
SELECT generate_client_code('New Test Company', 'technology') as generated_code;

-- Get client statistics
SELECT get_client_stats() as stats;

-- Show recent clients
SELECT 
    client_name,
    client_code,
    client_type,
    is_active,
    created_at
FROM core_clients 
ORDER BY created_at DESC 
LIMIT 10;

COMMIT;