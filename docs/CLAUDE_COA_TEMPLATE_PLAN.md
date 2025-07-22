# 🧠 Claude AI Chart of Accounts Template System - Implementation Plan

## 🎯 Overview

Create a system where Claude AI generates comprehensive, industry-specific Chart of Accounts templates that are saved to the database and used as reference for all future account creation and migration operations.

## 🏗️ Architecture

### 1. **Template Generation Flow**
```
Business Type Request → Claude AI → Generate Complete COA → Save as Template → Use for Reference
```

### 2. **Database Schema**
Using existing HERA universal tables:

#### **core_entities** (Template Storage)
```sql
-- Template entity
{
  entity_type: 'coa_template',
  entity_code: 'CLAUDE_RESTAURANT_COA_V1',
  entity_name: 'Claude AI Restaurant COA Template',
  organization_id: '00000000-0000-0000-0000-000000000001' -- System org
}
```

#### **core_dynamic_data** (Template Accounts)
```sql
-- Each account in template
{
  entity_id: [template_entity_id],
  field_name: 'account_1001000',
  field_value: JSON.stringify({
    accountCode: '1001000',
    accountName: 'Cash - Operating Account',
    accountType: 'ASSET',
    description: 'Primary cash account for daily restaurant operations',
    keywords: ['cash', 'operating', 'checking', 'bank'],
    commonAliases: ['Petty Cash', 'Cash on Hand', 'Operating Cash'],
    businessRules: {
      minBalance: 5000,
      reconciliationFrequency: 'daily',
      approvalRequired: false
    },
    aiMetadata: {
      confidence: 0.99,
      lastUpdated: '2024-01-22',
      usageFrequency: 'very_high',
      criticalAccount: true
    }
  })
}
```

## 📋 Implementation Plan

### Phase 1: Template Generation API
**File**: `/app/api/finance/chart-of-accounts/generate-template/route.ts`

```typescript
// Request Claude to generate comprehensive COA template
POST /api/finance/chart-of-accounts/generate-template
{
  businessType: "restaurant",
  businessDetails: {
    cuisineType: ["italian", "american"],
    services: ["dine-in", "takeout", "delivery", "catering"],
    size: "medium", // small, medium, large, enterprise
    locations: 1,
    specialRequirements: ["bar", "bakery", "food-truck"]
  },
  regenerate: false // true to force new generation
}
```

#### Claude Prompt Structure:
```
You are a senior accountant specializing in restaurant operations. Generate a comprehensive Chart of Accounts for a restaurant with the following characteristics:

Business Type: Restaurant
Cuisine: Italian, American
Services: Dine-in, Takeout, Delivery, Catering
Special Features: Bar, Bakery

Requirements:
1. Include ALL accounts a restaurant would need (minimum 100 accounts)
2. Use HERA's 7-digit numbering system
3. Include account metadata: keywords, aliases, business rules
4. Consider industry best practices and compliance requirements
5. Include both common and edge-case accounts

Generate a complete JSON structure with accounts organized by category...
```

### Phase 2: Template Storage System
**File**: `/app/api/finance/chart-of-accounts/template-manager/route.ts`

```typescript
// Save generated template
async function saveTemplate(template: GeneratedTemplate) {
  // 1. Create template entity
  const templateEntity = await createEntity(
    'coa_template',
    `CLAUDE_${businessType}_COA_V${version}`,
    'Claude AI Generated COA Template'
  );

  // 2. Store each account as dynamic data
  for (const account of template.accounts) {
    await createDynamicData(templateEntity.id, {
      field_name: `account_${account.accountCode}`,
      field_value: JSON.stringify(account),
      field_type: 'template_account'
    });
  }

  // 3. Create search index
  await createSearchIndex(template);
}
```

### Phase 3: Intelligent Matching Engine
**File**: `/utils/coa-template-matcher.ts`

```typescript
class COATemplateMatcher {
  private template: LoadedTemplate;
  private searchIndex: SearchIndex;

  async matchAccount(input: {
    name: string,
    type?: string,
    description?: string
  }): Promise<TemplateMatch[]> {
    // 1. Fuzzy search by name
    const nameMatches = this.fuzzySearch(input.name);
    
    // 2. Keyword matching
    const keywordMatches = this.keywordSearch(input.name);
    
    // 3. Alias matching
    const aliasMatches = this.aliasSearch(input.name);
    
    // 4. AI similarity scoring
    const aiMatches = await this.aiSimilaritySearch(input);
    
    // 5. Combine and rank results
    return this.rankMatches([
      ...nameMatches,
      ...keywordMatches,
      ...aliasMatches,
      ...aiMatches
    ]);
  }
}
```

### Phase 4: Enhanced Migration with Template
**Update**: `/app/api/finance/chart-of-accounts/migrate-legacy/route.ts`

```typescript
// Load template for reference
const template = await loadCOATemplate('restaurant');
const matcher = new COATemplateMatcher(template);

// For each account to migrate
const templateMatch = await matcher.matchAccount({
  name: account.originalName,
  type: account.originalType
});

if (templateMatch.confidence > 0.8) {
  // Use template account
  return {
    ...templateMatch.account,
    confidence: templateMatch.confidence,
    reasoning: `Matched to template: ${templateMatch.account.accountName}`,
    templateBased: true
  };
} else {
  // Fall back to existing logic
  return existingMapping(account);
}
```

### Phase 5: Template UI & Management
**File**: `/app/finance/chart-of-accounts/templates/page.tsx`

Features:
- View generated templates
- Trigger regeneration
- Edit/customize templates
- Compare versions
- Usage analytics

## 🎯 Benefits

### 1. **Consistency**
- All restaurants use the same high-quality base
- Reduces errors and variations
- Industry best practices built-in

### 2. **Intelligence**
- Learns from Claude's knowledge
- Includes edge cases humans might miss
- Self-documenting with descriptions

### 3. **Performance**
- Fast template-based matching
- Reduces API calls to Claude
- Cached for instant access

### 4. **Customization**
- Base template can be customized
- Business-specific additions
- Regional variations supported

## 📊 Example Template Structure

```json
{
  "templateId": "CLAUDE_RESTAURANT_COA_V1",
  "businessType": "restaurant",
  "version": 1,
  "generatedAt": "2024-01-22T10:00:00Z",
  "generatedBy": "Claude AI",
  "metadata": {
    "totalAccounts": 125,
    "categories": {
      "ASSET": 25,
      "LIABILITY": 20,
      "EQUITY": 10,
      "REVENUE": 15,
      "COST_OF_SALES": 10,
      "DIRECT_EXPENSE": 20,
      "INDIRECT_EXPENSE": 20,
      "TAX_EXPENSE": 5
    }
  },
  "accounts": [
    {
      "accountCode": "1001000",
      "accountName": "Cash - Operating Account",
      "accountType": "ASSET",
      "description": "Primary operating cash for daily transactions",
      "keywords": ["cash", "operating", "bank", "checking"],
      "commonAliases": ["Petty Cash", "Cash on Hand"],
      "parentAccount": "1000000",
      "isActive": true,
      "allowPosting": true,
      "businessRules": {
        "reconciliationRequired": true,
        "reconciliationFrequency": "daily",
        "minBalance": 5000,
        "maxTransaction": 50000
      },
      "industryNotes": "Critical for daily operations. Recommend daily reconciliation.",
      "complianceNotes": "Maintain audit trail for all cash transactions",
      "aiMetadata": {
        "confidence": 0.99,
        "usageFrequency": "very_high",
        "criticalAccount": true,
        "seasonalVariation": false
      }
    },
    // ... 124 more accounts
  ]
}
```

## 🔄 Migration Flow with Templates

```
Legacy Account "Petty Cash" 
    ↓
Template Matcher finds:
  - Exact: "Petty Cash" (alias of 1001000)
  - Similar: "Cash - Operating Account" (95% match)
  - Related: "Cash - Register Tills" (80% match)
    ↓
Select best match (1001000)
    ↓
Apply to migration with high confidence
```

## 🚀 Implementation Timeline

### Week 1: Template Generation
- [ ] Create Claude prompt engineering
- [ ] Build template generation API
- [ ] Test with restaurant type

### Week 2: Storage & Retrieval
- [ ] Implement template storage
- [ ] Build search index
- [ ] Create caching layer

### Week 3: Matching Engine
- [ ] Fuzzy search implementation
- [ ] Keyword/alias matching
- [ ] AI similarity scoring

### Week 4: Integration
- [ ] Update migration API
- [ ] Update generation API
- [ ] Add template UI

## 🎯 Success Metrics

1. **Coverage**: 95%+ of common accounts in template
2. **Match Rate**: 85%+ accounts matched to template
3. **Accuracy**: 98%+ correct categorization
4. **Performance**: <100ms template matching
5. **Adoption**: 100% migrations use templates

## 🔧 Technical Considerations

### Caching Strategy
```typescript
// In-memory cache for active template
let cachedTemplate: CachedTemplate | null = null;

// Redis cache for search index
await redis.set(`coa_template_${businessType}`, JSON.stringify(template));
```

### Search Optimization
- Use trigram similarity for fuzzy matching
- Build inverted index for keywords
- Pre-compute similarity scores

### Version Management
- Keep last 3 versions
- Track changes between versions
- Allow rollback if needed

## 📝 Next Steps

1. **Review & Approve** this plan
2. **Prioritize** features for MVP
3. **Start Implementation** with template generation
4. **Test** with real restaurant data
5. **Iterate** based on results

---

This template-based approach will make HERA's COA system incredibly powerful, combining Claude's intelligence with fast, consistent operations.