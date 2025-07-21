-- Update HERA Chart of Accounts to New 7-Category Structure
-- Splits expenses into: Cost of Sales, Direct Expense, Indirect Expense, Tax, Extraordinary

-- Update account type definitions
UPDATE core_dynamic_data 
SET field_value = 'COST_OF_SALES'
WHERE field_name = 'account_type' 
  AND entity_id IN (
    SELECT id FROM core_entities 
    WHERE entity_code LIKE '5%' 
      AND entity_name LIKE '%Cost%' 
      OR entity_name LIKE '%COGS%'
      OR entity_name LIKE '%Material%'
  );

-- Update account type for direct expenses (rent, utilities, salaries)
UPDATE core_dynamic_data 
SET field_value = 'DIRECT_EXPENSE'  
WHERE field_name = 'account_type'
  AND entity_id IN (
    SELECT id FROM core_entities
    WHERE entity_name IN (
      'Staff Salaries - Kitchen',
      'Staff Salaries - Service', 
      'Rent Expense',
      'Electricity Expense',
      'Gas Expense',
      'Water Expense'
    )
  );

-- Update account type for indirect expenses (marketing, insurance, depreciation)
UPDATE core_dynamic_data
SET field_value = 'INDIRECT_EXPENSE'
WHERE field_name = 'account_type' 
  AND entity_id IN (
    SELECT id FROM core_entities
    WHERE entity_name IN (
      'Marketing Expense',
      'Insurance Expense', 
      'Depreciation Expense',
      'Miscellaneous Expenses',
      'Professional Fees'
    )
  );

-- Update account type for tax expenses
UPDATE core_dynamic_data
SET field_value = 'TAX_EXPENSE'
WHERE field_name = 'account_type'
  AND entity_id IN (
    SELECT id FROM core_entities  
    WHERE entity_name LIKE '%Tax%'
      AND entity_name NOT LIKE '%Input%'
      AND entity_name NOT LIKE '%Credit%'
  );

-- Add new account categories to schema registry
INSERT INTO ai_schema_registry (
  id,
  organization_id,
  schema_name,
  schema_type,
  schema_definition,
  ai_confidence,
  is_active
) VALUES (
  gen_random_uuid(),
  '123e4567-e89b-12d3-a456-426614174000',
  'Updated Chart of Accounts Categories',
  'coa_categories',
  '{
    "categories": [
      {
        "code": "1",
        "name": "Assets",
        "range": "1000000-1999999",
        "description": "Bank accounts, inventory, equipment, receivables"
      },
      {
        "code": "2", 
        "name": "Liabilities",
        "range": "2000000-2999999",
        "description": "Creditors, loans, accrued expenses, tax payables"
      },
      {
        "code": "3",
        "name": "Equity", 
        "range": "3000000-3999999",
        "description": "Owner equity, retained earnings, capital contributions"
      },
      {
        "code": "4",
        "name": "Revenue",
        "range": "4000000-4999999", 
        "description": "Food sales, beverage sales, delivery income, other revenue"
      },
      {
        "code": "5",
        "name": "Cost of Sales",
        "range": "5000000-5999999",
        "description": "Direct costs: food materials, beverage costs, packaging"
      },
      {
        "code": "6", 
        "name": "Direct Expenses",
        "range": "6000000-6999999",
        "description": "Operational expenses: staff salaries, rent, utilities"  
      },
      {
        "code": "7",
        "name": "Indirect Expenses", 
        "range": "7000000-7999999",
        "description": "Administrative: marketing, insurance, depreciation, professional fees"
      },
      {
        "code": "8",
        "name": "Tax Expenses",
        "range": "8000000-8999999", 
        "description": "Income tax, professional tax, other tax expenses"
      },
      {
        "code": "9",
        "name": "Extraordinary Expenses",
        "range": "9000000-9999999",
        "description": "One-time, unusual, or exceptional expenses"
      }
    ]
  }'::jsonb,
  95,
  true
);

-- Create sample accounts for each new category using Mario's restaurant

-- Cost of Sales Accounts (5000000 range)
INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active)
VALUES 
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Food Materials - Vegetables', '5001000', true),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Food Materials - Spices', '5002000', true),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Beverage Costs - Soft Drinks', '5003000', true),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Packaging Materials', '5004000', true);

-- Direct Expenses Accounts (6000000 range) 
INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active)
VALUES
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Kitchen Staff Salaries', '6001000', true),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Service Staff Salaries', '6002000', true), 
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Restaurant Rent', '6003000', true),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Electricity Bills', '6004000', true),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Gas Cylinder Expenses', '6005000', true);

-- Indirect Expenses Accounts (7000000 range)
INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active) 
VALUES
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Marketing & Advertising', '7001000', true),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Insurance Premiums', '7002000', true),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Equipment Depreciation', '7003000', true),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Professional Fees', '7004000', true),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Office Supplies', '7005000', true);

-- Tax Expenses Accounts (8000000 range)
INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active)
VALUES
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Income Tax Expense', '8001000', true),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Professional Tax', '8002000', true),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Property Tax', '8003000', true);

-- Extraordinary Expenses Accounts (9000000 range)  
INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active)
VALUES
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Legal Settlement Costs', '9001000', true),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Asset Write-off Losses', '9002000', true),
  (gen_random_uuid(), '123e4567-e89b-12d3-a456-426614174000', 'chart_of_account', 'Pandemic Relief Expenses', '9003000', true);

-- Add account type classifications for all new accounts
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type)
SELECT 
  ce.id,
  'account_type',
  CASE 
    WHEN ce.entity_code LIKE '5%' THEN 'COST_OF_SALES'
    WHEN ce.entity_code LIKE '6%' THEN 'DIRECT_EXPENSE' 
    WHEN ce.entity_code LIKE '7%' THEN 'INDIRECT_EXPENSE'
    WHEN ce.entity_code LIKE '8%' THEN 'TAX_EXPENSE'
    WHEN ce.entity_code LIKE '9%' THEN 'EXTRAORDINARY_EXPENSE'
  END,
  'text'
FROM core_entities ce
WHERE ce.entity_type = 'chart_of_account'
  AND ce.entity_code ~ '^[5-9][0-9]{6}$'
  AND ce.organization_id = '123e4567-e89b-12d3-a456-426614174000';

-- Add posting allowed flag for all detail accounts
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type)
SELECT 
  ce.id,
  'posting_allowed', 
  'true',
  'text'
FROM core_entities ce  
WHERE ce.entity_type = 'chart_of_account'
  AND ce.entity_code ~ '^[1-9][0-9]{6}$'
  AND ce.organization_id = '123e4567-e89b-12d3-a456-426614174000';

-- Update AI function to recognize new account types
CREATE OR REPLACE FUNCTION generate_intelligent_account_code_v2(
    p_organization_id UUID,
    p_account_type TEXT,
    p_account_name TEXT
) RETURNS JSON AS $$
DECLARE
    result JSON;
    suggested_code VARCHAR(20);
    base_code INTEGER;
    sequence_num INTEGER;
    existing_codes INTEGER[];
BEGIN
    -- Determine base code based on NEW account type structure
    base_code := CASE p_account_type
        WHEN 'ASSET' THEN 1000000
        WHEN 'LIABILITY' THEN 2000000
        WHEN 'EQUITY' THEN 3000000
        WHEN 'REVENUE' THEN 4000000
        WHEN 'COST_OF_SALES' THEN 5000000
        WHEN 'DIRECT_EXPENSE' THEN 6000000
        WHEN 'INDIRECT_EXPENSE' THEN 7000000
        WHEN 'TAX_EXPENSE' THEN 8000000
        WHEN 'EXTRAORDINARY_EXPENSE' THEN 9000000
        ELSE 9999000
    END;

    -- Get existing codes in this range
    SELECT ARRAY(
        SELECT CAST(entity_code AS INTEGER)
        FROM core_entities
        WHERE organization_id = p_organization_id
          AND entity_type = 'chart_of_account'
          AND entity_code ~ '^[0-9]+$'
          AND CAST(entity_code AS INTEGER) BETWEEN base_code AND base_code + 999999
        ORDER BY CAST(entity_code AS INTEGER)
    ) INTO existing_codes;

    -- Find next available sequence (increments of 1000)
    sequence_num := 1;
    WHILE (base_code + (sequence_num * 1000)) = ANY(existing_codes) LOOP
        sequence_num := sequence_num + 1;
    END LOOP;

    suggested_code := (base_code + (sequence_num * 1000))::TEXT;

    -- Generate result with new category information
    result := json_build_object(
        'suggested_code', suggested_code,
        'account_type', p_account_type,
        'base_code', base_code,
        'sequence_number', sequence_num,
        'category_info', CASE p_account_type
            WHEN 'COST_OF_SALES' THEN 'Direct costs of goods sold'
            WHEN 'DIRECT_EXPENSE' THEN 'Operational expenses'
            WHEN 'INDIRECT_EXPENSE' THEN 'Administrative expenses'
            WHEN 'TAX_EXPENSE' THEN 'Tax-related expenses'
            WHEN 'EXTRAORDINARY_EXPENSE' THEN 'Unusual/one-time expenses'
            ELSE 'Standard account category'
        END,
        'naming_suggestions', json_build_array(
            p_account_name,
            INITCAP(p_account_name),
            UPPER(REPLACE(p_account_name, ' ', '_'))
        ),
        'confidence', 94,
        'reasoning', 'Based on new 7-category COA structure with expense breakdown'
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;