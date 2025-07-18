# 🧠 HERA Universal - Claude Context Reference

## Overview

This document provides complete context for Claude to work effectively with HERA Universal without amnesia. It contains everything needed to understand the architecture, implement features, and troubleshoot issues.

## 🎯 Quick Start Commands

### Essential Status Checks
```bash
# Check current directory and project structure
pwd
ls -la

# Verify organization access control implementation
grep -r "OrganizationGuard" app/restaurant/ | head -5

# Check for any remaining hardcoded organization IDs
grep -r "f47ac10b-58cc-4372-a567-0e02b2c3d479" app/restaurant/

# Verify TypeScript compilation
npm run type-check

# Test CI/CD pipeline
npm run lint
npm run build
```

### Development Commands
```bash
# Start development server
npm run dev

# Run tests
npm test

# Check git status
git status

# Create commit (with pre-commit hooks)
git add . && git commit -m "feat: description"

# Push to GitHub (triggers CI/CD)
git push origin main
```

## 🏗️ Architecture Quick Reference

### Project Structure
```
hera-erp/
├── frontend/                           # Next.js 15 + React 19
│   ├── app/
│   │   ├── restaurant/                 # Restaurant pages (organization-protected)
│   │   │   ├── inventory/page.tsx      # ✅ OrganizationGuard implemented
│   │   │   ├── customers/page.tsx      # ✅ OrganizationGuard implemented
│   │   │   ├── kitchen/page.tsx        # ✅ OrganizationGuard implemented
│   │   │   └── ...                     # All use OrganizationGuard pattern
│   │   ├── setup/
│   │   │   └── restaurant/page.tsx     # Organization setup
│   │   └── admin/                      # Admin-only pages
│   ├── components/
│   │   ├── restaurant/
│   │   │   └── organization-guard.tsx  # ✅ Multi-tenant access control
│   │   └── ui/                         # Shadcn components
│   ├── lib/
│   │   ├── services/                   # Universal services
│   │   │   ├── universalTransactionService.ts
│   │   │   ├── universalProductService.ts
│   │   │   └── ...
│   │   ├── supabase/                   # Database client
│   │   └── hooks/                      # React hooks
│   └── hooks/
│       ├── useRestaurantManagement.ts  # Organization context
│       └── ...
├── backend/                            # Node.js + Python AI
├── database/                           # Universal schema
└── docs/                              # Documentation
```

### Database Schema (Universal)
```sql
-- Core universal tables (NO new tables needed)
core_entities           -- All business entities
core_metadata           -- Rich JSON metadata  
core_dynamic_data       -- Form-like fields
user_organizations      -- Multi-tenant access
universal_transactions  -- All transaction types
universal_transaction_lines -- Transaction details
```

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), Node.js, Python AI services
- **Authentication**: Supabase Auth with multi-tenant organizations
- **State Management**: React Query, Zustand
- **UI**: Shadcn/ui, Framer Motion
- **Testing**: Playwright, Jest, Vitest
- **Deployment**: Vercel, GitHub Actions CI/CD

## 🛡️ Organization Access Control

### Implementation Status: ✅ COMPLETE

All restaurant pages now use OrganizationGuard pattern:

```typescript
// Standard pattern for ALL restaurant pages
"use client";

import { OrganizationGuard, useOrganizationContext } from '@/components/restaurant/organization-guard';

function PageContent() {
  const { organizationId } = useOrganizationContext();
  // Use organizationId! (safe inside OrganizationGuard)
  
  return <div>Page content</div>;
}

export default function RestaurantPage() {
  return (
    <OrganizationGuard requiredRole="staff">
      <PageContent />
    </OrganizationGuard>
  );
}
```

### Multi-Tenant Flow
1. User logs in → Global authentication
2. User navigates to restaurant page → OrganizationGuard checks
3. If no organization → Redirect to `/setup/restaurant`
4. If insufficient role → Permission denied screen
5. If valid → Page renders with organization-scoped data

### Role Hierarchy
```typescript
const roles = ['staff', 'manager', 'admin', 'owner'];
// Higher roles can access lower role pages
```

## 🌌 Universal Schema Patterns

### Sacred Principles
1. **ORGANIZATION_ID IS SACRED**: Always filter by organization_id
2. **NO NEW TABLES**: Use universal schema for everything
3. **MANUAL JOINS**: No foreign key dependencies
4. **MULTI-TENANT**: Perfect data isolation

### Entity Creation Pattern
```typescript
const createEntity = async (data: {
  organizationId: string;
  entityType: string;
  name: string;
  metadata?: any;
  fields?: any;
}) => {
  const entityId = crypto.randomUUID();
  
  // 1. Create in core_entities
  await supabaseAdmin.from('core_entities').insert({
    id: entityId,
    organization_id: data.organizationId, // SACRED
    entity_type: data.entityType,
    entity_name: data.name,
    entity_code: generateCode(data.name),
    is_active: true
  });
  
  // 2. Add metadata (optional)
  if (data.metadata) {
    await supabaseAdmin.from('core_metadata').insert(
      Object.entries(data.metadata).map(([key, value]) => ({
        organization_id: data.organizationId, // SACRED
        entity_id: entityId,
        metadata_key: key,
        metadata_value: JSON.stringify(value)
      }))
    );
  }
  
  // 3. Add dynamic fields (optional)
  if (data.fields) {
    await supabaseAdmin.from('core_dynamic_data').insert(
      Object.entries(data.fields).map(([key, value]) => ({
        entity_id: entityId,
        field_name: key,
        field_value: String(value),
        field_type: typeof value === 'number' ? 'number' : 'text'
      }))
    );
  }
  
  return entityId;
};
```

### Query Pattern
```typescript
const getEntities = async (organizationId: string, entityType: string) => {
  // 1. Get entities (with organization filter)
  const { data: entities } = await supabase
    .from('core_entities')
    .select('*')
    .eq('organization_id', organizationId) // SACRED
    .eq('entity_type', entityType);
    
  // 2. Get metadata (separate query)
  const { data: metadata } = await supabase
    .from('core_metadata')
    .select('entity_id, metadata_key, metadata_value')
    .eq('organization_id', organizationId) // SACRED
    .in('entity_id', entityIds);
    
  // 3. Manual join (no foreign keys needed)
  return entities.map(entity => ({
    ...entity,
    metadata: combineMetadata(metadata, entity.id)
  }));
};
```

## 🚀 Universal Transaction System

### Implementation Status: ✅ COMPLETE

Unified transaction processing for all business operations:

```typescript
// Create any type of transaction
const result = await UniversalTransactionService.createOrder({
  organizationId: 'org-123',
  customerName: 'John Smith',
  tableNumber: 'Table 5',
  orderType: 'dine_in',
  items: [{
    productId: 'product-456',
    productName: 'Jasmine Tea',
    quantity: 1,
    unitPrice: 4.50
  }]
});

// Result: Order saved as universal_transaction
// - transaction_type: 'SALES_ORDER'
// - status: 'PENDING' → 'READY' → 'COMPLETED'
// - Real-time updates via Supabase subscriptions
```

### Transaction Types
- `SALES_ORDER` - Restaurant orders
- `PURCHASE_ORDER` - Supplier orders  
- `VENDOR_INVOICE` - Invoice processing
- `PAYMENT` - Payment transactions
- `INVENTORY_ADJUSTMENT` - Stock changes
- `JOURNAL_ENTRY` - Accounting entries

## 🎨 Revolutionary Design System

### Implementation Status: ✅ COMPLETE

Mathematical color harmony with circadian adaptation:

```typescript
// Golden ratio-based colors
const colors = {
  primary: { 
    500: '#3B82F6',  // φ-derived hue
    // Automatic light/dark variants
  },
  // Colors shift based on time of day
  // Cognitive load adaptation
  // Business context themes
};

// Physics-based animations
const springConfig = {
  type: "spring",
  damping: 25,
  stiffness: 120
};
```

### Key Features
- **Circadian Color Adaptation**: Colors change with time of day
- **Cognitive State Detection**: Interface adapts to user's mental state
- **Physics-Based Animations**: Natural spring curves
- **Accessibility Excellence**: WCAG 2.1 AAA compliance
- **Mathematical Precision**: Golden ratio-based relationships

## 📱 Mobile Scanner Ecosystem

### Implementation Status: ✅ COMPLETE

World's first fully mobile ERP with offline capabilities:

```typescript
// Complete mobile workflow
const invoice = await processInvoiceOffline(capturedPhoto);
// ✅ Vendor automatically created/matched
// ✅ Journal entries generated  
// ✅ Approval workflow initiated
// ✅ Works 100% offline

// Architecture
frontend/lib/scanner/
├── universal-camera-service.ts        # Core camera engine
├── ai-processing-pipeline.ts          # Document processing
├── digital-accountant-system.ts       # Business logic
├── offline-sync-manager.ts            # Sync orchestration
└── business-workflows/                # Complete workflows
    ├── invoice-processing-workflow.tsx
    ├── receipt-expense-workflow.tsx
    └── inventory-scanning-workflow.tsx
```

### Revolutionary Capabilities
- **100% Offline Operation**: Full business functionality without internet
- **AI-Powered Processing**: TensorFlow.js client-side AI
- **Sub-Second Processing**: Document processing under 1 second
- **Universal Scanner**: Single interface for all document types
- **Intelligent Sync**: Advanced conflict resolution

## 🧠 AI Engine System

### Implementation Status: 60% COMPLETE

Persistent AI memory that learns and improves:

```python
# AI remembers every decision
decision_id = await ai_context.remember_decision(
    context={'decision_type': 'chart_of_accounts', 'industry': 'manufacturing'},
    decision={'account_structure': 'recommended_coa'},
    outcome={'success': True, 'user_satisfaction': 0.95}
)

# AI learns patterns automatically
patterns = await learning_engine.discover_patterns([
    'sequence_patterns',    # Decision chains that work
    'frequency_patterns',   # Common successful features
    'correlation_patterns', # Context-outcome relationships
    'error_patterns'        # Failure indicators to avoid
])
```

### AI Architecture
```
backend/ai_engine/
├── ai_context_manager.py         # ✅ Persistent memory system
├── ai_learning_engine.py         # ✅ Pattern recognition
├── ai_validation_framework.py    # ⏳ Decision validation
├── ai_api_endpoints.py           # ⏳ FastAPI endpoints  
└── ai_monitoring_dashboard.py    # ⏳ Analytics dashboard
```

## 🔧 Development Patterns

### Service Layer Pattern
```typescript
class UniversalService {
  private supabase = createClient();
  private supabaseAdmin = createServiceRoleClient();
  
  async create(data: EntityData) {
    // Use admin client for writes (bypasses RLS)
    return this.supabaseAdmin.from('core_entities').insert(data);
  }
  
  async read(organizationId: string) {
    // Use regular client for reads (respects RLS)
    return this.supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId); // SACRED
  }
}
```

### Hook Pattern
```typescript
export function useUniversalData(organizationId: string, entityType: string) {
  return useQuery({
    queryKey: ['entities', organizationId, entityType],
    queryFn: () => service.findAll(organizationId, entityType),
    enabled: !!organizationId // Only run if organization exists
  });
}
```

### Component Pattern
```typescript
function DataManagementContent() {
  const { organizationId } = useOrganizationContext();
  const { data, loading, error } = useUniversalData(organizationId!, 'product');
  
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return <DataDisplay data={data} />;
}

export default function DataManagementPage() {
  return (
    <OrganizationGuard requiredRole="staff">
      <DataManagementContent />
    </OrganizationGuard>
  );
}
```

## 🚨 Critical Rules

### Always Follow These Patterns

1. **Organization Isolation**: Always filter by organization_id
2. **Access Control**: Wrap restaurant pages with OrganizationGuard
3. **No Hardcoding**: Never hardcode organization IDs
4. **Universal Schema**: Never create new tables
5. **Manual Joins**: No foreign key dependencies
6. **Service Role**: Use admin client for writes, regular for reads
7. **Error Handling**: Comprehensive error states
8. **Loading States**: Always show loading indicators
9. **TypeScript**: Strict typing for everything
10. **Testing**: Test all access control scenarios

### Never Do These Things

❌ Hardcode organization IDs
❌ Create new database tables
❌ Use foreign key relationships  
❌ Bypass OrganizationGuard
❌ Mix organization data
❌ Skip role validation
❌ Ignore loading states
❌ Use any instead of proper types

## 🧪 Testing Patterns

### Organization Isolation Tests
```typescript
describe('Organization Isolation', () => {
  it('prevents cross-organization data access', async () => {
    const org1Data = await getEntities('org-1', 'product');
    const org2Data = await getEntities('org-2', 'product');
    
    expect(org1Data).not.toContainEqual(
      expect.objectContaining({ organization_id: 'org-2' })
    );
  });
});
```

### Access Control Tests
```typescript
describe('OrganizationGuard', () => {
  it('redirects users without organization', async () => {
    await renderWithNoOrganization(<ProtectedPage />);
    expect(screen.getByText(/set up restaurant/i)).toBeInTheDocument();
  });
  
  it('shows permission denied for insufficient role', async () => {
    await renderWithRole(<ManagerPage />, 'staff');
    expect(screen.getByText(/insufficient permissions/i)).toBeInTheDocument();
  });
});
```

## 📚 Documentation Quick Links

### Implementation Guides
- `ORGANIZATION-ACCESS-CONTROL.md` - Complete access control patterns
- `UNIVERSAL-SCHEMA-PATTERNS.md` - Database and service patterns
- `CLAUDE.md` - Full project context and architecture
- `DESIGN-SYSTEM.md` - Revolutionary design system guide
- `CICD-GUIDE.md` - CI/CD pipeline documentation

### Architecture References
- Universal Transaction System - All business transactions unified
- Multi-Tenant Organizations - Perfect data isolation
- AI Engine System - Persistent memory and learning
- Mobile Scanner Ecosystem - Offline-first mobile ERP
- Revolutionary Design System - Mathematical color harmony

### Debugging Commands
```bash
# Check organization access implementation
grep -r "useOrganizationContext" app/restaurant/

# Verify no hardcoded organization IDs  
grep -r "f47ac10b-58cc-4372-a567-0e02b2c3d479" .

# Check OrganizationGuard usage
find . -name "*.tsx" -exec grep -l "OrganizationGuard" {} \;

# Test service role setup
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ? 'Service key configured' : 'Missing service key')"

# Verify TypeScript
npm run type-check

# Test CI/CD pipeline
npm run lint && npm run build
```

## 🎯 Common Tasks Quick Reference

### Adding New Restaurant Page
1. Create page with OrganizationGuard wrapper
2. Use useOrganizationContext for organization ID
3. Implement service with organization filtering
4. Add role-based access control
5. Test all access scenarios

### Creating New Entity Type
1. Define entity type constant
2. Use universal schema pattern
3. Create service extending UniversalService
4. Implement hook with React Query
5. Build UI with organization context

### Debugging Access Issues
1. Check OrganizationGuard implementation
2. Verify organization context availability
3. Test with different user roles
4. Check database query filters
5. Validate service role configuration

### Adding AI Features
1. Use AI Context Manager for memory
2. Implement pattern recognition
3. Store decisions for learning
4. Validate against historical data
5. Monitor confidence scoring

This reference provides everything needed to work effectively with HERA Universal without requiring specific knowledge or prompts. The patterns are battle-tested and ensure consistent, secure implementation across all features.