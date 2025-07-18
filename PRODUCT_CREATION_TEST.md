# 🧪 Product Creation Test Guide

**Objective:** Test the products page by creating sample products for santhoshlal@gmail.com  
**Page:** http://localhost:3000/restaurant/products

## 🔧 Method 1: Browser Console Test

### **Step 1: Open Products Page**
Navigate to: `http://localhost:3000/restaurant/products`

### **Step 2: Open Browser Console**
- Press `F12` or right-click → "Inspect Element"
- Go to "Console" tab

### **Step 3: Run Product Creation Script**
```javascript
// Test Product Creation - Copy and paste this into browser console

async function createTestProducts() {
  try {
    console.log('🧪 Starting product creation test...');
    
    // Import the ProductCatalogService
    const { default: ProductCatalogService } = await import('/lib/services/productCatalogService.ts');
    
    // Get organization ID from current page context
    const { useRestaurantManagement } = await import('/hooks/useRestaurantManagement');
    
    // Sample products to create
    const testProducts = [
      {
        name: "Premium Jasmine Green Tea",
        description: "Delicate jasmine-scented green tea with floral notes and refreshing taste",
        categoryId: "auto", // Will auto-create category
        basePrice: 4.50,
        sku: "TEA-JASMINE-001",
        preparationTimeMinutes: 5,
        productType: 'tea',
        brewingInstructions: {
          temperature: "80°C",
          steepingTime: "3-4 minutes",
          teaAmount: "1 tsp per cup"
        },
        nutritionalInfo: {
          caffeineContent: "25mg per cup",
          caloriesPerServing: 2,
          allergens: []
        },
        originStory: "Sourced from the hills of Fujian province",
        popularPairings: ["Light pastries", "Steamed dumplings", "Fresh fruit"]
      },
      {
        name: "Earl Grey Supreme",
        description: "Classic Earl Grey with bergamot oil, lavender, and cornflower petals",
        categoryId: "auto",
        basePrice: 5.25,
        sku: "TEA-EARL-002",
        preparationTimeMinutes: 5,
        productType: 'tea',
        brewingInstructions: {
          temperature: "95°C",
          steepingTime: "4-5 minutes",
          teaAmount: "1 tsp per cup"
        },
        nutritionalInfo: {
          caffeineContent: "40mg per cup",
          caloriesPerServing: 2,
          allergens: []
        },
        originStory: "A premium blend inspired by the 2nd Earl Grey",
        popularPairings: ["Scones", "Shortbread", "Lemon cakes"]
      },
      {
        name: "Fresh Blueberry Scone",
        description: "Buttery scone loaded with fresh blueberries and a hint of lemon zest",
        categoryId: "auto",
        basePrice: 3.25,
        sku: "PASTRY-SCONE-001",
        preparationTimeMinutes: 2,
        productType: 'pastry',
        nutritionalInfo: {
          caloriesPerServing: 280,
          allergens: ["Gluten", "Dairy", "Eggs"]
        },
        originStory: "Made fresh daily with locally sourced blueberries",
        popularPairings: ["Earl Grey", "English Breakfast", "Coffee"]
      },
      {
        name: "Almond Croissant",
        description: "Flaky pastry filled with sweet almond cream and topped with sliced almonds",
        categoryId: "auto",
        basePrice: 4.00,
        sku: "PASTRY-CROIS-001",
        preparationTimeMinutes: 3,
        productType: 'pastry',
        nutritionalInfo: {
          caloriesPerServing: 320,
          allergens: ["Gluten", "Dairy", "Eggs", "Nuts"]
        },
        originStory: "Traditional French recipe with premium almond paste",
        popularPairings: ["Coffee", "Black tea", "Hot chocolate"]
      }
    ];
    
    // Get organization ID (you'll need to replace this with actual org ID)
    console.log('Please check the Network tab for API calls to get the organization ID, or check localStorage');
    
    // For now, let's try to get it from the page context
    const orgId = 'YOUR_ORG_ID_HERE'; // Replace with actual org ID
    
    console.log(`Creating products for organization: ${orgId}`);
    
    for (const product of testProducts) {
      try {
        console.log(`Creating product: ${product.name}`);
        const result = await ProductCatalogService.createProduct(orgId, product);
        if (result.success) {
          console.log(`✅ Created: ${product.name}`);
        } else {
          console.error(`❌ Failed to create ${product.name}:`, result.error);
        }
      } catch (error) {
        console.error(`❌ Error creating ${product.name}:`, error);
      }
    }
    
    console.log('🎉 Product creation test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
createTestProducts();
```

## 🔧 Method 2: Use the UI

### **Step 1: Create Products via Interface**
1. Navigate to `http://localhost:3000/restaurant/products`
2. Look for an "Add Product" or "Create Product" button
3. Fill out the product form with sample data

### **Step 2: Sample Product Data**

#### **Product 1: Premium Jasmine Green Tea**
- **Name:** Premium Jasmine Green Tea
- **Description:** Delicate jasmine-scented green tea with floral notes and refreshing taste
- **Category:** Hot Beverages (create if needed)
- **Price:** ₹4.50
- **Preparation Time:** 5 minutes
- **Type:** Tea

#### **Product 2: Fresh Blueberry Scone**
- **Name:** Fresh Blueberry Scone  
- **Description:** Buttery scone loaded with fresh blueberries and a hint of lemon zest
- **Category:** Pastries & Desserts (create if needed)
- **Price:** ₹3.25
- **Preparation Time:** 2 minutes
- **Type:** Pastry

#### **Product 3: Earl Grey Supreme**
- **Name:** Earl Grey Supreme
- **Description:** Classic Earl Grey with bergamot oil, lavender, and cornflower petals
- **Category:** Hot Beverages
- **Price:** ₹5.25
- **Preparation Time:** 5 minutes
- **Type:** Tea

## 🔍 What to Test

### **1. Product Display**
- ✅ Products appear in the catalog
- ✅ Product cards show correct information
- ✅ Categories are organized properly
- ✅ Prices display correctly

### **2. Product Management**
- ✅ Create new products
- ✅ Edit existing products
- ✅ View product details
- ✅ Search and filter functionality

### **3. Categories**
- ✅ Products grouped by category
- ✅ Category navigation works
- ✅ Category creation/management

### **4. HERA Universal Architecture**
- ✅ Data stored using core_entities + core_metadata pattern
- ✅ Organization isolation (only shows products for santhoshlal@gmail.com's org)
- ✅ No schema mismatches

## 📊 Expected Results

### **After Creating Products:**
- Products page should show sample products
- Categories should be organized (Hot Beverages, Pastries & Desserts)
- Each product should display with proper pricing and details
- Search and filter functionality should work
- Dashboard metrics should update to show product count

### **Database Verification:**
```sql
-- Check products created
SELECT e.entity_name, m.metadata_value->>'base_price' as price, m.metadata_value->>'product_type' as type
FROM core_entities e
LEFT JOIN core_metadata m ON e.id = m.entity_id
WHERE e.entity_type = 'product' 
  AND e.organization_id = 'YOUR_ORG_ID'
ORDER BY e.created_at DESC;

-- Check categories created  
SELECT entity_name, entity_code
FROM core_entities 
WHERE entity_type = 'product_category'
  AND organization_id = 'YOUR_ORG_ID';
```

## 🎯 Success Criteria

**✅ Products Page Working When:**
- Multiple products visible in catalog
- Products organized by categories  
- Product details display correctly
- Create/Edit functionality works
- Search and filtering works
- Statistics show correct counts
- Page loads without errors

**✅ HERA Architecture Compliance:**
- All data in universal schema (core_entities + core_metadata)
- Organization-scoped data isolation
- Proper foreign key relationships
- No custom tables created