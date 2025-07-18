-- ===================================================================
-- RESTAURANT TRANSACTIONS SETUP - Universal Transaction System
-- Following universal_transactions + universal_transaction_lines pattern
-- ===================================================================

-- ===================================================================
-- 1. RESTAURANT ORDER TRANSACTIONS
-- ===================================================================

-- Sample Restaurant Order
INSERT INTO universal_transactions (
  id, 
  organization_id, 
  transaction_type, 
  transaction_number, 
  transaction_date, 
  total_amount, 
  currency, 
  status, 
  transaction_status,
  procurement_metadata,
  created_at, 
  updated_at
) VALUES (
  'order-001',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'restaurant_order',
  'ORDER-001',
  CURRENT_DATE,
  67.97,
  'USD',
  'APPROVED',
  'IN_PROGRESS',
  '{
    "order_type": "dine_in",
    "table_id": "table-001",
    "waiter_id": "staff-002",
    "customer_id": "cust-002",
    "customer_count": 2,
    "special_instructions": "Extra spicy",
    "order_time": "2024-12-08T18:30:00Z",
    "kitchen_status": "preparing",
    "payment_status": "pending",
    "ai_metadata": {
      "confidence_score": 0.95,
      "fraud_risk_score": 0.02,
      "recommendation_used": true,
      "estimated_prep_time": 25
    }
  }',
  NOW(),
  NOW()
),
(
  'order-002',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'restaurant_order',
  'ORDER-002',
  CURRENT_DATE,
  41.98,
  'USD',
  'APPROVED',
  'COMPLETED',
  '{
    "order_type": "takeout",
    "table_id": null,
    "waiter_id": "staff-005",
    "customer_id": "cust-001",
    "customer_count": 1,
    "special_instructions": "",
    "order_time": "2024-12-08T17:45:00Z",
    "kitchen_status": "completed",
    "payment_status": "completed",
    "ai_metadata": {
      "confidence_score": 0.98,
      "fraud_risk_score": 0.01,
      "recommendation_used": false,
      "estimated_prep_time": 15
    }
  }',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Order Line Items
INSERT INTO universal_transaction_lines (
  id,
  transaction_id,
  entity_id,
  line_description,
  quantity,
  unit_price,
  line_amount,
  line_order,
  created_at
) VALUES 
-- Order 001 Line Items
('line-001-1', 'order-001', 'item-001', 'Butter Chicken', 1, 18.99, 18.99, 1, NOW()),
('line-001-2', 'order-001', 'item-002', 'Chicken Biryani', 1, 22.99, 22.99, 2, NOW()),
('line-001-3', 'order-001', 'item-004', 'Samosa (2 pieces)', 2, 5.99, 11.98, 3, NOW()),
('line-001-4', 'order-001', 'item-006', 'Mango Lassi', 2, 6.99, 13.98, 4, NOW()),

-- Order 002 Line Items
('line-002-1', 'order-002', 'item-003', 'Paneer Tikka Masala', 1, 19.99, 19.99, 1, NOW()),
('line-002-2', 'order-002', 'item-005', 'Gulab Jamun', 1, 5.99, 5.99, 2, NOW()),
('line-002-3', 'order-002', 'item-006', 'Mango Lassi', 2, 7.99, 15.98, 3, NOW())
ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- 2. INVENTORY TRANSACTIONS
-- ===================================================================

-- Inventory Purchase Transaction
INSERT INTO universal_transactions (
  id, 
  organization_id, 
  transaction_type, 
  transaction_number, 
  transaction_date, 
  total_amount, 
  currency, 
  status, 
  transaction_status,
  procurement_metadata,
  created_at, 
  updated_at
) VALUES (
  'inv-purchase-001',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'inventory_purchase',
  'INV-PUR-001',
  CURRENT_DATE,
  450.00,
  'USD',
  'APPROVED',
  'COMPLETED',
  '{
    "supplier_id": "ABC Suppliers",
    "purchase_order_number": "PO-2024-001",
    "delivery_date": "2024-12-08",
    "received_by": "staff-001",
    "quality_check_passed": true,
    "storage_location": "main_storage",
    "ai_metadata": {
      "demand_forecast_accuracy": 0.87,
      "optimal_order_quantity": true,
      "supplier_reliability_score": 0.92
    }
  }',
  NOW(),
  NOW()
),
-- Inventory Consumption Transaction (for order preparation)
(
  'inv-consume-001',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'inventory_consumption',
  'INV-CON-001',
  CURRENT_DATE,
  0.00,
  'USD',
  'APPROVED',
  'COMPLETED',
  '{
    "consumption_type": "order_preparation",
    "related_order_id": "order-001",
    "kitchen_staff_id": "staff-003",
    "consumption_time": "2024-12-08T18:45:00Z",
    "waste_amount": 0.0,
    "ai_metadata": {
      "portion_accuracy": 0.95,
      "waste_prediction": 0.02,
      "recipe_adherence": 0.98
    }
  }',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Inventory Purchase Line Items
INSERT INTO universal_transaction_lines (
  id,
  transaction_id,
  entity_id,
  line_description,
  quantity,
  unit_price,
  line_amount,
  line_order,
  created_at
) VALUES 
-- Purchase transaction lines
('inv-line-001-1', 'inv-purchase-001', 'inv-002', 'Basmati Rice - 50kg', 50, 4.50, 225.00, 1, NOW()),
('inv-line-001-2', 'inv-purchase-001', 'inv-003', 'Paneer - 20kg', 20, 8.00, 160.00, 2, NOW()),
('inv-line-001-3', 'inv-purchase-001', 'inv-004', 'Tomatoes - 25kg', 25, 2.60, 65.00, 3, NOW()),

-- Consumption transaction lines
('inv-line-002-1', 'inv-consume-001', 'inv-001', 'Chicken used for Butter Chicken', 0.5, 8.50, 4.25, 1, NOW()),
('inv-line-002-2', 'inv-consume-001', 'inv-002', 'Basmati Rice used for Biryani', 0.3, 4.50, 1.35, 2, NOW()),
('inv-line-002-3', 'inv-consume-001', 'inv-004', 'Tomatoes used for curry', 0.2, 2.60, 0.52, 3, NOW())
ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- 3. PAYMENT TRANSACTIONS
-- ===================================================================

-- Payment Transaction for Order 001
INSERT INTO universal_transactions (
  id, 
  organization_id, 
  transaction_type, 
  transaction_number, 
  transaction_date, 
  total_amount, 
  currency, 
  status, 
  transaction_status,
  procurement_metadata,
  created_at, 
  updated_at
) VALUES (
  'payment-001',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'payment',
  'PAY-001',
  CURRENT_DATE,
  75.00,
  'USD',
  'APPROVED',
  'COMPLETED',
  '{
    "payment_method": "card",
    "related_order_id": "order-001",
    "order_total": 67.97,
    "tax_amount": 5.44,
    "tip_amount": 7.00,
    "payment_processor": "stripe",
    "authorization_code": "auth_12345",
    "processed_by": "staff-002",
    "customer_id": "cust-002",
    "ai_metadata": {
      "fraud_risk_score": 0.01,
      "tip_prediction_accuracy": 0.89,
      "payment_time_optimal": true
    }
  }',
  NOW(),
  NOW()
),
-- Cash Payment Transaction for Order 002
(
  'payment-002',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'payment',
  'PAY-002',
  CURRENT_DATE,
  45.00,
  'USD',
  'APPROVED',
  'COMPLETED',
  '{
    "payment_method": "cash",
    "related_order_id": "order-002",
    "order_total": 41.98,
    "tax_amount": 3.36,
    "tip_amount": 0.00,
    "cash_received": 45.00,
    "change_given": 0.00,
    "processed_by": "staff-005",
    "customer_id": "cust-001",
    "ai_metadata": {
      "fraud_risk_score": 0.00,
      "cash_handling_accuracy": 1.00,
      "drawer_balance_impact": 45.00
    }
  }',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Payment Line Items (for breakdown)
INSERT INTO universal_transaction_lines (
  id,
  transaction_id,
  entity_id,
  line_description,
  quantity,
  unit_price,
  line_amount,
  line_order,
  created_at
) VALUES 
-- Payment 001 breakdown
('pay-line-001-1', 'payment-001', 'order-001', 'Order Total', 1, 67.97, 67.97, 1, NOW()),
('pay-line-001-2', 'payment-001', NULL, 'Tax (8%)', 1, 5.44, 5.44, 2, NOW()),
('pay-line-001-3', 'payment-001', NULL, 'Tip', 1, 7.00, 7.00, 3, NOW()),

-- Payment 002 breakdown
('pay-line-002-1', 'payment-002', 'order-002', 'Order Total', 1, 41.98, 41.98, 1, NOW()),
('pay-line-002-2', 'payment-002', NULL, 'Tax (8%)', 1, 3.36, 3.36, 2, NOW())
ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- 4. STAFF TIMESHEET TRANSACTIONS
-- ===================================================================

-- Staff Timesheet Transaction
INSERT INTO universal_transactions (
  id, 
  organization_id, 
  transaction_type, 
  transaction_number, 
  transaction_date, 
  total_amount, 
  currency, 
  status, 
  transaction_status,
  procurement_metadata,
  created_at, 
  updated_at
) VALUES (
  'timesheet-001',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'staff_timesheet',
  'TS-001',
  CURRENT_DATE,
  124.00,
  'USD',
  'APPROVED',
  'COMPLETED',
  '{
    "staff_id": "staff-002",
    "shift_start": "2024-12-08T16:00:00Z",
    "shift_end": "2024-12-08T24:00:00Z",
    "break_duration": 30,
    "hours_worked": 8.0,
    "hourly_rate": 15.50,
    "overtime_hours": 0.0,
    "tables_served": 12,
    "orders_taken": 8,
    "ai_metadata": {
      "performance_score": 0.92,
      "efficiency_rating": "high",
      "customer_satisfaction": 0.89
    }
  }',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- 5. REFUND TRANSACTIONS
-- ===================================================================

-- Refund Transaction
INSERT INTO universal_transactions (
  id, 
  organization_id, 
  transaction_type, 
  transaction_number, 
  transaction_date, 
  total_amount, 
  currency, 
  status, 
  transaction_status,
  procurement_metadata,
  created_at, 
  updated_at
) VALUES (
  'refund-001',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'refund',
  'REF-001',
  CURRENT_DATE,
  -18.99,
  'USD',
  'APPROVED',
  'COMPLETED',
  '{
    "original_order_id": "order-001",
    "original_payment_id": "payment-001",
    "refund_reason": "customer_complaint",
    "refund_type": "partial",
    "approved_by": "staff-001",
    "refund_method": "card",
    "customer_id": "cust-002",
    "complaint_details": "Dish was too spicy despite no spice level specified",
    "ai_metadata": {
      "refund_legitimacy_score": 0.85,
      "customer_retention_impact": 0.78,
      "process_efficiency": 0.92
    }
  }',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Refund Line Items
INSERT INTO universal_transaction_lines (
  id,
  transaction_id,
  entity_id,
  line_description,
  quantity,
  unit_price,
  line_amount,
  line_order,
  created_at
) VALUES 
('refund-line-001-1', 'refund-001', 'item-001', 'Butter Chicken - Refund', 1, -18.99, -18.99, 1, NOW())
ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- 6. DAILY SETTLEMENT TRANSACTIONS
-- ===================================================================

-- Daily Settlement Transaction
INSERT INTO universal_transactions (
  id, 
  organization_id, 
  transaction_type, 
  transaction_number, 
  transaction_date, 
  total_amount, 
  currency, 
  status, 
  transaction_status,
  procurement_metadata,
  created_at, 
  updated_at
) VALUES (
  'settlement-001',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'daily_settlement',
  'SET-001',
  CURRENT_DATE,
  2847.50,
  'USD',
  'APPROVED',
  'COMPLETED',
  '{
    "settlement_date": "2024-12-08",
    "total_orders": 24,
    "total_revenue": 2847.50,
    "cash_sales": 856.00,
    "card_sales": 1991.50,
    "refunds_total": 45.99,
    "tips_total": 198.50,
    "tax_collected": 227.80,
    "settled_by": "staff-001",
    "discrepancies": 0.00,
    "ai_metadata": {
      "settlement_accuracy": 1.00,
      "anomaly_detection": "none",
      "forecast_vs_actual": 0.94
    }
  }',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- 7. EVENT TRACKING FOR REAL-TIME UPDATES
-- ===================================================================

-- Real-time events for order tracking
INSERT INTO core_events_timeseries (timestamp, entity_id, event_type, event_data, metadata) VALUES
-- Order 001 events
(NOW() - INTERVAL '30 minutes', 'order-001', 'order_created', '{"status": "created", "table": "table-001"}', '{"waiter_id": "staff-002"}'),
(NOW() - INTERVAL '25 minutes', 'order-001', 'order_sent_to_kitchen', '{"status": "in_kitchen", "estimated_time": 20}', '{"chef_id": "staff-003"}'),
(NOW() - INTERVAL '5 minutes', 'order-001', 'order_ready', '{"status": "ready", "ready_time": "2024-12-08T19:25:00Z"}', '{"chef_id": "staff-003"}'),

-- Kitchen events
(NOW() - INTERVAL '20 minutes', 'staff-003', 'kitchen_status_update', '{"active_orders": 3, "avg_prep_time": 18}', '{"shift": "evening"}'),

-- Table events
(NOW() - INTERVAL '45 minutes', 'table-001', 'table_seated', '{"customer_count": 2, "estimated_duration": 60}', '{"host_id": "staff-005"}'),
(NOW() - INTERVAL '5 minutes', 'table-001', 'table_order_ready', '{"order_id": "order-001", "ready_for_service": true}', '{"waiter_id": "staff-002"}'),

-- Inventory events
(NOW() - INTERVAL '2 hours', 'inv-002', 'stock_alert', '{"current_stock": 5, "min_stock": 20, "alert_level": "critical"}', '{"auto_generated": true}'),

-- Payment events
(NOW() - INTERVAL '2 minutes', 'payment-001', 'payment_processed', '{"amount": 75.00, "method": "card", "status": "success"}', '{"processor": "stripe"});

-- ===================================================================
-- 8. VIEWS FOR RESTAURANT OPERATIONS
-- ===================================================================

-- Kitchen Orders View
CREATE OR REPLACE VIEW v_kitchen_orders AS
SELECT 
  ut.id as order_id,
  ut.transaction_number,
  ut.transaction_date,
  ut.procurement_metadata->>'order_time' as order_time,
  ut.procurement_metadata->>'table_id' as table_id,
  ut.procurement_metadata->>'kitchen_status' as kitchen_status,
  ut.procurement_metadata->>'special_instructions' as special_instructions,
  ut.total_amount,
  ut.status,
  ARRAY_AGG(
    json_build_object(
      'item_id', utl.entity_id,
      'item_name', utl.line_description,
      'quantity', utl.quantity,
      'unit_price', utl.unit_price
    ) ORDER BY utl.line_order
  ) as order_items,
  (ut.procurement_metadata->>'ai_metadata'->>'estimated_prep_time')::integer as estimated_prep_time
FROM universal_transactions ut
JOIN universal_transaction_lines utl ON ut.id = utl.transaction_id
WHERE ut.transaction_type = 'restaurant_order'
  AND ut.status IN ('APPROVED', 'IN_PROGRESS')
  AND ut.procurement_metadata->>'kitchen_status' != 'completed'
GROUP BY ut.id, ut.transaction_number, ut.transaction_date, ut.procurement_metadata, ut.total_amount, ut.status
ORDER BY ut.transaction_date ASC;

-- Real-time Order Status View
CREATE OR REPLACE VIEW v_order_status AS
SELECT 
  ut.id as order_id,
  ut.transaction_number,
  ut.procurement_metadata->>'table_id' as table_id,
  ut.procurement_metadata->>'waiter_id' as waiter_id,
  ut.procurement_metadata->>'kitchen_status' as kitchen_status,
  ut.procurement_metadata->>'payment_status' as payment_status,
  ut.total_amount,
  ut.transaction_date,
  ut.status,
  COUNT(utl.id) as item_count,
  CASE 
    WHEN ut.procurement_metadata->>'kitchen_status' = 'completed' AND ut.procurement_metadata->>'payment_status' = 'completed' THEN 'ready_to_close'
    WHEN ut.procurement_metadata->>'kitchen_status' = 'completed' AND ut.procurement_metadata->>'payment_status' = 'pending' THEN 'ready_for_payment'
    WHEN ut.procurement_metadata->>'kitchen_status' = 'preparing' THEN 'in_kitchen'
    ELSE 'pending'
  END as overall_status
FROM universal_transactions ut
JOIN universal_transaction_lines utl ON ut.id = utl.transaction_id
WHERE ut.transaction_type = 'restaurant_order'
  AND ut.transaction_date = CURRENT_DATE
GROUP BY ut.id, ut.transaction_number, ut.procurement_metadata, ut.total_amount, ut.transaction_date, ut.status
ORDER BY ut.transaction_date DESC;

-- Daily Sales Summary View
CREATE OR REPLACE VIEW v_daily_sales_summary AS
SELECT 
  ut.transaction_date,
  COUNT(DISTINCT ut.id) as total_orders,
  SUM(ut.total_amount) as total_revenue,
  AVG(ut.total_amount) as avg_order_value,
  SUM(CASE WHEN ut.procurement_metadata->>'payment_method' = 'cash' THEN ut.total_amount ELSE 0 END) as cash_sales,
  SUM(CASE WHEN ut.procurement_metadata->>'payment_method' = 'card' THEN ut.total_amount ELSE 0 END) as card_sales,
  COUNT(DISTINCT ut.procurement_metadata->>'customer_id') as unique_customers,
  COUNT(DISTINCT ut.procurement_metadata->>'table_id') as tables_served
FROM universal_transactions ut
WHERE ut.transaction_type = 'restaurant_order'
  AND ut.status = 'COMPLETED'
  AND ut.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ut.transaction_date
ORDER BY ut.transaction_date DESC;

-- Inventory Status View
CREATE OR REPLACE VIEW v_inventory_status AS
SELECT 
  ce.id as item_id,
  ce.entity_name as item_name,
  ce.entity_code,
  (SELECT metadata_value FROM core_metadata WHERE entity_id = ce.id AND metadata_key = 'current_stock')::decimal as current_stock,
  (SELECT metadata_value FROM core_metadata WHERE entity_id = ce.id AND metadata_key = 'min_stock')::decimal as min_stock,
  (SELECT metadata_value FROM core_metadata WHERE entity_id = ce.id AND metadata_key = 'max_stock')::decimal as max_stock,
  (SELECT metadata_value FROM core_metadata WHERE entity_id = ce.id AND metadata_key = 'unit') as unit,
  (SELECT metadata_value FROM core_metadata WHERE entity_id = ce.id AND metadata_key = 'cost_per_unit')::decimal as cost_per_unit,
  (SELECT metadata_value FROM core_metadata WHERE entity_id = ce.id AND metadata_key = 'primary_supplier') as supplier,
  CASE 
    WHEN (SELECT metadata_value FROM core_metadata WHERE entity_id = ce.id AND metadata_key = 'current_stock')::decimal <= 
         (SELECT metadata_value FROM core_metadata WHERE entity_id = ce.id AND metadata_key = 'min_stock')::decimal * 0.5 
    THEN 'critical'
    WHEN (SELECT metadata_value FROM core_metadata WHERE entity_id = ce.id AND metadata_key = 'current_stock')::decimal <= 
         (SELECT metadata_value FROM core_metadata WHERE entity_id = ce.id AND metadata_key = 'min_stock')::decimal 
    THEN 'low'
    ELSE 'normal'
  END as stock_status
FROM core_entities ce
WHERE ce.entity_type = 'inventory_item'
  AND ce.is_active = true
  AND ce.organization_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
ORDER BY 
  CASE 
    WHEN (SELECT metadata_value FROM core_metadata WHERE entity_id = ce.id AND metadata_key = 'current_stock')::decimal <= 
         (SELECT metadata_value FROM core_metadata WHERE entity_id = ce.id AND metadata_key = 'min_stock')::decimal * 0.5 
    THEN 1
    WHEN (SELECT metadata_value FROM core_metadata WHERE entity_id = ce.id AND metadata_key = 'current_stock')::decimal <= 
         (SELECT metadata_value FROM core_metadata WHERE entity_id = ce.id AND metadata_key = 'min_stock')::decimal 
    THEN 2
    ELSE 3
  END, ce.entity_name;

-- ===================================================================
-- 9. FUNCTIONS FOR RESTAURANT OPERATIONS
-- ===================================================================

-- Function to update order status
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_kitchen_status TEXT DEFAULT NULL,
  p_payment_status TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  current_metadata JSONB;
  updated_metadata JSONB;
BEGIN
  -- Get current metadata
  SELECT procurement_metadata INTO current_metadata
  FROM universal_transactions
  WHERE id = p_order_id;
  
  -- Update metadata
  updated_metadata := current_metadata;
  
  IF p_kitchen_status IS NOT NULL THEN
    updated_metadata := jsonb_set(updated_metadata, '{kitchen_status}', to_jsonb(p_kitchen_status));
  END IF;
  
  IF p_payment_status IS NOT NULL THEN
    updated_metadata := jsonb_set(updated_metadata, '{payment_status}', to_jsonb(p_payment_status));
  END IF;
  
  -- Update transaction
  UPDATE universal_transactions
  SET procurement_metadata = updated_metadata,
      updated_at = NOW()
  WHERE id = p_order_id;
  
  -- Log event
  INSERT INTO core_events_timeseries (timestamp, entity_id, event_type, event_data, metadata)
  VALUES (NOW(), p_order_id, 'status_update', 
          json_build_object('kitchen_status', p_kitchen_status, 'payment_status', p_payment_status),
          json_build_object('updated_by', 'system'));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to update inventory stock
CREATE OR REPLACE FUNCTION update_inventory_stock(
  p_item_id UUID,
  p_quantity_change DECIMAL,
  p_reason TEXT DEFAULT 'manual_adjustment'
) RETURNS BOOLEAN AS $$
DECLARE
  current_stock DECIMAL;
  new_stock DECIMAL;
BEGIN
  -- Get current stock
  SELECT metadata_value::decimal INTO current_stock
  FROM core_metadata
  WHERE entity_id = p_item_id AND metadata_key = 'current_stock';
  
  -- Calculate new stock
  new_stock := current_stock + p_quantity_change;
  
  -- Update stock
  UPDATE core_metadata
  SET metadata_value = new_stock::text,
      updated_at = NOW()
  WHERE entity_id = p_item_id AND metadata_key = 'current_stock';
  
  -- Log event
  INSERT INTO core_events_timeseries (timestamp, entity_id, event_type, event_data, metadata)
  VALUES (NOW(), p_item_id, 'stock_update', 
          json_build_object('previous_stock', current_stock, 'new_stock', new_stock, 'change', p_quantity_change),
          json_build_object('reason', p_reason));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 10. TRIGGERS FOR REAL-TIME UPDATES
-- ===================================================================

-- Trigger function for order status changes
CREATE OR REPLACE FUNCTION notify_order_change() RETURNS TRIGGER AS $$
BEGIN
  -- Notify about order changes
  PERFORM pg_notify('order_changes', json_build_object(
    'order_id', NEW.id,
    'action', TG_OP,
    'status', NEW.status,
    'metadata', NEW.procurement_metadata
  )::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order changes
DROP TRIGGER IF EXISTS order_change_trigger ON universal_transactions;
CREATE TRIGGER order_change_trigger
  AFTER INSERT OR UPDATE ON universal_transactions
  FOR EACH ROW
  WHEN (NEW.transaction_type = 'restaurant_order')
  EXECUTE FUNCTION notify_order_change();

-- Trigger function for inventory alerts
CREATE OR REPLACE FUNCTION check_inventory_alerts() RETURNS TRIGGER AS $$
DECLARE
  current_stock DECIMAL;
  min_stock DECIMAL;
  item_name TEXT;
BEGIN
  -- Get current and minimum stock
  SELECT metadata_value::decimal INTO current_stock
  FROM core_metadata
  WHERE entity_id = NEW.entity_id AND metadata_key = 'current_stock';
  
  SELECT metadata_value::decimal INTO min_stock
  FROM core_metadata
  WHERE entity_id = NEW.entity_id AND metadata_key = 'min_stock';
  
  SELECT entity_name INTO item_name
  FROM core_entities
  WHERE id = NEW.entity_id;
  
  -- Check if stock is low
  IF current_stock <= min_stock THEN
    PERFORM pg_notify('inventory_alert', json_build_object(
      'item_id', NEW.entity_id,
      'item_name', item_name,
      'current_stock', current_stock,
      'min_stock', min_stock,
      'alert_level', CASE WHEN current_stock <= min_stock * 0.5 THEN 'critical' ELSE 'low' END
    )::text);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory alerts
DROP TRIGGER IF EXISTS inventory_alert_trigger ON core_metadata;
CREATE TRIGGER inventory_alert_trigger
  AFTER UPDATE ON core_metadata
  FOR EACH ROW
  WHEN (NEW.metadata_key = 'current_stock')
  EXECUTE FUNCTION check_inventory_alerts();

COMMIT;