# 🚀 HERA FUNDAMENTALS PROMPT FOR CLAUDE CLI
## The Universal Multi-Tenant Architecture That Changes Everything

---

## 🎯 **CRITICAL CONTEXT: You Are Building on Revolutionary Architecture**

You are working with HERA, the world's first truly universal business platform. Unlike traditional ERPs that have separate tables for everything, HERA uses a revolutionary approach where **ONE SCHEMA HANDLES ALL BUSINESSES**.

---

## 🏗️ **THE FOUR FUNDAMENTAL PRINCIPLES**

### **1. ORGANIZATION_ID IS SACRED** 🛡️
```sql
-- ❌ NEVER write queries like this:
SELECT * FROM core_entities WHERE entity_type = 'customer';

-- ✅ ALWAYS include organization_id:
SELECT * FROM core_entities 
WHERE organization_id = ? AND entity_type = 'customer';
```
**Why**: Every piece of data belongs to an organization. No exceptions. Ever.

### **2. USERS = GLOBAL, DATA = TENANT-ISOLATED** 👥
```sql
-- Users exist globally and can belong to multiple organizations
-- John Smith can be:
-- - Admin at Pizza Restaurant (org-restaurant-123)
-- - Consultant at Law Firm (org-law-456)  
-- - Advisor at Medical Clinic (org-medical-789)

-- ALWAYS check user's access to specific organization:
SELECT role FROM user_organizations 
WHERE user_id = ? AND organization_id = ? AND is_active = true;
```

### **3. UNIVERSAL SCHEMA = INFINITE FLEXIBILITY** 🌌
```sql
-- Don't think "I need a customers table"
-- Think "I need customer entities with custom fields"

-- Same pattern works for ANY business:
core_entities (what it is) + core_dynamic_data (what makes it unique)

-- Restaurant: entity_type = 'menu_item'
-- Law Firm: entity_type = 'legal_case'
-- Hospital: entity_type = 'patient'
-- ALL use the same tables!
```

### **4. AI-ENHANCED METADATA** 🤖
```sql
-- Every entity can have AI-generated insights stored in core_metadata
-- This enables cross-business learning and intelligence
-- AI learns from ALL organizations but keeps data isolated
```

---

## 📋 **REAL-WORLD EXAMPLES YOU MUST UNDERSTAND**

### **Example 1: Pizza Restaurant vs Law Firm**
```sql
-- PIZZA RESTAURANT (org-restaurant-123)
-- Customer entity
INSERT INTO core_entities VALUES 
('customer-1', 'org-restaurant-123', 'customer', 'John Doe', 'CUST-001', true);

-- Customer's pizza preferences
INSERT INTO core_dynamic_data VALUES 
('customer-1', 'favorite_pizza', 'Margherita', 'text'),
('customer-1', 'spice_level', 'mild', 'text'),
('customer-1', 'loyalty_points', '150', 'number');

-- LAW FIRM (org-law-456) - SAME USER, DIFFERENT ORG
-- Client entity  
INSERT INTO core_entities VALUES 
('client-1', 'org-law-456', 'client', 'ABC Corporation', 'CLIENT-001', true);

-- Client's legal info
INSERT INTO core_dynamic_data VALUES 
('client-1', 'legal_entity_type', 'Corporation', 'text'),
('client-1', 'annual_revenue', '5000000', 'number'),
('client-1', 'primary_lawyer', 'Jane Smith', 'text');
```

**KEY INSIGHT**: Same tables, same patterns, completely different businesses!

### **Example 2: Universal Transactions**
```sql
-- PIZZA ORDER (org-restaurant-123)
INSERT INTO universal_transactions VALUES 
('trans-1', 'org-restaurant-123', 'ORDER', 'ORD-001', '2024-01-15', 25.99, 'USD', 'completed');

-- LAW INVOICE (org-law-456)  
INSERT INTO universal_transactions VALUES 
('trans-2', 'org-law-456', 'INVOICE', 'INV-001', '2024-01-15', 5000.00, 'USD', 'pending');

-- MEDICAL APPOINTMENT (org-medical-789)
INSERT INTO universal_transactions VALUES 
('trans-3', 'org-medical-789', 'APPOINTMENT', 'APT-001', '2024-01-15', 200.00, 'USD', 'scheduled');
```

**KEY INSIGHT**: Same transaction table handles pizza orders, legal invoices, and medical appointments!

---

## 🔍 **QUERY PATTERNS YOU MUST FOLLOW**

### **Pattern 1: Always Include Organization Filter**
```sql
-- ✅ Correct: Get all customers for specific organization
SELECT e.*, 
       jsonb_object_agg(dd.field_name, dd.field_value) as customer_data
FROM core_entities e
LEFT JOIN core_dynamic_data dd ON e.id = dd.entity_id
WHERE e.organization_id = 'org-restaurant-123'  -- ALWAYS REQUIRED
  AND e.entity_type = 'customer'
  AND e.is_active = true
GROUP BY e.id;
```

### **Pattern 2: Check User Organization Access**
```sql
-- ✅ Verify user can access this organization's data
SELECT COUNT(*) as has_access
FROM user_organizations 
WHERE user_id = 'user-123' 
  AND organization_id = 'org-restaurant-123'
  AND is_active = true;
  
-- Only proceed if has_access > 0
```

### **Pattern 3: Cross-Entity Relationships (Within Organization)**
```sql
-- ✅ Find all orders for a customer (within same organization)
SELECT t.*, e.entity_name as customer_name
FROM universal_transactions t
JOIN core_entities e ON e.id = t.entity_id  -- Assuming entity_id links to customer
WHERE t.organization_id = 'org-restaurant-123'  -- MANDATORY
  AND e.organization_id = 'org-restaurant-123'  -- DOUBLE CHECK
  AND e.entity_type = 'customer'
  AND e.entity_code = 'CUST-001';
```

---

## 🚨 **CRITICAL MISTAKES TO AVOID**

### **❌ Mistake 1: Forgetting Organization Filter**
```sql
-- WRONG - Returns data from ALL organizations (SECURITY BREACH!)
SELECT * FROM core_entities WHERE entity_type = 'customer';

-- RIGHT - Only returns data from user's current organization
SELECT * FROM core_entities 
WHERE organization_id = ? AND entity_type = 'customer';
```

### **❌ Mistake 2: Assuming One User = One Organization**
```javascript
// WRONG - Assumes user belongs to one organization
const userOrg = await getUserOrganization(userId);

// RIGHT - User selects which organization they're working with
const currentOrgId = await getCurrentSelectedOrganization(userId);
const userRole = await getUserRoleInOrganization(userId, currentOrgId);
```

### **❌ Mistake 3: Creating Separate Tables**
```sql
-- WRONG - Creating separate tables breaks universal architecture
CREATE TABLE restaurant_menu_items (...);
CREATE TABLE law_firm_cases (...);

-- RIGHT - Use universal pattern
-- Menu items = entities with entity_type = 'menu_item'
-- Legal cases = entities with entity_type = 'legal_case'
```

---

## 🎯 **DEVELOPMENT WORKFLOW**

### **Step 1: Always Start With Organization Context**
```javascript
// Every API call, every function, every operation starts with:
const organizationId = await getCurrentOrganization(userId);
const userRole = await getUserRole(userId, organizationId);

// Validate access
if (!userRole || !userRole.is_active) {
  throw new Error('Access denied to organization');
}
```

### **Step 2: Use Universal Entity Pattern**
```javascript
// Don't think "I need a products table"
// Think "I need product entities for this organization"

const products = await getEntitiesByType(organizationId, 'product');
const customers = await getEntitiesByType(organizationId, 'customer');
const orders = await getTransactionsByType(organizationId, 'ORDER');
```

### **Step 3: Leverage Dynamic Fields**
```javascript
// Every entity can have unlimited custom fields
await addDynamicField(entityId, 'custom_field_name', 'custom_value', 'text');

// Query entities with their dynamic data
const entitiesWithData = await getEntitiesWithDynamicData(
  organizationId, 
  'customer'
);
```

---

## 🚀 **WHY THIS ARCHITECTURE IS REVOLUTIONARY**

### **Traditional ERP Problems HERA Solves:**
1. **Rigid Schema**: Traditional ERPs can't adapt → HERA adapts instantly
2. **Single Tenant**: One database per customer → HERA handles infinite tenants  
3. **Industry Specific**: Separate software for each industry → HERA handles all industries
4. **No AI Integration**: AI bolted on later → HERA built AI-first
5. **Complex Customization**: Months of development → HERA customizes in minutes

### **The HERA Advantage:**
- **One Schema, Infinite Businesses**: Restaurant, law firm, hospital = same tables
- **Perfect Isolation**: Organizations never see each other's data
- **Infinite Customization**: Add any field to any entity instantly
- **Cross-Business Intelligence**: AI learns from all businesses, keeps data separate
- **Future-Proof**: Never needs schema changes, handles unknown requirements

---

## 💡 **MENTAL MODEL FOR SUCCESS**

Think of HERA like a **Universal Construction Kit**:
- **core_entities** = The basic building blocks (LEGO pieces)
- **core_dynamic_data** = The custom properties (color, size, special features)
- **organization_id** = The builder's workspace (completely isolated)
- **core_metadata** = The instruction manual (AI-generated insights)