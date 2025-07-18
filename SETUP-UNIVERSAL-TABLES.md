# Setup Universal Transaction Tables

**IMPORTANT**: Run this SQL in your Supabase SQL Editor to create the universal transaction tables.

## Step 1: Create Tables

```sql
-- Create universal_transactions table
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

-- Create universal_transaction_lines table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_universal_transactions_org_id ON universal_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_universal_transactions_type ON universal_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_universal_transactions_status ON universal_transactions(status);
CREATE INDEX IF NOT EXISTS idx_universal_transaction_lines_transaction_id ON universal_transaction_lines(transaction_id);
```

## Step 2: Enable RLS (Row Level Security)

```sql
-- Enable RLS
ALTER TABLE universal_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE universal_transaction_lines ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (adjust as needed)
CREATE POLICY "Allow all operations on universal_transactions" ON universal_transactions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on universal_transaction_lines" ON universal_transaction_lines
    FOR ALL USING (true) WITH CHECK (true);
```

## Step 3: Test the Setup

After running the above SQL, refresh the orders page at `http://localhost:3004/restaurant/orders` and you should see:

- Today's Orders: 1 (from sample data)
- Revenue: $7.75 (from sample order)
- Sample order: "ORD-20240115-001" with Jasmine Tea and Blueberry Scone

## Step 4: Create New Orders

Click "New Order" and add items to test the system. Orders will now be permanently saved to Supabase!

## Troubleshooting

If you see errors:
1. Check the browser console for specific error messages
2. Verify the tables were created in Supabase Dashboard > Table Editor
3. Ensure RLS policies are created properly
4. Check that your Supabase project has the correct permissions

## Next Steps

Once the tables are created, the system will:
- ✅ Show existing orders from universal_transactions
- ✅ Create new orders permanently in Supabase
- ✅ Update order status in real-time
- ✅ Display correct statistics and totals