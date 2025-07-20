# 🔒 Organization Isolation Validation Function

## 🎯 Overview
The `validate_organization_isolation` function is a critical Supabase database function that enforces HERA's multi-tenant architecture by preventing cross-organization data access and maintaining strict data isolation.

## 📋 Function Definition

```sql
CREATE OR REPLACE FUNCTION validate_organization_isolation(
    p_entity_id UUID,
    p_expected_org_id UUID,
    p_allow_client_sharing BOOLEAN DEFAULT FALSE
) RETURNS BOOLEAN
```

## 🛡️ Security Rules

### **1. Same Organization Access** ✅
- **Rule**: Entities can always access other entities within the same organization
- **Logic**: `v_actual_org_id = p_expected_org_id`
- **Result**: `RETURN TRUE`

### **2. Cross-Organization Access** ❌
- **Default Rule**: Cross-organization access is **FORBIDDEN**
- **Exception**: Only allowed when `p_allow_client_sharing = TRUE` AND same client
- **Security**: Prevents data leakage between organizations

### **3. Client-Level Sharing** 🔄
- **Condition**: `p_allow_client_sharing = TRUE`
- **Logic**: Check if both organizations belong to same client
- **Use Case**: Enterprise clients with multiple organizations
- **Validation**: `v_expected_client_id = v_actual_client_id`

### **4. Entity Existence Validation** 🔍
- **Check**: Entity must exist and be active
- **Query**: `FROM core_entities WHERE id = p_entity_id AND is_active = true`
- **Error**: Raises exception if entity not found or inactive

## 🚨 Error Handling

### **Entity Not Found Error**
```
Entity reference validation failed: Entity {UUID} does not exist or is inactive
```

### **Organization Isolation Violation**
```
Organization isolation violation: Entity {UUID} belongs to organization {UUID}, expected {UUID} (client sharing: {BOOLEAN})
```

## 🧪 Testing Scenarios

### **Test Case 1: Same Organization Access**
```sql
-- Should return TRUE
SELECT validate_organization_isolation(
    'entity-uuid-1'::UUID,
    'org-uuid-1'::UUID,
    FALSE
);
```
**Expected**: `TRUE` if entity belongs to org-uuid-1

### **Test Case 2: Cross-Organization Denial**
```sql
-- Should raise exception
SELECT validate_organization_isolation(
    'entity-in-org-1'::UUID,
    'org-uuid-2'::UUID,
    FALSE
);
```
**Expected**: Exception with isolation violation message

### **Test Case 3: Client Sharing Allowed**
```sql
-- Should return TRUE if same client
SELECT validate_organization_isolation(
    'entity-in-org-1'::UUID,
    'org-2-same-client'::UUID,
    TRUE
);
```
**Expected**: `TRUE` if both orgs have same client_id

### **Test Case 4: Client Sharing Denied**
```sql
-- Should raise exception
SELECT validate_organization_isolation(
    'entity-in-org-1'::UUID,
    'org-different-client'::UUID,
    TRUE
);
```
**Expected**: Exception if different clients

### **Test Case 5: Non-existent Entity**
```sql
-- Should raise exception
SELECT validate_organization_isolation(
    'non-existent-uuid'::UUID,
    'org-uuid-1'::UUID,
    FALSE
);
```
**Expected**: Entity not found exception

## 🔧 Implementation in APIs

### **Menu API Example**
```typescript
// Before accessing menu items
const isValid = await supabase.rpc('validate_organization_isolation', {
  p_entity_id: menuItemId,
  p_expected_org_id: organizationId,
  p_allow_client_sharing: false
});

if (!isValid) {
  throw new Error('Access denied: Organization isolation violation');
}
```

### **Purchase Order API Example**
```typescript
// Before processing supplier reference
const isValid = await supabase.rpc('validate_organization_isolation', {
  p_entity_id: supplierId,
  p_expected_org_id: organizationId,
  p_allow_client_sharing: true // Allow supplier sharing across orgs in same client
});
```

## 🎯 Use Cases by Module

### **Menu Management**
- **Items**: Cannot reference categories from other organizations
- **Categories**: Cannot be shared across organizations
- **Client Sharing**: Usually `FALSE` (restaurant-specific menus)

### **Purchase Orders**
- **Suppliers**: May allow client sharing (`TRUE` for enterprise suppliers)
- **Items**: Organization-specific, no sharing
- **Approval**: Strict organization isolation

### **Inventory**
- **Items**: Never shared across organizations
- **Suppliers**: May allow client sharing
- **Adjustments**: Organization-specific only

### **Staff Management**
- **Users**: Can belong to multiple organizations (via user_organizations)
- **Roles**: Organization-specific
- **Permissions**: Strictly isolated

## 🚀 Performance Considerations

### **Function Optimization**
- **SECURITY DEFINER**: Runs with creator privileges for consistent access
- **Index Requirements**: Ensure indexes on `organization_id` and `client_id`
- **Caching**: Results should not be cached due to security implications

### **Recommended Indexes**
```sql
-- Core entities organization lookup
CREATE INDEX IF NOT EXISTS idx_core_entities_org_active 
ON core_entities(organization_id, is_active);

-- Organization client lookup
CREATE INDEX IF NOT EXISTS idx_core_organizations_client 
ON core_organizations(client_id);
```

## 🔍 Testing Integration

### **Unit Tests**
1. **Same Organization**: Verify TRUE return
2. **Cross Organization**: Verify exception
3. **Client Sharing**: Test both allowed and denied
4. **Invalid Entity**: Verify proper error handling
5. **Inactive Entity**: Verify access denial

### **Integration Tests**
1. **API Endpoints**: All APIs should call validation
2. **Bulk Operations**: Validate each entity reference
3. **Relationship Creation**: Prevent cross-org relationships
4. **Data Migration**: Ensure isolation during imports

### **Security Tests**
1. **Privilege Escalation**: Attempt access via different user contexts
2. **SQL Injection**: Test with malformed UUIDs
3. **Race Conditions**: Concurrent access patterns
4. **Data Leakage**: Verify no information disclosure in errors

## 📊 Monitoring & Alerts

### **Error Monitoring**
- Track isolation violation attempts
- Monitor for unusual cross-org access patterns
- Alert on repeated violations from same user/IP

### **Performance Monitoring**
- Function execution time
- Database load from validation calls
- Index usage efficiency

### **Audit Logging**
- Log all validation calls
- Record violation attempts with context
- Maintain access pattern analytics

## 🎛️ Configuration Management

### **Environment Variables**
```env
# Default client sharing policy
HERA_DEFAULT_CLIENT_SHARING=false

# Audit logging level
HERA_ISOLATION_AUDIT_LEVEL=warning

# Performance monitoring
HERA_VALIDATION_PERFORMANCE_THRESHOLD=100ms
```

### **Per-Module Settings**
```typescript
const ValidationConfig = {
  menu: { allowClientSharing: false },
  purchasing: { allowClientSharing: true },
  inventory: { allowClientSharing: false },
  staff: { allowClientSharing: true }
};
```

## 🔄 Migration & Deployment

### **Deployment Steps**
1. Deploy function to Supabase
2. Update all API endpoints to use validation
3. Add monitoring and alerting
4. Run comprehensive security tests
5. Monitor for performance impact

### **Rollback Plan**
1. Remove validation calls from APIs
2. Drop function if needed
3. Restore previous access patterns
4. Verify system functionality

---

## 🎯 Key Takeaways

✅ **Always validate** entity references across organizations
✅ **Use client sharing** judiciously (suppliers, enterprise users)
✅ **Monitor violations** for security threats
✅ **Test thoroughly** with all edge cases
✅ **Performance matters** - optimize queries and indexes

This function is the **cornerstone of HERA's security model** - ensuring that multi-tenant data remains completely isolated while allowing controlled sharing where appropriate.

**🔒 Security First: Every entity reference must be validated! 🔒**