# HERA Universal - Developer Onboarding Guide

## Welcome to HERA Universal

You're now part of building the world's first Universal Transaction System. This guide will help you understand our architecture, development practices, and how to contribute effectively.

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- VS Code (recommended)
- Docker (for local database)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hera-erp
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend && npm install
   
   # Backend
   cd ../backend && npm install
   ```

3. **Environment setup**
   ```bash
   # Copy environment files
   cp .env.example .env.local
   
   # Configure your environment variables
   # See .env.example for required variables
   ```

4. **Start development**
   ```bash
   # Frontend (runs on port 3000)
   cd frontend && npm run dev
   
   # Backend (runs on port 8000)
   cd backend && npm run dev
   ```

## Understanding HERA Universal

### Core Philosophy

HERA Universal is built on the principle of **Universal Processing** - one system that handles ALL transaction types through a unified architecture. Think of it as:

- **Traditional ERP**: 350+ tables, complex relationships, rigid structure
- **HERA Universal**: 80+ smart tables, universal relationships, adaptive structure

### The Universal Transaction Concept

Every action in HERA is a **Universal Transaction**:
- Journal entries
- Master data changes
- Payments
- Inventory movements
- Document processing
- User actions

All transactions flow through the same processing engine with:
- Real-time validation
- AI classification
- Automatic routing
- Complete audit trails

## Revolutionary Design System

HERA features the world's most advanced enterprise design system that redefines what enterprise software can look like.

### Design Philosophy
We combine the mathematical precision of Dieter Rams, the pixel-perfect craft of Susan Kare, the emotional intelligence of Don Norman, and the typographic mastery of Tobias Frere-Jones into a unified, AI-powered design language.

### Key Design Innovations

#### **1. Mathematical Color Harmony**
```css
/* Golden ratio-based color relationships */
:root {
  --golden-ratio: 1.618;
  --primary-h: 217;
  --primary-s: 91%;
  --primary-l: 60%;
  
  /* Generated mathematical variants */
  --primary-600: hsl(var(--primary-h), var(--primary-s), calc(var(--primary-l) / var(--golden-ratio)));
}
```

#### **2. Circadian Rhythm Adaptation**
```css
/* Colors shift based on time of day */
.circadian-morning { filter: hue-rotate(-5deg); } /* Cooler, alerting */
.circadian-evening { filter: hue-rotate(8deg); }  /* Warmer, comfortable */
```

#### **3. Cognitive State Detection**
```typescript
// Interface adapts to user's mental state
const cognitiveStates = {
  focused: { colorSaturation: -20, spacing: "compact" },
  creative: { colorSaturation: +15, spacing: "comfortable" },
  scanning: { colorSaturation: 0, spacing: "optimal" },
}
```

#### **4. Physics-Based Animations**
```typescript
// Natural spring animations
const springPresets = {
  gentle: { stiffness: 120, damping: 14, mass: 0.8 },
  swift: { stiffness: 300, damping: 20, mass: 0.4 },
  bounce: { stiffness: 400, damping: 12, mass: 0.3 },
}
```

## Architecture Deep Dive

### Six-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Presentation Layer (Next.js, React, TypeScript)            │
├─────────────────────────────────────────────────────────────┤
│ API Gateway Layer (Express, Routing, Authentication)       │
├─────────────────────────────────────────────────────────────┤
│ Business Logic Layer (Services, Validation, Rules)         │
├─────────────────────────────────────────────────────────────┤
│ AI Orchestration Layer (Classification, Prediction, ML)    │
├─────────────────────────────────────────────────────────────┤
│ Data Management Layer (Universal Tables, Relationships)    │
├─────────────────────────────────────────────────────────────┤
│ Infrastructure Layer (Security, Monitoring, Compliance)    │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Universal Data Abstraction Engine**
   - Single interface for all data types
   - Multi-database federation
   - Real-time synchronization

2. **AI Governance Platform**
   - Explainable AI decisions
   - Bias detection
   - Model trust scoring

3. **Enterprise Security Framework**
   - Zero-trust architecture
   - Real-time fraud detection
   - Advanced encryption

## Development Practices

### Code Organization

```
frontend/
├── app/                 # Next.js app router
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── forms/          # Form components
│   └── charts/         # Chart components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── stores/             # State management (Zustand)
└── types/              # TypeScript definitions

backend/
├── src/
│   ├── controllers/    # API controllers
│   ├── services/       # Business logic
│   ├── models/         # Data models
│   ├── middleware/     # Express middleware
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript definitions
└── tests/              # Test files
```

### Naming Conventions

- **Components**: PascalCase (e.g., `UniversalTransactionForm`)
- **Files**: kebab-case (e.g., `universal-transaction-form.tsx`)
- **Variables**: camelCase (e.g., `transactionData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `TRANSACTION_TYPES`)
- **Database**: snake_case (e.g., `universal_transactions`)

### TypeScript Usage

We use TypeScript extensively for type safety:

```typescript
// Define interfaces for data structures
interface UniversalTransaction {
  id: string;
  type: TransactionType;
  subtype: TransactionSubtype;
  data: Record<string, any>;
  metadata: TransactionMetadata;
  aiDecisions: AIDecision[];
  auditTrail: AuditEntry[];
}

// Use strict typing for API responses
type APIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: ResponseMetadata;
};
```

### Component Development

Follow these patterns for React components:

```typescript
// Universal component pattern
interface UniversalComponentProps {
  // Props interface
  data: UniversalTransaction;
  onUpdate: (data: UniversalTransaction) => void;
  className?: string;
}

export function UniversalComponent({ 
  data, 
  onUpdate, 
  className 
}: UniversalComponentProps) {
  // Component implementation
  return (
    <div className={cn("universal-component", className)}>
      {/* Component content */}
    </div>
  );
}
```

## Testing Strategy

### Frontend Testing

```bash
# Run frontend tests
cd frontend && npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- UniversalTransaction.test.tsx
```

### Backend Testing

```bash
# Run backend tests
cd backend && npm test

# Run integration tests
npm run test:integration

# Run specific test suite
npm test -- --grep "Universal Transaction"
```

### Test Structure

```typescript
// Frontend component test
describe('UniversalTransactionForm', () => {
  it('should handle universal transaction creation', () => {
    // Test implementation
  });
  
  it('should validate transaction data', () => {
    // Test implementation
  });
});

// Backend service test
describe('UniversalTransactionService', () => {
  it('should process all transaction types', () => {
    // Test implementation
  });
});
```

## AI Integration Guidelines

### AI-First Development

Every feature should consider AI enhancement:

```typescript
// AI-enhanced component
interface AIEnhancedProps {
  aiPredictions?: AIPrediction[];
  confidenceScore?: number;
  aiDecisionTrail?: AIDecision[];
}

export function AIEnhancedComponent(props: AIEnhancedProps) {
  // Show AI insights
  // Display confidence scores
  // Provide explainable AI decisions
}
```

### AI Decision Trails

Always capture AI decision trails:

```typescript
interface AIDecision {
  timestamp: Date;
  modelId: string;
  decision: string;
  confidence: number;
  explanation: string;
  features: Record<string, any>;
}
```

## Performance Guidelines

### Frontend Performance

1. **Code Splitting**: Use dynamic imports for large components
2. **Memoization**: Use React.memo for expensive components
3. **Lazy Loading**: Implement lazy loading for data-heavy components
4. **Caching**: Use React Query for efficient data caching

### Backend Performance

1. **Database Optimization**: Use proper indexing and query optimization
2. **Caching Strategy**: Implement Redis caching for frequently accessed data
3. **API Optimization**: Use pagination and filtering for large datasets
4. **Real-time Processing**: Implement efficient real-time processing pipelines

## Security Best Practices

### Frontend Security

- Never expose sensitive data in client-side code
- Use proper authentication and authorization
- Implement CSP headers
- Validate all user inputs

### Backend Security

- Use JWT tokens for authentication
- Implement rate limiting
- Use proper CORS configuration
- Encrypt sensitive data at rest

## Deployment

### Environment Management

```bash
# Development
npm run dev

# Staging
npm run deploy:staging

# Production
npm run deploy:production
```

### Database Migrations

```bash
# Create migration
npm run db:migrate:create

# Run migrations
npm run db:migrate

# Rollback migration
npm run db:migrate:rollback
```

## Common Tasks

### Adding a New Transaction Type

1. Define the transaction type in `types/transactions.ts`
2. Add validation schema in `schemas/transaction-schemas.ts`
3. Update the universal transaction processor
4. Add AI classification rules
5. Create UI components for the transaction type
6. Write comprehensive tests

### Adding a New AI Model

1. Define the model interface in `types/ai-models.ts`
2. Implement the model service
3. Add explainability features
4. Create model monitoring
5. Add bias detection
6. Write model tests

## Getting Help

### Resources

- **Documentation**: `/docs` folder
- **Architecture**: See `PROJECT-OVERVIEW.md`
- **API Documentation**: Available at `/api/docs`
- **Component Library**: Storybook at `/storybook`

### Team Communication

- **Daily Standups**: 9:00 AM EST
- **Architecture Reviews**: Wednesdays
- **Code Reviews**: All PRs require review
- **Pair Programming**: Encouraged for complex features

### Revolutionary Design System Usage

#### **Using the Theme Provider**
```typescript
import { ThemeProvider } from "@/components/providers/theme-provider"

// Enable all revolutionary features
<ThemeProvider
  enableCircadianRhythm={true}
  enableCognitiveAdaptation={true}
  enablePerformanceOptimization={true}
  defaultContext="financial"
>
  <App />
</ThemeProvider>
```

#### **Using Adaptive Colors**
```typescript
import { useAdaptiveColor } from "@/hooks/use-adaptive-color"

const { getAdaptedColor, isHighContrast, getColorForContext } = useAdaptiveColor()

// Colors automatically adapt to context and user needs
const primaryColor = getAdaptedColor('primary')
const financialColor = getColorForContext(primaryColor, 'financial')
```

#### **Using Gesture Recognition**
```typescript
import { useGestures } from "@/hooks/use-gestures"

const gestureHandlers = {
  onSwipeLeft: () => navigateBack(),
  onSwipeRight: () => navigateForward(),
  onPinchZoom: (scale) => zoomInterface(scale),
  onLongPress: () => showContextMenu(),
}

useGestures(elementRef, gestureHandlers)
```

#### **Using Revolutionary Components**
```typescript
import { Button } from "@/components/ui/revolutionary-button"
import { Card } from "@/components/ui/revolutionary-card"

// Button with magnetic interactions and haptic feedback
<Button
  variant="gradient"
  interaction="magnetic"
  hapticFeedback={true}
  particleEffect={true}
  contextualColor={true}
>
  Process Transaction
</Button>

// Card with tilt effects and contextual intelligence
<Card
  variant="contextual"
  interaction="tilt"
  context="financial"
  contextualColors={true}
  microAnimations={true}
>
  Financial Dashboard
</Card>
```

### Code Review Guidelines

1. **Universal Thinking**: Does this work for all transaction types?
2. **AI Enhancement**: Are there AI opportunities?
3. **Performance**: Is this optimized for scale?
4. **Security**: Are security best practices followed?
5. **Testing**: Are there comprehensive tests?
6. **Documentation**: Is the code well-documented?
7. **Design Excellence**: Does this use the revolutionary design system?
8. **Accessibility**: Is this WCAG 2.1 AAA compliant?
9. **Micro-Interactions**: Are delightful interactions included?
10. **Contextual Awareness**: Does this adapt to business context?

## Best Practices Summary

1. **Think Universal**: Build for all transaction types
2. **AI-First**: Consider AI enhancement opportunities
3. **Enterprise-Grade**: Maintain security and compliance
4. **Real-Time**: Design for instant processing
5. **Traceable**: Ensure complete audit trails
6. **Scalable**: Build for any volume or complexity
7. **Design Excellence**: Use the revolutionary design system
8. **Accessibility First**: WCAG 2.1 AAA with neurodiversity support
9. **Performance Obsessed**: 60fps animations, sub-100ms interactions
10. **Contextually Aware**: Adapt to business context and user state

## Revolutionary Design System Features

### **🎨 What Makes Our Design System Legendary**
- **First enterprise system** with circadian rhythm adaptation
- **Mathematical precision** in every color relationship
- **Physics-based animations** that feel natural and organic
- **Cognitive state detection** that adapts to user's mental state
- **Gesture recognition** for intuitive touch and mouse interactions
- **Contextual intelligence** for financial/operational/strategic themes
- **Performance optimization** with guaranteed 60fps animations
- **Accessibility excellence** beyond WCAG 2.1 AAA compliance

### **⚡ Quick Implementation**
```bash
# Install required dependencies
npm install framer-motion class-variance-authority @tailwindcss/container-queries

# Import and use immediately
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Button } from "@/components/ui/revolutionary-button"
```

Welcome to the future of enterprise software design! 🎨✨