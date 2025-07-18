-- ===================================================================
-- RESTAURANT ENTITIES SETUP - Using Universal Architecture
-- Following core_entities + core_metadata pattern
-- ===================================================================

-- Insert restaurant organization (demo data)
INSERT INTO core_organizations (id, client_id, name, org_code, industry, country, currency, is_active, created_at, updated_at) 
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '550e8400-e29b-41d4-a716-446655440000',
  'First Floor Restaurant',
  'FFR001',
  'restaurant',
  'US',
  'USD',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- 1. MENU MANAGEMENT ENTITIES
-- ===================================================================

-- Menu Categories
INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active, created_at, updated_at) VALUES
('cat-001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_category', 'Appetizers', 'APP', true, NOW(), NOW()),
('cat-002', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_category', 'Main Course', 'MAIN', true, NOW(), NOW()),
('cat-003', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_category', 'Desserts', 'DESS', true, NOW(), NOW()),
('cat-004', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_category', 'Beverages', 'BEV', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Menu Category Metadata
INSERT INTO core_metadata (id, organization_id, entity_type, entity_id, metadata_type, metadata_category, metadata_scope, metadata_key, metadata_value, metadata_value_type, is_system_generated, is_user_editable, is_searchable, is_encrypted, is_active, version, ai_generated, ai_confidence_score, created_at, updated_at) VALUES
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_category', 'cat-001', 'display', 'ui', 'public', 'display_order', '1', 'integer', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_category', 'cat-001', 'display', 'ui', 'public', 'icon', 'appetizer', 'text', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_category', 'cat-002', 'display', 'ui', 'public', 'display_order', '2', 'integer', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_category', 'cat-002', 'display', 'ui', 'public', 'icon', 'main_course', 'text', false, true, false, false, true, 1, false, 0.95, NOW(), NOW());

-- Menu Items
INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active, created_at, updated_at) VALUES
('item-001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'Butter Chicken', 'BTR-CHK', true, NOW(), NOW()),
('item-002', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'Chicken Biryani', 'CHK-BIR', true, NOW(), NOW()),
('item-003', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'Paneer Tikka Masala', 'PNR-TKM', true, NOW(), NOW()),
('item-004', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'Samosa (2 pieces)', 'SAM-2PC', true, NOW(), NOW()),
('item-005', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'Gulab Jamun', 'GUL-JAM', true, NOW(), NOW()),
('item-006', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'Mango Lassi', 'MNG-LAS', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Menu Item Metadata (Pricing, Nutrition, etc.)
INSERT INTO core_metadata (id, organization_id, entity_type, entity_id, metadata_type, metadata_category, metadata_scope, metadata_key, metadata_value, metadata_value_type, is_system_generated, is_user_editable, is_searchable, is_encrypted, is_active, version, ai_generated, ai_confidence_score, created_at, updated_at) VALUES
-- Butter Chicken Metadata
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'item-001', 'pricing', 'financial', 'public', 'price', '18.99', 'decimal', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'item-001', 'pricing', 'financial', 'internal', 'cost', '6.50', 'decimal', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'item-001', 'category', 'classification', 'public', 'category_id', 'cat-002', 'text', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'item-001', 'nutrition', 'health', 'public', 'calories', '650', 'integer', false, true, true, false, true, 1, true, 0.85, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'item-001', 'preparation', 'kitchen', 'internal', 'prep_time_minutes', '20', 'integer', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'item-001', 'dietary', 'health', 'public', 'spice_level', '2', 'integer', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'item-001', 'dietary', 'health', 'public', 'dietary_flags', '["gluten_free", "dairy_contains"]', 'json', false, true, true, false, true, 1, true, 0.90, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'item-001', 'inventory', 'operations', 'internal', 'ingredients', '["chicken", "tomato", "cream", "butter", "spices"]', 'json', false, true, false, false, true, 1, true, 0.88, NOW(), NOW()),

-- Chicken Biryani Metadata
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'item-002', 'pricing', 'financial', 'public', 'price', '22.99', 'decimal', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'item-002', 'pricing', 'financial', 'internal', 'cost', '8.50', 'decimal', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'item-002', 'category', 'classification', 'public', 'category_id', 'cat-002', 'text', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'item-002', 'nutrition', 'health', 'public', 'calories', '780', 'integer', false, true, true, false, true, 1, true, 0.85, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'item-002', 'preparation', 'kitchen', 'internal', 'prep_time_minutes', '35', 'integer', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'menu_item', 'item-002', 'dietary', 'health', 'public', 'spice_level', '3', 'integer', false, true, true, false, true, 1, false, 0.95, NOW(), NOW());

-- ===================================================================
-- 2. TABLE MANAGEMENT ENTITIES
-- ===================================================================

INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active, created_at, updated_at) VALUES
('table-001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'Table 1', 'TBL-001', true, NOW(), NOW()),
('table-002', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'Table 2', 'TBL-002', true, NOW(), NOW()),
('table-003', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'Table 3', 'TBL-003', true, NOW(), NOW()),
('table-004', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'Table 4', 'TBL-004', true, NOW(), NOW()),
('table-005', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'Table 5', 'TBL-005', true, NOW(), NOW()),
('table-006', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'Table 6', 'TBL-006', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Table Metadata
INSERT INTO core_metadata (id, organization_id, entity_type, entity_id, metadata_type, metadata_category, metadata_scope, metadata_key, metadata_value, metadata_value_type, is_system_generated, is_user_editable, is_searchable, is_encrypted, is_active, version, ai_generated, ai_confidence_score, created_at, updated_at) VALUES
-- Table capacities and features
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'table-001', 'capacity', 'operations', 'public', 'seats', '4', 'integer', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'table-001', 'location', 'operations', 'public', 'section', 'main_dining', 'text', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'table-001', 'features', 'operations', 'public', 'features', '["window_view"]', 'json', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'table-001', 'technology', 'operations', 'internal', 'qr_code', 'TBL001-QR', 'text', true, false, false, false, true, 1, false, 0.95, NOW(), NOW()),

(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'table-002', 'capacity', 'operations', 'public', 'seats', '2', 'integer', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'table-002', 'location', 'operations', 'public', 'section', 'main_dining', 'text', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),

(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'table-003', 'capacity', 'operations', 'public', 'seats', '6', 'integer', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'table-003', 'location', 'operations', 'public', 'section', 'patio', 'text', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'table-003', 'features', 'operations', 'public', 'features', '["outdoor", "umbrella"]', 'json', false, true, true, false, true, 1, false, 0.95, NOW(), NOW());

-- ===================================================================
-- 3. STAFF MANAGEMENT ENTITIES
-- ===================================================================

INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active, created_at, updated_at) VALUES
('staff-001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'John Smith (Manager)', 'MGR-001', true, NOW(), NOW()),
('staff-002', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'Sarah Johnson (Waiter)', 'WTR-001', true, NOW(), NOW()),
('staff-003', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'Mike Chen (Chef)', 'CHF-001', true, NOW(), NOW()),
('staff-004', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'Lisa Brown (Cashier)', 'CSH-001', true, NOW(), NOW()),
('staff-005', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'David Wilson (Host)', 'HST-001', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Staff Metadata
INSERT INTO core_metadata (id, organization_id, entity_type, entity_id, metadata_type, metadata_category, metadata_scope, metadata_key, metadata_value, metadata_value_type, is_system_generated, is_user_editable, is_searchable, is_encrypted, is_active, version, ai_generated, ai_confidence_score, created_at, updated_at) VALUES
-- Manager metadata
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'staff-001', 'role', 'hr', 'internal', 'role', 'manager', 'text', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'staff-001', 'contact', 'hr', 'internal', 'email', 'manager@restaurant.demo', 'text', false, true, true, true, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'staff-001', 'permissions', 'security', 'internal', 'permissions', '["manage_staff", "view_reports", "manage_inventory", "process_refunds"]', 'json', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'staff-001', 'compensation', 'hr', 'internal', 'hourly_rate', '25.00', 'decimal', false, true, false, true, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'staff-001', 'schedule', 'operations', 'internal', 'shift_preference', 'full_time', 'text', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),

-- Waiter metadata
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'staff-002', 'role', 'hr', 'internal', 'role', 'waiter', 'text', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'staff-002', 'contact', 'hr', 'internal', 'email', 'waiter@restaurant.demo', 'text', false, true, true, true, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'staff-002', 'permissions', 'security', 'internal', 'permissions', '["take_order", "process_payment", "modify_order"]', 'json', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'staff-002', 'compensation', 'hr', 'internal', 'hourly_rate', '15.50', 'decimal', false, true, false, true, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'staff-002', 'schedule', 'operations', 'internal', 'shift_preference', 'evening', 'text', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),

-- Chef metadata
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'staff-003', 'role', 'hr', 'internal', 'role', 'chef', 'text', false, true, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'staff-003', 'contact', 'hr', 'internal', 'email', 'chef@restaurant.demo', 'text', false, true, true, true, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'staff-003', 'permissions', 'security', 'internal', 'permissions', '["view_orders", "update_order_status", "manage_recipes"]', 'json', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_staff', 'staff-003', 'compensation', 'hr', 'internal', 'hourly_rate', '22.00', 'decimal', false, true, false, true, true, 1, false, 0.95, NOW(), NOW());

-- ===================================================================
-- 4. CUSTOMER ENTITIES (Using core_clients)
-- ===================================================================

INSERT INTO core_clients (id, client_name, client_code, client_type, is_active, created_at, updated_at) VALUES
('cust-001', 'Regular Customer', 'WALK-IN', 'walk_in', true, NOW(), NOW()),
('cust-002', 'John Doe', 'CUST-002', 'registered', true, NOW(), NOW()),
('cust-003', 'Jane Smith', 'CUST-003', 'registered', true, NOW(), NOW()),
('cust-004', 'Food Delivery Platform', 'DELIVERY-001', 'delivery_partner', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Customer Metadata in core_metadata
INSERT INTO core_metadata (id, organization_id, entity_type, entity_id, metadata_type, metadata_category, metadata_scope, metadata_key, metadata_value, metadata_value_type, is_system_generated, is_user_editable, is_searchable, is_encrypted, is_active, version, ai_generated, ai_confidence_score, created_at, updated_at) VALUES
-- Registered customer metadata
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'core_clients', 'cust-002', 'contact', 'customer', 'internal', 'phone', '+1-555-0123', 'text', false, true, true, true, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'core_clients', 'cust-002', 'contact', 'customer', 'internal', 'email', 'john.doe@email.com', 'text', false, true, true, true, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'core_clients', 'cust-002', 'loyalty', 'customer', 'internal', 'points', '250', 'integer', true, false, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'core_clients', 'cust-002', 'preferences', 'customer', 'internal', 'dietary_restrictions', '["vegetarian"]', 'json', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'core_clients', 'cust-002', 'preferences', 'customer', 'internal', 'favorite_items', '["item-003", "item-005"]', 'json', true, false, false, false, true, 1, true, 0.85, NOW(), NOW());

-- ===================================================================
-- 5. INVENTORY ENTITIES
-- ===================================================================

INSERT INTO core_entities (id, organization_id, entity_type, entity_name, entity_code, is_active, created_at, updated_at) VALUES
('inv-001', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'Chicken (Raw)', 'INV-CHK', true, NOW(), NOW()),
('inv-002', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'Basmati Rice', 'INV-RICE', true, NOW(), NOW()),
('inv-003', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'Paneer', 'INV-PNR', true, NOW(), NOW()),
('inv-004', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'Tomatoes', 'INV-TOM', true, NOW(), NOW()),
('inv-005', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'Heavy Cream', 'INV-CRM', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inventory Metadata
INSERT INTO core_metadata (id, organization_id, entity_type, entity_id, metadata_type, metadata_category, metadata_scope, metadata_key, metadata_value, metadata_value_type, is_system_generated, is_user_editable, is_searchable, is_encrypted, is_active, version, ai_generated, ai_confidence_score, created_at, updated_at) VALUES
-- Chicken inventory
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'inv-001', 'stock', 'inventory', 'internal', 'current_stock', '25', 'decimal', true, false, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'inv-001', 'stock', 'inventory', 'internal', 'min_stock', '10', 'decimal', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'inv-001', 'stock', 'inventory', 'internal', 'max_stock', '50', 'decimal', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'inv-001', 'stock', 'inventory', 'internal', 'unit', 'kg', 'text', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'inv-001', 'pricing', 'financial', 'internal', 'cost_per_unit', '8.50', 'decimal', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'inv-001', 'storage', 'operations', 'internal', 'storage_location', 'freezer_a1', 'text', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'inv-001', 'quality', 'operations', 'internal', 'expiry_date', '2024-12-15', 'date', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),

-- Basmati Rice inventory (Critical Stock)
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'inv-002', 'stock', 'inventory', 'internal', 'current_stock', '5', 'decimal', true, false, true, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'inv-002', 'stock', 'inventory', 'internal', 'min_stock', '20', 'decimal', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'inv-002', 'stock', 'inventory', 'internal', 'max_stock', '100', 'decimal', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'inv-002', 'stock', 'inventory', 'internal', 'unit', 'kg', 'text', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'inv-002', 'pricing', 'financial', 'internal', 'cost_per_unit', '4.50', 'decimal', false, true, false, false, true, 1, false, 0.95, NOW(), NOW()),
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'inventory_item', 'inv-002', 'supplier', 'purchasing', 'internal', 'primary_supplier', 'ABC Suppliers', 'text', false, true, false, false, true, 1, false, 0.95, NOW(), NOW());

-- ===================================================================
-- 6. AI SCHEMA REGISTRY FOR RESTAURANT
-- ===================================================================

INSERT INTO ai_schema_registry (id, organization_id, schema_name, schema_type, schema_definition, ai_confidence, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_menu_item', 'entity_schema', 
'{
  "entity_type": "menu_item",
  "required_metadata": [
    {"key": "price", "type": "decimal", "category": "pricing"},
    {"key": "cost", "type": "decimal", "category": "pricing"},
    {"key": "category_id", "type": "text", "category": "classification"},
    {"key": "prep_time_minutes", "type": "integer", "category": "preparation"}
  ],
  "optional_metadata": [
    {"key": "calories", "type": "integer", "category": "nutrition"},
    {"key": "spice_level", "type": "integer", "category": "dietary"},
    {"key": "dietary_flags", "type": "json", "category": "dietary"},
    {"key": "ingredients", "type": "json", "category": "inventory"}
  ],
  "ai_capabilities": {
    "nutrition_analysis": true,
    "ingredient_extraction": true,
    "pricing_optimization": true,
    "demand_forecasting": true
  }
}', 0.95, true, NOW(), NOW()),

(gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'restaurant_table', 'entity_schema',
'{
  "entity_type": "restaurant_table",
  "required_metadata": [
    {"key": "seats", "type": "integer", "category": "capacity"},
    {"key": "section", "type": "text", "category": "location"}
  ],
  "optional_metadata": [
    {"key": "features", "type": "json", "category": "operations"},
    {"key": "qr_code", "type": "text", "category": "technology"}
  ],
  "ai_capabilities": {
    "occupancy_prediction": true,
    "table_assignment_optimization": true,
    "customer_preference_matching": true
  }
}', 0.92, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ===================================================================

-- Core metadata indexes for restaurant queries
CREATE INDEX IF NOT EXISTS idx_core_metadata_restaurant_menu 
ON core_metadata(organization_id, entity_type, metadata_category) 
WHERE entity_type = 'menu_item';

CREATE INDEX IF NOT EXISTS idx_core_metadata_restaurant_pricing 
ON core_metadata(organization_id, metadata_key, metadata_value) 
WHERE metadata_category = 'pricing';

CREATE INDEX IF NOT EXISTS idx_core_metadata_restaurant_inventory 
ON core_metadata(organization_id, entity_type, metadata_key, metadata_value) 
WHERE entity_type = 'inventory_item' AND metadata_category = 'inventory';

-- Core entities indexes
CREATE INDEX IF NOT EXISTS idx_core_entities_restaurant 
ON core_entities(organization_id, entity_type, is_active) 
WHERE entity_type IN ('menu_item', 'restaurant_table', 'restaurant_staff', 'inventory_item');

-- Events timeseries index for real-time data
CREATE INDEX IF NOT EXISTS idx_core_events_restaurant 
ON core_events_timeseries(entity_id, event_type, timestamp DESC);

COMMIT;