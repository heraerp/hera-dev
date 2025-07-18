# HERA Universal Prompt Templates

A comprehensive collection of AI prompt templates for rapid development using HERA Universal CRUD and Frontend Template Systems. These prompts follow "Don't Make Me Think" principles and enable developers to build sophisticated interfaces quickly and consistently.

## 🎯 **Quick Start - Copy & Paste Prompts**

### **📋 Template Categories**

1. **[CRUD Templates](#crud-templates)** - Complete CRUD functionality
2. **[Frontend Templates](#frontend-templates)** - UI layouts and pages
3. **[Business Logic Templates](#business-logic-templates)** - Domain-specific implementations
4. **[Integration Templates](#integration-templates)** - System connections
5. **[Workflow Templates](#workflow-templates)** - Complete feature development

---

## 🔧 **CRUD Templates**

### **Basic CRUD Implementation**
```
Create a complete CRUD system for [ENTITY_NAME] using HERA Universal CRUD Template.

Requirements:
- Entity: [ENTITY_NAME] (e.g., "products", "customers", "orders")
- Fields: [LIST_FIELDS] (e.g., "name, description, price, category, is_active")
- Features: [FEATURES] (e.g., "search, filters, bulk actions, real-time updates")

Use:
- HERAUniversalCRUD component
- Universal naming convention validation
- Organization-first architecture
- TypeScript with proper types

Example fields configuration:
- name: required text field with validation
- price: currency field with min/max validation
- category: select field with predefined options
- is_active: boolean field with default true

Include proper error handling, loading states, and success notifications.
```

### **Advanced CRUD with Custom Features**
```
Create an advanced CRUD system for [ENTITY_NAME] with the following specifications:

Core Configuration:
- Entity Type: [ENTITY_TYPE]
- Service: [SERVICE_NAME]
- Fields: [DETAILED_FIELDS]

Advanced Features:
- Real-time updates: [YES/NO]
- Bulk operations: [LIST_OPERATIONS]
- Custom actions: [LIST_ACTIONS]
- Advanced filters: [LIST_FILTERS]
- Export functionality: [FORMATS]

Custom Requirements:
- [SPECIFIC_REQUIREMENT_1]
- [SPECIFIC_REQUIREMENT_2]
- [SPECIFIC_REQUIREMENT_3]

Use HERA Universal architecture with:
- Organization isolation
- Universal schema patterns
- Manual joins (no foreign keys)
- Naming convention compliance

Implement all service methods (create, read, update, delete, list, search) with proper validation.
```

### **Service Layer Implementation**
```
Create a service implementation for [ENTITY_NAME] following HERA Universal patterns.

Service Requirements:
- Entity Type: [ENTITY_TYPE]
- Organization-first design
- Universal CRUD interface compliance
- Naming convention validation

Methods to implement:
- create(organizationId, data): Create new entity
- read(organizationId, id): Get single entity
- update(organizationId, id, data): Update entity
- delete(organizationId, id): Remove entity
- list(organizationId, options): List with pagination/filters
- search(organizationId, query, options): Search functionality

Business Logic:
- [VALIDATION_RULES]
- [BUSINESS_CONSTRAINTS]
- [WORKFLOW_REQUIREMENTS]

Use:
- UniversalCrudService for database operations
- HeraNamingConventionAI for field validation
- Proper error handling and logging
- TypeScript interfaces

Include comprehensive validation, error handling, and business rule enforcement.
```

---

## 🎨 **Frontend Templates**

### **List Page Implementation**
```
Create a [ENTITY_NAME] management page using HERA Universal Frontend Templates.

Page Requirements:
- Title: [PAGE_TITLE]
- Entity: [ENTITY_NAME]
- Layout: Dashboard with sidebar navigation

Features Required:
- Data table with sorting and filtering
- Search functionality
- Quick stats: [LIST_STATS]
- Quick actions: [LIST_ACTIONS]
- Tab views: [LIST_TABS]

Design Requirements:
- Mobile-first responsive design
- "Don't Make Me Think" principles
- Consistent with HERA design system
- Performance optimized

Use:
- SimpleListPage or create custom preset
- Responsive grid system
- Proper loading and error states
- Real-time updates if applicable

Example implementation for products:
- Quick stats: Total Products, Active Items, Low Stock
- Tab views: All, Active, Inactive, Low Stock
- Actions: Add Product, Import, Export

Include proper TypeScript types and error handling.
```

### **Form Page Implementation**
```
Create a [FORM_PURPOSE] form for [ENTITY_NAME] using HERA Universal Frontend Templates.

Form Configuration:
- Purpose: [CREATE/EDIT/VIEW] [ENTITY_NAME]
- Layout: [DASHBOARD/CENTERED/FULLSCREEN]
- Steps: [SINGLE_STEP/MULTI_STEP]

Form Fields:
[DETAILED_FIELD_CONFIGURATION]

Features:
- Validation: [VALIDATION_REQUIREMENTS]
- Auto-save: [YES/NO]
- Progress indicator: [YES/NO]
- File uploads: [YES/NO]

Form Behavior:
- [SPECIFIC_BEHAVIOR_1]
- [SPECIFIC_BEHAVIOR_2]
- [SPECIFIC_BEHAVIOR_3]

Use:
- FormPage component with proper configuration
- Field validation and error handling
- Responsive design for all devices
- Accessibility compliance

Example for product creation:
- Step 1: Basic Info (name, description, category)
- Step 2: Pricing (price, cost, margins)
- Step 3: Inventory (stock, alerts, locations)

Include proper success/error handling and user feedback.
```

### **Dashboard Layout Implementation**
```
Create a [DASHBOARD_NAME] dashboard using HERA Universal Frontend Templates.

Dashboard Requirements:
- Layout: Dashboard with sidebar navigation
- Navigation: [LIST_NAV_ITEMS]
- User role: [USER_ROLE]

Content Sections:
- Header: [HEADER_CONTENT]
- Metrics: [LIST_METRICS]
- Main content: [MAIN_CONTENT_AREAS]
- Sidebar: [SIDEBAR_CONTENT]

Features:
- Real-time updates: [YES/NO]
- Responsive design: [BREAKPOINT_BEHAVIOR]
- Quick actions: [LIST_QUICK_ACTIONS]

Use:
- DashboardLayout as base
- Grid system for responsive layout
- MetricCard components for KPIs
- Proper loading states

Example restaurant dashboard:
- Metrics: Today's Sales, Orders, Average Order Value
- Quick actions: New Order, View Kitchen, Daily Report
- Main content: Recent Orders, Popular Items
- Sidebar: Staff Performance, Notifications

Include proper navigation structure and user context.
```

---

## 💼 **Business Logic Templates**

### **Restaurant Management System**
```
Create a complete restaurant management feature for [FEATURE_NAME].

Business Context:
- Restaurant type: [RESTAURANT_TYPE]
- Feature scope: [FEATURE_SCOPE]
- User roles: [USER_ROLES]

Requirements:
- [BUSINESS_REQUIREMENT_1]
- [BUSINESS_REQUIREMENT_2]
- [BUSINESS_REQUIREMENT_3]

Technical Implementation:
- Use HERA Universal CRUD for data management
- Frontend templates for user interface
- Real-time updates for order processing
- Mobile-first design for staff usage

Entities to implement:
- [ENTITY_1]: [ENTITY_1_DESCRIPTION]
- [ENTITY_2]: [ENTITY_2_DESCRIPTION]
- [ENTITY_3]: [ENTITY_3_DESCRIPTION]

Workflows:
- [WORKFLOW_1]: [WORKFLOW_1_STEPS]
- [WORKFLOW_2]: [WORKFLOW_2_STEPS]

Include proper validation, error handling, and business rule enforcement.
```

### **E-commerce Implementation**
```
Create an e-commerce feature for [FEATURE_NAME] using HERA Universal templates.

Business Model:
- Product types: [PRODUCT_TYPES]
- Customer segments: [CUSTOMER_SEGMENTS]
- Sales channels: [SALES_CHANNELS]

Feature Requirements:
- [REQUIREMENT_1]
- [REQUIREMENT_2]
- [REQUIREMENT_3]

Technical Stack:
- CRUD: HERA Universal CRUD system
- Frontend: HERA Universal Frontend templates
- Real-time: Order processing and inventory updates
- Mobile: Mobile-first responsive design

Implementations needed:
- Product catalog management
- Customer management
- Order processing
- Inventory tracking
- Payment processing integration

Include proper business validation and workflow automation.
```

### **Service Business Implementation**
```
Create a service business management system for [SERVICE_TYPE].

Service Configuration:
- Service type: [SERVICE_TYPE]
- Business model: [BUSINESS_MODEL]
- Customer journey: [CUSTOMER_JOURNEY_STEPS]

Required Features:
- [FEATURE_1]
- [FEATURE_2]
- [FEATURE_3]

Technical Requirements:
- Appointment scheduling
- Customer management
- Service delivery tracking
- Payment processing
- Reporting and analytics

Use HERA Universal templates for:
- Service catalog management
- Customer relationship management
- Appointment booking interface
- Staff management
- Financial reporting

Include proper validation and business workflow enforcement.
```

---

## 🔗 **Integration Templates**

### **API Integration**
```
Create an integration with [EXTERNAL_SERVICE] using HERA Universal patterns.

Integration Details:
- Service: [EXTERNAL_SERVICE_NAME]
- Purpose: [INTEGRATION_PURPOSE]
- Data flow: [BIDIRECTIONAL/UNIDIRECTIONAL]

Technical Requirements:
- Authentication: [AUTH_METHOD]
- Data format: [JSON/XML/CSV]
- Frequency: [REAL_TIME/BATCH/SCHEDULED]

Implementation:
- Create service layer following HERA patterns
- Use organization-first architecture
- Implement proper error handling
- Add retry logic and fallbacks

Data Mapping:
- [EXTERNAL_FIELD] → [HERA_FIELD]
- [EXTERNAL_FIELD] → [HERA_FIELD]
- [EXTERNAL_FIELD] → [HERA_FIELD]

Include:
- Configuration management
- Monitoring and logging
- Data validation and transformation
- Error handling and recovery

Use HERA Universal CRUD for storing integration data and configuration.
```

### **Payment System Integration**
```
Integrate [PAYMENT_PROVIDER] with HERA Universal restaurant system.

Payment Configuration:
- Provider: [PAYMENT_PROVIDER]
- Payment methods: [CREDIT_CARD/ACH/DIGITAL_WALLET]
- Transaction types: [SALE/REFUND/VOID]

Implementation Requirements:
- Secure payment processing
- Transaction recording in universal_transactions
- Receipt generation and storage
- Error handling and retry logic

Features:
- Payment form using FormPage template
- Transaction history using SimpleListPage
- Real-time payment status updates
- Mobile-friendly payment interface

Security:
- PCI compliance considerations
- Secure data handling
- Audit trail implementation
- Error logging without sensitive data

Use HERA Universal architecture for storing transaction records and payment metadata.
```

---

## 🔄 **Workflow Templates**

### **Complete Feature Development**
```
Develop a complete [FEATURE_NAME] feature from scratch using HERA Universal templates.

Feature Specification:
- Feature name: [FEATURE_NAME]
- Business purpose: [BUSINESS_PURPOSE]
- User roles: [USER_ROLES]
- Success metrics: [SUCCESS_METRICS]

Development Plan:
1. Data Model Design
   - Entities: [LIST_ENTITIES]
   - Relationships: [ENTITY_RELATIONSHIPS]
   - Business rules: [BUSINESS_RULES]

2. Backend Implementation
   - Service layer using HERA Universal patterns
   - CRUD operations with proper validation
   - Business logic implementation
   - API endpoints if needed

3. Frontend Implementation
   - List page for data management
   - Forms for create/edit operations
   - Dashboard integration
   - Mobile-responsive design

4. Integration
   - Connect with existing HERA systems
   - Real-time updates if applicable
   - Notification system integration
   - Reporting integration

5. Testing & Validation
   - Unit tests for service layer
   - Integration tests for workflows
   - UI testing for user experience
   - Performance testing

Include proper documentation, error handling, and deployment instructions.
```

### **Migration & Enhancement**
```
Migrate [EXISTING_SYSTEM] to HERA Universal templates and enhance with [NEW_FEATURES].

Current System Analysis:
- Existing entities: [LIST_ENTITIES]
- Current functionality: [CURRENT_FEATURES]
- Pain points: [PAIN_POINTS]
- Data volume: [DATA_VOLUME]

Migration Plan:
1. Data Migration
   - Map existing schema to universal schema
   - Create migration scripts
   - Validate data integrity
   - Plan rollback strategy

2. Feature Enhancement
   - Implement using HERA Universal CRUD
   - Add new features: [NEW_FEATURES]
   - Improve user experience
   - Add mobile support

3. UI Modernization
   - Replace existing UI with HERA Frontend templates
   - Implement responsive design
   - Add accessibility features
   - Improve performance

4. Testing & Rollout
   - Parallel testing environment
   - User acceptance testing
   - Phased rollout plan
   - Training documentation

Include proper backup procedures and rollback plans.
```

---

## 🎨 **Customization Templates**

### **Theme Customization**
```
Create a custom theme for [BRAND_NAME] using HERA Universal design system.

Brand Requirements:
- Primary color: [HEX_COLOR]
- Secondary color: [HEX_COLOR]
- Accent color: [HEX_COLOR]
- Typography: [FONT_PREFERENCES]
- Logo: [LOGO_REQUIREMENTS]

Customization Areas:
- Color palette adaptation
- Typography scaling
- Component styling
- Layout adjustments
- Animation preferences

Implementation:
- Use createCustomTheme utility
- Override design tokens
- Maintain accessibility compliance
- Test across all components

Include:
- Brand guidelines compliance
- Accessibility testing
- Component showcase
- Implementation documentation

Ensure the theme works across all HERA Universal components and maintains usability.
```

### **Component Extension**
```
Extend [COMPONENT_NAME] with [ADDITIONAL_FUNCTIONALITY] while maintaining HERA Universal patterns.

Extension Requirements:
- Base component: [COMPONENT_NAME]
- New functionality: [FUNCTIONALITY_DESCRIPTION]
- Compatibility: Must work with existing HERA system

Implementation Approach:
- Extend existing component without breaking changes
- Follow HERA naming conventions
- Maintain TypeScript type safety
- Add proper documentation

Features to Add:
- [FEATURE_1]: [FEATURE_1_DESCRIPTION]
- [FEATURE_2]: [FEATURE_2_DESCRIPTION]
- [FEATURE_3]: [FEATURE_3_DESCRIPTION]

Testing Requirements:
- Unit tests for new functionality
- Integration tests with existing components
- Visual regression testing
- Performance impact assessment

Include proper error handling and fallback behavior.
```

---

## 🚀 **Usage Instructions**

### **How to Use These Prompts**

1. **Choose the appropriate template** based on your development need
2. **Replace placeholders** (e.g., `[ENTITY_NAME]`, `[FEATURE_NAME]`) with your specific values
3. **Customize requirements** to match your business needs
4. **Copy and paste** the completed prompt to your AI assistant
5. **Review and refine** the generated code as needed

### **Placeholder Guide**

- `[ENTITY_NAME]` - The business entity (e.g., "products", "customers", "orders")
- `[FEATURE_NAME]` - The feature being developed (e.g., "inventory management", "order processing")
- `[USER_ROLES]` - Who will use this feature (e.g., "admin", "staff", "customer")
- `[BUSINESS_REQUIREMENTS]` - Specific business needs and constraints
- `[TECHNICAL_REQUIREMENTS]` - Technical specifications and constraints

### **Best Practices**

1. **Be specific** - The more detailed your requirements, the better the output
2. **Include context** - Provide business context and user needs
3. **Specify constraints** - Mention any technical or business limitations
4. **Request examples** - Ask for concrete examples and use cases
5. **Iterate** - Refine the prompts based on the generated output

### **Example Usage**

```
Create a complete CRUD system for products using HERA Universal CRUD Template.

Requirements:
- Entity: products
- Fields: name (required text), description (textarea), price (currency with min 0), category (select from: appetizers, mains, desserts, beverages), is_available (boolean, default true)
- Features: search by name, filter by category and availability, bulk operations (activate/deactivate), real-time updates

Use:
- HERAUniversalCRUD component
- Universal naming convention validation
- Organization-first architecture
- TypeScript with proper types

Include proper error handling, loading states, and success notifications.
```

This comprehensive prompt template system enables rapid development while maintaining consistency with HERA Universal architecture and design principles. Each template is designed to generate production-ready code that follows best practices and integrates seamlessly with the existing HERA ecosystem.