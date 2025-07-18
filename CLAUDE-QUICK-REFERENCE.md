# 🚀 CLAUDE CLI Quick Reference Card

## 🎯 Starting Claude
```bash
cd /Users/san/Documents/hera-erp
claude
```

## 📋 Essential Info to Provide
1. **Where you are**: "I'm in the frontend directory"
2. **What you're doing**: "Working on restaurant products feature"  
3. **Any context**: "Last session we fixed authentication"

## 🛠️ Most Common Commands

### Database Operations
```bash
"Create a new [entity] in the database"
"Update [entity] information"
"Fetch all [entities] for current organization"
```

### Creating Features
```bash
"Create a new [feature] page in restaurant module"
"Add [functionality] to [existing page]"
"Implement [business logic] using universal schema"
```

### Fixing Issues
```bash
"Fix TypeScript error: [paste error]"
"Fix build error in [file]:[line]"
"Debug why [feature] is not working"
```

### Testing
```bash
cd frontend
npm run build          # Check for syntax errors
npm run type-check     # TypeScript validation
npm run test:e2e       # Run E2E tests
npm run ci:check       # Full CI validation
```

## 🏗️ Key Patterns

### Always Use Organization Context
```typescript
const { restaurantData } = useRestaurantManagement();
const organizationId = restaurantData?.organizationId;
```

### Universal CRUD Service
```typescript
import UniversalCrudService from '@/lib/services/universalCrudService';
// Claude uses this by default for all DB operations
```

### Transaction Processing
```typescript
import { UniversalTransactionService } from '@/lib/services/universalTransactionService';
// For orders, invoices, payments
```

## 🚨 Common Issues

| Issue | Tell Claude |
|-------|------------|
| "No restaurant found" | "Check user-organization link" |
| Build errors | "Fix build error: [paste full error]" |
| Data not loading | "[Entity] not showing for user" |
| TypeScript errors | "Fix TS error in [file]:[line]" |

## 📁 Key Files

### Services
- `/lib/services/universalCrudService.ts` - DB operations
- `/lib/services/universalTransactionService.ts` - Orders
- `/lib/services/universalProductService.ts` - Products

### Hooks  
- `/hooks/useRestaurantManagement.ts` - Organization context
- `/hooks/useProducts.ts` - Product management
- `/hooks/useUniversalAnalytics.ts` - Analytics

### Pages
- `/app/setup/restaurant/page.tsx` - Setup flow
- `/app/restaurant/products/page.tsx` - Products
- `/app/restaurant/orders/page.tsx` - Orders

## ⚡ Quick Fixes

### Clear TypeScript Cache
```bash
rm -rf .next
npm run build
```

### Reset Git Hooks
```bash
./scripts/setup-git-hooks.sh
```

### Test Specific Feature
```bash
npm run test -- restaurant-setup
```

## 🔄 Git Workflow
```bash
git add .
git commit -m "feat: description"
# If blocked by hooks:
git commit --no-verify -m "wip: fixing issues"
```

## 📚 Documentation
- `CLAUDE.md` - Architecture rules
- `CLAUDE-CLI-GUIDE.md` - Detailed guide
- `README.md` - Project overview
- `CICD-GUIDE.md` - CI/CD info

---

**Remember**: Claude knows HERA's patterns. Just describe what you need!