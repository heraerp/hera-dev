# 🛡️ Universal Field Validation Function

## 🎯 Overview
The `validate_field_against_universal_rules` function represents HERA's revolutionary approach to validation - storing validation rules as entities in the universal schema itself. This allows dynamic, configurable validation rules that can be managed through the same CRUD operations as any other business data.

## 📋 Function Definition

```sql
CREATE OR REPLACE FUNCTION validate_field_against_universal_rules(
    p_entity_type VARCHAR(100),
    p_field_name VARCHAR(200),
    p_field_value TEXT,
    p_field_type VARCHAR(50)
) RETURNS VOID
```

## 🏗️ Universal Schema Integration

### **Validation Rules as Entities**
Validation rules are stored as `validation_rule` entities in `core_entities` with properties in `core_dynamic_data`:

```sql
-- Example validation rule entity
INSERT INTO core_entities (entity_type, entity_name) 
VALUES ('validation_rule', 'Menu Item Price Validation');

-- Rule properties in core_dynamic_data
INSERT INTO core_dynamic_data (entity_id, field_name, field_value) VALUES
('rule-id', 'target_entity_type', 'menu_item'),
('rule-id', 'target_field_name', 'base_price'),
('rule-id', 'min_value', '0.01'),
('rule-id', 'max_value', '999.99'),
('rule-id', 'error_message', 'Menu item price must be between $0.01 and $999.99');
```

## 🔧 Validation Types Supported

### **1. Numeric Range Validation** 📊
For `field_type = 'number'`:
- **min_value**: Minimum allowed value
- **max_value**: Maximum allowed value

```sql
-- Example: Price validation
target_entity_type: 'menu_item'
target_field_name: 'base_price'
min_value: '0.01'
max_value: '999.99'
error_message: 'Price must be between $0.01 and $999.99'
```

### **2. Regex Pattern Validation** 🔤
For `field_type = 'text'`:
- **regex_pattern**: PostgreSQL regular expression

```sql
-- Example: Email validation
target_entity_type: 'customer'
target_field_name: 'email'
regex_pattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
error_message: 'Please enter a valid email address'
```

### **3. Date Validation** 📅
For `field_type = 'date'`:
- **rule_expression**: Special date rules like `'no_future_dates'`

```sql
-- Example: Birth date validation
target_entity_type: 'employee'
target_field_name: 'birth_date'
rule_expression: 'no_future_dates'
error_message: 'Birth date cannot be in the future'
```

## 🚀 Usage Examples

### **Creating Menu Item Price Rules**
```sql
-- 1. Create validation rule entity
INSERT INTO core_entities (id, entity_type, entity_name, is_active) 
VALUES ('price-rule-001', 'validation_rule', 'Menu Item Price Range', true);

-- 2. Add rule properties
INSERT INTO core_dynamic_data (entity_id, field_name, field_value) VALUES
('price-rule-001', 'target_entity_type', 'menu_item'),
('price-rule-001', 'target_field_name', 'base_price'),
('price-rule-001', 'min_value', '0.50'),
('price-rule-001', 'max_value', '500.00'),
('price-rule-001', 'error_message', 'Menu item price must be between $0.50 and $500.00');
```

### **Creating Email Validation Rules**
```sql
-- 1. Create email rule entity
INSERT INTO core_entities (id, entity_type, entity_name, is_active) 
VALUES ('email-rule-001', 'validation_rule', 'Customer Email Format', true);

-- 2. Add regex pattern
INSERT INTO core_dynamic_data (entity_id, field_name, field_value) VALUES
('email-rule-001', 'target_entity_type', 'customer'),
('email-rule-001', 'target_field_name', 'email'),
('email-rule-001', 'regex_pattern', '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
('email-rule-001', 'error_message', 'Please enter a valid email address');
```

### **Creating Quantity Validation Rules**
```sql
-- Inventory quantity rules
INSERT INTO core_entities (id, entity_type, entity_name, is_active) 
VALUES ('qty-rule-001', 'validation_rule', 'Inventory Quantity Validation', true);

INSERT INTO core_dynamic_data (entity_id, field_name, field_value) VALUES
('qty-rule-001', 'target_entity_type', 'inventory_item'),
('qty-rule-001', 'target_field_name', 'quantity'),
('qty-rule-001', 'min_value', '0'),
('qty-rule-001', 'error_message', 'Inventory quantity cannot be negative');
```

## 🧪 Testing Scenarios

### **Test Case 1: Valid Price**
```sql
-- Should pass
SELECT validate_field_against_universal_rules(
    'menu_item', 
    'base_price', 
    '15.99', 
    'number'
);
```

### **Test Case 2: Invalid Price (Too Low)**
```sql
-- Should raise exception
SELECT validate_field_against_universal_rules(
    'menu_item', 
    'base_price', 
    '0.25', 
    'number'
);
-- Expected: "Menu item price must be between $0.50 and $500.00"
```

### **Test Case 3: Invalid Email Format**
```sql
-- Should raise exception
SELECT validate_field_against_universal_rules(
    'customer', 
    'email', 
    'invalid-email', 
    'text'
);
-- Expected: "Please enter a valid email address"
```

### **Test Case 4: Future Date Validation**
```sql
-- Should raise exception
SELECT validate_field_against_universal_rules(
    'employee', 
    'birth_date', 
    '2030-01-01', 
    'date'
);
-- Expected: "Birth date cannot be in the future"
```

## 🔗 Integration with Existing Triggers

This function can be called from the existing `validate_entity_reference()` trigger:

```sql
-- Add to validate_entity_reference() trigger function
PERFORM validate_field_against_universal_rules(
    v_entity_type,
    NEW.field_name,
    NEW.field_value,
    NEW.field_type
);
```

## 💡 Benefits of Universal Validation

### **1. Dynamic Configuration** 🔄
- Validation rules can be added/modified through standard CRUD operations
- No database schema changes required
- Rules can be enabled/disabled by setting `is_active`

### **2. Business User Management** 👥
- Non-technical users can manage validation rules through UI
- Rules stored in same format as business data
- Full audit trail of rule changes

### **3. Multi-Tenant Support** 🏢
- Different validation rules per organization
- Client-level sharing of common rules
- Customizable error messages per tenant

### **4. Infinite Extensibility** 🚀
- Add new validation types without code changes
- Complex business rules can be stored as expressions
- Integration with AI for intelligent validation

## 🛠️ Advanced Usage Patterns

### **Conditional Validation Rules**
```sql
-- Different rules based on entity subtype
INSERT INTO core_dynamic_data (entity_id, field_name, field_value) VALUES
('rule-id', 'target_entity_type', 'menu_item'),
('rule-id', 'target_entity_subtype', 'alcoholic_beverage'),
('rule-id', 'target_field_name', 'price'),
('rule-id', 'min_value', '5.00'),
('rule-id', 'error_message', 'Alcoholic beverages must be priced at least $5.00');
```

### **Multi-Field Validation**
```sql
-- Rules that depend on other field values
INSERT INTO core_dynamic_data (entity_id, field_name, field_value) VALUES
('rule-id', 'rule_expression', 'IF cost_price > 0 THEN base_price > cost_price * 1.2'),
('rule-id', 'error_message', 'Menu item price must be at least 20% above cost');
```

### **Organization-Specific Rules**
```sql
-- Rules that apply only to specific organizations
INSERT INTO core_entities (id, organization_id, entity_type, entity_name) 
VALUES ('org-rule-001', 'mario-restaurant', 'validation_rule', 'Mario Pricing Policy');
```

## 🎯 Best Practices

### **1. Rule Naming Convention**
- Use descriptive names: `'Menu Item Price Range'`
- Include entity type: `'Customer Email Format'`
- Version rules: `'Price Validation v2.0'`

### **2. Error Message Guidelines**
- Be specific and actionable
- Include valid ranges/formats
- Use friendly, non-technical language
- Provide examples when helpful

### **3. Performance Optimization**
- Create indexes on validation rule queries
- Cache frequently used rules
- Use `is_active = false` instead of deleting rules

### **4. Testing Strategy**
- Test both valid and invalid values
- Verify error messages are clear
- Test rule activation/deactivation
- Validate multi-rule scenarios

## 🔍 Monitoring & Analytics

### **Validation Failure Tracking**
```sql
-- Log validation failures for analysis
CREATE TABLE validation_failure_log (
    id UUID DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100),
    field_name VARCHAR(200),
    field_value TEXT,
    rule_id UUID,
    error_message TEXT,
    failed_at TIMESTAMP DEFAULT NOW(),
    user_id UUID,
    organization_id UUID
);
```

### **Rule Usage Statistics**
```sql
-- Track which rules are triggered most
SELECT 
    target_entity_type,
    target_field_name,
    COUNT(*) as failure_count,
    MAX(failed_at) as last_failure
FROM validation_failure_log vfl
JOIN core_dynamic_data cdd ON vfl.rule_id = cdd.entity_id
WHERE cdd.field_name = 'target_entity_type'
GROUP BY target_entity_type, target_field_name
ORDER BY failure_count DESC;
```

## ✅ Summary

The Universal Field Validation function represents the pinnacle of HERA's universal schema design:

1. **🏗️ Schema Consistency**: Validation rules follow the same universal pattern as all business data
2. **🔧 Zero Code Changes**: New validation rules require no code deployment
3. **👥 Business Control**: Non-technical users can manage validation through standard UI
4. **🌍 Multi-Tenant**: Organization-specific rules with client-level sharing
5. **📊 Analytics**: Full tracking and analysis of validation patterns
6. **🚀 Infinite Scale**: Any field, any entity, any rule complexity

**🛡️ Universal validation - where business rules become data! 🛡️**