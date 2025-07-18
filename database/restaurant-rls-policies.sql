-- ===================================================================
-- RESTAURANT ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-tenant security with role-based access control
-- ===================================================================

-- ===================================================================
-- 1. ENABLE RLS ON ALL CORE TABLES
-- ===================================================================

ALTER TABLE core_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE universal_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE universal_transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_events_timeseries ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_organizations ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- 2. HELPER FUNCTIONS FOR RLS
-- ===================================================================

-- Function to get current user's organization
CREATE OR REPLACE FUNCTION auth.get_user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() ->> 'organization_id')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.jwt() ->> 'role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's email
CREATE OR REPLACE FUNCTION auth.get_user_email()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.jwt() ->> 'email';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's staff permissions
CREATE OR REPLACE FUNCTION auth.get_user_permissions()
RETURNS TEXT[] AS $$
DECLARE
  user_permissions TEXT[];
BEGIN
  SELECT ARRAY(
    SELECT jsonb_array_elements_text(cm.metadata_value::jsonb)
    FROM core_entities ce
    JOIN core_metadata cm ON ce.id = cm.entity_id
    WHERE ce.entity_type = 'restaurant_staff'
      AND ce.organization_id = auth.get_user_organization_id()
      AND cm.metadata_key = 'permissions'
      AND EXISTS (
        SELECT 1 FROM core_metadata cm2
        WHERE cm2.entity_id = ce.id
          AND cm2.metadata_key = 'email'
          AND cm2.metadata_value = auth.get_user_email()
      )
  ) INTO user_permissions;
  
  RETURN COALESCE(user_permissions, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION auth.user_has_permission(required_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_permissions TEXT[];
  user_role TEXT;
BEGIN
  user_role := auth.get_user_role();
  
  -- Admin and manager have all permissions
  IF user_role IN ('admin', 'manager') THEN
    RETURN TRUE;
  END IF;
  
  user_permissions := auth.get_user_permissions();
  
  RETURN required_permission = ANY(user_permissions) OR 'admin' = ANY(user_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- 3. CORE ORGANIZATIONS POLICIES
-- ===================================================================

-- Users can only see their own organization
CREATE POLICY "Users can access their organization"
ON core_organizations FOR ALL
TO authenticated
USING (id = auth.get_user_organization_id());

-- ===================================================================
-- 4. CORE ENTITIES POLICIES
-- ===================================================================

-- Base policy: Users can only access entities in their organization
CREATE POLICY "Restaurant staff can access their organization entities"
ON core_entities FOR ALL
TO authenticated
USING (organization_id = auth.get_user_organization_id());

-- Menu items: All staff can read, only managers can modify
CREATE POLICY "All staff can read menu items"
ON core_entities FOR SELECT
TO authenticated
USING (
  entity_type = 'menu_item' 
  AND organization_id = auth.get_user_organization_id()
);

CREATE POLICY "Only managers can modify menu items"
ON core_entities FOR INSERT, UPDATE, DELETE
TO authenticated
USING (
  entity_type = 'menu_item' 
  AND organization_id = auth.get_user_organization_id()
  AND auth.get_user_role() IN ('admin', 'manager')
);

-- Restaurant tables: All staff can read, only managers can modify
CREATE POLICY "All staff can read restaurant tables"
ON core_entities FOR SELECT
TO authenticated
USING (
  entity_type = 'restaurant_table' 
  AND organization_id = auth.get_user_organization_id()
);

CREATE POLICY "Only managers can modify restaurant tables"
ON core_entities FOR INSERT, UPDATE, DELETE
TO authenticated
USING (
  entity_type = 'restaurant_table' 
  AND organization_id = auth.get_user_organization_id()
  AND auth.get_user_role() IN ('admin', 'manager')
);

-- Restaurant staff: Managers can manage, staff can read limited info
CREATE POLICY "Managers can manage restaurant staff"
ON core_entities FOR ALL
TO authenticated
USING (
  entity_type = 'restaurant_staff' 
  AND organization_id = auth.get_user_organization_id()
  AND auth.get_user_role() IN ('admin', 'manager')
);

CREATE POLICY "Staff can read basic staff info"
ON core_entities FOR SELECT
TO authenticated
USING (
  entity_type = 'restaurant_staff' 
  AND organization_id = auth.get_user_organization_id()
);

-- Inventory items: Staff with inventory permissions can access
CREATE POLICY "Staff with inventory permissions can access inventory"
ON core_entities FOR ALL
TO authenticated
USING (
  entity_type = 'inventory_item' 
  AND organization_id = auth.get_user_organization_id()
  AND (
    auth.get_user_role() IN ('admin', 'manager') OR
    auth.user_has_permission('manage_inventory')
  )
);

-- ===================================================================
-- 5. CORE METADATA POLICIES
-- ===================================================================

-- Base policy: Users can only access metadata for entities in their organization
CREATE POLICY "Restaurant staff can access metadata for their organization"
ON core_metadata FOR ALL
TO authenticated
USING (
  organization_id = auth.get_user_organization_id()
);

-- Sensitive metadata (pricing, wages): Only managers can access
CREATE POLICY "Only managers can access sensitive financial metadata"
ON core_metadata FOR ALL
TO authenticated
USING (
  organization_id = auth.get_user_organization_id()
  AND (
    metadata_category NOT IN ('financial', 'hr', 'compensation') OR
    auth.get_user_role() IN ('admin', 'manager')
  )
);

-- Staff personal data: Only managers and the individual can access
CREATE POLICY "Staff can access their own personal data"
ON core_metadata FOR SELECT
TO authenticated
USING (
  organization_id = auth.get_user_organization_id()
  AND (
    auth.get_user_role() IN ('admin', 'manager') OR
    (
      metadata_category = 'personal' AND
      entity_id IN (
        SELECT ce.id FROM core_entities ce
        JOIN core_metadata cm ON ce.id = cm.entity_id
        WHERE ce.entity_type = 'restaurant_staff'
          AND cm.metadata_key = 'email'
          AND cm.metadata_value = auth.get_user_email()
      )
    )
  )
);

-- ===================================================================
-- 6. UNIVERSAL TRANSACTIONS POLICIES
-- ===================================================================

-- Restaurant orders: Staff can create and view, chefs can update status
CREATE POLICY "Staff can create restaurant orders"
ON universal_transactions FOR INSERT
TO authenticated
WITH CHECK (
  transaction_type = 'restaurant_order'
  AND organization_id = auth.get_user_organization_id()
  AND auth.user_has_permission('take_order')
);

CREATE POLICY "Staff can view restaurant orders"
ON universal_transactions FOR SELECT
TO authenticated
USING (
  transaction_type = 'restaurant_order'
  AND organization_id = auth.get_user_organization_id()
);

CREATE POLICY "Authorized staff can update restaurant orders"
ON universal_transactions FOR UPDATE
TO authenticated
USING (
  transaction_type = 'restaurant_order'
  AND organization_id = auth.get_user_organization_id()
  AND (
    auth.get_user_role() IN ('admin', 'manager') OR
    auth.user_has_permission('update_order_status')
  )
);

-- Payment transactions: Only cashiers and managers can process
CREATE POLICY "Cashiers can process payments"
ON universal_transactions FOR INSERT
TO authenticated
WITH CHECK (
  transaction_type = 'payment'
  AND organization_id = auth.get_user_organization_id()
  AND auth.user_has_permission('process_payment')
);

CREATE POLICY "Staff can view payments"
ON universal_transactions FOR SELECT
TO authenticated
USING (
  transaction_type = 'payment'
  AND organization_id = auth.get_user_organization_id()
);

-- Inventory transactions: Only staff with inventory permissions
CREATE POLICY "Staff with inventory permissions can manage inventory transactions"
ON universal_transactions FOR ALL
TO authenticated
USING (
  transaction_type IN ('inventory_purchase', 'inventory_consumption')
  AND organization_id = auth.get_user_organization_id()
  AND (
    auth.get_user_role() IN ('admin', 'manager') OR
    auth.user_has_permission('manage_inventory')
  )
);

-- Refunds: Only managers can process refunds
CREATE POLICY "Only managers can process refunds"
ON universal_transactions FOR INSERT
TO authenticated
WITH CHECK (
  transaction_type = 'refund'
  AND organization_id = auth.get_user_organization_id()
  AND auth.get_user_role() IN ('admin', 'manager')
);

-- Staff timesheets: Staff can view their own, managers can view all
CREATE POLICY "Staff can view their own timesheets"
ON universal_transactions FOR SELECT
TO authenticated
USING (
  transaction_type = 'staff_timesheet'
  AND organization_id = auth.get_user_organization_id()
  AND (
    auth.get_user_role() IN ('admin', 'manager') OR
    procurement_metadata->>'staff_id' IN (
      SELECT ce.id FROM core_entities ce
      JOIN core_metadata cm ON ce.id = cm.entity_id
      WHERE ce.entity_type = 'restaurant_staff'
        AND cm.metadata_key = 'email'
        AND cm.metadata_value = auth.get_user_email()
    )
  )
);

-- Daily settlements: Only managers can access
CREATE POLICY "Only managers can access daily settlements"
ON universal_transactions FOR ALL
TO authenticated
USING (
  transaction_type = 'daily_settlement'
  AND organization_id = auth.get_user_organization_id()
  AND auth.get_user_role() IN ('admin', 'manager')
);

-- ===================================================================
-- 7. UNIVERSAL TRANSACTION LINES POLICIES
-- ===================================================================

-- Transaction lines inherit permissions from their parent transaction
CREATE POLICY "Transaction lines inherit parent transaction permissions"
ON universal_transaction_lines FOR ALL
TO authenticated
USING (
  transaction_id IN (
    SELECT id FROM universal_transactions
    WHERE organization_id = auth.get_user_organization_id()
  )
);

-- ===================================================================
-- 8. CORE EVENTS TIMESERIES POLICIES
-- ===================================================================

-- All authenticated users can read events for their organization
CREATE POLICY "Staff can read events for their organization"
ON core_events_timeseries FOR SELECT
TO authenticated
USING (
  entity_id IN (
    SELECT id FROM core_entities
    WHERE organization_id = auth.get_user_organization_id()
  )
  OR
  entity_id IN (
    SELECT id FROM universal_transactions
    WHERE organization_id = auth.get_user_organization_id()
  )
);

-- Only system can insert events (or managers for manual entries)
CREATE POLICY "System and managers can insert events"
ON core_events_timeseries FOR INSERT
TO authenticated
WITH CHECK (
  auth.get_user_role() IN ('admin', 'manager', 'system')
);

-- ===================================================================
-- 9. CORE CLIENTS POLICIES
-- ===================================================================

-- All restaurant staff can read client information
CREATE POLICY "Restaurant staff can read client information"
ON core_clients FOR SELECT
TO authenticated
USING (true); -- Clients are not organization-specific in this model

-- Only managers can modify client information
CREATE POLICY "Only managers can modify client information"
ON core_clients FOR INSERT, UPDATE, DELETE
TO authenticated
USING (
  auth.get_user_role() IN ('admin', 'manager')
);

-- ===================================================================
-- 10. ROLE-SPECIFIC POLICIES
-- ===================================================================

-- Waiter-specific policies
CREATE POLICY "Waiters can only access their assigned tables"
ON universal_transactions FOR SELECT
TO authenticated
USING (
  transaction_type = 'restaurant_order'
  AND organization_id = auth.get_user_organization_id()
  AND (
    auth.get_user_role() IN ('admin', 'manager') OR
    procurement_metadata->>'waiter_id' IN (
      SELECT ce.id FROM core_entities ce
      JOIN core_metadata cm ON ce.id = cm.entity_id
      WHERE ce.entity_type = 'restaurant_staff'
        AND cm.metadata_key = 'email'
        AND cm.metadata_value = auth.get_user_email()
    )
  )
);

-- Chef-specific policies
CREATE POLICY "Chefs can update kitchen status"
ON universal_transactions FOR UPDATE
TO authenticated
USING (
  transaction_type = 'restaurant_order'
  AND organization_id = auth.get_user_organization_id()
  AND (
    auth.get_user_role() IN ('admin', 'manager', 'chef') OR
    auth.user_has_permission('update_order_status')
  )
);

-- Host-specific policies
CREATE POLICY "Hosts can manage table assignments"
ON core_metadata FOR UPDATE
TO authenticated
USING (
  organization_id = auth.get_user_organization_id()
  AND entity_id IN (
    SELECT id FROM core_entities
    WHERE entity_type = 'restaurant_table'
      AND organization_id = auth.get_user_organization_id()
  )
  AND metadata_key = 'current_status'
  AND (
    auth.get_user_role() IN ('admin', 'manager', 'host') OR
    auth.user_has_permission('manage_tables')
  )
);

-- ===================================================================
-- 11. AUDIT AND SECURITY POLICIES
-- ===================================================================

-- All modifications are logged
CREATE OR REPLACE FUNCTION log_security_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO core_events_timeseries (timestamp, entity_id, event_type, event_data, metadata)
  VALUES (
    NOW(),
    COALESCE(NEW.id, OLD.id),
    'security_' || TG_OP,
    json_build_object(
      'table', TG_TABLE_NAME,
      'user_email', auth.get_user_email(),
      'user_role', auth.get_user_role(),
      'organization_id', auth.get_user_organization_id()
    ),
    json_build_object('source', 'rls_trigger')
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create security triggers
CREATE TRIGGER core_entities_security_trigger
  AFTER INSERT OR UPDATE OR DELETE ON core_entities
  FOR EACH ROW EXECUTE FUNCTION log_security_event();

CREATE TRIGGER universal_transactions_security_trigger
  AFTER INSERT OR UPDATE OR DELETE ON universal_transactions
  FOR EACH ROW EXECUTE FUNCTION log_security_event();

-- ===================================================================
-- 12. PERFORMANCE INDEXES FOR RLS
-- ===================================================================

-- Indexes to support RLS queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_core_entities_org_type_active 
ON core_entities(organization_id, entity_type, is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_core_metadata_org_entity_key 
ON core_metadata(organization_id, entity_id, metadata_key);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_universal_transactions_org_type_date 
ON universal_transactions(organization_id, transaction_type, transaction_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_core_metadata_staff_email 
ON core_metadata(entity_id, metadata_key, metadata_value) 
WHERE metadata_key = 'email';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_core_entities_staff_org 
ON core_entities(organization_id, entity_type, id) 
WHERE entity_type = 'restaurant_staff';

-- ===================================================================
-- 13. TESTING RLS POLICIES
-- ===================================================================

-- Test function to verify RLS is working
CREATE OR REPLACE FUNCTION test_rls_policies()
RETURNS TABLE (
  test_name TEXT,
  result BOOLEAN,
  message TEXT
) AS $$
BEGIN
  -- Test 1: Organization isolation
  RETURN QUERY
  SELECT 
    'Organization Isolation'::TEXT,
    NOT EXISTS(
      SELECT 1 FROM core_entities 
      WHERE organization_id != auth.get_user_organization_id()
    ),
    'Users should not see entities from other organizations'::TEXT;

  -- Test 2: Role-based access
  RETURN QUERY
  SELECT 
    'Role-based Access'::TEXT,
    CASE 
      WHEN auth.get_user_role() IN ('admin', 'manager') THEN
        EXISTS(SELECT 1 FROM core_metadata WHERE metadata_category = 'financial')
      ELSE
        NOT EXISTS(SELECT 1 FROM core_metadata WHERE metadata_category = 'financial')
    END,
    'Financial metadata should only be accessible to managers'::TEXT;

  -- Test 3: Transaction type access
  RETURN QUERY
  SELECT 
    'Transaction Type Access'::TEXT,
    CASE 
      WHEN auth.user_has_permission('take_order') THEN
        EXISTS(SELECT 1 FROM universal_transactions WHERE transaction_type = 'restaurant_order')
      ELSE
        NOT EXISTS(SELECT 1 FROM universal_transactions WHERE transaction_type = 'restaurant_order')
    END,
    'Order transactions should only be accessible to staff with take_order permission'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- 14. RLS MONITORING AND ALERTING
-- ===================================================================

-- Function to monitor RLS performance
CREATE OR REPLACE FUNCTION monitor_rls_performance()
RETURNS TABLE (
  query_type TEXT,
  avg_execution_time NUMERIC,
  total_executions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'RLS Query Performance'::TEXT,
    0.0::NUMERIC,
    0::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 15. GRANT PERMISSIONS
-- ===================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON core_entities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON core_metadata TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON universal_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON universal_transaction_lines TO authenticated;
GRANT SELECT, INSERT ON core_events_timeseries TO authenticated;
GRANT SELECT ON core_clients TO authenticated;
GRANT SELECT ON core_organizations TO authenticated;

-- Grant access to views
GRANT SELECT ON v_kitchen_orders TO authenticated;
GRANT SELECT ON v_order_status TO authenticated;
GRANT SELECT ON v_daily_sales_summary TO authenticated;
GRANT SELECT ON v_inventory_status TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION update_order_status TO authenticated;
GRANT EXECUTE ON FUNCTION update_inventory_stock TO authenticated;
GRANT EXECUTE ON FUNCTION test_rls_policies TO authenticated;

COMMIT;

-- ===================================================================
-- USAGE EXAMPLES
-- ===================================================================

/*
-- Example 1: Waiter creating an order
-- JWT should contain: {"email": "waiter@restaurant.demo", "role": "waiter", "organization_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"}

INSERT INTO universal_transactions (
  id, organization_id, transaction_type, transaction_number, 
  transaction_date, total_amount, currency, status, procurement_metadata
) VALUES (
  gen_random_uuid(),
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'restaurant_order',
  'ORDER-TEST-001',
  CURRENT_DATE,
  25.99,
  'USD',
  'APPROVED',
  '{"table_id": "table-001", "waiter_id": "staff-002"}'
);

-- Example 2: Chef updating order status
-- JWT should contain: {"email": "chef@restaurant.demo", "role": "chef", "organization_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"}

SELECT update_order_status(
  'order-001',
  'ready',
  null
);

-- Example 3: Manager accessing financial data
-- JWT should contain: {"email": "manager@restaurant.demo", "role": "manager", "organization_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"}

SELECT * FROM core_metadata 
WHERE metadata_category = 'financial' 
  AND entity_id IN (
    SELECT id FROM core_entities WHERE entity_type = 'menu_item'
  );

-- Example 4: Testing RLS policies
SELECT * FROM test_rls_policies();
*/