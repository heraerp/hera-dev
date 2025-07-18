# 🚀 CLAUDE BUILD PROMPT: HERA Universal Transactions System
**Build a complete Universal Transaction Processing interface using existing HERA infrastructure**

## 🎯 MISSION
You are tasked with building a revolutionary Universal Transaction Processing system that integrates seamlessly with an existing HERA ERP infrastructure. The goal is to create a comprehensive transaction management interface at `/transactions` that handles ALL transaction types (journal entries, sales, purchases, payments, master data) through a single, intelligent interface.

## 🏗️ EXISTING INFRASTRUCTURE CONTEXT
The user already has a complete HERA ERP system with:
- ✅ Full Supabase database with 40+ tables
- ✅ Complete schema available at `schema/schema.json`
- ✅ Working Next.js frontend
- ✅ Authentication system
- ✅ Multi-tenant organization structure
- ✅ Existing UI components and design system

**CRITICAL**: This is NOT a greenfield project. You must build ON TOP OF the existing schema and infrastructure.

## 📋 EXISTING DATABASE SCHEMA
The complete database schema is available at `schema/schema.json`. Key tables you'll be working with include:

### Core Tables (Already Exist):
- `universal_transactions` - Main transaction table
- `universal_transaction_lines` - Transaction line items
- `core_organizations` - Organization/tenant structure
- `user_organizations` - User-organization relationships
- `core_users` - User management
- `ai_processing_results` - AI processing data
- `transaction_templates` - Transaction templates
- And 35+ other supporting tables

### Key Schema Points:
1. **Multi-tenant**: All data is organized by `organization_id`
2. **Universal Design**: `universal_transactions` table handles ALL transaction types
3. **AI-Ready**: Built-in AI classification, confidence scores, fraud detection
4. **Workflow-Enabled**: Approval chains, status tracking, audit trails
5. **Real-time Ready**: Designed for Supabase real-time subscriptions

## 🎯 WHAT TO BUILD

### 1. Universal Transaction Service (`services/heraTransactions.ts`)
Create a comprehensive service class that:
- **Reads from existing schema**: Use the actual table structures from `schema/schema.json`
- **Handles all CRUD operations**: Create, read, update, delete transactions
- **Supports filtering & search**: By type, status, date, organization
- **Generates transaction numbers**: Auto-numbering with org/type/year format
- **Real-time subscriptions**: Supabase real-time for live updates
- **Statistics calculation**: Transaction counts, status breakdowns, trends
- **Error handling**: Comprehensive error handling and logging

```typescript
export class HeraTransactionService {
  static async getTransactions(filters: TransactionFilters): Promise<TransactionResult>
  static async createTransaction(data: TransactionData): Promise<Transaction>
  static async updateTransactionStatus(id: string, status: string): Promise<Transaction>
  static async getTransactionStats(orgId: string): Promise<TransactionStats>
  static subscribeToTransactions(orgId: string, callback: Function): Subscription
  // ... more methods
}
```

### 2. Organization Hook (`hooks/useHeraOrganization.ts`)
Create a React hook that:
- **Uses existing user_organizations table**: Query the actual schema
- **Manages current organization**: Selection, switching, persistence
- **Role-based permissions**: Check user roles (admin, manager, editor, user, viewer)
- **Error handling**: Loading states, error states, retry logic
- **Local storage**: Persist selected organization across sessions

```typescript
export function useHeraOrganization() {
  return {
    organizations: Organization[],
    currentOrganization: Organization | null,
    userRole: string,
    canCreate: boolean,
    canEdit: boolean,
    canAdmin: boolean,
    switchOrganization: (org: Organization) => void,
    loading: boolean,
    error: string | null
  }
}
```

### 3. Main Transactions Page (`pages/transactions/index.tsx`)
Build a comprehensive dashboard that:
- **Lists all transactions**: With pagination, filtering, search
- **Real-time updates**: Live transaction updates via Supabase
- **Organization switching**: Multi-tenant organization selector
- **Transaction creation**: Modal/form for creating new transactions
- **Status management**: Update transaction statuses with approval workflows
- **Statistics dashboard**: Key metrics and trends
- **Mobile responsive**: Works on all devices
- **Export capabilities**: CSV/PDF export functionality

### 4. Transaction Components
Build these React components:

#### `TransactionCard.tsx`
- **Visual transaction cards**: Show key transaction data
- **Status indicators**: Visual status with color coding
- **AI insights**: Show AI confidence scores, risk scores
- **Actions**: Quick actions (approve, reject, view details)
- **Type-specific icons**: Different icons for different transaction types

#### `TransactionStats.tsx`
- **Key metrics**: Total, pending, approved, posted counts
- **Trend indicators**: Growth/decline trends
- **Risk indicators**: High-risk transaction counts
- **AI metrics**: AI-generated transaction percentages

#### `CreateTransactionModal.tsx`
- **Multi-step creation**: Transaction type selection → Details entry
- **Smart defaults**: Auto-populate based on type and history
- **Validation**: Real-time form validation
- **Template support**: Use transaction templates for quick creation

#### `TransactionFilters.tsx`
- **Advanced filtering**: Type, status, date range, search
- **Saved filters**: Save commonly used filter combinations
- **Quick filters**: Pre-defined filter buttons

### 5. Supporting Components
Build these utility components:

#### `TransactionStatusBadge.tsx`
- **Status visualization**: Color-coded status badges
- **Transition animations**: Smooth status changes

#### `TransactionTypeIcon.tsx`
- **Type-specific icons**: Visual indicators for transaction types
- **Consistent styling**: Unified icon system

#### `AIInsightPanel.tsx`
- **AI analysis display**: Show AI classification results
- **Confidence indicators**: Visual confidence scores
- **Explainability**: Show AI decision reasoning

## 🔧 TECHNICAL REQUIREMENTS

### Database Integration
1. **Use Existing Schema**: Read table structures from `schema/schema.json`
2. **Respect Foreign Keys**: Use existing relationships between tables
3. **Multi-tenant Security**: Filter all queries by organization_id
4. **Supabase RPC**: Use stored procedures for complex operations
5. **Real-time**: Implement Supabase real-time subscriptions

### Frontend Architecture
1. **Next.js**: Use existing Next.js application structure
2. **TypeScript**: Full TypeScript implementation with proper typing
3. **Tailwind CSS**: Use existing Tailwind styling
4. **Component Library**: Build on existing UI component library
5. **State Management**: Use React hooks, no external state management

### Performance Requirements
1. **Fast Loading**: < 500ms initial page load
2. **Real-time Updates**: < 100ms real-time update latency
3. **Efficient Queries**: Optimized database queries with proper indexing
4. **Pagination**: Handle large datasets with efficient pagination
5. **Caching**: Smart caching for frequently accessed data

### User Experience
1. **Intuitive Interface**: Easy to use for non-technical users
2. **Mobile Responsive**: Full mobile compatibility
3. **Accessibility**: WCAG 2.1 compliance
4. **Error Handling**: Graceful error handling with user-friendly messages
5. **Loading States**: Smooth loading states and skeleton screens

## 📊 SPECIFIC IMPLEMENTATION DETAILS

### Transaction Types to Support
```typescript
type TransactionType = 
  | 'journal_entry'    // Manual accounting entries
  | 'sales'           // Revenue transactions
  | 'purchase'        // Expense transactions  
  | 'payment'         // Money movements
  | 'master_data'     // Reference data changes
  | 'inventory'       // Stock movements
  | 'payroll'         // Payroll processing
  | 'reconciliation'  // Bank reconciliations
```

### Transaction Statuses
```typescript
type TransactionStatus = 
  | 'PENDING'         // Awaiting approval
  | 'APPROVED'        // Approved for posting
  | 'POSTED'          // Posted to ledger
  | 'REJECTED'        // Rejected by approver
  | 'CANCELLED'       // Cancelled by user
  | 'DRAFT'           // Work in progress
```

### AI Integration Points
1. **Classification**: Automatic transaction type detection
2. **Fraud Detection**: Risk scoring with ML models
3. **Quality Assessment**: Data quality scoring
4. **Suggestions**: Smart field completion and suggestions
5. **Anomaly Detection**: Unusual pattern identification

## 🎨 UI/UX REQUIREMENTS

### Design System
- **Use existing design tokens**: Colors, typography, spacing
- **Consistent with HERA**: Match existing HERA design language
- **Modern aesthetics**: Clean, professional, enterprise-grade
- **Dark mode support**: If existing system supports it

### Key UI Elements
1. **Dashboard Layout**: Clean, organized transaction dashboard
2. **Card-based Design**: Transaction cards with key information
3. **Advanced Filters**: Comprehensive filtering interface
4. **Modal Dialogs**: For transaction creation and editing
5. **Status Indicators**: Clear visual status communication
6. **Real-time Indicators**: Show when data is updating live

## 🔐 SECURITY & PERMISSIONS

### Authentication
- **Use existing auth**: Integrate with current authentication system
- **Session management**: Proper session handling and refresh

### Authorization
- **Role-based access**: Different permissions per user role
- **Organization isolation**: Users only see their organization's data
- **Action permissions**: Control who can create/edit/approve transactions

### Data Security
- **Input validation**: Comprehensive input validation and sanitization
- **SQL injection prevention**: Use parameterized queries
- **XSS prevention**: Proper output encoding
- **Audit logging**: Log all significant actions

## 📝 IMPLEMENTATION STEPS

### Phase 1: Core Service (Priority 1)
1. Analyze `schema/schema.json` and understand table relationships
2. Build `HeraTransactionService` with full CRUD operations
3. Implement transaction number generation logic
4. Add comprehensive error handling and logging

### Phase 2: Organization Management (Priority 1)
1. Build `useHeraOrganization` hook
2. Implement organization switching and persistence
3. Add role-based permission checking
4. Handle loading and error states

### Phase 3: Main Interface (Priority 1)
1. Build main transactions page with list view
2. Implement filtering, search, and pagination
3. Add real-time updates via Supabase subscriptions
4. Create transaction statistics dashboard

### Phase 4: Transaction Management (Priority 2)
1. Build transaction creation modal with multi-step flow
2. Implement transaction status updates and approval workflow
3. Add transaction detail view with full information
4. Create edit transaction functionality

### Phase 5: Advanced Features (Priority 3)
1. Add AI insights and visualization
2. Implement advanced search and filtering
3. Add export functionality (CSV, PDF)
4. Build transaction templates system

## 🎯 SUCCESS CRITERIA

### Functional Requirements
- ✅ Users can view all transactions for their organization
- ✅ Users can create new transactions of any type
- ✅ Users can update transaction statuses based on their role
- ✅ Real-time updates work across multiple browser tabs
- ✅ Search and filtering work correctly
- ✅ Transaction statistics are accurate and real-time
- ✅ Organization switching works seamlessly
- ✅ Mobile interface is fully functional

### Performance Requirements
- ✅ Page loads in < 500ms
- ✅ Real-time updates appear in < 100ms
- ✅ Search results appear in < 200ms
- ✅ No memory leaks in long-running sessions
- ✅ Efficient database queries with proper indexing

### User Experience Requirements
- ✅ Intuitive interface that requires no training
- ✅ Clear error messages and loading states
- ✅ Responsive design works on all devices
- ✅ Consistent with existing HERA design language
- ✅ Accessible to users with disabilities

## 🔧 DEVELOPMENT SETUP

### Prerequisites
- Access to existing HERA Next.js application
- Supabase project with existing schema
- `schema/schema.json` file with complete database schema
- Existing authentication system working

### File Structure
```
pages/
  transactions/
    index.tsx              # Main transactions page
    [id].tsx              # Transaction detail page
    
components/
  transactions/
    TransactionCard.tsx
    TransactionStats.tsx
    CreateTransactionModal.tsx
    TransactionFilters.tsx
    AIInsightPanel.tsx
    
services/
  heraTransactions.ts     # Main service class
  
hooks/
  useHeraOrganization.ts  # Organization management hook
  
types/
  transactions.ts         # TypeScript type definitions
```

## 🎉 DELIVERABLES

Provide the complete implementation including:

1. **All TypeScript files** with full implementations
2. **Comprehensive error handling** throughout the system
3. **TypeScript type definitions** for all data structures
4. **Integration instructions** for adding to existing HERA system
5. **Sample data queries** for testing the system
6. **Performance optimization** recommendations
7. **Security checklist** for production deployment

## 🚨 IMPORTANT NOTES

1. **DO NOT recreate existing infrastructure** - build on top of what exists
2. **Use the actual schema** from `schema/schema.json` - don't assume table structures
3. **Respect existing patterns** - follow the coding patterns already established
4. **Multi-tenant aware** - everything must be organization-scoped
5. **Production ready** - this should be enterprise-grade code
6. **Real-time first** - prioritize real-time updates and live data
7. **Mobile responsive** - ensure full mobile compatibility
8. **Error resilient** - handle all error cases gracefully

## 🎯 START IMPLEMENTATION

Begin by:
1. **Analyzing the schema**: Read and understand `schema/schema.json`
2. **Building the service layer**: Start with `HeraTransactionService`
3. **Creating the organization hook**: Implement `useHeraOrganization`
4. **Building the main page**: Create the transactions dashboard
5. **Testing with real data**: Use existing data in the database

Focus on getting a working end-to-end flow first, then add advanced features.

Build this as a production-ready system that seamlessly integrates with the existing HERA infrastructure!