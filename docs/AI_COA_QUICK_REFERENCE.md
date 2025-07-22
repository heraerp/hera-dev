# AI Chart of Accounts - Quick Reference Guide

## 🚀 Quick Start

### 1. Generate Accounts with AI
```bash
curl -X POST "/api/finance/chart-of-accounts/ai-generate" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "123e4567-e89b-12d3-a456-426614174000",
    "businessType": "restaurant", 
    "description": "Italian restaurant with catering and delivery",
    "complexity": "intermediate"
  }'
```

### 2. Check for Duplicates
```bash
curl -X POST "/api/finance/chart-of-accounts/check-duplicates" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "123e4567-e89b-12d3-a456-426614174000",
    "accountCodes": ["1001000", "1002000"],
    "suggestAlternatives": true
  }'
```

### 3. Create Accounts in Bulk
```bash
curl -X POST "/api/finance/chart-of-accounts/bulk-create" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "123e4567-e89b-12d3-a456-426614174000",
    "accounts": [/* AI-generated accounts array */]
  }'
```

## 📊 9-Category Structure

| Category | Code Range | Examples |
|----------|------------|----------|
| ASSET | 1000000-1999999 | Cash (1001000), Inventory (1003000) |
| LIABILITY | 2000000-2999999 | Accounts Payable (2001000) |
| EQUITY | 3000000-3999999 | Owner's Capital (3001000) |
| REVENUE | 4000000-4999999 | Food Sales (4001000) |
| COST_OF_SALES | 5000000-5999999 | Food Cost (5001000) |
| DIRECT_EXPENSE | 6000000-6999999 | Staff Wages (6001000) |
| INDIRECT_EXPENSE | 7000000-7999999 | Marketing (7001000) |
| TAX_EXPENSE | 8000000-8999999 | Payroll Taxes (8002000) |
| EXTRAORDINARY_EXPENSE | 9000000-9999999 | Legal Settlements (9001000) |

## 🛡️ Duplicate Prevention Layers

1. **Frontend**: Real-time validation
2. **Request**: Within-request duplicate check
3. **Database**: Existing account queries
4. **Smart Handling**: Skip duplicates, don't fail
5. **Alternatives**: Auto-generate alternative codes
6. **Organization**: Isolated per organization
7. **Constraints**: Database-level unique indexes

## 🧠 AI Features

### Business Types
- `restaurant` - Full restaurant operations
- `cafe` - Cafe and coffee shop
- `bakery` - Bakery and pastry shop
- `food_truck` - Mobile food service
- `catering` - Catering services

### Complexity Levels
- `basic` - Essential accounts only (15 accounts)
- `intermediate` - Essential + Recommended (25 accounts)
- `advanced` - Complete structure (35+ accounts)

### Specific Needs
- `delivery` - Third-party delivery platforms
- `catering` - Catering and events
- `bar` - Alcoholic beverage service
- `retail` - Retail product sales
- `franchising` - Franchise operations

## 🔧 Common Patterns

### Standard Account Creation
```typescript
const account = {
  accountName: "Cash - Operating Account",
  accountCode: "1001000", // 7-digit format required
  accountType: "ASSET",
  description: "Primary cash account for daily operations",
  isActive: true,
  allowPosting: true,
  currency: "USD",
  openingBalance: 0,
  taxDeductible: false,
  notes: "Main restaurant cash account"
}
```

### Priority Levels
```typescript
// AI assigns priority levels
{
  priority: "essential",    // Must-have accounts
  priority: "recommended",  // Should-have accounts  
  priority: "optional"      // Nice-to-have accounts
}
```

### AI Reasoning
```typescript
// Each account includes AI explanation
{
  aiReasoning: "Every restaurant needs a primary cash account for daily operations",
  priority: "essential"
}
```

## 📱 Frontend Integration

### Page Structure
```
/finance/chart-of-accounts/create
├── AI Generate Tab (default)
│   ├── Natural Language Input
│   ├── Business Configuration
│   ├── Generated Accounts Review
│   └── Bulk Create Action
└── Manual Create Tab
    ├── Traditional Form
    ├── Real-time Validation
    └── Single Account Creation
```

### UI Components
- `AIGenerationPanel` - Main AI interface
- `AccountReviewList` - Generated accounts display
- `DuplicateChecker` - Real-time validation
- `BulkActionButtons` - Selection and creation controls

## 🔍 Error Handling

### Common Errors
```typescript
// Invalid account code format
{ error: "Account code must be exactly 7 digits" }

// Duplicate within request
{ error: "Duplicate account codes in request", duplicates: ["1001000"] }

// Account already exists
{ status: "skipped", reason: "Account code already exists" }

// Validation failure
{ error: "Validation failed", validationErrors: [...] }
```

### Success Responses
```typescript
// AI Generation Success
{
  success: true,
  data: {
    generatedAccounts: [...],
    summary: { totalAccounts: 25, essential: 15, recommended: 8, optional: 2 }
  }
}

// Bulk Creation Success
{
  success: true, 
  data: {
    totalRequested: 25,
    created: 22,
    skipped: 3,
    failed: 0
  }
}
```

## 🗄️ Database Schema

### core_entities Table
```sql
INSERT INTO core_entities (
  id, organization_id, entity_type, entity_name, entity_code, is_active
) VALUES (
  'uuid', 'org-id', 'chart_of_account', 'Account Name', '1001000', true
);
```

### core_dynamic_data Table
```sql
INSERT INTO core_dynamic_data (entity_id, field_name, field_value, field_type) VALUES
  ('uuid', 'account_type', 'ASSET', 'text'),
  ('uuid', 'description', 'Account description', 'text'),
  ('uuid', 'currency', 'USD', 'text'),
  ('uuid', 'opening_balance', '0', 'decimal');
```

## ⚡ Performance Tips

1. **Batch Operations**: Use bulk-create for multiple accounts
2. **Validation First**: Use `validateOnly: true` for pre-checks
3. **Smart Defaults**: Let AI handle code generation
4. **Organization Scope**: Always include organizationId
5. **Error Handling**: Handle partial failures gracefully

## 🔗 Integration Points

### Digital Accountant
- Account mapping for document processing
- Automatic transaction categorization
- Journal entry generation

### Reporting
- Financial statement generation
- Category-based analytics
- Budget vs actual reporting

### Third-Party
- Export to accounting software
- API integration hooks
- Data synchronization

---

## 🔄 Legacy Migration (New!)

### Upload CSV/Excel
```bash
POST /api/finance/chart-of-accounts/import-csv
Content-Type: multipart/form-data

# Supports QuickBooks, Xero, Sage, Excel, CSV
```

### Intelligent Migration
```bash
POST /api/finance/chart-of-accounts/migrate-legacy
{
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "accounts": [
    {"code": "1000", "name": "Cash", "type": "Asset"}
  ],
  "options": {
    "preserveCodes": true,
    "suggestMissing": true
  }
}

# Response: AI-mapped accounts with 95%+ accuracy
```

### Migration UI
```
Navigate to: /finance/chart-of-accounts/migrate
- Drag & drop file upload
- Real-time AI mapping preview  
- 5-minute complete migration
```

---

*For complete documentation:*
- [AI Chart of Accounts Documentation](./AI_CHART_OF_ACCOUNTS_DOCUMENTATION.md)
- [Legacy Migration Guide](./AI_COA_MIGRATION_GUIDE.md)*