# HERA Universal Quick Start Prompts

**Copy-paste ready prompts for instant development**

## 🚀 **1-Minute Quick Starts**

### **Basic Product Management**
```
Create a complete product management system using HERA Universal templates.

Entity: products
Fields: name (required), description, price (currency), category (select: appetizers, mains, desserts, beverages), is_available (boolean, default true)
Features: search, category filters, bulk activate/deactivate, real-time updates
Layout: Dashboard with sidebar navigation
Quick stats: Total Products, Active Items, Low Stock, Out of Stock
Tab views: All Products, Active, Inactive, Low Stock

Use HERAUniversalCRUD component with SimpleListPage frontend template.
Include proper TypeScript types, error handling, and mobile-responsive design.
```

### **Customer Management System**
```
Create a customer management system using HERA Universal templates.

Entity: customers  
Fields: full_name (required), email (required, validated), phone (tel format), address (textarea), customer_type (select: regular, vip, corporate), is_active (boolean, default true), created_at (readonly)
Features: search by name/email, filter by type and status, bulk operations, export to CSV
Layout: Dashboard layout with customer insights
Quick stats: Total Customers, Active This Month, New This Week, VIP Members
Tab views: All Customers, VIP, New, Inactive

Include customer contact history and purchase tracking integration.
Use HERA Universal CRUD with organization-first architecture.
```

### **Order Processing System**
```
Create a real-time order processing system using HERA Universal templates.

Entity: orders
Fields: order_number (auto-generated), customer_name (required), table_number, order_items (array), total_amount (currency), order_status (select: pending, preparing, ready, completed, cancelled), special_instructions (textarea), created_at
Features: real-time updates, search by order number/customer, filter by status and date, bulk status updates
Layout: Dashboard with live order board
Quick stats: Today's Orders, Pending, In Progress, Completed
Tab views: All Orders, Pending, Preparing, Ready, Completed

Include kitchen display integration and notification system.
Use UniversalTransactionService with real-time subscriptions.
```

### **Multi-Step Form (Restaurant Setup)**
```
Create a restaurant setup wizard using HERA Universal FormPage template.

Form: Restaurant Setup Wizard
Layout: Centered layout with progress indicator
Steps:
1. Basic Info: restaurant_name (required), cuisine_type (select), description (textarea)
2. Location: address (required), phone (tel), email (email), website (url)
3. Settings: timezone (select), currency (select), opening_hours (time ranges), table_count (number)
4. Menu Categories: categories (dynamic array of category names)

Features: auto-save every 30 seconds, validation on each step, progress indicator, step navigation
Include proper error handling and success state.
Use FormPage component with steps configuration.
```

## 📋 **Ready-to-Use Entity Templates**

### **Product Catalog**
```
Create product catalog management with these exact specifications:

Fields Configuration:
- name: text, required, max 100 chars, searchable
- description: textarea, max 500 chars
- price: currency, required, min 0, max 999999
- cost: currency, min 0 (for profit calculation)
- category: select [appetizers, mains, desserts, beverages, sides]
- tags: multiselect [vegetarian, vegan, gluten-free, spicy, popular]
- image_url: url (product image)
- is_available: boolean, default true
- stock_quantity: number, min 0
- low_stock_alert: number, min 0, default 10

Use HERAUniversalCRUD with ProductListPage preset.
Include image upload, bulk price updates, and inventory alerts.
```

### **Staff Management**
```
Create staff management system with these specifications:

Fields Configuration:
- full_name: text, required, max 100 chars
- email: email, required, unique
- phone: tel, required
- role: select [manager, server, chef, cashier, cleaner]
- hourly_rate: currency, min 0
- hire_date: date, required
- emergency_contact: text
- notes: textarea, max 1000 chars
- is_active: boolean, default true
- permissions: multiselect [orders, products, customers, reports, settings]

Include shift scheduling integration and performance tracking.
Use HERA Universal CRUD with staff-specific actions.
```

### **Inventory Management**
```
Create inventory management system with these specifications:

Fields Configuration:
- item_name: text, required, searchable
- category: select [ingredients, supplies, equipment]
- unit_of_measure: select [pieces, kg, liters, boxes]
- current_stock: number, min 0
- minimum_stock: number, min 0
- maximum_stock: number, min 0
- unit_cost: currency, min 0
- supplier: text
- expiry_date: date (for perishables)
- location: select [kitchen, storage, freezer, bar]
- is_active: boolean, default true

Include low stock alerts, expiry notifications, and supplier integration.
Use real-time updates for stock changes.
```

## 🎨 **Frontend Layout Templates**

### **Restaurant Dashboard**
```
Create a restaurant dashboard using HERA Universal Frontend templates.

Layout: DashboardLayout with restaurant navigation
Navigation items: Dashboard, Orders, Products, Customers, Staff, Analytics, Settings

Dashboard Content:
Header: Welcome message with current date/time and restaurant name
Metrics row: Today's Sales ($), Orders count, Average Order Value, Table Turnover
Main content grid:
- Recent Orders (real-time table, 2/3 width)
- Popular Items (chart, 1/3 width)
- Kitchen Status (orders by status)
- Staff Performance (today's metrics)

Quick actions: New Order, View Kitchen Display, Daily Report, Settings
Use responsive Grid system with mobile-first design.
```

### **Point of Sale Interface**
```
Create a POS interface using HERA Universal templates.

Layout: Fullscreen layout optimized for tablets
Left side (2/3): Product grid with categories
- Category tabs: All, Appetizers, Mains, Desserts, Beverages
- Product cards with image, name, price
- Quick add to cart functionality

Right side (1/3): Order summary
- Customer info (name, table number)
- Order items with quantity controls
- Total calculation with tax
- Payment options
- Order action buttons (Save, Print, Complete)

Features: touch-friendly (44px+ targets), offline capability, receipt printing
Use Grid system with mobile-optimized interactions.
```

### **Kitchen Display System**
```
Create a kitchen display system using HERA Universal templates.

Layout: Fullscreen dashboard with auto-refresh
Header: Current time, pending orders count, average prep time
Main content: Order cards grid
- Each card shows: order number, table, items, special instructions, time elapsed
- Color coding: green (new), yellow (preparing), red (overdue)
- Card actions: Start Preparing, Mark Ready, View Details

Features: real-time updates, audio notifications, drag-and-drop status updates
Auto-refresh every 10 seconds, large fonts for kitchen environment
Use real-time subscriptions with visual/audio alerts.
```

## 🔧 **Service Layer Templates**

### **Universal Product Service**
```
Create a product service following HERA Universal patterns.

Service: ProductCatalogService
Methods: create, read, update, delete, list, search, bulkUpdate, validateProduct

Business Logic:
- Auto-generate product codes (format: PROD-YYYYMMDD-XXX)
- Calculate profit margins (price - cost)
- Validate price > cost (warning if margin < 20%)
- Check category consistency
- Image URL validation
- Stock quantity tracking

Validation Rules:
- Name: required, 2-100 characters, no special characters except spaces and hyphens
- Price: required, positive number, max 2 decimal places
- Category: must be from predefined list
- Stock quantity: non-negative integer

Use UniversalCrudService with proper error handling and logging.
Include audit trail for price changes.
```

### **Order Processing Service**
```
Create an order processing service with business logic.

Service: OrderProcessingService
Methods: createOrder, updateOrderStatus, addItem, removeItem, calculateTotal, processPayment

Order Workflow:
1. PENDING: Order created, items can be modified
2. CONFIRMED: Order sent to kitchen, limited modifications
3. PREPARING: Kitchen started preparation
4. READY: Order ready for pickup/delivery
5. COMPLETED: Order delivered/picked up
6. CANCELLED: Order cancelled (only if PENDING or CONFIRMED)

Business Rules:
- Calculate tax based on location (configurable rate)
- Apply discounts and promotions
- Validate item availability before confirming
- Track preparation time estimates
- Send notifications on status changes

Use UniversalTransactionService for order storage.
Include real-time updates and audit logging.
```

## 📱 **Mobile-Optimized Templates**

### **Mobile Staff App**
```
Create a mobile staff application using HERA Universal responsive templates.

Layout: Mobile-first design with bottom navigation
Screens:
- Orders: List with status filters, swipe actions (accept, complete)
- Products: Quick access catalog with availability toggle
- Customers: Customer lookup and order history
- Profile: Staff info, schedule, performance metrics

Features:
- Touch-friendly interfaces (44px minimum targets)
- Offline capability for order viewing
- Push notifications for new orders
- Gesture controls (swipe, tap, hold)
- Large fonts and high contrast for readability

Use responsive breakpoints with mobile-specific optimizations.
Include PWA features for app-like experience.
```

### **Customer Ordering App**
```
Create a customer ordering interface optimized for mobile.

Layout: Centered layout with minimal navigation
Flow:
1. Menu browsing (category filters, search)
2. Item details (description, customization, add to cart)
3. Cart review (items, quantities, special requests)
4. Customer info (name, phone, table number)
5. Order confirmation (summary, estimated time)

Features:
- Image-heavy product display
- Easy quantity controls (+/- buttons)
- Cart persistence across sessions
- Order tracking with real-time updates
- Accessibility compliance (WCAG 2.1 AA)

Use FormPage for checkout process with progress indicator.
Include order status tracking and notifications.
```

## 🔗 **Integration Templates**

### **Payment Integration**
```
Integrate Stripe payment processing with HERA Universal order system.

Integration: Stripe Payment Processing
Components:
- Payment form using FormPage template
- Transaction recording in universal_transactions
- Receipt generation and email delivery
- Refund processing interface

Implementation:
- Secure payment form with validation
- Token-based payment processing (no sensitive data storage)
- Transaction status tracking
- Automated receipt generation
- Error handling with user-friendly messages

Business Logic:
- Calculate tax and tips
- Apply discounts and promotions
- Handle partial payments and refunds
- Track payment methods and preferences

Use HERA Universal architecture for transaction storage.
Include PCI compliance considerations and audit logging.
```

### **Inventory Supplier Integration**
```
Create supplier integration for automated inventory management.

Integration: Supplier API Integration
Features:
- Automated purchase order generation
- Real-time inventory updates
- Price comparison across suppliers
- Delivery tracking and confirmation
- Invoice processing and matching

Workflow:
1. Monitor inventory levels
2. Generate purchase orders when stock low
3. Send orders to preferred suppliers
4. Track deliveries and update inventory
5. Process invoices and payments

Data Mapping:
- Supplier product codes → Internal product codes
- Supplier categories → Internal categories
- Delivery schedules → Inventory updates
- Pricing updates → Cost calculations

Use HERA Universal patterns for integration data storage.
Include error handling and manual override capabilities.
```

## 🎯 **Usage Examples**

Copy any prompt above, customize the placeholders for your specific needs, and paste into your AI assistant for instant, production-ready code that follows HERA Universal architecture and design principles.

Each prompt generates:
- ✅ **Complete TypeScript implementation**
- ✅ **HERA Universal architecture compliance**
- ✅ **Mobile-responsive design**
- ✅ **Accessibility features**
- ✅ **Error handling and validation**
- ✅ **Real-time capabilities when needed**
- ✅ **Performance optimizations**