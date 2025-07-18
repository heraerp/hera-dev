# Complete Restaurant Management System Prompt

**Copy-paste this prompt for a complete restaurant management implementation**

## 🎯 **Master Prompt - Complete Restaurant System**

```
Create a complete restaurant management system using HERA Universal CRUD and Frontend Templates.

BUSINESS CONTEXT:
Restaurant Type: Full-service restaurant with dine-in, takeout, and delivery
User Roles: Owner, Manager, Server, Chef, Cashier
Business Goals: Streamline operations, improve customer experience, increase efficiency

SYSTEM REQUIREMENTS:

1. PRODUCT MANAGEMENT
Entity: products (menu items)
Fields:
- name: text, required, max 100 chars, searchable
- description: textarea, max 500 chars
- price: currency, required, min 0, max 999
- cost: currency, min 0 (for profit margins)
- category: select [appetizers, mains, desserts, beverages, sides, specials]
- dietary_tags: multiselect [vegetarian, vegan, gluten-free, spicy, nut-free, dairy-free]
- image_url: url
- preparation_time: number (minutes), min 1, max 120
- is_available: boolean, default true
- popularity_score: number, readonly (calculated from orders)

Features: Real-time availability updates, bulk price changes, profitability analysis
Use: HERAUniversalCRUD with ProductListPage preset
Quick Stats: Total Items, Available Today, Out of Stock, Low Profit Margin
Tab Views: All Items, Available, Unavailable, High Profit, Low Profit

2. ORDER PROCESSING
Entity: orders (using universal_transactions)
Fields:
- order_number: auto-generated (format: ORD-YYYYMMDD-XXX)
- customer_name: text, required
- customer_phone: tel
- table_number: text (for dine-in)
- order_type: select [dine_in, takeout, delivery]
- items: array of {product_id, quantity, special_instructions, unit_price}
- subtotal: currency, calculated
- tax_amount: currency, calculated (8.5% rate)
- total_amount: currency, calculated
- order_status: select [pending, confirmed, preparing, ready, completed, cancelled]
- special_instructions: textarea
- estimated_prep_time: number (minutes), calculated
- actual_prep_time: number (minutes)
- payment_status: select [pending, paid, refunded]
- payment_method: select [cash, card, digital_wallet]

Features: Real-time kitchen updates, order tracking, payment processing
Use: UniversalTransactionService with real-time subscriptions
Layout: Full-screen order board with status columns
Quick Stats: Today's Orders, Revenue, Average Order Value, Table Turnover

3. CUSTOMER MANAGEMENT
Entity: customers
Fields:
- full_name: text, required, max 100 chars
- email: email, unique
- phone: tel, required
- address: textarea (for delivery)
- customer_type: select [regular, vip, corporate]
- total_orders: number, readonly
- total_spent: currency, readonly
- last_order_date: date, readonly
- preferences: multiselect [dietary restrictions, favorite items]
- notes: textarea
- is_active: boolean, default true

Features: Order history, loyalty tracking, preferences management
Use: HERAUniversalCRUD with CustomerListPage preset
Quick Stats: Total Customers, Active This Month, VIP Members, Repeat Customers

4. STAFF MANAGEMENT
Entity: staff
Fields:
- full_name: text, required
- email: email, required, unique
- phone: tel, required
- role: select [owner, manager, server, chef, cashier, cleaner]
- hourly_rate: currency, min 0
- hire_date: date, required
- emergency_contact_name: text
- emergency_contact_phone: tel
- permissions: multiselect [orders, products, customers, staff, reports, settings]
- schedule: json (weekly schedule)
- is_active: boolean, default true

Features: Shift scheduling, performance tracking, permission management
Use: HERAUniversalCRUD with custom StaffListPage

5. INVENTORY MANAGEMENT
Entity: inventory
Fields:
- item_name: text, required, searchable
- category: select [ingredients, beverages, supplies, equipment]
- unit_of_measure: select [pieces, kg, liters, boxes, cases]
- current_stock: number, min 0
- minimum_stock: number, min 0, default 10
- maximum_stock: number, min 0
- unit_cost: currency, min 0
- supplier_name: text
- supplier_contact: text
- last_restocked: date
- expiry_date: date (for perishables)
- storage_location: select [kitchen, walk_in_cooler, freezer, dry_storage, bar]
- is_active: boolean, default true

Features: Low stock alerts, expiry notifications, supplier management
Use: HERAUniversalCRUD with InventoryListPage preset
Alerts: Items below minimum stock, items expiring within 7 days

FRONTEND IMPLEMENTATION:

1. MAIN DASHBOARD
Layout: DashboardLayout with sidebar navigation
Navigation Items:
- Dashboard (overview)
- Orders (real-time order management)
- Products (menu management)
- Customers (customer database)
- Staff (employee management)
- Inventory (stock management)
- Analytics (reports and insights)
- Settings (system configuration)

Dashboard Content:
- Header: Welcome message, current time, restaurant status
- Key Metrics: Today's Sales, Orders Count, Table Occupancy, Staff On Duty
- Quick Actions: New Order, Add Customer, Update Menu, View Kitchen
- Real-time Widgets: Recent Orders, Popular Items, Low Stock Alerts, Staff Performance

2. ORDER MANAGEMENT INTERFACE
Layout: Full-screen dashboard with real-time updates
Sections:
- Order Entry: Quick product selection with categories
- Order Queue: Visual board with status columns (Pending, Preparing, Ready)
- Kitchen Display: Orders organized by preparation priority
- Payment Processing: Integrated payment terminal interface

Features: Touch-friendly for tablets, real-time updates, audio notifications
Auto-refresh: Every 10 seconds for order status
Color Coding: Green (new), Yellow (preparing), Red (overdue), Blue (ready)

3. POINT OF SALE SYSTEM
Layout: Tablet-optimized interface
Left Panel (70%): Product grid with category filters
- Category tabs with item counts
- Product cards: image, name, price, availability
- Quick add buttons with quantity controls

Right Panel (30%): Current order
- Customer information section
- Order items with modify/remove options
- Running total with tax calculation
- Payment method selection
- Order type selection (dine-in/takeout/delivery)

4. MOBILE STAFF APP
Layout: Mobile-first responsive design
Screens:
- Order Status: Current orders with status updates
- Product Availability: Toggle item availability
- Customer Lookup: Quick customer search and order history
- Table Management: Table status and assignments

Features: Offline capability, push notifications, gesture controls
Target: 44px minimum touch targets, high contrast colors

TECHNICAL SPECIFICATIONS:

Architecture: HERA Universal with organization-first design
Database: Supabase with universal schema patterns
Real-time: Supabase subscriptions for orders and inventory
Authentication: Role-based access control
Mobile: PWA with offline capabilities
Performance: Virtual scrolling for large datasets
Accessibility: WCAG 2.1 AA compliance

Business Logic:
- Auto-calculate prep times based on order complexity
- Dynamic pricing based on demand and inventory
- Automatic low stock notifications
- Customer loyalty point calculation
- Staff performance metrics tracking
- Financial reporting with profit margins

Integration Points:
- Payment processing (Stripe/Square)
- Kitchen display systems
- Receipt printing
- SMS notifications for order updates
- Email marketing for customer retention

Error Handling:
- Graceful degradation for network issues
- Order backup and recovery
- Payment failure handling
- Real-time sync conflict resolution

DELIVERABLES REQUIRED:
1. Complete service layer implementations for all entities
2. Frontend pages using HERA Universal templates
3. Real-time order processing system
4. Mobile-responsive interfaces
5. Role-based access control
6. Business logic validation
7. Error handling and recovery
8. Performance optimizations
9. Accessibility compliance
10. Documentation and setup instructions

Generate production-ready TypeScript code following HERA Universal architecture principles with proper error handling, validation, and user experience design.
```

## 🎯 **Expected Output**

When you use this prompt, you'll receive:

### **Service Layer (5 complete services)**
- ✅ ProductCatalogService with menu management
- ✅ OrderProcessingService with real-time updates  
- ✅ CustomerManagementService with loyalty tracking
- ✅ StaffManagementService with scheduling
- ✅ InventoryManagementService with alerts

### **Frontend Components (8 complete pages)**
- ✅ RestaurantDashboard with real-time metrics
- ✅ OrderManagementPage with kitchen display
- ✅ ProductCatalogPage with menu management
- ✅ CustomerManagementPage with history
- ✅ StaffManagementPage with scheduling
- ✅ InventoryManagementPage with alerts
- ✅ PointOfSaleInterface for order entry
- ✅ MobileStaffApp for mobile operations

### **Business Logic (10 key workflows)**
- ✅ Order processing from entry to completion
- ✅ Real-time kitchen display updates
- ✅ Automatic inventory deduction
- ✅ Customer loyalty point calculation
- ✅ Staff performance tracking
- ✅ Profit margin analysis
- ✅ Low stock alert system
- ✅ Table management workflow
- ✅ Payment processing integration
- ✅ Report generation system

### **Integration Features (6 systems)**
- ✅ Real-time order synchronization
- ✅ Payment gateway integration
- ✅ Kitchen display system connection
- ✅ SMS notification system
- ✅ Receipt printing integration
- ✅ Analytics and reporting

## 📱 **Mobile-First Design**

The generated system includes:
- **Touch-friendly interfaces** with 44px minimum targets
- **Offline capability** for critical operations
- **Progressive Web App** features
- **Gesture controls** for natural interactions
- **High contrast** design for kitchen environments
- **Audio notifications** for order alerts

## 🎨 **Design Principles**

Follows "Don't Make Me Think" with:
- **Self-evident navigation** - clear menu structure
- **Minimal cognitive load** - focused interfaces
- **Consistent patterns** - unified interaction design
- **Visual hierarchy** - important information stands out
- **Error prevention** - validation and confirmation dialogs

## 🚀 **Performance Features**

Optimized for real-world restaurant use:
- **Sub-second response times** for order entry
- **Real-time updates** without page refresh
- **Offline resilience** for network interruptions
- **Batch processing** for bulk operations
- **Efficient data loading** with pagination
- **Memory optimization** for long-running sessions

This master prompt generates a complete, production-ready restaurant management system that can handle real-world operations while maintaining excellent user experience and performance.