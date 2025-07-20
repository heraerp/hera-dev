# 🍽️ Menu Management System Testing Guide

## 🎯 Overview
This guide provides comprehensive testing instructions for Mario's Restaurant Menu Management System built with HERA Universal Schema. The system supports categories, individual items, combo meals, and advanced features like nutrition tracking and profit analysis.

## 🚀 Getting Started

### Prerequisites
- Application running at `http://localhost:3001`
- Browser with Developer Tools (Chrome/Firefox recommended)
- Access to Mario's Restaurant test organization:
  - Organization ID: `00000000-0000-0000-0000-000000000001`

### Test URLs
- **Main Menu Management**: `http://localhost:3001/restaurant/menu`
- **Advanced Menu Management**: `http://localhost:3001/restaurant/menu-management`

---

## 📝 Test Scenarios

### 1. Menu Categories Management

#### Test Case 1.1: Create New Category
1. Navigate to `http://localhost:3001/restaurant/menu`
2. Click **"Add Category"** or **"Create Category"** button
3. Fill in category details:
   - Name: `Appetizers`
   - Description: `Delicious starters to begin your meal`
   - Icon: Select from available icons (🥗, 🍕, 🍖, etc.)
   - Display Order: `1`
4. Click **"Create Category"**
5. **Expected Result**:
   - Success message appears
   - Category appears in grid/list view
   - Icon displays correctly

#### Test Case 1.2: Edit Existing Category
1. Find an existing category
2. Click **"Edit"** or **pencil icon**
3. Modify:
   - Name: `Main Courses`
   - Description: Update description
   - Change icon
   - Adjust display order
4. Save changes
5. **Expected Result**:
   - Changes saved and displayed
   - Category reorders if order changed

#### Test Case 1.3: Delete Category
1. Try to delete category with items
2. **Expected Result**: Warning message about existing items
3. Delete empty category
4. **Expected Result**: Category removed successfully

#### Test Case 1.4: Bulk Upload Categories
1. Download category template (if available)
2. Fill Excel/CSV with:
   - Multiple categories
   - Icons and descriptions
   - Display orders
3. Upload file
4. **Expected Result**: All categories imported correctly

---

### 2. Menu Items Management

#### Test Case 2.1: Create Individual Menu Item
1. Click **"Add Item"** or **"Create Menu Item"**
2. Fill comprehensive form:
   - **Basic Info**:
     - Name: `Margherita Pizza`
     - Description: `Classic pizza with fresh mozzarella and basil`
     - Category: `Main Courses`
     - Price: `$18.99`
     - Cost: `$8.50` (for profit calculation)
   - **Details**:
     - Preparation Time: `15 minutes`
     - Calories: `320`
     - Allergens: `Gluten, Dairy`
   - **Dietary Restrictions**:
     - ☐ Vegetarian: ✅
     - ☐ Vegan: ❌
     - ☐ Gluten-Free: ❌
   - **Availability**: Active
3. Upload item image (if feature available)
4. Click **"Create Item"**
5. **Expected Result**:
   - Item appears in selected category
   - Profit margin calculated automatically
   - All metadata saved correctly

#### Test Case 2.2: Create Combo/Composite Item
1. Click **"Create Combo"** or similar
2. Set combo details:
   - Name: `Pizza & Drink Combo`
   - Description: `Any large pizza with a soft drink`
   - Base Components:
     - Pizza (any large): $18.99
     - Soft Drink: $3.99
   - Combo Price: $19.99
3. **Expected Result**:
   - Savings calculated: $2.99 (10.5% off)
   - Combo appears with "COMBO" badge
   - Components linked correctly

#### Test Case 2.3: Edit Menu Item
1. Find existing item
2. Click **"Edit"** button
3. Modify:
   - Price adjustment
   - Description update
   - Allergen information
   - Availability status
4. Save changes
5. **Expected Result**:
   - All changes persist
   - Profit margin recalculated if cost/price changed

#### Test Case 2.4: Item Metadata Management
1. Click on item to view details
2. Check metadata display:
   - Nutrition information
   - Allergen warnings
   - Dietary restriction badges
   - Preparation time
   - Profit analysis
3. **Expected Result**: All metadata displayed correctly

#### Test Case 2.5: Item Image Management
1. Edit an item
2. Upload new image:
   - Test supported formats (JPG, PNG, WebP)
   - Test file size limits
   - Test invalid formats
3. **Expected Result**:
   - Valid images upload successfully
   - Invalid formats show error
   - Images display in item cards

---

### 3. Search and Filtering

#### Test Case 3.1: Search Functionality
1. Use search bar to find items:
   - Search by name: `pizza`
   - Search by ingredient: `cheese`
   - Search by description: `spicy`
2. **Expected Result**: Relevant items shown

#### Test Case 3.2: Category Filtering
1. Click on different categories
2. **Expected Result**: Only items from selected category shown

#### Test Case 3.3: Dietary Filter
1. Use dietary restriction filters:
   - Vegetarian only
   - Vegan only
   - Gluten-free only
2. **Expected Result**: Filtered results match criteria

#### Test Case 3.4: Price Range Filter
1. Set price range filters (if available)
2. **Expected Result**: Items within price range shown

---

### 4. Combo System Testing

#### Test Case 4.1: Simple Combo Creation
1. Create combo with 2 items:
   - Burger + Fries
   - Individual prices: $12 + $5 = $17
   - Combo price: $15
2. **Expected Result**:
   - Savings: $2 (11.8%)
   - Components listed clearly

#### Test Case 4.2: Complex Combo (3+ items)
1. Create family meal combo:
   - 2 Pizzas + 4 Drinks + 1 Dessert
   - Calculate individual vs combo pricing
2. **Expected Result**:
   - All components tracked
   - Significant savings displayed

#### Test Case 4.3: Combo Modifications
1. Edit existing combo:
   - Change component items
   - Adjust combo pricing
   - Modify availability
2. **Expected Result**: Changes reflect in calculations

---

### 5. Business Intelligence & Analytics

#### Test Case 5.1: Profit Analysis
1. Check profit margins on items:
   - View cost vs price
   - Profit percentage calculations
   - Profit dollar amounts
2. **Expected Result**: Accurate calculations displayed

#### Test Case 5.2: Menu Analytics (if available)
1. Access analytics dashboard
2. Check metrics:
   - Most popular items
   - Highest profit items
   - Category performance
   - Average order values
3. **Expected Result**: Data displays correctly

---

### 6. Security & Organization Isolation

#### Test Case 6.1: Organization Isolation Validation
1. Create menu items in Organization A
2. Attempt to access from Organization B:
   ```bash
   curl -X GET "http://localhost:3001/api/menu/items?organizationId=org-b"
   ```
3. **Expected Result**: No items from Organization A visible

#### Test Case 6.2: Category Reference Validation
1. Create category in Organization A
2. Attempt to create menu item in Organization B referencing category from A
3. **Expected Result**: Validation error preventing cross-org reference

#### Test Case 6.3: Cross-Organization Category Access
1. Try to edit/delete categories from different organization
2. **Expected Result**: Access denied or item not found

#### Test Case 6.4: Entity Reference Security
1. Test the `validate_organization_isolation` function:
   ```sql
   SELECT validate_organization_isolation(
     'menu-item-uuid'::UUID,
     'current-org-uuid'::UUID,
     FALSE
   );
   ```
2. **Expected Result**: TRUE for same org, exception for different org

### 7. Data Management

#### Test Case 7.1: Bulk Upload Items
1. Download menu item template
2. Fill with multiple items:
   - Different categories
   - Various price points
   - Mixed dietary restrictions
3. Upload file
4. **Expected Result**: All items imported correctly

#### Test Case 6.2: Data Export
1. Export menu data (if available):
   - Full menu export
   - Category-specific export
   - Format options (Excel, CSV, PDF)
2. **Expected Result**: Clean, formatted export

#### Test Case 6.3: Data Validation
1. Test invalid data:
   - Negative prices
   - Missing required fields
   - Invalid categories
2. **Expected Result**: Validation errors shown

---

### 7. UI/UX Testing

#### Test Case 7.1: Layout Views
1. Toggle between:
   - Grid view (cards)
   - List view (table)
   - Category view (grouped)
2. **Expected Result**: Smooth transitions, data preserved

#### Test Case 7.2: Responsive Design
1. Test on different screen sizes:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
2. **Expected Result**: Layout adapts properly

#### Test Case 7.3: Dark/Light Mode
1. Toggle theme (if available)
2. **Expected Result**: Consistent styling in both modes

#### Test Case 7.4: Loading States
1. Observe loading indicators:
   - Initial page load
   - Category switching
   - Item creation/editing
2. **Expected Result**: Smooth loading experiences

---

## 🔍 Validation Checklist

### Categories Management
- [ ] Create new categories with icons
- [ ] Edit category details and ordering
- [ ] Delete empty categories
- [ ] Prevent deletion of categories with items
- [ ] Bulk upload categories from Excel/CSV

### Menu Items Management
- [ ] Create individual items with full metadata
- [ ] Create combo items with multiple components
- [ ] Edit items and maintain data integrity
- [ ] Upload and display item images
- [ ] Calculate profit margins automatically
- [ ] Set dietary restrictions correctly

### Search & Filtering
- [ ] Search by name, ingredients, description
- [ ] Filter by category accurately
- [ ] Filter by dietary restrictions
- [ ] Multiple filters work together

### Combo System
- [ ] Create combos with 2+ items
- [ ] Calculate savings correctly
- [ ] Display component relationships
- [ ] Edit combos and update calculations

### Business Logic
- [ ] Profit calculations accurate
- [ ] Price validations work
- [ ] Category-item relationships maintained
- [ ] Availability status respected

### Data Integrity
- [ ] Organization isolation maintained
- [ ] All CRUD operations persist
- [ ] Bulk operations succeed
- [ ] Invalid data rejected appropriately

---

## 🐛 Common Issues & Solutions

### Issue: "Categories not loading"
- **Solution**: Check organization ID, refresh page

### Issue: "Image upload failing"
- **Solution**: Check file size (max 5MB) and format (JPG/PNG)

### Issue: "Combo calculations incorrect"
- **Solution**: Verify component item prices, refresh combo

### Issue: "Search not working"
- **Solution**: Clear search filters, check for typos

### Issue: "Items not appearing in category"
- **Solution**: Verify category assignment, check item status

---

## 📊 Test Data Examples

### Sample Categories
- 🥗 Appetizers
- 🍕 Pizzas
- 🍖 Main Courses
- 🍰 Desserts
- 🥤 Beverages

### Sample Menu Items
- **Margherita Pizza** - $18.99 (Vegetarian)
- **Caesar Salad** - $12.99 (Vegetarian, Gluten-Free option)
- **Grilled Salmon** - $26.99 (Gluten-Free)
- **Chocolate Cake** - $8.99 (Vegetarian)
- **Craft Beer** - $6.99

### Sample Combos
- **Pizza & Drink Combo** - $19.99 (Save $2.99)
- **Family Feast** - $39.99 (2 Pizzas + 4 Drinks)
- **Lunch Special** - $14.99 (Salad + Soup + Drink)

---

## 🎯 Success Criteria

The Menu Management system is working correctly when:

1. ✅ Categories can be created, edited, and deleted properly
2. ✅ Menu items save with all metadata intact
3. ✅ Combo system calculates savings accurately
4. ✅ Search and filtering work across all fields
5. ✅ Image uploads function correctly
6. ✅ Profit calculations are accurate
7. ✅ Bulk operations complete successfully
8. ✅ Data remains isolated by organization
9. ✅ UI is responsive and intuitive
10. ✅ All validation rules are enforced

---

## 🔧 API Testing Commands

### Get Categories
```bash
curl -X GET "http://localhost:3001/api/menu/categories?organizationId=00000000-0000-0000-0000-000000000001"
```

### Create Category
```bash
curl -X POST "http://localhost:3001/api/menu/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "name": "Appetizers",
    "description": "Delicious starters",
    "icon": "🥗",
    "displayOrder": 1
  }'
```

### Get Menu Items
```bash
curl -X GET "http://localhost:3001/api/menu/items?organizationId=00000000-0000-0000-0000-000000000001"
```

### Create Menu Item
```bash
curl -X POST "http://localhost:3001/api/menu/items" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "00000000-0000-0000-0000-000000000001",
    "name": "Margherita Pizza",
    "description": "Classic pizza with fresh mozzarella",
    "categoryId": "category-id-here",
    "price": 18.99,
    "cost": 8.50,
    "isVegetarian": true,
    "allergens": ["Gluten", "Dairy"]
  }'
```

---

**Happy Testing! 🍽️**