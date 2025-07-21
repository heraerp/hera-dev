# HERA Sidebar Variants Documentation

## Overview
The HERA Universal sidebar system supports different variants optimized for specific business functions. Each variant provides contextual navigation and shortcuts relevant to that business area.

## Available Variants

### 1. Default Variant (`variant="default"`)
**Use Case**: General business management, admin dashboard, multi-function pages
**Icon Bar**: Activity, Messages, Calendar, Notifications, Search
**Navigation Sections**:
- Main Navigation (Dashboard, POS, Purchase Orders, Inventory, Suppliers)
- Business Management (Customers, Invoicing, Reports, Analytics, Organization)
- System & Tools (Performance, Security, Integrations, Database, Settings, Help)

### 2. POS Variant (`variant="pos"`)
**Use Case**: Restaurant Point of Sale, order management, kitchen operations
**Icon Bar**: Orders, Kitchen, Tables, Notifications, Support
**Navigation Sections**:
- Order Management (Point of Sale, Kitchen View, Prep Station, Tables & Seating)
- Restaurant Operations (Menu Management, Inventory, Staff & Shifts, Customer Orders)
- Reports & Analytics (Daily Reports, Sales Analytics, Performance)
- Settings & Support (Restaurant Settings, System Settings, Support & Help)

### 3. Purchasing Variant (`variant="purchasing"`) [Coming Soon]
**Use Case**: Procurement, supplier management, purchase workflows
**Icon Bar**: Purchase Orders, Suppliers, Approvals, Reports, Search
**Navigation Sections**:
- Procurement (Purchase Orders, Suppliers, Contracts, Approvals)
- Inventory (Stock Levels, Receiving, Quality Control)
- Analytics (Spend Analysis, Supplier Performance, Cost Reports)

### 4. Inventory Variant (`variant="inventory"`) [Coming Soon]
**Use Case**: Warehouse management, stock control, fulfillment
**Icon Bar**: Stock, Movements, Alerts, Reports, Search
**Navigation Sections**:
- Stock Management (Items, Categories, Locations, Movements)
- Operations (Receiving, Picking, Shipping, Adjustments)
- Analytics (Stock Reports, Usage Analytics, Forecasting)

### 5. Analytics Variant (`variant="analytics"`) [Coming Soon]
**Use Case**: Business intelligence, reporting, data analysis
**Icon Bar**: Dashboards, Reports, Charts, Insights, Export
**Navigation Sections**:
- Dashboards (Executive, Operations, Financial, Custom)
- Reports (Sales, Inventory, Financial, Operational)
- Analytics (Trends, Forecasting, Performance, Insights)

## Usage Examples

```tsx
// POS System - Restaurant focused navigation
<AppLayoutWithSidebar variant="pos">
  <POSContent />
</AppLayoutWithSidebar>

// Default - General business management
<AppLayoutWithSidebar variant="default">
  <DashboardContent />
</AppLayoutWithSidebar>

// Purchasing - Procurement focused navigation
<AppLayoutWithSidebar variant="purchasing">
  <PurchaseOrderContent />
</AppLayoutWithSidebar>
```

## Core Icons Used (Lucide Icons)

### Universal Business Icons
- 🏠 `Home` / `LayoutDashboard` - Main Dashboard
- 🧾 `ClipboardList` / `Receipt` - Orders
- 👨‍🍳 `ChefHat` - Kitchen / Prep
- 🔥 `Flame` - Live / Active Operations
- 🪑 `LayoutGrid` / `Users` - Tables / Seating
- 📊 `BarChart3` / `PieChart` - Reports / Analytics
- 📦 `Boxes` / `Package` - Inventory
- 📋 `ListChecks` - Menu Management
- 🔔 `Bell` / `AlertCircle` - Notifications
- ⚙️ `Settings` / `Sliders` - Settings
- 📞 `Phone` / `LifeBuoy` - Support / Help
- 👤 `User` / `UserCircle` - Profile / Account

### PO Gold Standard Colors
- **Primary Blue**: `bg-blue-600`, `text-blue-600`
- **Success Green**: `bg-green-100`, `text-green-800`
- **Warning Orange**: `bg-orange-100`, `text-orange-600`
- **Background Gray**: `bg-gray-50` (light), `bg-gray-900` (dark)
- **Card Background**: `bg-white` (light), `bg-gray-800` (dark)
- **Text Colors**: `text-gray-900` (light), `text-gray-100` (dark)

## Implementation Notes

1. **Automatic Detection**: The system could auto-detect variant based on route patterns in the future
2. **Responsive Design**: All variants maintain responsive behavior across screen sizes
3. **Dark/Light Mode**: Full support for both themes with proper contrast
4. **Badge System**: Dynamic badge counts for notifications and alerts
5. **Favorites**: Context-aware favorite items based on variant
6. **Tooltips**: Comprehensive tooltip support for all icon bar items

## Extending the System

To add a new variant:

1. Add the variant name to the `SidebarVariant` type
2. Create variant-specific icon bar items
3. Create variant-specific sidebar sections
4. Create variant-specific favorite items
5. Update the getter functions with the new variant case
6. Test across different screen sizes and themes

This system maintains consistency while providing context-aware navigation for different business functions.