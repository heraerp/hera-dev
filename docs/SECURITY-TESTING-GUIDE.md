# 🔒 HERA Security Testing Guide

## 🎯 Overview
This guide provides comprehensive security testing instructions for HERA's multi-tenant architecture, focusing on organization isolation, data access controls, and the `validate_organization_isolation` function.

## 🛡️ Core Security Principles

### **1. Organization Isolation**
- Each organization's data must be completely isolated
- No cross-organization access unless explicitly allowed
- Client-level sharing only when appropriate

### **2. Entity Reference Validation**
- All entity references must be validated using `validate_organization_isolation`
- Invalid references should throw clear error messages
- Active/inactive status must be respected

### **3. Multi-Tenant Data Access**
- Users can belong to multiple organizations
- Data access is scoped by organization context
- Role-based permissions within organizations

---

## 🧪 Security Test Scenarios

### 1. Organization Isolation Validation

#### Test Case 1.1: Same Organization Access ✅
**Objective**: Verify entities can access other entities in same organization

**Test Steps**:
1. Create test entities in organization A
2. Attempt to validate reference within same organization
3. Verify access is granted

**SQL Test**:
```sql
-- Setup test data
INSERT INTO core_entities (id, organization_id, entity_type, entity_name) 
VALUES ('test-entity-1', 'org-a', 'menu_item', 'Test Item');

-- Test validation
SELECT validate_organization_isolation(
    'test-entity-1'::UUID,
    'org-a'::UUID,
    FALSE
);
```

**Expected Result**: `TRUE`

#### Test Case 1.2: Cross-Organization Denial ❌
**Objective**: Verify cross-organization access is blocked

**Test Steps**:
1. Create entity in organization A
2. Attempt to access from organization B
3. Verify access is denied with proper error

**SQL Test**:
```sql
-- Test cross-org access (should fail)
SELECT validate_organization_isolation(
    'test-entity-1'::UUID,  -- Entity in org-a
    'org-b'::UUID,          -- Trying to access from org-b
    FALSE
);
```

**Expected Result**: Exception with message:
```
Organization isolation violation: Entity test-entity-1 belongs to organization org-a, expected org-b (client sharing: false)
```

#### Test Case 1.3: Client Sharing Allowed 🔄
**Objective**: Verify client-level sharing works when enabled

**Test Steps**:
1. Create organizations A and B under same client
2. Create entity in organization A
3. Attempt access from organization B with client sharing enabled
4. Verify access is granted

**Setup**:
```sql
-- Setup same-client organizations
INSERT INTO core_organizations (id, client_id, org_name) VALUES 
('org-a', 'client-1', 'Restaurant A'),
('org-b', 'client-1', 'Restaurant B');

INSERT INTO core_entities (id, organization_id, entity_type, entity_name) 
VALUES ('shared-entity', 'org-a', 'supplier', 'Shared Supplier');
```

**Test**:
```sql
SELECT validate_organization_isolation(
    'shared-entity'::UUID,
    'org-b'::UUID,
    TRUE  -- Allow client sharing
);
```

**Expected Result**: `TRUE`

#### Test Case 1.4: Client Sharing Denied ❌
**Objective**: Verify client sharing blocks different clients

**Setup**:
```sql
-- Setup different-client organizations
INSERT INTO core_organizations (id, client_id, org_name) VALUES 
('org-c', 'client-2', 'Restaurant C');
```

**Test**:
```sql
SELECT validate_organization_isolation(
    'shared-entity'::UUID,  -- Entity in client-1
    'org-c'::UUID,          -- Org in client-2
    TRUE                    -- Client sharing enabled
);
```

**Expected Result**: Exception with isolation violation

#### Test Case 1.5: Non-existent Entity ❌
**Objective**: Verify validation fails for non-existent entities

**Test**:
```sql
SELECT validate_organization_isolation(
    '00000000-0000-0000-0000-000000000000'::UUID,  -- Non-existent
    'org-a'::UUID,
    FALSE
);
```

**Expected Result**: Exception:
```
Entity reference validation failed: Entity 00000000-0000-0000-0000-000000000000 does not exist or is inactive
```

#### Test Case 1.6: Inactive Entity ❌
**Objective**: Verify validation fails for inactive entities

**Setup**:
```sql
-- Create and deactivate entity
INSERT INTO core_entities (id, organization_id, entity_type, entity_name, is_active) 
VALUES ('inactive-entity', 'org-a', 'menu_item', 'Inactive Item', FALSE);
```

**Test**:
```sql
SELECT validate_organization_isolation(
    'inactive-entity'::UUID,
    'org-a'::UUID,
    FALSE
);
```

**Expected Result**: Exception about entity not existing or being inactive

---

### 2. API Security Testing

#### Test Case 2.1: Menu API Organization Isolation
**Objective**: Verify menu APIs respect organization boundaries

**Test Steps**:
1. Create menu items in organization A
2. Attempt to access via API using organization B credentials
3. Verify empty results or access denied

**API Test**:
```bash
# Create item in org A
curl -X POST "http://localhost:3001/api/menu/items" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-a",
    "name": "Secret Recipe",
    "categoryId": "category-a"
  }'

# Try to access from org B (should fail)
curl -X GET "http://localhost:3001/api/menu/items?organizationId=org-b"
```

**Expected Result**: No "Secret Recipe" in org B results

#### Test Case 2.2: Purchase Order Cross-Reference Validation
**Objective**: Verify PO APIs validate supplier references

**Test Steps**:
1. Create supplier in organization A
2. Attempt to create PO in organization B referencing org A supplier
3. Verify validation error

**API Test**:
```bash
# Create PO with cross-org supplier reference
curl -X POST "http://localhost:3001/api/purchasing/purchase-orders" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-b",
    "supplierId": "supplier-from-org-a",
    "items": [{"name": "Test", "quantity": 1, "unitPrice": 10}]
  }'
```

**Expected Result**: Error about organization isolation violation

#### Test Case 2.3: Bulk Operations Security
**Objective**: Verify bulk uploads respect organization isolation

**Test Steps**:
1. Prepare CSV with references to other organizations
2. Attempt bulk upload
3. Verify validation errors for cross-org references

---

### 3. User Access Control Testing

#### Test Case 3.1: Multi-Organization User Access
**Objective**: Verify users can only access their assigned organizations

**Setup**:
```sql
-- User belongs to org A only
INSERT INTO user_organizations (user_id, organization_id, role) 
VALUES ('user-1', 'org-a', 'admin');
```

**Test Steps**:
1. Authenticate as user-1
2. Attempt to access org B data
3. Verify access denied

#### Test Case 3.2: Role-Based Access Within Organization
**Objective**: Verify role permissions within organization

**Test Steps**:
1. Create user with 'viewer' role
2. Attempt to perform admin actions
3. Verify permission denied

---

### 4. SQL Injection & Security Vulnerabilities

#### Test Case 4.1: SQL Injection in Organization Filter
**Objective**: Verify APIs are protected against SQL injection

**Test**:
```bash
# Attempt SQL injection in organization ID
curl -X GET "http://localhost:3001/api/menu/items?organizationId='; DROP TABLE core_entities; --"
```

**Expected Result**: Safe handling, no SQL execution

#### Test Case 4.2: UUID Validation
**Objective**: Verify UUID parameters are properly validated

**Test**:
```bash
# Invalid UUID format
curl -X GET "http://localhost:3001/api/menu/items?organizationId=invalid-uuid"
```

**Expected Result**: UUID validation error

---

### 5. Performance & DoS Protection

#### Test Case 5.1: Validation Function Performance
**Objective**: Verify validation doesn't create performance bottlenecks

**Test**:
```sql
-- Benchmark validation calls
SELECT 
  COUNT(*),
  AVG(duration)
FROM (
  SELECT 
    validate_organization_isolation('test-entity', 'org-a', FALSE),
    EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time) as duration
  FROM (SELECT clock_timestamp() as start_time) t,
       generate_series(1, 1000)
) results;
```

**Expected Result**: Average < 10ms per call

#### Test Case 5.2: Bulk Validation Performance
**Objective**: Test performance with large datasets

**Test Steps**:
1. Create 10,000 entities
2. Perform bulk validation operations
3. Monitor response times and database load

---

## 🔍 Security Checklist

### Organization Isolation
- [ ] Same organization access works
- [ ] Cross-organization access blocked
- [ ] Client sharing works when enabled
- [ ] Client sharing blocks different clients
- [ ] Non-existent entities handled properly
- [ ] Inactive entities blocked

### API Security
- [ ] All endpoints validate organization access
- [ ] Cross-organization references blocked
- [ ] Bulk operations validate each reference
- [ ] Error messages don't leak information
- [ ] SQL injection protection active

### User Access Control
- [ ] Multi-organization user access controlled
- [ ] Role-based permissions enforced
- [ ] Authentication required for all operations
- [ ] Session management secure

### Data Validation
- [ ] UUID format validation
- [ ] Required field validation
- [ ] Business rule enforcement
- [ ] Input sanitization

### Performance Security
- [ ] No performance DoS vulnerabilities
- [ ] Rate limiting implemented
- [ ] Resource usage monitoring
- [ ] Query timeout protection

---

## 🚨 Common Security Issues

### Issue: "Organization isolation bypassed"
- **Cause**: Missing validation in API endpoint
- **Fix**: Add `validate_organization_isolation` call
- **Prevention**: Code review checklist

### Issue: "Performance degradation with validation"
- **Cause**: Missing database indexes
- **Fix**: Add indexes on organization_id, client_id
- **Prevention**: Performance testing in CI/CD

### Issue: "Client sharing allows unintended access"
- **Cause**: Incorrect client_sharing parameter
- **Fix**: Review and update per-module settings
- **Prevention**: Security configuration review

---

## 🔧 Security Testing Tools

### Database Testing
```sql
-- Test isolation function directly
SELECT validate_organization_isolation(
  p_entity_id := 'entity-uuid',
  p_expected_org_id := 'org-uuid', 
  p_allow_client_sharing := false
);
```

### API Testing
```bash
# Test with different organization contexts
ORG_A="00000000-0000-0000-0000-000000000001"
ORG_B="00000000-0000-0000-0000-000000000002"

curl -X GET "http://localhost:3001/api/menu/items?organizationId=${ORG_A}"
curl -X GET "http://localhost:3001/api/menu/items?organizationId=${ORG_B}"
```

### Automated Security Tests
```typescript
// Jest security test example
describe('Organization Isolation', () => {
  test('prevents cross-organization access', async () => {
    const response = await request(app)
      .get('/api/menu/items')
      .query({ organizationId: 'other-org' })
      .expect(403);
  });
});
```

---

## 🛡️ Universal Field Validation Testing

### Test Case 6.1: Create Validation Rules as Entities
**Objective**: Verify validation rules can be created and managed as universal schema entities

**Setup**:
```sql
-- Create price validation rule
INSERT INTO core_entities (id, entity_type, entity_name, is_active) 
VALUES ('price-rule-001', 'validation_rule', 'Menu Item Price Range', true);

INSERT INTO core_dynamic_data (entity_id, field_name, field_value) VALUES
('price-rule-001', 'target_entity_type', 'menu_item'),
('price-rule-001', 'target_field_name', 'base_price'),
('price-rule-001', 'min_value', '0.50'),
('price-rule-001', 'max_value', '500.00'),
('price-rule-001', 'error_message', 'Menu item price must be between $0.50 and $500.00');

-- Create email validation rule
INSERT INTO core_entities (id, entity_type, entity_name, is_active) 
VALUES ('email-rule-001', 'validation_rule', 'Customer Email Format', true);

INSERT INTO core_dynamic_data (entity_id, field_name, field_value) VALUES
('email-rule-001', 'target_entity_type', 'customer'),
('email-rule-001', 'target_field_name', 'email'),
('email-rule-001', 'regex_pattern', '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
('email-rule-001', 'error_message', 'Please enter a valid email address');
```

### Test Case 6.2: Valid Price Validation
**Objective**: Verify price validation passes for valid values

**Test**:
```sql
SELECT validate_field_against_universal_rules(
    'menu_item', 
    'base_price', 
    '15.99', 
    'number'
);
```

**Expected Result**: No exception, validation passes

### Test Case 6.3: Invalid Price Validation (Too Low)
**Objective**: Verify price validation fails for values below minimum

**Test**:
```sql
SELECT validate_field_against_universal_rules(
    'menu_item', 
    'base_price', 
    '0.25', 
    'number'
);
```

**Expected Result**: Exception with message "Menu item price must be between $0.50 and $500.00"

### Test Case 6.4: Invalid Price Validation (Too High)
**Objective**: Verify price validation fails for values above maximum

**Test**:
```sql
SELECT validate_field_against_universal_rules(
    'menu_item', 
    'base_price', 
    '600.00', 
    'number'
);
```

**Expected Result**: Exception with custom error message

### Test Case 6.5: Valid Email Validation
**Objective**: Verify email regex validation passes for valid format

**Test**:
```sql
SELECT validate_field_against_universal_rules(
    'customer', 
    'email', 
    'john.doe@example.com', 
    'text'
);
```

**Expected Result**: No exception, validation passes

### Test Case 6.6: Invalid Email Validation
**Objective**: Verify email regex validation fails for invalid format

**Test**:
```sql
SELECT validate_field_against_universal_rules(
    'customer', 
    'email', 
    'invalid-email-format', 
    'text'
);
```

**Expected Result**: Exception with message "Please enter a valid email address"

### Test Case 6.7: Rule Activation/Deactivation
**Objective**: Verify validation rules can be enabled/disabled

**Setup**:
```sql
-- Deactivate price rule
UPDATE core_entities 
SET is_active = false 
WHERE id = 'price-rule-001';
```

**Test**:
```sql
-- This should now pass (no rule to enforce)
SELECT validate_field_against_universal_rules(
    'menu_item', 
    'base_price', 
    '0.25', 
    'number'
);
```

**Expected Result**: No exception, validation skipped for inactive rule

### Test Case 6.8: Multiple Rules for Same Field
**Objective**: Verify multiple validation rules can apply to the same field

**Setup**:
```sql
-- Create additional price rule for minimum profit margin
INSERT INTO core_entities (id, entity_type, entity_name, is_active) 
VALUES ('profit-rule-001', 'validation_rule', 'Minimum Profit Margin', true);

INSERT INTO core_dynamic_data (entity_id, field_name, field_value) VALUES
('profit-rule-001', 'target_entity_type', 'menu_item'),
('profit-rule-001', 'target_field_name', 'base_price'),
('profit-rule-001', 'rule_expression', 'base_price >= cost_price * 1.3'),
('profit-rule-001', 'error_message', 'Menu item must have at least 30% profit margin');
```

**Expected Result**: Both rules should be evaluated for the same field

## 🔐 Entity Reference Trigger Testing

### Test Case 7.1: Email Field Validation
**Objective**: Verify email fields are validated automatically

**Test Steps**:
```sql
-- Valid email (should succeed)
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) 
VALUES ('test-entity', 'customer_email', 'text', 'valid@email.com');

-- Invalid email (should fail)
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) 
VALUES ('test-entity', 'contact_email', 'text', 'invalid-email');
```

**Expected**: Invalid email format error

### Test Case 6.2: Financial Field Validation
**Objective**: Verify financial fields reject negative values

**Test Steps**:
```sql
-- Negative price (should fail)
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) 
VALUES ('test-entity', 'unit_price', 'number', '-10.50');

-- Negative quantity (should fail)  
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) 
VALUES ('test-entity', 'order_quantity', 'number', '-5');
```

**Expected**: Negative value not allowed error

### Test Case 6.3: Percentage Field Validation
**Objective**: Verify percentage fields enforce 0-100 range

**Test Steps**:
```sql
-- Over 100% (should fail)
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) 
VALUES ('test-entity', 'discount_percentage', 'number', '150');

-- Negative percentage (should fail)
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) 
VALUES ('test-entity', 'tax_percentage', 'number', '-10');
```

**Expected**: Percentage must be between 0 and 100

### Test Case 6.4: Phone Number Validation
**Objective**: Verify phone fields validate format

**Test Steps**:
```sql
-- Valid formats (should succeed)
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) 
VALUES ('test-entity', 'mobile_phone', 'text', '+1-555-123-4567');

-- Invalid format (should fail)
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) 
VALUES ('test-entity', 'office_phone', 'text', 'abc123');
```

**Expected**: Invalid phone format error

### Test Case 6.5: Date Field Validation
**Objective**: Verify dates can't be too far in future

**Test Steps**:
```sql
-- Far future date (should fail)
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) 
VALUES ('test-entity', 'delivery_date', 'date', '2050-01-01');
```

**Expected**: Date too far in future error

### Test Case 6.6: Client Sharing Rules
**Objective**: Verify supplier_id allows client sharing

**Test Steps**:
```sql
-- Same client, different org (should succeed)
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) 
VALUES ('po-in-org-a', 'supplier_id', 'uuid', 'supplier-in-org-b-same-client');

-- Different client (should fail)
INSERT INTO core_dynamic_data (entity_id, field_name, field_type, field_value) 
VALUES ('po-in-org-a', 'supplier_id', 'uuid', 'supplier-different-client');
```

**Expected**: Success for same client, failure for different client

## 🎯 Success Criteria

Security testing passes when:

1. ✅ **Complete isolation** between organizations
2. ✅ **Controlled sharing** at client level when appropriate
3. ✅ **No data leakage** through errors or responses
4. ✅ **Performance impact** < 10ms per validation
5. ✅ **All APIs protected** with validation calls
6. ✅ **Audit logging** captures security events
7. ✅ **Error handling** doesn't expose sensitive info

**🔒 Security is not optional - every entity reference must be validated! 🔒**