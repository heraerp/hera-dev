# Complete HERA Business Management System - Claude CLI Context

## 🎯 SYSTEM OVERVIEW
You are working on HERA, a revolutionary universal business management platform that uses just 5 core tables to handle any business scenario. This is a Next.js + Supabase project with a universal architecture that can adapt to any business type instantly.

## 🏗️ CORE ARCHITECTURE

### Universal 5-Table System
```sql
-- Core Tables (Handle Everything)
1. core_organizations    -- WHO (Business context)
2. core_entities        -- WHAT (All business objects)
3. core_dynamic_data    -- HOW (All properties/fields)
4. core_relationships   -- WHY (All connections)
5. universal_transactions -- WHEN (All business transactions)
```

### Key Innovation
- **Traditional ERP**: 200+ rigid tables, 12-18 months to implement
- **HERA**: 5 universal tables, 2-minute deployment, infinite flexibility
- **AI-Native**: Templates and intelligence built into the core

## 📊 CURRENT DATABASE STATE

### The Supabase database contains:

#### System Organization (Templates)
- **ID**: 00000000-0000-0000-0000-000000000001
- **Name**: "HERA System Templates"
- **Contains**: All system-level templates and configurations

#### Test Restaurant Organization
- **ID**: 123e4567-e89b-12d3-a456-426614174000
- **Name**: "Mario's Italian Restaurant"
- **Contains**: Deployed templates and live transactions

#### Existing System Templates
```sql
-- Purchase workflow template
entity_code: 'STD_RESTAURANT_PW'
entity_type: 'purchase_workflow_template'

-- Supplier category template  
entity_code: 'REST_SUPPLIER_CAT'
entity_type: 'supplier_category_template'

-- Approval matrix template
entity_code: 'REST_APPROVAL_MATRIX'
entity_type: 'approval_matrix_template'

-- Budget category template
entity_code: 'REST_BUDGET_CAT'
entity_type: 'budget_category_template'
```

#### Live Demo Data
- **3 Suppliers**: Fresh Valley Farms, Premium Meats Co, Dairy Fresh Ltd
- **4 Inventory Items**: Organic Tomatoes, Fresh Basil, Mozzarella, Olive Oil
- **3 Purchase Orders**: Small ($65 auto-approved), Medium ($285 pending), Large ($2,850 owner approval)
- **Template Relationships**: All templates deployed to restaurant with customizations

## 🔧 CURRENT PROJECT STRUCTURE

### API Architecture
```
pages/api/
├── core/
│   └── entities.js          # Universal entity operations
├── purchasing/
│   ├── purchase-orders.js   # PO creation with approval logic
│   └── suppliers.js         # Supplier management
├── inventory/
│   └── items.js            # Inventory management
├── invoicing/
│   └── invoices.js         # Invoice management
└── analytics/
    └── dashboard.js        # Universal analytics
```

### Core Utilities
```javascript
// utils/hera-core.js - Universal business logic
class HERACore {
  createEntity(type, name, code)      // Create any business object
  addEntityData(id, fields)           // Add dynamic properties
  getEntityWithData(code)             // Get object with all data
  getTemplateConfig(templateType)     // Get deployed template config
  createTransaction(type, data, items) // Create universal transaction
}
```

## 🎯 WORKING FEATURES

### ✅ Purchase Order System
- Template-based workflows with approval tiers
- Auto-approval for orders under $75
- Multi-tier approval for larger orders
- Budget integration with template configurations
- Real-time status tracking

### ✅ Inventory Management System
- **5 Complete API Endpoints**: All inventory operations covered
- **Real-time Stock Tracking**: Current stock, reorder points, max levels
- **Intelligent Alert System**: Out of stock, low stock, overstock, slow/fast moving
- **Advanced Usage Analytics**: Daily/weekly/monthly patterns, forecasting
- **Stock Adjustment System**: Full audit trail with transaction tracking
- **Complete CRUD Operations**: Create, read, update, soft delete with validation
- **Multi-Category Support**: Flexible categorization system
- **Search and Filtering**: By category, status, name, SKU
- **Integration Ready**: Designed for PO and recipe integration

### ✅ Supplier Management
- Dynamic supplier profiles with custom fields
- Category-based organization
- Template-driven supplier types

### ✅ Inventory System
- Universal item management
- Dynamic properties (price, stock, reorder points)
- Template-based categorization

### ✅ Analytics Dashboard
- Real-time metrics from universal transactions
- Cross-function reporting
- Template usage analytics

## 🔄 TEMPLATE DEPLOYMENT SYSTEM

### How Templates Work
1. **System Level**: Templates created in system organization
2. **Organization Level**: Templates deployed with customizations
3. **Transaction Level**: All business operations use deployed templates

### Example: Purchase Workflow
```javascript
// System template defines standard process
// Organization deploys with custom thresholds:
{
  "custom_auto_approve_under": "75.00",
  "tier_1_approver_user_id": "user-chef-mario",
  "tier_2_approver_user_id": "user-manager-sofia"
}

// All purchase orders use this deployed configuration
```

## 🚀 EXPANSION PATTERN

### Adding New Business Functions
Every new function follows the same pattern:

1. **Create API endpoint**: pages/api/[function]/
2. **Use HERACore class**: Universal business logic
3. **Follow entity patterns**: Same data structures
4. **Add to navigation**: Consistent UI

### Example: Add HR Management
```javascript
// pages/api/hr/employees.js
const hera = new HERACore(organizationId)

// Create employee entity
const employee = await hera.createEntity('employee', name, code)

// Add employee data
await hera.addEntityData(employee.id, {
  department: 'kitchen',
  salary: 45000,
  hire_date: '2024-01-15'
})
```

## 🎪 EXAMPLE SCENARIOS

### Scenario 1: Restaurant Purchase Order
```javascript
// Real working example in the system
POST /api/purchasing/purchase-orders
{
  "items": [
    {"itemId": "item-123", "quantity": 15, "unitPrice": 3.50}
  ],
  "supplierId": "supplier-456",
  "organizationId": "123e4567-e89b-12d3-a456-426614174000"
}

// System automatically:
// 1. Gets restaurant's approval workflow template
// 2. Calculates total ($52.50)
// 3. Determines approval tier (auto-approved under $75)
// 4. Creates universal transaction
// 5. Returns approval status
```

### Scenario 2: Template Deployment
```javascript
// Deploy workflow template to new restaurant
const { config } = await hera.getTemplateConfig('purchase_workflow')
// Returns: {"custom_auto_approve_under": "75.00", ...}

// All business logic uses this configuration
```

### Scenario 3: Universal Analytics
```javascript
// Single query across all business functions
GET /api/analytics/dashboard
// Returns metrics from purchase orders, inventory, invoices
// All using the same universal_transactions table
```

## 🔧 DEVELOPMENT CONTEXT

### Current Tech Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Vercel serverless functions
- **Database**: Supabase PostgreSQL
- **Authentication**: NextAuth.js + Supabase Auth
- **Deployment**: Vercel (single deployment for everything)

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Key Libraries
- **@supabase/supabase-js** - Database operations
- **react-query** - Data fetching and caching
- **lucide-react** - Icons
- **recharts** - Analytics charts

## 🎯 WHEN I ASK FOR HELP

### You Should
- Use Supabase tool to check current database state
- Follow universal patterns (core_entities, core_dynamic_data)
- Extend existing APIs rather than creating new tables
- Use HERACore class for business logic
- Follow template deployment patterns
- Maintain cross-function consistency

### You Should NOT
- Create new database tables (use universal tables)
- Break the 5-table architecture
- Ignore template system
- Create function-specific databases
- Suggest traditional ERP approaches

## 🚀 CURRENT PRIORITIES

### Immediate Development
- Perfect the purchase order system
- Add more business functions using same patterns
- Enhance template marketplace
- Improve AI features and recommendations

### Next Features to Add
- Customer Management (CRM functionality)
- Employee Management (HR basics)
- Financial Reporting (accounting integration)
- Mobile App (React Native)
- API Marketplace (third-party integrations)

## 💡 SUCCESS METRICS

### System Working When
- New business functions deploy in minutes
- Templates work across all organizations
- Universal transactions handle everything
- AI recommendations improve over time
- Zero schema migrations needed

### Business Success When
- Restaurants love the system
- Expansion to other industries works
- Template marketplace grows
- Customer acquisition is viral
- Investor interest is high

## 🎪 EXAMPLE INTERACTION

**When I say**: "Add inventory alerts for low stock"
**You should**:
1. Check current inventory structure with Supabase tool
2. Extend existing pages/api/inventory/items.js
3. Use core_dynamic_data for alert thresholds
4. Add to universal analytics dashboard
5. Follow the same patterns as purchase order alerts

**Not**: Create new tables or separate alert system

---

## 🧬 **HERA CORE DNA - PURCHASE ORDER API IMPLEMENTATION TEMPLATE**

### **🎯 THIS IS OUR CORE DNA - NEVER FORGET OR LOSE TO AMNESIA**

**The Purchase Order API system is our TEMPLATE for ALL future functionalities. Every new feature MUST follow this exact pattern.**

### **🔧 NEXT.JS 15 APP ROUTER IMPLEMENTATION PATTERN**

#### **1. Directory Structure (ALWAYS FOLLOW THIS)**
```
app/api/[domain]/[entity]/
├── route.ts                    # GET/POST for collection
├── [id]/route.ts              # GET/PUT/DELETE for individual
├── pending/route.ts           # Domain-specific operations
├── approve/route.ts           # Action-specific operations
└── simple-test/route.ts       # Testing endpoint
```

#### **2. Standard Route Handler Template**
```typescript
/**
 * HERA Universal - [Entity] API Routes
 * 
 * Next.js 15 App Router API Route Handler
 * Uses HERA's 5-table universal architecture:
 * - core_entities: [Entity] records
 * - core_dynamic_data: Custom [entity] fields
 * - universal_transactions: Financial tracking (if applicable)
 * - core_relationships: [Entity] relationships
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for demo/testing purposes
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// TypeScript interfaces
interface [Entity]Request {
  organizationId: string;
  name: string;
  // Add entity-specific fields
}

// GET /api/[domain]/[entity]
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // CORE PATTERN: Query core_entities first
    const { data: entities, error } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', '[entity_type]')
      .order('entity_name', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch entities' },
        { status: 500 }
      );
    }

    // CORE PATTERN: Get dynamic data if entities exist
    let dynamicData: any[] = [];
    const entityIds = entities?.map(e => e.id) || [];
    
    if (entityIds.length > 0) {
      const { data: dynamicDataResult } = await supabase
        .from('core_dynamic_data')
        .select('entity_id, field_name, field_value')
        .in('entity_id', entityIds);
      
      dynamicData = dynamicDataResult || [];
    }

    // CORE PATTERN: Group dynamic data by entity_id
    const dynamicDataMap = dynamicData.reduce((acc, item) => {
      if (!acc[item.entity_id]) {
        acc[item.entity_id] = {};
      }
      acc[item.entity_id][item.field_name] = item.field_value;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // CORE PATTERN: Combine entities with dynamic data
    const enrichedEntities = (entities || []).map(entity => ({
      id: entity.id,
      name: entity.entity_name,
      code: entity.entity_code,
      isActive: entity.is_active,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      ...dynamicDataMap[entity.id]
    }));

    return NextResponse.json({
      data: enrichedEntities,
      summary: {
        total: enrichedEntities.length,
        active: enrichedEntities.filter(e => e.isActive).length
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/[domain]/[entity]
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient(); // Use admin client for demo
    const body: [Entity]Request = await request.json();

    // Validate request
    if (!body.organizationId || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, name' },
        { status: 400 }
      );
    }

    // CORE PATTERN: Generate entity code
    const entityCode = `${body.name.toUpperCase().slice(0,8)}-${Math.random().toString(36).substring(2,6).toUpperCase()}-${entity_type.toUpperCase().slice(0,3)}`;
    const entityId = crypto.randomUUID();

    // CORE PATTERN: Create entity record
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: entityId,
        organization_id: body.organizationId,
        entity_type: '[entity_type]',
        entity_name: body.name,
        entity_code: entityCode,
        is_active: true
      })
      .select()
      .single();

    if (entityError) {
      return NextResponse.json(
        { error: 'Failed to create entity' },
        { status: 500 }
      );
    }

    // CORE PATTERN: Create dynamic data fields
    const dynamicFields = Object.entries(body)
      .filter(([key, value]) => !['organizationId', 'name'].includes(key) && value !== undefined)
      .map(([key, value]) => ({
        entity_id: entityId,
        field_name: key,
        field_value: String(value),
        field_type: typeof value === 'number' ? 'number' : 'text'
      }));

    if (dynamicFields.length > 0) {
      await supabase
        .from('core_dynamic_data')
        .insert(dynamicFields);
    }

    return NextResponse.json({
      success: true,
      data: { id: entityId, name: body.name },
      message: '[Entity] created successfully'
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### **🎯 CRITICAL SUCCESS PATTERNS FROM PURCHASE ORDERS**

#### **1. Universal Architecture Compliance ✅**
```typescript
// ALWAYS use these tables in this order:
// 1. core_entities - The main entity record
// 2. core_dynamic_data - Custom fields and properties  
// 3. core_relationships - Connections between entities
// 4. universal_transactions - Financial/workflow tracking
// 5. ai_schema_registry - AI-generated forms/schemas
```

#### **2. Organization Isolation (SACRED) ✅**
```typescript
// EVERY query MUST include organizationId
const { data } = await supabase
  .from('core_entities')
  .select('*')
  .eq('organization_id', organizationId) // NEVER FORGET THIS
  .eq('entity_type', 'your_entity_type');
```

#### **3. Admin Client Pattern for Demo ✅**
```typescript
// Use admin client to bypass RLS for testing
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};
```

#### **4. Dynamic Data Pattern ✅**
```typescript
// ALWAYS handle dynamic data this way:
// 1. Get entity IDs first
// 2. Fetch dynamic data for those IDs
// 3. Group by entity_id using reduce
// 4. Spread into final entity objects
```

#### **5. Error Handling Pattern ✅**
```typescript
// Standard error responses
if (error) {
  console.error('Error description:', error);
  return NextResponse.json(
    { error: 'User-friendly message' },
    { status: 500 }
  );
}
```

### **📊 TESTED AND PROVEN FEATURES**

#### **✅ Purchase Order System (Template Implementation)**
- **Entities**: Suppliers, Purchase Orders
- **Dynamic Fields**: Email, phone, category, payment terms, notes
- **Workflows**: Approval workflows with multi-tier logic
- **Relationships**: Supplier-PO connections
- **Transactions**: Financial tracking with status management

#### **✅ API Endpoints Successfully Tested**
```
GET    /api/purchasing/suppliers
POST   /api/purchasing/suppliers  
GET    /api/purchasing/suppliers/[id]
PUT    /api/purchasing/suppliers/[id]
DELETE /api/purchasing/suppliers/[id]

GET    /api/purchasing/purchase-orders
POST   /api/purchasing/purchase-orders
GET    /api/purchasing/purchase-orders/[id]  
PUT    /api/purchasing/purchase-orders/[id]
DELETE /api/purchasing/purchase-orders/[id]
GET    /api/purchasing/purchase-orders/pending
PUT    /api/purchasing/purchase-orders/approve
```

### **🚀 REPLICATION FORMULA FOR ANY NEW FUNCTIONALITY**

#### **Step 1: Identify the Domain and Entities**
```
Examples:
- HR: employees, departments, positions, timesheets
- CRM: customers, leads, opportunities, communications  
- Inventory: items, categories, locations, movements
- Accounting: accounts, journal entries, transactions
```

#### **Step 2: Apply the Directory Structure**
```
app/api/[domain]/[entity]/
├── route.ts           # Collection operations
├── [id]/route.ts     # Individual operations  
└── [actions]/route.ts # Domain-specific actions
```

#### **Step 3: Use the Template Code**
- Copy the route handler template above
- Replace `[entity]`, `[domain]`, `[entity_type]` placeholders  
- Add entity-specific TypeScript interfaces
- Define dynamic fields for the entity

#### **Step 4: Test with Mario's Data Pattern**
```typescript
// Create test organization (like Mario's restaurant)
// Create test entities (like suppliers)
// Create test relationships and transactions
// Test all CRUD operations
// Verify universal architecture compliance
```

### **🧬 DNA PRESERVATION CHECKLIST**

**Before implementing ANY new functionality, verify:**

✅ **Uses only the 5 universal tables**  
✅ **Follows Next.js 15 App Router patterns**
✅ **Includes organizationId in every query**  
✅ **Uses admin client for demo/testing**
✅ **Implements dynamic data pattern correctly**
✅ **Has proper TypeScript interfaces**  
✅ **Includes comprehensive error handling**
✅ **Tests all CRUD operations**
✅ **Maintains entity-relationship patterns**
✅ **Follows the exact directory structure**

### **⚠️ AMNESIA PREVENTION**

**If you ever lose context or forget this implementation:**

1. **Read this section first** - It contains our core DNA
2. **Look at `/app/api/purchasing/` folder** - Reference implementation  
3. **Check Mario's test data** - Organization ID: `123e4567-e89b-12d3-a456-426614174000`
4. **Run the test suite** - All endpoints proven working
5. **Follow the template exactly** - No deviations allowed

**THIS IS HERA'S REVOLUTIONARY DNA - PROTECT IT AT ALL COSTS** 🧬

---

## 🏗️ **HERA UNIVERSAL SCHEMA - 6 CORE TABLES REFERENCE**
### Foundation for All Claude CLI Applications

**🎯 CORE PHILOSOPHY**

HERA Universal Schema uses **6 core tables** to handle ALL business data, eliminating the need for custom schemas or table creation. This is the revolutionary difference from traditional ERP systems that require hundreds of tables.

**Universal Principle:**
- **Traditional ERP**: 200+ fixed tables per business type
- **HERA Universal**: 6 dynamic tables for ALL business types
- **Result**: Infinite flexibility without schema changes

### **THE 6 CORE TABLES**

#### **1. CORE_ORGANIZATIONS** - *The "WHO" - Every business entity*
```sql
CREATE TABLE core_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    organization_type VARCHAR(50) NOT NULL,
    business_model VARCHAR(100),
    legal_name VARCHAR(200),
    tax_id VARCHAR(50),
    country_code VARCHAR(2),
    timezone VARCHAR(50),
    industry_sector VARCHAR(100),
    hera_trust_score DECIMAL(3,2) DEFAULT 0.50,
    ai_business_profile JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

#### **2. CORE_ENTITIES** - *The "WHAT" - Every business object*
```sql
CREATE TABLE core_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core_organizations(id),
    entity_type VARCHAR(100) NOT NULL,
    entity_subtype VARCHAR(100),
    name VARCHAR(200) NOT NULL,
    display_name VARCHAR(200),
    description TEXT,
    external_id VARCHAR(100),
    system_code VARCHAR(50),
    business_value DECIMAL(15,2),
    importance_level VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    lifecycle_stage VARCHAR(50),
    ai_classification JSONB,
    ai_insights JSONB,
    trust_indicators JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    is_active BOOLEAN DEFAULT TRUE
);
```

#### **3. CORE_DYNAMIC_DATA** - *The "HOW" - Every field for every entity*
```sql
CREATE TABLE core_dynamic_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES core_entities(id),
    field_name VARCHAR(200) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    field_subtype VARCHAR(50),
    text_value TEXT,
    number_value DECIMAL(20,6),
    boolean_value BOOLEAN,
    date_value TIMESTAMP,
    json_value JSONB,
    file_value JSONB,
    computed_value JSONB,
    ai_enhanced_value JSONB,
    display_name VARCHAR(200),
    description TEXT,
    field_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT FALSE,
    validation_rules JSONB,
    business_rules JSONB,
    is_sensitive BOOLEAN DEFAULT FALSE,
    is_pii BOOLEAN DEFAULT FALSE,
    encryption_required BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    previous_value JSONB,
    changed_at TIMESTAMP DEFAULT NOW(),
    changed_by UUID,
    ai_validation_score DECIMAL(3,2),
    ai_confidence_level DECIMAL(3,2),
    trust_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

#### **4. CORE_RELATIONSHIPS** - *The "CONNECTIONS" - How entities relate*
```sql
CREATE TABLE core_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core_organizations(id),
    relationship_type VARCHAR(100) NOT NULL,
    relationship_subtype VARCHAR(100),
    relationship_name VARCHAR(200),
    relationship_code VARCHAR(50),
    parent_entity_id UUID NOT NULL REFERENCES core_entities(id),
    child_entity_id UUID NOT NULL REFERENCES core_entities(id),
    relationship_data JSONB,
    relationship_metadata JSONB,
    relationship_score DECIMAL(3,2),
    relationship_priority INTEGER DEFAULT 0,
    is_bidirectional BOOLEAN DEFAULT FALSE,
    is_hierarchical BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    effective_from TIMESTAMP DEFAULT NOW(),
    effective_to TIMESTAMP,
    distance_to_root INTEGER DEFAULT 0,
    depth_level INTEGER DEFAULT 0,
    is_terminal_node BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);
```

#### **5. AI_SCHEMA_REGISTRY** - *The "WHY" - AI-defined structures*
```sql
CREATE TABLE ai_schema_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES core_organizations(id),
    schema_name VARCHAR(200) NOT NULL,
    schema_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    user_prompt TEXT,
    ai_interpretation JSONB,
    generation_model VARCHAR(100),
    schema_definition JSONB NOT NULL,
    field_definitions JSONB NOT NULL,
    validation_rules JSONB,
    business_rules JSONB,
    form_layout JSONB,
    display_preferences JSONB,
    workflow_definition JSONB,
    confidence_score DECIMAL(3,2),
    validation_status VARCHAR(50),
    user_feedback JSONB,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(3,2),
    error_patterns JSONB,
    version INTEGER DEFAULT 1,
    parent_schema_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    approved_by UUID,
    is_active BOOLEAN DEFAULT TRUE
);
```

#### **6. AI_SCHEMA_COMPONENTS** - *The "DETAILS" - AI-managed field definitions*
```sql
CREATE TABLE ai_schema_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schema_registry_id UUID NOT NULL REFERENCES ai_schema_registry(id),
    component_name VARCHAR(200) NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    component_subtype VARCHAR(100),
    field_name VARCHAR(200),
    field_type VARCHAR(50),
    field_subtype VARCHAR(50),
    display_name VARCHAR(200),
    description TEXT,
    placeholder_text VARCHAR(200),
    help_text TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    min_length INTEGER,
    max_length INTEGER,
    min_value DECIMAL(20,6),
    max_value DECIMAL(20,6),
    regex_pattern VARCHAR(500),
    custom_validation JSONB,
    business_rules JSONB,
    calculation_formula TEXT,
    conditional_logic JSONB,
    display_order INTEGER DEFAULT 0,
    width_percentage INTEGER DEFAULT 100,
    is_visible BOOLEAN DEFAULT TRUE,
    is_editable BOOLEAN DEFAULT TRUE,
    ai_suggested_values JSONB,
    ai_validation_patterns JSONB,
    ai_improvement_suggestions JSONB,
    parent_component_id UUID,
    related_components JSONB,
    usage_frequency INTEGER DEFAULT 0,
    error_rate DECIMAL(3,2),
    user_satisfaction_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

### **🧠 CORE RELATIONSHIPS FLOW**
```
core_organizations (WHO)
    ↓
core_entities (WHAT)
    ↓
core_dynamic_data (HOW)
    ↑
core_relationships (CONNECTIONS)
    ↑
ai_schema_registry (WHY)
    ↓
ai_schema_components (DETAILS)
```

### **🚀 BENEFITS FOR CLAUDE CLI**

**1. Zero Schema Changes**
- **Never create new tables** - use the 6 core tables
- **Add new fields** - insert into core_dynamic_data
- **New business objects** - insert into core_entities
- **Create relationships** - insert into core_relationships

**2. Consistent Architecture**
- **Same pattern** for all business types
- **Same queries** for all data access
- **Same validation** for all fields
- **Same relationships** for all connections

**3. AI-First Design**
- **Natural language** to schema generation
- **Automatic validation** and business rules
- **Continuous learning** from user feedback
- **Intelligent relationship detection**

**4. Infinite Flexibility**
- **Any business model** can be represented
- **Any field type** can be stored
- **Any relationship** can be modeled
- **Any hierarchy** can be created

### **🔧 IMPLEMENTATION GUIDELINES FOR CLAUDE CLI**

**Never suggest creating new tables** - always use the 6 core tables:
1. **Business objects** → core_entities
2. **Field data** → core_dynamic_data
3. **Connections** → core_relationships
4. **AI schemas** → ai_schema_registry
5. **Form definitions** → ai_schema_components

### **🎯 CRITICAL: AI SCHEMA TABLES vs ENTITY TABLES**

**THE FUNDAMENTAL DIFFERENCE - ENGRAINED FOREVER:**

#### **Entity Tables = THE DATA (Real Business Records)**
- **core_entities** - Actual business objects (real customers, products, orders)
- **core_dynamic_data** - Actual field values (real names, emails, prices)
- **core_relationships** - Actual connections (real customer-order relationships)

#### **AI Schema Tables = THE BLUEPRINTS (Form Instructions)**
- **ai_schema_registry** - Instructions for creating forms/interfaces
- **ai_schema_components** - Instructions for creating form fields

#### **The Flow:**
```
User Request → AI Creates Schema (Blueprint) → System Generates Form → User Fills Form → Data Stored in Entity Tables
```

#### **Examples:**
```sql
-- ENTITY TABLES: Real customer data
INSERT INTO core_entities VALUES ('customer-001', 'org-bakery', 'customer', 'Sarah Johnson');
INSERT INTO core_dynamic_data VALUES ('customer-001', 'email', 'sarah.johnson@email.com');

-- SCHEMA TABLES: Instructions for creating customer forms
INSERT INTO ai_schema_registry VALUES ('schema-customer-form', 'Customer Form Blueprint');
INSERT INTO ai_schema_components VALUES ('comp-email', 'Email Field Instructions');
```

#### **When to Use Which:**
- **Entity Tables For**: Storing actual business data, running operations, reports, transactions
- **Schema Tables For**: Creating dynamic forms, generating interfaces, A/B testing layouts

#### **The Magic:**
- **Entity Tables = Your Business Reality** (customers, orders, products)
- **Schema Tables = Your Form Factory** (blueprints for collecting that reality)
- **They work together but serve completely different purposes**
- **One creates the interface, the other stores the results**

**This separation enables infinite flexibility - change how you collect data without affecting the data itself!**

---

**🎯 REMEMBER: The Universal Promise**

**HERA Universal Schema can handle ANY business requirement with just these 6 core tables. No exceptions. No custom schemas. No table creation. This is the foundation that makes HERA revolutionary.**

---

## 🚨 **CRITICAL: ALWAYS USE THE VERIFIED ACTUAL SCHEMA - NEVER ASSUME FIELDS**

**🔍 BEFORE ANY DATABASE OPERATION, RUN:**
```bash
node scripts/verify-schema.js
```

**VERIFIED ACTUAL SCHEMA (Live from Supabase - Last checked: 2025-01-18):**

### **✅ core_entities** 
```
id, organization_id, entity_type, entity_name, entity_code, is_active, created_at, updated_at
```

### **✅ core_organizations**
```
id, client_id, org_code, industry, country, currency, is_active, created_at, updated_at, org_name
```

### **✅ core_dynamic_data**
```
id, entity_id, field_name, field_value, field_type, created_at, updated_at
```

### **✅ core_relationships**
```
id, organization_id, relationship_type_id, relationship_type, relationship_subtype, relationship_name, relationship_code, parent_entity_id, child_entity_id, relationship_data, relationship_metadata, relationship_score, relationship_priority, is_bidirectional, is_hierarchical, is_active, effective_from, effective_to, created_at, created_by, updated_at, updated_by, version, change_reason, distance_to_root, depth_level, is_terminal_node
```

### **✅ ai_schema_registry**
```
id, organization_id, schema_name, schema_type, schema_definition, ai_confidence, is_active, created_at, updated_at
```

### **❌ ai_schema_components** - DOES NOT EXIST

### **✅ core_users**
```
id, email, full_name, is_active, created_at, updated_at, auth_user_id, user_role
```

### **✅ user_organizations**
```
id, user_id, organization_id, role, is_active, created_at, updated_at
```

### **✅ universal_transactions**
```
id, organization_id, transaction_type, transaction_number, transaction_date, total_amount, currency, created_at, updated_at, procurement_metadata, transaction_status, is_financial, transaction_subtype, workflow_status, requires_approval, mapped_accounts, transaction_data, created_by, posting_status, posted_at, released_to_accounting, released_at, released_by, posting_period, journal_entry_id
```

**BEFORE ANY DATABASE OPERATION, YOU MUST:**

1. **Use ONLY the verified tables above** - Never create new tables
2. **Use EXACT field names** - Never assume field names
3. **Map business objects** to core_entities
4. **Store field data** in core_dynamic_data
5. **Create relationships** in core_relationships
6. **Define AI schemas** in ai_schema_registry (ai_schema_components does NOT exist)

**🎯 REMEMBER: The Universal Promise**

**HERA Universal Schema can handle ANY business requirement with just these verified tables. No exceptions. No custom schemas. No table creation. Always use EXACT field names.**

---

## 🎯 **CORE PRINCIPLES FOR CLAUDE CLI**

### **🚨 THE FOUR SACRED PRINCIPLES OF HERA**

#### **1. ORGANIZATION_ID IS SACRED** 🛡️
```sql
-- ❌ NEVER write queries like this:
SELECT * FROM core_entities WHERE entity_type = 'customer';

-- ✅ ALWAYS include organization_id:
SELECT * FROM core_entities 
WHERE organization_id = ? AND entity_type = 'customer';
```
**Why**: Every piece of data belongs to an organization. No exceptions. Ever.

#### **2. USERS = GLOBAL, DATA = TENANT-ISOLATED** 👥
```sql
-- Users exist globally and can belong to multiple organizations
-- ALWAYS check user's access to specific organization:
SELECT role FROM user_organizations 
WHERE user_id = ? AND organization_id = ? AND is_active = true;
```

#### **3. UNIVERSAL SCHEMA = INFINITE FLEXIBILITY** 🌌
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

#### **4. NO NEW TABLES EVER** 🚫
```sql
-- ❌ WRONG - Creating separate tables breaks universal architecture
CREATE TABLE restaurant_menu_items (...);
CREATE TABLE law_firm_cases (...);

-- ✅ RIGHT - Use universal pattern
-- Menu items = entities with entity_type = 'menu_item'
-- Legal cases = entities with entity_type = 'legal_case'
```

### **✅ CRITICAL QUERY PATTERNS**

#### **Pattern 1: Always Include Organization Filter**
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

#### **Pattern 2: Manual Joins for Metadata**
```typescript
// ✅ CORRECT: Separate queries with manual joining
const entities = await supabase
  .from('core_entities')
  .select('*')
  .eq('organization_id', organizationId) // SACRED
  .eq('entity_type', 'product');

const metadata = await supabase
  .from('core_dynamic_data')
  .select('entity_id, field_name, field_value')
  .eq('organization_id', organizationId) // DOUBLE CHECK
  .in('entity_id', entityIds);

// Manual join using Map for performance
const metadataMap = new Map();
metadata?.forEach(m => metadataMap.set(m.entity_id, m));
```

---

## 🔧 **HERA UNIVERSAL CRUD**

**Universal CRUD** is HERA's standardized, enterprise-grade CRUD template system that applies **Toyota Manufacturing principles** to software development.

### **🎯 What is Universal CRUD?**

**Universal CRUD** is a **single, reusable component** that can handle ANY entity type (products, customers, orders, etc.) with **zero custom code** - just configuration.

### **🚀 30-Second Implementation**

```typescript
// Step 1: Define fields
const productFields = [
  { key: 'name', label: 'Product Name', type: 'text', required: true },
  { key: 'price', label: 'Price', type: 'currency', required: true },
  { key: 'category', label: 'Category', type: 'select', required: true }
]

// Step 2: Use Universal CRUD
const ProductsPage = () => (
  <HERAUniversalCRUD
    entityType="products"
    entityTypeLabel="Products"
    service={ProductService}
    fields={productFields}
  />
)
```

**Result:** Complete products management system with search, filtering, bulk operations, export, and real-time updates - in **30 seconds**.

### **🏭 Toyota Manufacturing Benefits**

#### **Results:**
- **99.7% time reduction** (2-3 days → 10 minutes)
- **100% consistency** across all CRUDs
- **Zero quality variations**
- **10x developer productivity**

**Universal CRUD = Toyota Manufacturing applied to software development.**

---

*This reference document should be used by Claude CLI for ALL database operations and schema decisions. The 6 core tables are the only database structure needed for any HERA application.*

---

## 🧬 **QUICK DNA REFERENCE - COPY/PASTE TEMPLATES**

### **🚀 New API Route Handler (Copy This)**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const { data: entities, error } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'YOUR_ENTITY_TYPE');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch entities' }, { status: 500 });
    }

    return NextResponse.json({ data: entities });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### **📊 Mario's Test Organization ID**
```
123e4567-e89b-12d3-a456-426614174000
```

### **🧪 API Test Commands (Copy These)**
```bash
# GET entities
curl -X GET "http://localhost:3000/api/[domain]/[entity]?organizationId=123e4567-e89b-12d3-a456-426614174000"

# POST create entity
curl -X POST "http://localhost:3000/api/[domain]/[entity]" \
  -H "Content-Type: application/json" \
  -d '{"organizationId": "123e4567-e89b-12d3-a456-426614174000", "name": "Test Entity"}'

# GET individual entity
curl -X GET "http://localhost:3000/api/[domain]/[entity]/[id]"
```

### **🔧 Core Tables Query Patterns**
```typescript
// 1. Get entities
const { data: entities } = await supabase
  .from('core_entities')
  .select('*')
  .eq('organization_id', organizationId)
  .eq('entity_type', 'your_type');

// 2. Get dynamic data
const { data: dynamicData } = await supabase
  .from('core_dynamic_data')
  .select('entity_id, field_name, field_value')
  .in('entity_id', entityIds);

// 3. Create relationships
await supabase
  .from('core_relationships')
  .insert({
    organization_id: organizationId,
    relationship_type: 'your_relationship',
    parent_entity_id: parentId,
    child_entity_id: childId
  });

// 4. Create transactions
await supabase
  .from('universal_transactions')
  .insert({
    organization_id: organizationId,
    transaction_type: 'your_transaction_type',
    transaction_number: 'TXN-001',
    total_amount: 100.00,
    currency: 'USD'
  });
```

### **⚡ Working Examples Reference**
- **Suppliers API**: `/app/api/purchasing/suppliers/`
- **Purchase Orders API**: `/app/api/purchasing/purchase-orders/`
- **Test Data**: Mario's Restaurant with 4 suppliers, 5 purchase orders
- **Proven Patterns**: All CRUD operations tested and working

**REMEMBER: This is our DNA. Every new feature MUST follow these exact patterns.** 🧬