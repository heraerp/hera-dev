# 🔐 Entity Reference Validation Trigger

## 🎯 Overview
The `validate_entity_reference` trigger function provides automatic validation for all dynamic data fields in HERA's Universal Schema. It enforces organization isolation, validates entity references, and applies business rules to ensure data integrity.

## 📋 Function Definition

```sql
CREATE OR REPLACE FUNCTION validate_entity_reference() 
RETURNS TRIGGER
```

**Trigger Context**: Should be attached to `core_dynamic_data` table for INSERT/UPDATE operations

## 🛡️ Validation Layers

### **1. Entity Reference Validation** 🔗
For UUID fields that reference other entities:

#### **Client-Level Sharing Fields**
Fields that allow sharing across organizations within same client:
- `supplier_id`
- `vendor_id`
- `corporate_account_id`
- `shared_resource_id`

```sql
-- These fields use:
validate_organization_isolation(uuid, org_id, TRUE)
```

#### **Strict Organization Isolation Fields**
Fields that require exact organization match:
- Any field ending with `_id`
- Any field ending with `_ref`
- `parent_id`

```sql
-- These fields use:
validate_organization_isolation(uuid, org_id, FALSE)
```

#### **Non-Existent Entity Validation**
- If field name suggests entity reference (`*_id`, `*_ref`)
- But referenced entity doesn't exist
- Raises: `Invalid entity reference: Field X references non-existent entity Y`

### **2. Business Rule Validations** 📏

#### **Email Validation** 📧
- **Applied to**: Fields containing `email` (case-insensitive)
- **Pattern**: `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`
- **Error**: `Invalid email format for field X: Y`

#### **Phone Validation** 📞
- **Applied to**: Fields containing `phone` (case-insensitive)
- **Pattern**: `^[\+]?[0-9]?[0-9\s\-\(\)\.]{7,15}$`
- **Allows**: International formats, spaces, dashes, parentheses
- **Error**: `Invalid phone format for field X: Y`

#### **Financial/Quantity Validation** 💰
- **Applied to**: Fields containing:
  - `amount`
  - `quantity`
  - `price`
  - `cost`
  - `total`
- **Rule**: Must be >= 0 (no negative values)
- **Error**: `Negative value not allowed for field X: Y`

#### **Percentage Validation** 📊
- **Applied to**: Fields containing `percentage` or `percent`
- **Rule**: Must be between 0 and 100
- **Error**: `Percentage value must be between 0 and 100 for field X: Y`

#### **Date Validation** 📅
- **Applied to**: Fields containing `date`
- **Rule**: Cannot be more than 10 years in future
- **Purpose**: Prevent data entry typos
- **Error**: `Date value too far in future for field X: Y`

## 🧪 Testing Scenarios

### **Test Case 1: Valid Entity Reference (Same Org)**
```sql
-- Setup
INSERT INTO core_entities (id, organization_id, entity_type, entity_name) VALUES
('cat-001', 'org-001', 'menu_category', 'Appetizers');

INSERT INTO core_entities (id, organization_id, entity_type, entity_name) VALUES  
('item-001', 'org-001', 'menu_item', 'Caesar Salad');

-- Test: Should succeed
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) VALUES
('item-001', 'category_id', 'uuid', 'cat-001');
```

### **Test Case 2: Cross-Org Reference (Blocked)**
```sql
-- Setup different org category
INSERT INTO core_entities (id, organization_id, entity_type, entity_name) VALUES
('cat-002', 'org-002', 'menu_category', 'Desserts');

-- Test: Should fail
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) VALUES
('item-001', 'category_id', 'uuid', 'cat-002');
-- Error: Organization isolation violation
```

### **Test Case 3: Supplier Sharing (Allowed)**
```sql
-- Setup: Same client, different orgs
INSERT INTO core_organizations (id, client_id, org_name) VALUES
('org-001', 'client-001', 'Restaurant A'),
('org-002', 'client-001', 'Restaurant B');

INSERT INTO core_entities (id, organization_id, entity_type, entity_name) VALUES
('sup-001', 'org-002', 'supplier', 'Shared Supplier');

-- Test: Should succeed (client sharing allowed)
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) VALUES
('item-001', 'supplier_id', 'uuid', 'sup-001');
```

### **Test Case 4: Email Validation**
```sql
-- Valid email: Should succeed
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) VALUES
('item-001', 'contact_email', 'text', 'chef@restaurant.com');

-- Invalid email: Should fail
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) VALUES
('item-001', 'contact_email', 'text', 'invalid-email');
-- Error: Invalid email format
```

### **Test Case 5: Financial Validation**
```sql
-- Valid price: Should succeed
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) VALUES
('item-001', 'unit_price', 'number', '18.99');

-- Negative price: Should fail
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) VALUES
('item-001', 'unit_price', 'number', '-5.00');
-- Error: Negative value not allowed
```

### **Test Case 6: Percentage Validation**
```sql
-- Valid percentage: Should succeed
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) VALUES
('item-001', 'discount_percentage', 'number', '15');

-- Invalid percentage: Should fail
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) VALUES
('item-001', 'tax_percentage', 'number', '150');
-- Error: Percentage value must be between 0 and 100
```

### **Test Case 7: Date Validation**
```sql
-- Valid date: Should succeed
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) VALUES
('item-001', 'expiry_date', 'date', '2025-12-31');

-- Too far future: Should fail
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) VALUES
('item-001', 'review_date', 'date', '2050-01-01');
-- Error: Date value too far in future
```

## 🔧 Implementation Guide

### **1. Create Trigger on core_dynamic_data**
```sql
CREATE TRIGGER validate_dynamic_data_before_insert
BEFORE INSERT ON core_dynamic_data
FOR EACH ROW
EXECUTE FUNCTION validate_entity_reference();

CREATE TRIGGER validate_dynamic_data_before_update
BEFORE UPDATE ON core_dynamic_data
FOR EACH ROW
EXECUTE FUNCTION validate_entity_reference();
```

### **2. Field Naming Conventions**
To leverage automatic validation, follow these conventions:

#### **Entity References**
- Use `*_id` suffix for entity references
- Use `*_ref` suffix for alternative references
- Examples: `category_id`, `supplier_id`, `parent_id`

#### **Business Fields**
- Include `email` in email field names
- Include `phone` in phone field names
- Include `price`, `cost`, `amount` for financial fields
- Include `percentage` or `percent` for percentage fields
- Include `date` in date field names

### **3. Client Sharing Configuration**
For fields that should allow client-level sharing:
```sql
-- Add to the CASE statement in trigger:
WHEN NEW.field_name IN ('new_shared_field_id') THEN
    PERFORM validate_organization_isolation(NEW.field_value::uuid, v_current_org_id, TRUE);
```

## 📊 Performance Considerations

### **Optimization Strategies**
1. **Index Requirements**:
   ```sql
   CREATE INDEX idx_core_entities_org_active ON core_entities(organization_id, is_active);
   CREATE INDEX idx_dynamic_data_field_type ON core_dynamic_data(field_type, field_name);
   ```

2. **Validation Caching**:
   - Consider caching organization relationships
   - Cache client membership for frequent validations

3. **Batch Operations**:
   - Validate in bulk before insert
   - Use COPY with pre-validation for large imports

### **Performance Monitoring**
```sql
-- Monitor trigger execution time
SELECT 
    schemaname,
    tablename,
    calls,
    total_time,
    mean_time
FROM pg_stat_user_functions
WHERE funcname = 'validate_entity_reference';
```

## 🚨 Error Handling Best Practices

### **1. Graceful Degradation**
- Non-UUID values in UUID fields are allowed (for flexibility)
- Only enforce if field name suggests entity reference

### **2. Clear Error Messages**
- Include field name and value in errors
- Specify validation rule that failed
- Don't expose sensitive system information

### **3. Validation Bypass (Emergency)**
```sql
-- Temporarily disable for data migration
ALTER TABLE core_dynamic_data DISABLE TRIGGER validate_dynamic_data_before_insert;
-- Re-enable after migration
ALTER TABLE core_dynamic_data ENABLE TRIGGER validate_dynamic_data_before_insert;
```

## 🎯 Integration with HERA Modules

### **Menu Management**
- `category_id`: Strict organization isolation
- `supplier_id`: Client-level sharing allowed
- `price`, `cost`: Non-negative validation
- `preparation_time`: Positive number validation

### **Purchase Orders**
- `supplier_id`, `vendor_id`: Client sharing
- `approver_id`: Strict isolation
- `total_amount`: Non-negative
- `delivery_date`: Future date validation

### **Inventory**
- `item_id`: Strict isolation
- `supplier_id`: Client sharing
- `quantity`: Non-negative
- `reorder_percentage`: 0-100 range

### **Staff Management**
- `manager_id`: Strict isolation
- `email`: Email format
- `phone`: Phone format
- `hire_date`: Date validation

## 🔍 Monitoring & Auditing

### **Validation Failures**
```sql
-- Log validation failures for analysis
CREATE TABLE validation_audit_log (
    id UUID DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP DEFAULT NOW(),
    entity_id UUID,
    field_name VARCHAR(200),
    field_value TEXT,
    error_message TEXT,
    user_id UUID
);
```

### **Performance Metrics**
- Track average validation time
- Monitor validation failure rates
- Identify most common validation errors
- Alert on unusual patterns

## ✅ Benefits

1. **Automatic Security**: No manual validation code needed
2. **Consistent Rules**: Same validation across all modules
3. **Data Integrity**: Prevents invalid data at database level
4. **Performance**: Validation at trigger level is fast
5. **Flexibility**: Easy to add new validation rules
6. **Audit Trail**: All violations can be logged

## 🎯 Key Takeaways

✅ **Entity references** are automatically validated for organization isolation
✅ **Business rules** are enforced based on field naming conventions
✅ **Client sharing** is configurable per field type
✅ **Performance impact** is minimal with proper indexing
✅ **Error messages** are clear and actionable

This trigger function is a **critical component** of HERA's data integrity and security model, ensuring that all dynamic data adheres to both security policies and business rules!

**🔐 Every field is validated - Security and integrity by default! 🔐**