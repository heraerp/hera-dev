# 🚀 HERA Universal Architecture Guide for Claude CLI
**Complete Context for AI Development Assistant**

---

## 🎯 WHAT IS HERA?

HERA is a revolutionary universal business platform that uses **ONE flexible schema** to handle ANY business type, rather than rigid table structures. It's the world's first AI-native ERP that adapts to businesses instead of forcing businesses to adapt to it.

### **Core Philosophy**
- **Universal**: One system handles everything
- **Dynamic**: Structure adapts to any need  
- **AI-Powered**: Intelligence built into the architecture
- **Flexible**: Never breaks, always extensible
- **Simple**: Complex capability through simple design

---

## 🏗️ UNIVERSAL SCHEMA ARCHITECTURE

### **The Magic: 5 Core Tables Handle Everything**

Instead of 200+ rigid tables like traditional ERPs, HERA uses 5 universal tables:

```sql
-- 1. CORE ENTITIES (The "What" - Any Business Object)
core_entities:
├── id (uuid)
├── organization_id (uuid)
├── entity_type (text) -- 'customer', 'product', 'invoice', 'employee', etc.
├── entity_name (text) -- Human readable name
├── entity_code (text) -- Business code/SKU
├── is_active (boolean)
├── created_at, updated_at

-- 2. CORE DYNAMIC DATA (The "How" - Any Field for Any Entity)
core_dynamic_data:
├── id (uuid)
├── entity_id (uuid) -- Links to core_entities
├── field_name (text) -- 'email', 'price', 'description', etc.
├── field_value (text) -- Actual data value
├── field_type (text) -- 'text', 'number', 'date', 'boolean', etc.
├── created_at, updated_at

-- 3. CORE METADATA (The "Why" - Rich Context & AI Intelligence)
core_metadata:
├── id (uuid)
├── organization_id (uuid)
├── entity_type (text)
├── entity_id (uuid)
├── metadata_type (text) -- 'ai_enhancement', 'user_preference', 'system_config'
├── metadata_category (text) -- 'ml_insights', 'behavioral_data', 'performance'
├── metadata_key (text) -- Specific metadata identifier
├── metadata_value (jsonb) -- Rich JSON data
├── ai_generated (boolean)
├── ai_confidence_score (numeric)
├── effective_from, effective_to (timestamps)
├── is_active (boolean)
├── created_at, updated_at

-- 4. UNIVERSAL TRANSACTIONS (The "When" - Any Business Transaction)
universal_transactions:
├── id (uuid)
├── organization_id (uuid)
├── transaction_type (text) -- 'INVOICE', 'PAYMENT', 'PURCHASE', etc.
├── transaction_number (text) -- Business reference
├── transaction_date (date)
├── total_amount (numeric)
├── currency (text)
├── status (text)
├── created_at, updated_at

-- 5. UNIVERSAL TRANSACTION LINES (Transaction Details)
universal_transaction_lines:
├── id (uuid)
├── transaction_id (uuid)
├── entity_id (uuid) -- Links to any entity (product, service, etc.)
├── line_description (text)
├── quantity (numeric)
├── unit_price (numeric)
├── line_amount (numeric)
├── line_order (integer)
├── created_at
```

### **Supporting Tables**

```sql
-- Organizations and Users
core_organizations, core_users, user_organizations

-- AI Intelligence
ai_schema_registry, ai_processing_results, ai_decision_audit, ai_model_performance

-- System Management
core_workflows, core_workflow_instances, core_sync_status, core_performance_metrics
```

---

## 🎨 HOW IT WORKS: REAL EXAMPLES

### **Example 1: Restaurant Business**
```sql
-- Create restaurant as entity
INSERT INTO core_entities VALUES 
('rest-001', 'org-123', 'restaurant', 'Tony''s Pizza', 'TP-001', true);

-- Add restaurant details through dynamic data
INSERT INTO core_dynamic_data VALUES
('rest-001', 'cuisine_type', 'Italian', 'text'),
('rest-001', 'seating_capacity', '50', 'number'),
('rest-001', 'phone', '555-1234', 'text'),
('rest-001', 'delivery_available', 'true', 'boolean');

-- AI adds intelligent insights through metadata
INSERT INTO core_metadata VALUES
('org-123', 'restaurant', 'rest-001', 'ai_enhancement', 'performance_insights',
'revenue_optimization', 
'{"avg_order_value": 25.50, "peak_hours": ["12:00-14:00", "18:00-21:00"], 
  "recommended_menu_items": ["margherita", "pepperoni"], 
  "predicted_monthly_revenue": 45000}'::jsonb, 
true, 0.94);
```

### **Example 2: Law Firm Business**
```sql
-- Same universal structure, different business
INSERT INTO core_entities VALUES 
('law-001', 'org-456', 'law_firm', 'Smith & Associates', 'SA-001', true);

-- Law firm specific data
INSERT INTO core_dynamic_data VALUES
('law-001', 'practice_areas', 'Corporate Law, IP Law', 'text'),
('law-001', 'attorney_count', '12', 'number'),
('law-001', 'bar_admissions', 'NY, NJ, CT', 'text'),
('law-001', 'billing_rate', '450', 'number');

-- AI adds legal-specific insights
INSERT INTO core_metadata VALUES
('org-456', 'law_firm', 'law-001', 'ai_enhancement', 'legal_insights',
'case_analytics', 
'{"avg_case_duration": 180, "success_rate": 0.87, 
  "most_profitable_practice": "IP Law",
  "recommended_billing_optimization": "increase_ip_rates"}'::jsonb, 
true, 0.91);
```

---

## 🧠 AI-NATIVE INTELLIGENCE

### **AI Schema Registry**
```sql
-- AI automatically generates and manages schemas
ai_schema_registry:
├── schema_name -- 'restaurant_management', 'legal_case_tracking'
├── schema_type -- 'industry_template', 'custom_schema'
├── schema_definition -- Complete JSON schema
├── ai_confidence -- How confident AI is in this schema
├── is_active -- Currently being used
```

### **AI Processing Results**
```sql
-- Every AI operation is tracked
ai_processing_results:
├── entity_id -- What was processed
├── processing_type -- 'ocr_extraction', 'classification', 'prediction'
├── ai_model_name -- 'gpt-4', 'claude-3-sonnet'
├── input_data -- What went in
├── output_data -- What came out
├── confidence_score -- How confident the AI is
├── success -- Did it work?
```

### **AI Decision Audit**
```sql
-- Complete audit trail of all AI decisions
ai_decision_audit:
├── entity_id -- What the decision was about
├── decision_type -- 'classification', 'recommendation', 'automation'
├── decision_data -- The actual decision
├── reasoning -- Why AI made this decision
├── confidence_score -- How confident AI is
├── human_override -- Did a human override this?
```

---

## 🔄 UNIVERSAL PATTERNS

### **Any Business Entity Pattern**
```sql
-- Step 1: Create entity
INSERT INTO core_entities (entity_type, entity_name, entity_code);

-- Step 2: Add dynamic fields
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type);

-- Step 3: Let AI enhance with metadata
INSERT INTO core_metadata (entity_id, metadata_type, metadata_key, metadata_value);
```

### **Any Transaction Pattern**
```sql
-- Step 1: Create transaction
INSERT INTO universal_transactions (transaction_type, transaction_number, total_amount);

-- Step 2: Add transaction lines
INSERT INTO universal_transaction_lines (transaction_id, entity_id, quantity, unit_price);

-- Step 3: AI processes and enhances
-- (Automatic through AI processing engine)
```

---

## 🎯 DEVELOPMENT PRINCIPLES

### **1. Universal First**
- If it can be represented as an entity with dynamic fields, use the universal schema
- Never create separate tables unless absolutely necessary
- Always check if existing universal patterns can handle the requirement

### **2. AI-Native**
- Every operation should generate AI insights through core_metadata
- Use ai_processing_results to track all AI operations
- Store AI decisions in ai_decision_audit for explainability

### **3. Dynamic Schema**
- Fields are added through core_dynamic_data, not schema changes
- Use ai_schema_registry to manage schema definitions
- Let AI suggest and validate schema changes

### **4. Metadata-Rich**
- Store rich context in core_metadata
- Use metadata for AI insights, user preferences, system configs
- Enable temporal metadata with effective_from/effective_to

---

## 🚀 COMMON ENTITY TYPES

### **Business Entities**
```sql
entity_type IN (
  'customer', 'vendor', 'supplier', 'partner',
  'product', 'service', 'inventory_item',
  'employee', 'contractor', 'user',
  'organization', 'department', 'location',
  'project', 'task', 'contract',
  'invoice', 'order', 'payment',
  'asset', 'expense', 'budget',
  'campaign', 'lead', 'opportunity'
)
```

### **Transaction Types**
```sql
transaction_type IN (
  'INVOICE', 'PAYMENT', 'PURCHASE', 'SALE',
  'EXPENSE', 'TRANSFER', 'ADJUSTMENT',
  'ORDER', 'QUOTE', 'CONTRACT',
  'PAYROLL', 'TIMESHEET', 'EXPENSE_REPORT',
  'INVENTORY_MOVE', 'ASSET_TRANSFER',
  'JOURNAL_ENTRY', 'BUDGET_ALLOCATION'
)
```

---

## 🔍 POWERFUL UNIVERSAL QUERIES

### **Get Any Entity with All Data**
```sql
SELECT 
  e.entity_name,
  e.entity_type,
  jsonb_object_agg(dd.field_name, dd.field_value) as entity_data,
  jsonb_object_agg(m.metadata_key, m.metadata_value) as ai_insights
FROM core_entities e
LEFT JOIN core_dynamic_data dd ON e.id = dd.entity_id
LEFT JOIN core_metadata m ON e.id = m.entity_id AND m.ai_generated = true
WHERE e.entity_type = 'customer'
GROUP BY e.id, e.entity_name, e.entity_type;
```

### **Cross-Entity Intelligence**
```sql
-- Find relationships between any entities
SELECT 
  e1.entity_type as source_type,
  e2.entity_type as target_type,
  COUNT(*) as relationship_count
FROM universal_transactions t
JOIN core_entities e1 ON t.organization_id = e1.organization_id
JOIN universal_transaction_lines tl ON t.id = tl.transaction_id
JOIN core_entities e2 ON tl.entity_id = e2.id
GROUP BY e1.entity_type, e2.entity_type;
```

---

## 🛠️ DEVELOPMENT WORKFLOW

### **1. When Building New Features**
```bash
# Ask yourself:
1. Can this be represented as an entity? → Use core_entities
2. Does it need custom fields? → Use core_dynamic_data  
3. Should AI enhance this? → Use core_metadata
4. Is this a business transaction? → Use universal_transactions
5. Does it need workflow? → Use core_workflows
```

### **2. When Adding AI Features**
```bash
# Always use the AI tables:
1. Track processing → ai_processing_results
2. Store decisions → ai_decision_audit  
3. Monitor performance → ai_model_performance
4. Manage schemas → ai_schema_registry
```

### **3. When Handling Business Logic**
```bash
# Use universal patterns:
1. Create entities for business objects
2. Add dynamic data for flexible fields
3. Use metadata for rich context
4. Let AI enhance automatically
```

---

## 📊 CURRENT DATABASE TABLES

The database currently contains these tables:
- `core_entities` - Universal entity storage
- `core_dynamic_data` - Dynamic field storage
- `core_metadata` - Rich metadata and AI insights
- `core_organizations` - Organization management
- `core_users` - User management
- `universal_transactions` - Universal transaction processing
- `universal_transaction_lines` - Transaction line items
- `ai_schema_registry` - AI-managed schemas
- `ai_processing_results` - AI processing tracking
- `ai_decision_audit` - AI decision audit trail
- `ai_model_performance` - AI model performance tracking
- `core_workflows` - Workflow definitions
- `core_workflow_instances` - Active workflow instances
- `core_sync_status` - Synchronization tracking
- `core_performance_metrics` - System performance
- `core_real_time_events` - Real-time event processing

---

## 🎯 KEY ADVANTAGES

### **1. Infinite Flexibility**
- Add any field to any entity without schema changes
- Support any business type with the same architecture
- Never breaks existing functionality

### **2. AI-Native Design**
- Every operation generates AI insights
- Complete audit trail of all AI decisions
- Continuous learning and improvement

### **3. Universal Scalability**
- One schema handles any complexity
- Consistent patterns across all features
- No technical debt accumulation

### **4. Business Agility**
- Adapt to changing requirements instantly
- Support new business models immediately
- Zero downtime for changes

---

## 💡 WHEN TO USE TRADITIONAL TABLES

**Only create traditional tables for:**
- Authentication/authorization (handled by Supabase)
- System configuration that's truly static
- Performance-critical operations requiring specific indexes
- External integrations requiring specific formats

**99% of business functionality should use the universal schema.**

---

## 🚀 GETTING STARTED

### **For Any New Feature:**
1. Identify what business entities are involved
2. Define what dynamic fields are needed
3. Consider what AI insights would be valuable
4. Design using universal patterns
5. Let AI enhance automatically

### **For Any Business Type:**
1. Create core entities for the business domain
2. Add dynamic fields for business-specific data
3. Use metadata for rich context and AI insights
4. Create transactions for business processes
5. Let the universal schema handle the rest

---

**Remember: HERA's power comes from using ONE flexible schema to handle infinite business complexity, enhanced by AI intelligence that learns and improves continuously. Every business need can be met through these universal patterns!**