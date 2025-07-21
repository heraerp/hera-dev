# 🔗 HERA API Reference
## Complete API Documentation for Digital Accountant & Chart of Accounts Integration

### 📋 **Table of Contents**
1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Digital Accountant APIs](#digital-accountant-apis)
4. [Chart of Accounts APIs](#chart-of-accounts-apis)
5. [Enhanced Integration APIs](#enhanced-integration-apis)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Examples](#examples)

---

## 🎯 **API Overview**

### **Base URLs**
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

### **API Principles**
- **RESTful Design**: Standard HTTP methods and status codes
- **JSON Format**: All requests and responses use JSON
- **Organization Isolation**: All data scoped by organizationId
- **Universal Schema**: Consistent data model across all endpoints
- **AI Intelligence**: Enhanced endpoints with AI capabilities

### **Response Format**
```typescript
// Success Response
{
  "data": any,           // Response data
  "success": true,       // Always true for success
  "message"?: string     // Optional success message
}

// Error Response  
{
  "error": string,       // Error message
  "details"?: any,       // Optional error details
  "success": false       // Always false for errors
}
```

---

## 🔐 **Authentication**

### **Service Role Key (Development)**
```typescript
// Using admin client for development/testing
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY  // Service role key
);
```

### **Organization-Based Access Control**
```typescript
// All requests require organizationId
const organizationId = "123e4567-e89b-12d3-a456-426614174000";

// Example request
const response = await fetch('/api/finance/chart-of-accounts', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ organizationId })
});
```

---

## 🤖 **Digital Accountant APIs**

### **Document Management**

#### **Upload Document**
```http
POST /api/digital-accountant/documents
```

**Request Body:**
```typescript
{
  "organizationId": string,
  "file": File,              // Document file (PDF, JPG, PNG)
  "documentType": "receipt" | "invoice" | "expense" | "purchase_order",
  "metadata": {
    "source": "mobile_camera" | "file_upload" | "email",
    "uploadedBy": string,
    "tags": string[]
  }
}
```

**Response:**
```typescript
{
  "data": {
    "id": string,
    "documentNumber": string,
    "status": "uploaded",
    "fileUrl": string,
    "metadata": DocumentMetadata
  },
  "success": true
}
```

#### **Get Documents**
```http
GET /api/digital-accountant/documents?organizationId={id}&status={status}&limit={limit}
```

**Query Parameters:**
- `organizationId` (required): Organization identifier
- `status` (optional): `uploaded`, `processing`, `completed`, `error`
- `documentType` (optional): Document type filter
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```typescript
{
  "data": DocumentEntry[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  },
  "success": true
}
```

#### **Process Document**
```http
POST /api/digital-accountant/documents/{id}/process
```

**Response:**
```typescript
{
  "data": {
    "id": string,
    "status": "completed",
    "aiResults": {
      "vendor": string,
      "amount": number,
      "date": string,
      "description": string,
      "items": ExtractedItem[],
      "confidence": number
    },
    "processingTime": number
  },
  "success": true
}
```

### **Journal Entry Management**

#### **Create Journal Entry**
```http
POST /api/digital-accountant/journal-entries
```

**Request Body:**
```typescript
{
  "organizationId": string,
  "description": string,
  "entryDate": string,       // ISO date string
  "entries": [
    {
      "accountCode": string,
      "accountName": string,
      "debit": number,
      "credit": number,
      "description": string,
      "costCenter": string,
      "project": string
    }
  ],
  "metadata": {
    "sourceDocument": string,
    "aiGenerated": boolean,
    "confidenceScore": number
  },
  "autoPost": boolean
}
```

**Response:**
```typescript
{
  "data": {
    "id": string,
    "journalNumber": string,
    "status": "draft" | "posted",
    "totalDebits": number,
    "totalCredits": number,
    "isBalanced": boolean,
    "entries": JournalEntry[],
    "aiMetadata": AIMetadata,
    "createdAt": string,
    "postedAt": string
  },
  "success": true
}
```

#### **Get Journal Entries**
```http
GET /api/digital-accountant/journal-entries?organizationId={id}&status={status}
```

**Query Parameters:**
- `organizationId` (required): Organization identifier
- `status` (optional): `draft`, `posted`, `reversed`
- `aiGenerated` (optional): `true`, `false`
- `page` (optional): Page number
- `limit` (optional): Items per page

#### **Post Journal Entry**
```http
PUT /api/digital-accountant/journal-entries/{id}/post
```

**Response:**
```typescript
{
  "data": {
    "id": string,
    "status": "posted",
    "postedAt": string,
    "postingReference": string
  },
  "success": true,
  "message": "Journal entry posted successfully"
}
```

### **AI Intelligence**

#### **AI Analytics**
```http
GET /api/digital-accountant/ai/analytics?organizationId={id}
```

**Response:**
```typescript
{
  "data": {
    "performance": {
      "totalDocuments": number,
      "averageConfidence": number,
      "processingTime": number,
      "accuracyRate": number
    },
    "trends": {
      "documentsPerDay": number,
      "automationRate": number,
      "userApprovalRate": number
    },
    "insights": AIInsight[]
  },
  "success": true
}
```

#### **Submit AI Feedback**
```http
POST /api/digital-accountant/ai/feedback
```

**Request Body:**
```typescript
{
  "organizationId": string,
  "documentId": string,
  "feedbackType": "accuracy" | "suggestion" | "error",
  "rating": number,        // 1-5 scale
  "comments": string,
  "correctedData": any     // Corrected extraction results
}
```

---

## 📊 **Chart of Accounts APIs**

### **Account Management**

#### **Get Accounts**
```http
GET /api/finance/chart-of-accounts?organizationId={id}
```

**Query Parameters:**
- `organizationId` (required): Organization identifier
- `accountType` (optional): Filter by account type
- `isActive` (optional): Filter active/inactive accounts
- `includeBalances` (optional): Include current balances
- `parentAccountId` (optional): Get child accounts

**Response:**
```typescript
{
  "data": [
    {
      "id": string,
      "accountCode": string,
      "accountName": string,
      "accountType": AccountType,
      "parentAccountId": string,
      "description": string,
      "isActive": boolean,
      "balance": number,
      "currency": string,
      "classification": string,
      "level": number,
      "postingAllowed": boolean,
      "createdAt": string,
      "updatedAt": string
    }
  ],
  "summary": {
    "total": number,
    "byCategory": Record<AccountType, number>,
    "active": number
  },
  "success": true
}
```

#### **Create Account**
```http
POST /api/finance/chart-of-accounts
```

**Request Body:**
```typescript
{
  "organizationId": string,
  "accountName": string,
  "accountType": AccountType,
  "parentAccountId": string,
  "description": string,
  "classification": string,
  "currency": string,
  "initialBalance": number
}
```

**Response:**
```typescript
{
  "data": {
    "id": string,
    "accountCode": string,    // AI-generated
    "accountName": string,
    "accountType": AccountType,
    "aiSuggestions": {
      "suggestedCode": string,
      "alternativeCodes": string[],
      "reasoning": string[]
    }
  },
  "success": true,
  "message": "Account created successfully"
}
```

#### **Update Account**
```http
PUT /api/finance/chart-of-accounts/{id}
```

**Request Body:**
```typescript
{
  "accountName": string,
  "description": string,
  "parentAccountId": string,
  "isActive": boolean,
  "reason": string          // Required for audit trail
}
```

#### **Get Account by ID**
```http
GET /api/finance/chart-of-accounts/{id}
```

**Response:**
```typescript
{
  "data": {
    ...ChartOfAccountsEntry,
    "children": ChartOfAccountsEntry[],
    "transactions": RecentTransaction[],
    "analytics": AccountAnalytics
  },
  "success": true
}
```

### **AI COA Intelligence**

#### **Get AI Suggestions**
```http
GET /api/ai-coa?organizationId={id}
```

**Query Parameters:**
- `organizationId` (required): Organization identifier
- `analysisType` (optional): `suggestions`, `patterns`, `optimization`

**Response:**
```typescript
{
  "data": {
    "suggestions": [
      {
        "id": string,
        "type": "CREATE" | "MERGE" | "RENAME" | "RECLASSIFY",
        "title": string,
        "description": string,
        "confidence": number,
        "impact": "LOW" | "MEDIUM" | "HIGH",
        "suggestedAction": {
          "currentAccount": string,
          "newAccount": string,
          "newStructure": string
        },
        "businessReason": string,
        "expectedBenefit": string
      }
    ],
    "patterns": TransactionPattern[],
    "optimization": OptimizationRecommendation[],
    "metrics": {
      "totalAccounts": number,
      "aiConfidence": number,
      "suggestionsToday": number,
      "timeSaved": string
    }
  },
  "success": true
}
```

#### **Process AI Suggestion**
```http
POST /api/ai-coa/suggestions/{id}/action
```

**Request Body:**
```typescript
{
  "action": "accept" | "reject" | "modify",
  "reason": string,
  "modifications": Record<string, any>
}
```

#### **Account Analytics**
```http
GET /api/finance/chart-of-accounts/analytics?organizationId={id}
```

**Response:**
```typescript
{
  "data": {
    "summary": {
      "totalAccounts": number,
      "accountsByType": Record<AccountType, number>,
      "utilizationRate": number,
      "complianceScore": number
    },
    "categoryBreakdown": [
      {
        "category": AccountType,
        "count": number,
        "totalBalance": number,
        "averageTransactions": number,
        "trends": TrendData[]
      }
    ],
    "recommendations": BusinessRecommendation[]
  },
  "success": true
}
```

---

## 🤝 **Enhanced Integration APIs**

### **Intelligent Account Mapping**

#### **Main Integration Endpoint**
```http
POST /api/digital-accountant/enhanced-integration
```

**Request Body:**
```typescript
{
  "organizationId": string,
  "documentType": "receipt" | "invoice" | "expense" | "purchase_order",
  "aiResults": {
    "vendor": string,
    "description": string,
    "amount": number,
    "category": string,
    "items": [
      {
        "description": string,
        "amount": number,
        "quantity": number
      }
    ],
    "taxes": [
      {
        "type": string,
        "rate": number,
        "amount": number
      }
    ]
  },
  "confidence": number,
  "metadata": {
    "source": string,
    "timestamp": string,
    "userId": string
  }
}
```

**Response:**
```typescript
{
  "data": {
    "primaryAccount": {
      "code": string,
      "name": string,
      "type": AccountType,
      "category": string,
      "confidence": number,
      "postingAllowed": boolean
    },
    "alternativeAccounts": [
      {
        "code": string,
        "name": string,
        "confidence": number,
        "reason": string,
        "accountType": AccountType
      }
    ],
    "journalEntries": [
      {
        "accountCode": string,
        "accountName": string,
        "debit": number,
        "credit": number,
        "description": string,
        "costCenter": string,
        "project": string
      }
    ],
    "aiReasoning": string[],
    "businessRules": string[],
    "confidenceFactors": [
      {
        "factor": string,
        "weight": number,
        "contribution": number,
        "explanation": string
      }
    ],
    "integrationMetadata": {
      "processingTime": number,
      "engineVersion": string,
      "rulesApplied": string[],
      "patternsMatched": string[]
    }
  },
  "success": true,
  "message": "Intelligent account mapping completed successfully"
}
```

### **Integration Analytics**

#### **Get Account Structure**
```http
GET /api/digital-accountant/enhanced-integration?action=account-structure&organizationId={id}
```

**Response:**
```typescript
{
  "data": {
    "structure": {
      "ASSET": AccountInfo[],
      "LIABILITY": AccountInfo[],
      "EQUITY": AccountInfo[],
      "REVENUE": AccountInfo[],
      "COST_OF_SALES": AccountInfo[],
      "DIRECT_EXPENSE": AccountInfo[],
      "INDIRECT_EXPENSE": AccountInfo[],
      "TAX_EXPENSE": AccountInfo[],
      "EXTRAORDINARY_EXPENSE": AccountInfo[]
    },
    "metadata": {
      "totalAccounts": number,
      "categories": number,
      "lastUpdated": string,
      "organizationId": string
    },
    "statistics": {
      "utilizationRate": Record<AccountType, number>,
      "activeAccounts": Record<AccountType, number>,
      "recentActivity": Record<AccountType, number>
    }
  },
  "success": true
}
```

#### **Get Mapping Patterns**
```http
GET /api/digital-accountant/enhanced-integration?action=mapping-patterns&organizationId={id}
```

**Response:**
```typescript
{
  "data": {
    "patterns": [
      {
        "id": string,
        "pattern": string,
        "frequency": number,
        "confidence": number,
        "success_rate": number,
        "last_used": string,
        "mapped_account": {
          "code": string,
          "name": string,
          "type": AccountType
        }
      }
    ],
    "vendorMappings": [
      {
        "vendor": string,
        "primary_account": string,
        "confidence": number,
        "transaction_count": number,
        "success_rate": number
      }
    ],
    "keywordMappings": [
      {
        "keyword": string,
        "account_type": AccountType,
        "confidence": number,
        "usage_frequency": number
      }
    ],
    "insights": {
      "top_vendors": VendorInsight[],
      "common_patterns": PatternInsight[],
      "accuracy_trends": AccuracyTrend[],
      "improvement_suggestions": ImprovementSuggestion[]
    }
  },
  "success": true
}
```

#### **Get AI Suggestions**
```http
GET /api/digital-accountant/enhanced-integration?action=ai-suggestions&organizationId={id}
```

**Response:**
```typescript
{
  "data": {
    "suggestions": [
      {
        "type": "VENDOR_MAPPING" | "EXPENSE_CATEGORIZATION" | "TAX_OPTIMIZATION",
        "title": string,
        "description": string,
        "confidence": number,
        "suggestedAccount": string,
        "accountName": string,
        "impact": "HIGH" | "MEDIUM" | "LOW",
        "implementationSteps": string[]
      }
    ],
    "totalSuggestions": number
  },
  "success": true
}
```

---

## 📝 **Data Models**

### **Core Types**

#### **AccountType**
```typescript
type AccountType = 
  | 'ASSET'
  | 'LIABILITY' 
  | 'EQUITY'
  | 'REVENUE'
  | 'COST_OF_SALES'
  | 'DIRECT_EXPENSE'
  | 'INDIRECT_EXPENSE'
  | 'TAX_EXPENSE'
  | 'EXTRAORDINARY_EXPENSE';
```

#### **DocumentType**
```typescript
type DocumentType = 
  | 'receipt'
  | 'invoice'
  | 'expense'
  | 'purchase_order'
  | 'bank_statement';
```

#### **TransactionStatus**
```typescript
type TransactionStatus = 
  | 'draft'
  | 'posted'
  | 'reversed'
  | 'cancelled';
```

### **Complex Models**

#### **ChartOfAccountsEntry**
```typescript
interface ChartOfAccountsEntry {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  parentAccountId?: string;
  description?: string;
  isActive: boolean;
  balance: number;
  currency: string;
  classification: string;
  reportingCategory: string;
  level: number;
  pathToRoot: string[];
  postingAllowed: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}
```

#### **DocumentEntry**
```typescript
interface DocumentEntry {
  id: string;
  organizationId: string;
  documentNumber: string;
  documentType: DocumentType;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  aiResults?: {
    vendor: string;
    amount: number;
    date: string;
    description: string;
    items: ExtractedItem[];
    taxes: ExtractedTax[];
    confidence: number;
    processingTime: number;
  };
  metadata: {
    source: string;
    uploadedBy: string;
    tags: string[];
    customFields: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### **JournalEntry**
```typescript
interface JournalEntry {
  id: string;
  organizationId: string;
  journalNumber: string;
  description: string;
  entryDate: Date;
  status: TransactionStatus;
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  entries: JournalEntryLine[];
  metadata: {
    sourceDocument?: string;
    sourceTransaction?: string;
    aiGenerated: boolean;
    confidenceScore?: number;
    userId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  postedAt?: Date;
  createdBy: string;
}
```

#### **JournalEntryLine**
```typescript
interface JournalEntryLine {
  accountCode: string;
  accountName: string;
  debit?: number;
  credit?: number;
  description: string;
  costCenter?: string;
  project?: string;
  reference?: string;
}
```

---

## ❌ **Error Handling**

### **Standard Error Codes**

#### **400 - Bad Request**
```typescript
{
  "error": "Missing required fields: organizationId, accountName",
  "details": {
    "missingFields": ["organizationId", "accountName"],
    "providedFields": ["accountType"]
  },
  "success": false
}
```

#### **404 - Not Found**
```typescript
{
  "error": "Account not found",
  "details": {
    "accountId": "12345",
    "organizationId": "org-123"
  },
  "success": false
}
```

#### **409 - Conflict**
```typescript
{
  "error": "Account code already exists",
  "details": {
    "accountCode": "5001000",
    "existingAccount": {
      "id": "existing-id",
      "name": "Food Materials - Vegetables"
    }
  },
  "success": false
}
```

#### **500 - Internal Server Error**
```typescript
{
  "error": "Internal server error",
  "details": "Database connection failed",
  "success": false
}
```

### **AI-Specific Errors**

#### **AI Processing Errors**
```typescript
// Low confidence result
{
  "error": "AI confidence too low for auto-processing",
  "details": {
    "confidence": 0.45,
    "minimumRequired": 0.70,
    "suggestion": "Provide manual review or improve document quality"
  },
  "success": false
}

// Document processing error
{
  "error": "Document processing failed",
  "details": {
    "documentId": "doc-123",
    "processingStage": "text_extraction",
    "technicalError": "OCR service unavailable"
  },
  "success": false
}
```

### **Validation Errors**

#### **Journal Entry Validation**
```typescript
{
  "error": "Journal entry is not balanced",
  "details": {
    "totalDebits": 1000.00,
    "totalCredits": 950.00,
    "difference": 50.00,
    "entries": [
      { "account": "5001000", "debit": 1000.00 },
      { "account": "2000001", "credit": 950.00 }
    ]
  },
  "success": false
}
```

#### **Account Validation**
```typescript
{
  "error": "Invalid account code format",
  "details": {
    "providedCode": "50010",
    "expectedFormat": "7-digit code (e.g., 5001000)",
    "validRanges": {
      "COST_OF_SALES": "5000000-5999999"
    }
  },
  "success": false
}
```

---

## 🚦 **Rate Limiting**

### **Rate Limits**
```
General API calls: 1000 requests/hour per organization
AI processing: 100 documents/hour per organization  
Bulk operations: 10 requests/minute per organization
```

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-RetryAfter: 60
```

### **Rate Limit Exceeded Response**
```typescript
{
  "error": "Rate limit exceeded",
  "details": {
    "limit": 100,
    "current": 101,
    "resetTime": "2024-01-15T11:00:00Z",
    "retryAfter": 60
  },
  "success": false
}
```

---

## 💡 **Examples**

### **Complete Integration Workflow**

#### **1. Upload and Process Receipt**
```javascript
// Step 1: Upload receipt
const formData = new FormData();
formData.append('file', receiptFile);
formData.append('organizationId', 'mario-restaurant');
formData.append('documentType', 'receipt');

const uploadResponse = await fetch('/api/digital-accountant/documents', {
  method: 'POST',
  body: formData
});
const uploadResult = await uploadResponse.json();

// Step 2: Process document
const processResponse = await fetch(`/api/digital-accountant/documents/${uploadResult.data.id}/process`, {
  method: 'POST'
});
const processResult = await processResponse.json();
```

#### **2. Get Intelligent Account Mapping**
```javascript
// Step 3: Get account mapping
const mappingResponse = await fetch('/api/digital-accountant/enhanced-integration', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organizationId: 'mario-restaurant',
    documentType: 'receipt',
    aiResults: processResult.data.aiResults
  })
});
const mappingResult = await mappingResponse.json();
```

#### **3. Create and Post Journal Entry**
```javascript
// Step 4: Create journal entry
const journalResponse = await fetch('/api/digital-accountant/journal-entries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organizationId: 'mario-restaurant',
    description: 'Fresh Valley Farms - Vegetable purchase',
    entries: mappingResult.data.journalEntries,
    metadata: {
      sourceDocument: uploadResult.data.id,
      aiGenerated: true,
      confidenceScore: mappingResult.data.primaryAccount.confidence
    },
    autoPost: mappingResult.data.primaryAccount.confidence >= 95
  })
});
const journalResult = await journalResponse.json();
```

### **Chart of Accounts Management**

#### **Create New Account**
```javascript
const accountResponse = await fetch('/api/finance/chart-of-accounts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    organizationId: 'mario-restaurant',
    accountName: 'Online Marketing Expenses',
    accountType: 'INDIRECT_EXPENSE',
    description: 'Digital marketing and online advertising costs',
    parentAccountId: 'parent-indirect-expense-id'
  })
});
const accountResult = await accountResponse.json();

console.log('AI suggested account code:', accountResult.data.accountCode);
// Output: "7006000" (AI-generated based on category and existing accounts)
```

#### **Get AI Suggestions**
```javascript
const aiResponse = await fetch('/api/ai-coa?organizationId=mario-restaurant&analysisType=suggestions');
const aiResult = await aiResponse.json();

console.log('AI suggestions:', aiResult.data.suggestions);
// Output: Array of intelligent account optimization recommendations
```

### **Error Handling Example**
```javascript
async function processReceiptWithErrorHandling(file, organizationId) {
  try {
    // Upload document
    const uploadResponse = await fetch('/api/digital-accountant/documents', {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(`Upload failed: ${error.error}`);
    }
    
    const uploadResult = await uploadResponse.json();
    
    // Process with AI
    const processResponse = await fetch(`/api/digital-accountant/documents/${uploadResult.data.id}/process`, {
      method: 'POST'
    });
    
    const processResult = await processResponse.json();
    
    if (!processResult.success) {
      throw new Error(`AI processing failed: ${processResult.error}`);
    }
    
    // Check confidence level
    if (processResult.data.aiResults.confidence < 0.70) {
      console.warn('Low confidence result, manual review required');
      return { requiresReview: true, data: processResult.data };
    }
    
    return { requiresReview: false, data: processResult.data };
    
  } catch (error) {
    console.error('Receipt processing error:', error.message);
    throw error;
  }
}
```

### **Batch Operations**
```javascript
// Process multiple receipts in batch
async function processBatchReceipts(files, organizationId) {
  const results = [];
  
  // Upload all files first
  const uploads = await Promise.all(
    files.map(file => uploadDocument(file, organizationId))
  );
  
  // Process all documents
  const processes = await Promise.all(
    uploads.map(upload => processDocument(upload.data.id))
  );
  
  // Get account mappings for successful processes
  const mappings = await Promise.all(
    processes
      .filter(process => process.success && process.data.aiResults.confidence >= 0.70)
      .map(process => getAccountMapping(organizationId, 'receipt', process.data.aiResults))
  );
  
  // Create journal entries for high-confidence mappings
  const journals = await Promise.all(
    mappings
      .filter(mapping => mapping.data.primaryAccount.confidence >= 0.85)
      .map(mapping => createJournalEntry(organizationId, mapping))
  );
  
  return {
    processed: processes.length,
    mapped: mappings.length,
    posted: journals.length,
    results: journals
  };
}
```

---

## 🔍 **Testing Examples**

### **API Testing with cURL**

#### **Test Account Structure**
```bash
curl -X GET "http://localhost:3001/api/digital-accountant/enhanced-integration?action=account-structure&organizationId=123e4567-e89b-12d3-a456-426614174000"
```

#### **Test Intelligent Mapping**
```bash
curl -X POST "http://localhost:3001/api/digital-accountant/enhanced-integration" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "123e4567-e89b-12d3-a456-426614174000",
    "documentType": "receipt",
    "aiResults": {
      "vendor": "Fresh Valley Farms",
      "description": "Organic vegetables and herbs",
      "amount": 245.50,
      "category": "Food & Ingredients"
    }
  }'
```

#### **Test Chart of Accounts**
```bash
curl -X GET "http://localhost:3001/api/finance/chart-of-accounts?organizationId=123e4567-e89b-12d3-a456-426614174000&accountType=COST_OF_SALES"
```

### **Integration Testing with Postman**

#### **Environment Variables**
```json
{
  "baseUrl": "http://localhost:3001/api",
  "organizationId": "123e4567-e89b-12d3-a456-426614174000",
  "testVendor": "Fresh Valley Farms",
  "testAmount": 245.50
}
```

#### **Test Collection Structure**
```
HERA API Tests/
├── Authentication/
│   └── Test Service Key Access
├── Digital Accountant/
│   ├── Upload Document
│   ├── Process Document
│   ├── Create Journal Entry
│   └── Get Journal Entries
├── Chart of Accounts/
│   ├── Get Account Structure
│   ├── Create Account
│   ├── Get AI Suggestions
│   └── Account Analytics
├── Integration/
│   ├── Intelligent Mapping
│   ├── Pattern Analysis
│   └── Complete Workflow
└── Error Handling/
    ├── Invalid Organization ID
    ├── Missing Parameters
    └── Rate Limiting
```

---

**This comprehensive API reference provides everything needed to integrate with HERA's Digital Accountant and Chart of Accounts systems. The APIs are designed for reliability, performance, and ease of use while maintaining enterprise-grade capabilities.** 🚀