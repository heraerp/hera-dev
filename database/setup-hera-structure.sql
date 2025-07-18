-- HERA Universal Database Structure
-- This creates the complete HERA foundation following the Chef Lebanon example

-- ============================================================================
-- STEP 1: CORE FOUNDATION TABLES
-- ============================================================================

-- Core Clients Table (Top Level - Business Entity)
CREATE TABLE IF NOT EXISTS core_clients (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_code TEXT UNIQUE NOT NULL,
    client_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Core Organizations Table (Restaurant Locations)
CREATE TABLE IF NOT EXISTS core_organizations (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES core_clients(id),
    name TEXT NOT NULL,
    org_code TEXT NOT NULL,
    industry TEXT,
    country TEXT,
    currency TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Core Entities Table (Universal Entity Storage)
CREATE TABLE IF NOT EXISTS core_entities (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES core_organizations(id),
    entity_type TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_code TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Core Dynamic Data Table (Flexible Attributes)
CREATE TABLE IF NOT EXISTS core_dynamic_data (
    id SERIAL PRIMARY KEY,
    entity_id TEXT NOT NULL REFERENCES core_entities(id),
    field_name TEXT NOT NULL,
    field_value TEXT,
    field_type TEXT DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_id, field_name)
);

-- Core Metadata Table (Rich Context & Intelligence)
CREATE TABLE IF NOT EXISTS core_metadata (
    id SERIAL PRIMARY KEY,
    organization_id TEXT REFERENCES core_organizations(id),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata_type TEXT NOT NULL,
    metadata_category TEXT,
    metadata_key TEXT,
    metadata_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: USER MANAGEMENT TABLES
-- ============================================================================

-- Core Users Table
CREATE TABLE IF NOT EXISTS core_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role TEXT,
    auth_user_id TEXT UNIQUE
);

-- User-Client Relationships
CREATE TABLE IF NOT EXISTS user_clients (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES core_users(id),
    client_id TEXT NOT NULL REFERENCES core_clients(id),
    role TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, client_id)
);

-- User-Organization Relationships
CREATE TABLE IF NOT EXISTS user_organizations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES core_users(id),
    organization_id TEXT NOT NULL REFERENCES core_organizations(id),
    role TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- ============================================================================
-- STEP 3: UNIVERSAL TRANSACTIONS (Optional - for Order Management)
-- ============================================================================

-- Universal Transactions Table
CREATE TABLE IF NOT EXISTS universal_transactions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES core_organizations(id),
    transaction_type TEXT NOT NULL,
    transaction_number TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    total_amount DECIMAL(10,2),
    currency TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Universal Transaction Lines
CREATE TABLE IF NOT EXISTS universal_transaction_lines (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL REFERENCES universal_transactions(id),
    entity_id TEXT REFERENCES core_entities(id),
    line_description TEXT,
    quantity DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    line_amount DECIMAL(10,2),
    line_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: INDEXES FOR PERFORMANCE
-- ============================================================================

-- Core Clients Indexes
CREATE INDEX IF NOT EXISTS idx_core_clients_code ON core_clients(client_code);
CREATE INDEX IF NOT EXISTS idx_core_clients_type ON core_clients(client_type);
CREATE INDEX IF NOT EXISTS idx_core_clients_active ON core_clients(is_active);

-- Core Organizations Indexes
CREATE INDEX IF NOT EXISTS idx_core_organizations_client ON core_organizations(client_id);
CREATE INDEX IF NOT EXISTS idx_core_organizations_code ON core_organizations(org_code);
CREATE INDEX IF NOT EXISTS idx_core_organizations_active ON core_organizations(is_active);

-- Core Entities Indexes
CREATE INDEX IF NOT EXISTS idx_core_entities_org ON core_entities(organization_id);
CREATE INDEX IF NOT EXISTS idx_core_entities_type ON core_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_core_entities_active ON core_entities(is_active);
CREATE INDEX IF NOT EXISTS idx_core_entities_code ON core_entities(entity_code);

-- Core Dynamic Data Indexes
CREATE INDEX IF NOT EXISTS idx_core_dynamic_data_entity ON core_dynamic_data(entity_id);
CREATE INDEX IF NOT EXISTS idx_core_dynamic_data_field ON core_dynamic_data(field_name);
CREATE INDEX IF NOT EXISTS idx_core_dynamic_data_type ON core_dynamic_data(field_type);

-- Core Metadata Indexes
CREATE INDEX IF NOT EXISTS idx_core_metadata_org ON core_metadata(organization_id);
CREATE INDEX IF NOT EXISTS idx_core_metadata_entity ON core_metadata(entity_id);
CREATE INDEX IF NOT EXISTS idx_core_metadata_type ON core_metadata(metadata_type);

-- User Management Indexes
CREATE INDEX IF NOT EXISTS idx_core_users_email ON core_users(email);
CREATE INDEX IF NOT EXISTS idx_core_users_auth ON core_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_clients_user ON user_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_user_clients_client ON user_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_user ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org ON user_organizations(organization_id);

-- Universal Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_universal_transactions_org ON universal_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_universal_transactions_type ON universal_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_universal_transactions_status ON universal_transactions(status);
CREATE INDEX IF NOT EXISTS idx_universal_transactions_date ON universal_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_universal_transaction_lines_transaction ON universal_transaction_lines(transaction_id);

-- ============================================================================
-- STEP 5: ROW LEVEL SECURITY (RLS) - BASIC SETUP
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE core_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_dynamic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE universal_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE universal_transaction_lines ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Allow all for now - customize later)
CREATE POLICY "Allow all operations for authenticated users" ON core_clients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON core_organizations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON core_entities
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON core_dynamic_data
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON core_metadata
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON core_users
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON user_clients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON user_organizations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON universal_transactions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON universal_transaction_lines
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- STEP 6: UPDATED_AT TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_core_clients_updated_at BEFORE UPDATE ON core_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_core_organizations_updated_at BEFORE UPDATE ON core_organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_core_entities_updated_at BEFORE UPDATE ON core_entities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_core_dynamic_data_updated_at BEFORE UPDATE ON core_dynamic_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_core_metadata_updated_at BEFORE UPDATE ON core_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_core_users_updated_at BEFORE UPDATE ON core_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_universal_transactions_updated_at BEFORE UPDATE ON universal_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_universal_transaction_lines_updated_at BEFORE UPDATE ON universal_transaction_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Insert a test record to verify everything works
INSERT INTO core_clients (
    id, 
    client_name, 
    client_code, 
    client_type, 
    is_active
) VALUES (
    'test-client-001', 
    'HERA Test Client', 
    'TEST-CLIENT', 
    'test', 
    true
) ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'HERA Universal Database Structure created successfully!';
    RAISE NOTICE 'Tables created: core_clients, core_organizations, core_entities, core_dynamic_data, core_metadata, core_users, user_clients, user_organizations, universal_transactions, universal_transaction_lines';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'Row Level Security enabled';
    RAISE NOTICE 'Updated_at triggers configured';
    RAISE NOTICE 'Test client record inserted';
    RAISE NOTICE 'Ready for restaurant setup!';
END $$;