# 🤖 CLAUDE CLI Guide for HERA Universal

## 🚀 Quick Start

### **Starting a New Session**
```bash
# From the project root
cd /Users/san/Documents/hera-erp
claude

# Or from frontend directory
cd /Users/san/Documents/hera-erp/frontend
claude
```

### **Essential Context to Provide**
When starting a new Claude CLI session, always mention:
1. **Current Working Directory**: Where you are in the project
2. **What You're Working On**: Specific feature or issue
3. **Any Recent Changes**: What was done in previous sessions

## 📋 Project Overview

### **HERA Universal Architecture**
- **Universal Transaction System**: All business data flows through universal schema
- **Multi-Tenant Architecture**: Organization-based data isolation
- **Mobile-First Design**: Complete offline capabilities with PWA
- **AI-Enhanced**: Persistent AI memory and pattern recognition
- **Real-Time**: Live updates using Supabase subscriptions

### **Key Directories**
```
hera-erp/
├── frontend/          # Next.js 15 application
├── backend/           # Python AI engine & Node.js services
├── database/          # PostgreSQL schemas and migrations
├── scripts/           # Utility scripts
├── .github/workflows/ # CI/CD pipelines
└── docs/             # Documentation
```

## 🏗️ Common Tasks

### **1. Database Operations**
```bash
# ALWAYS use UniversalCrudService for database operations
# This is the default and required approach

# Example:
"Create a new product in the database"
"Update customer information"
"Setup a new restaurant"
```

**Claude will automatically use:**
- `UniversalCrudService` from `/lib/services/universalCrudService.ts`
- Service role pattern with proper RLS bypass
- Sequential operations for dependent entities

### **2. Creating New Features**
```bash
# Request pattern:
"Create a new [feature] page for [module]"
"Add [functionality] to the restaurant module"
"Implement [business logic] using universal schema"
```

**Claude will:**
- Follow HERA Universal Architecture patterns
- Use existing services and hooks
- Maintain organization isolation
- Create UI with Shadcn components

### **3. Fixing Issues**
```bash
# Be specific about the error:
"Fix TypeScript error in [file]"
"Resolve build error: [error message]"
"Fix authentication flow issue where [description]"
```

### **4. Running Tests**
```bash
# Frontend tests
cd frontend
npm test
npm run test:e2e
npm run test:universal

# Specific test suites
npm run test:auth
npm run test:restaurant
```

### **5. CI/CD Operations**
```bash
# Setup git hooks (one-time)
./scripts/setup-git-hooks.sh

# Test CI/CD locally
cd frontend
npm run ci:check
npm run ci:quick

# Manual build validation
npm run type-check
npm run lint
npm run build
```

## 🛡️ Architecture Rules

### **SACRED PRINCIPLES**
1. **Organization_ID is Sacred**: Every query MUST filter by organization_id
2. **Users = Global, Data = Tenant-Isolated**: Users can belong to multiple organizations
3. **Universal Schema = Infinite Flexibility**: Use core_entities + core_metadata
4. **No New Tables Ever**: Use entity types, not new tables

### **Required Patterns**
```typescript
// ✅ ALWAYS include organization filter
const { data } = await supabase
  .from('core_entities')
  .select('*')
  .eq('organization_id', organizationId) // MANDATORY
  .eq('entity_type', 'product');

// ✅ Use manual joins (no foreign keys)
const entities = await getEntities();
const metadata = await getMetadata();
const joined = manualJoin(entities, metadata);

// ✅ Get organization context from hook
const { restaurantData } = useRestaurantManagement();
const organizationId = restaurantData?.organizationId;
```

## 🔧 Development Workflow

### **1. Before Making Changes**
```bash
# Check current branch
git status
git branch

# Update from main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### **2. Making Changes**
```bash
# Let Claude know the context:
"I'm working on [feature] in the [module] module"
"Previous session we implemented [what was done]"
"Now I need to [what you need]"
```

### **3. Testing Changes**
```bash
# Build validation (catches syntax errors)
cd frontend && npm run build

# Run relevant tests
npm run test:universal
npm run test:e2e

# Check for TypeScript errors
npm run type-check
```

### **4. Committing Changes**
```bash
# Stage changes
git add .

# Commit (triggers pre-commit hooks)
git commit -m "feat: Description of changes"

# If blocked by hooks, fix issues first
# Or bypass temporarily:
git commit --no-verify -m "wip: Work in progress"
```

## 📊 Service Patterns

### **Universal CRUD Operations**
```typescript
import UniversalCrudService from '@/lib/services/universalCrudService';

// Create
const result = await UniversalCrudService.createEntity(data, 'product');

// Read
const entity = await UniversalCrudService.readEntity(id);

// Update
const updated = await UniversalCrudService.updateEntity(id, updates);

// Delete
const deleted = await UniversalCrudService.deleteEntity(id);

// Sequential operations
const results = await UniversalCrudService.sequentialOperation(operations);
```

### **Transaction Processing**
```typescript
import { UniversalTransactionService } from '@/lib/services/universalTransactionService';

// Create order
const order = await UniversalTransactionService.createOrder({
  organizationId,
  customerName,
  items: [...]
});

// Update status
await UniversalTransactionService.updateOrderStatus(orderId, 'READY');
```

### **Product Management**
```typescript
import { UniversalProductService } from '@/lib/services/universalProductService';

// Initialize for organization
await UniversalProductService.initializeProductData(organizationId);

// CRUD operations
const products = await UniversalProductService.fetchProducts(organizationId);
```

## 🚨 Common Issues & Solutions

### **Issue: "No restaurant found for user"**
```bash
# Tell Claude:
"User sees 'No restaurant found' - need to check user-organization link"

# Claude will check:
- user_organizations table
- Restaurant setup flow
- Organization context
```

### **Issue: "Build errors"**
```bash
# Provide full error:
"Build failed with: [paste error message]"

# Claude will:
- Identify syntax issues
- Fix TypeScript errors
- Resolve import problems
```

### **Issue: "Data not loading"**
```bash
# Describe the issue:
"Products not showing for restaurant user"

# Claude will check:
- Organization ID filters
- Service methods
- Hook implementations
- Real-time subscriptions
```

## 🎯 Best Practices

### **1. Always Provide Context**
- Current working directory
- What module/feature you're working on
- Any errors or issues you're seeing
- What you've tried already

### **2. Be Specific**
- Instead of: "Fix the error"
- Say: "Fix TypeScript error TS2339 in restaurant/products/page.tsx"

### **3. Reference Files**
- Mention specific files when relevant
- Provide error line numbers
- Include relevant code snippets

### **4. Test Incrementally**
- Test after each major change
- Run build checks frequently
- Verify in browser regularly

## 📚 Key Resources

### **Documentation**
- `CLAUDE.md` - Project instructions and patterns
- `README.md` - Project overview
- `CICD-GUIDE.md` - CI/CD pipeline documentation
- `docs/universal.md` - Universal architecture guide

### **Reference Implementations**
- `/app/setup/restaurant/page.tsx` - Complete CRUD example
- `/lib/services/universalProductService.ts` - Service pattern
- `/hooks/useRestaurantManagement.ts` - Organization context
- `/app/restaurant/products/page.tsx` - Full page implementation

### **Testing Examples**
- `/tests/restaurant-setup.spec.ts` - E2E test patterns
- `/scripts/run-tests.js` - Test runner configuration
- `/frontend/playwright.config.ts` - Test setup

## 🔄 Session Continuity

### **When Continuing a Session**
```bash
# Tell Claude:
"Continue from where we left off"
"Last session we were working on [feature]"
"The issue was [description]"
```

### **Starting Fresh**
```bash
# Clear context:
"Starting new work on [feature]"
"Need to implement [requirement]"
"Using HERA Universal patterns"
```

## 🚀 Quick Commands Reference

```bash
# Development
cd frontend && npm run dev

# Testing
npm run test
npm run test:e2e
npm run test:universal

# Building
npm run build
npm run type-check
npm run lint

# CI/CD
npm run ci:check
./scripts/setup-git-hooks.sh

# Database
node scripts/run-migrations.js
node test-supabase-connection.js
```

## 💡 Pro Tips

1. **Use Git Hooks**: Run `./scripts/setup-git-hooks.sh` once to catch errors early
2. **Check Organization Context**: Always verify `organizationId` is available
3. **Follow Universal Patterns**: Use core_entities + core_metadata for everything
4. **Test Offline**: Verify mobile scanner features work without connectivity
5. **Monitor Performance**: Check bundle size after adding features

---

**Remember**: Claude is context-aware of HERA Universal's architecture and will automatically follow the established patterns. Just describe what you need, and Claude will implement it correctly using the universal schema, proper organization isolation, and existing services.

**This guide ensures consistent, high-quality development across all Claude CLI sessions!** 🚀