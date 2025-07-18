-- HERA Universal Transaction Tables Setup
-- Run this in Supabase SQL Editor to create the universal transaction schema

-- 1. Create universal_transactions table
CREATE TABLE IF NOT EXISTS universal_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    transaction_type TEXT NOT NULL,
    transaction_number TEXT NOT NULL UNIQUE,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create universal_transaction_lines table
CREATE TABLE IF NOT EXISTS universal_transaction_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES universal_transactions(id) ON DELETE CASCADE,
    entity_id UUID,
    line_description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1.000,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    line_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    line_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_universal_transactions_org_id ON universal_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_universal_transactions_type ON universal_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_universal_transactions_status ON universal_transactions(status);
CREATE INDEX IF NOT EXISTS idx_universal_transactions_date ON universal_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_universal_transaction_lines_transaction_id ON universal_transaction_lines(transaction_id);
CREATE INDEX IF NOT EXISTS idx_universal_transaction_lines_entity_id ON universal_transaction_lines(entity_id);

-- 4. Enable Row Level Security
ALTER TABLE universal_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE universal_transaction_lines ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies (adjust as needed for your auth setup)
-- For now, allow all operations - you can restrict this later
CREATE POLICY "Allow all operations on universal_transactions" ON universal_transactions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on universal_transaction_lines" ON universal_transaction_lines
    FOR ALL USING (true) WITH CHECK (true);

-- 6. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for updated_at
CREATE TRIGGER update_universal_transactions_updated_at BEFORE UPDATE ON universal_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_universal_transaction_lines_updated_at BEFORE UPDATE ON universal_transaction_lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Insert sample data to test the system
INSERT INTO universal_transactions (
    id, organization_id, transaction_type, transaction_number, 
    transaction_date, total_amount, currency, status
) VALUES (
    '550e8400-e29b-41d4-a716-446655440050'::uuid, 
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
    'SALES_ORDER', 
    'ORD-20240115-001',
    '2024-01-15', 
    7.75, 
    'USD', 
    'PENDING'
) ON CONFLICT (transaction_number) DO NOTHING;

-- 9. Insert sample order line items
INSERT INTO universal_transaction_lines (
    id, transaction_id, entity_id, line_description, 
    quantity, unit_price, line_amount, line_order
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440060'::uuid, '550e8400-e29b-41d4-a716-446655440050'::uuid, '550e8400-e29b-41d4-a716-446655440030'::uuid, 'Premium Jasmine Green Tea', 1, 4.50, 4.50, 1),
    ('550e8400-e29b-41d4-a716-446655440061'::uuid, '550e8400-e29b-41d4-a716-446655440050'::uuid, '550e8400-e29b-41d4-a716-446655440031'::uuid, 'Fresh Blueberry Scone', 1, 3.25, 3.25, 2)
ON CONFLICT (id) DO NOTHING;

-- 10. Add order context metadata (if core_metadata table exists)
INSERT INTO core_metadata (
    organization_id, entity_type, entity_id, metadata_type, metadata_category,
    metadata_key, metadata_value, is_system_generated, created_by
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
    'transaction', 
    '550e8400-e29b-41d4-a716-446655440050'::uuid, 
    'order_context', 
    'customer_experience',
    'order_details',
    '{
        "customer_id": "John Smith",
        "staff_member": "Mike Johnson",
        "order_time": "2024-01-15T14:30:00Z",
        "table_number": "Table 5",
        "order_channel": "in_store",
        "special_instructions": "Extra hot, no sugar",
        "estimated_prep_time": "7 minutes",
        "customer_mood": "relaxed",
        "weather": "rainy afternoon"
    }'::jsonb,
    false,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
) ON CONFLICT DO NOTHING;

-- 11. Verify tables were created
SELECT 'universal_transactions' as table_name, count(*) as record_count FROM universal_transactions
UNION ALL
SELECT 'universal_transaction_lines' as table_name, count(*) as record_count FROM universal_transaction_lines;

-- 12. Show sample data
SELECT 
    t.transaction_number,
    t.transaction_type,
    t.status,
    t.total_amount,
    t.currency,
    COUNT(l.id) as line_count
FROM universal_transactions t
LEFT JOIN universal_transaction_lines l ON t.id = l.transaction_id
GROUP BY t.id, t.transaction_number, t.transaction_type, t.status, t.total_amount, t.currency
ORDER BY t.created_at DESC;