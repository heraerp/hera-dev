
# 🧠 HERA MASTER CONTEXT - AI AMNESIA PREVENTION

## 🚨 MANDATORY RULES FOR AI DEVELOPMENT

### RULE 1: NEVER CREATE DUPLICATE SOLUTIONS
- Always check existing solutions first
- Extend existing code instead of creating new
- Maintain architectural consistency

### RULE 2: FOLLOW ESTABLISHED PATTERNS
- Use existing patterns and conventions
- Integrate with current systems
- Maintain code consistency

## 📋 CURRENT SOLUTIONS REGISTRY

### 🪝 CUSTOM HOOKS (Your existing hooks)
- useHeraOrganization.ts - Organization management
- use-gestures.ts - Gesture handling  
- use-adaptive-color.ts - Adaptive color schemes

### 🎨 FRONTEND COMPONENTS
- Location: frontend/components/
- Pattern: React + TypeScript + Tailwind CSS
- State Management: React hooks
- Data Fetching: SWR + Supabase

### 🌐 API ENDPOINTS
- Universal Transactions: /api/universal-transactions
- Organizations: /api/organizations

### 🗄️ DATABASE SCHEMAS
- universal_transactions (main transaction table)
- universal_transaction_lines (transaction line items)
- organizations (company data)

## 🏗️ ESTABLISHED PATTERNS

### Custom Hook Pattern (Follow your existing hooks)
```typescript
// Custom hook pattern (like useHeraOrganization)
const useCustomHook = (params: HookParams) => {
  const [state, setState] = useState();
  
  // Hook logic here
  
  return { state, setState };
};