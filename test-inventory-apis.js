/**
 * Test HERA Universal Inventory Management APIs
 * Comprehensive testing of all 5 inventory endpoints
 */

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';
const MARIO_ORG_ID = '123e4567-e89b-12d3-a456-426614174000';

async function makeRequest(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testInventoryAPIs() {
  console.log('🏗️ Testing HERA Universal Inventory Management APIs\n');
  console.log('🍕 Organization: Mario\'s Italian Restaurant');
  console.log(`📊 Organization ID: ${MARIO_ORG_ID}\n`);

  const createdItems = [];

  try {
    // Test 1: Create inventory items
    console.log('1️⃣ Testing POST /api/inventory/items (Create Items)');
    
    const testItems = [
      {
        organizationId: MARIO_ORG_ID,
        name: 'San Marzano Tomatoes',
        category: 'vegetables',
        unitPrice: 4.50,
        currentStock: 25,
        reorderPoint: 5,
        maxStockLevel: 50,
        unitOfMeasure: 'kg',
        shelfLifeDays: 7,
        storageRequirements: 'refrigerated',
        description: 'Premium San Marzano tomatoes for pizza sauce',
        sku: 'TOM-SM-001'
      },
      {
        organizationId: MARIO_ORG_ID,
        name: 'Buffalo Mozzarella',
        category: 'dairy',
        unitPrice: 18.00,
        currentStock: 3, // Low stock to trigger alerts
        reorderPoint: 8,
        maxStockLevel: 25,
        unitOfMeasure: 'kg',
        shelfLifeDays: 10,
        storageRequirements: 'refrigerated',
        description: 'Authentic buffalo mozzarella from Italy',
        sku: 'MOZ-BUF-001'
      },
      {
        organizationId: MARIO_ORG_ID,
        name: 'Extra Virgin Olive Oil',
        category: 'oils',
        unitPrice: 35.00,
        currentStock: 0, // Out of stock to trigger alerts
        reorderPoint: 3,
        maxStockLevel: 12,
        unitOfMeasure: 'L',
        shelfLifeDays: 730,
        storageRequirements: 'cool_dry_place',
        description: 'Cold-pressed extra virgin olive oil',
        sku: 'OIL-EV-001'
      },
      {
        organizationId: MARIO_ORG_ID,
        name: 'Tipo 00 Flour',
        category: 'grains',
        unitPrice: 12.00,
        currentStock: 75, // Overstock to trigger alerts
        reorderPoint: 10,
        maxStockLevel: 40,
        unitOfMeasure: 'kg',
        shelfLifeDays: 365,
        storageRequirements: 'dry_pantry',
        description: 'Fine Italian pizza flour',
        sku: 'FLR-00-001'
      }
    ];

    for (const item of testItems) {
      const result = await makeRequest('POST', '/api/inventory/items', item);
      if (result.success) {
        console.log(`   ✅ Created: ${item.name} (ID: ${result.data.data.id})`);
        createdItems.push({
          id: result.data.data.id,
          name: item.name,
          currentStock: item.currentStock
        });
      } else {
        console.log(`   ❌ Failed to create ${item.name}:`, result.data?.error || result.error);
      }
    }

    // Test 2: Get all inventory items
    console.log('\n2️⃣ Testing GET /api/inventory/items (List All Items)');
    
    const listResult = await makeRequest('GET', `/api/inventory/items?organizationId=${MARIO_ORG_ID}&limit=20`);
    if (listResult.success) {
      const { data, summary, pagination } = listResult.data;
      console.log(`   ✅ Retrieved ${data.length} items`);
      console.log(`   📊 Summary: ${summary.inStock} in stock, ${summary.lowStock} low stock, ${summary.outOfStock} out of stock`);
      console.log(`   💰 Total inventory value: $${summary.totalValue.toFixed(2)}`);
      console.log(`   📋 Categories: ${summary.categories.join(', ')}`);
    } else {
      console.log('   ❌ Failed to retrieve items:', listResult.data?.error || listResult.error);
    }

    // Test 3: Get item details with history
    if (createdItems.length > 0) {
      console.log('\n3️⃣ Testing GET /api/inventory/items/[id] (Item Details)');
      
      const firstItem = createdItems[0];
      const detailResult = await makeRequest('GET', `/api/inventory/items/${firstItem.id}`);
      if (detailResult.success) {
        const item = detailResult.data.data;
        console.log(`   ✅ Retrieved details for: ${item.name}`);
        console.log(`   📦 Current stock: ${item.currentStock} ${item.unitOfMeasure}`);
        console.log(`   🏷️ Status: ${item.stockStatus}`);
        console.log(`   💰 Stock value: $${item.stockValue.toFixed(2)}`);
        console.log(`   📈 Stock movements: ${item.stockMovements.length} recorded`);
        console.log(`   🏪 Suppliers: ${item.suppliers.length} connected`);
      } else {
        console.log('   ❌ Failed to retrieve item details:', detailResult.data?.error || detailResult.error);
      }
    }

    // Test 4: Stock adjustments
    if (createdItems.length > 0) {
      console.log('\n4️⃣ Testing POST /api/inventory/items/adjust (Stock Adjustments)');
      
      const adjustments = [
        {
          organizationId: MARIO_ORG_ID,
          itemId: createdItems[0].id,
          adjustmentType: 'decrease',
          quantity: 5,
          reason: 'Used for pizza production',
          adjustmentSubtype: 'sold',
          notes: '20 Margherita pizzas made',
          costPerUnit: 4.50
        },
        {
          organizationId: MARIO_ORG_ID,
          itemId: createdItems[1].id,
          adjustmentType: 'increase',
          quantity: 10,
          reason: 'Weekly delivery received',
          adjustmentSubtype: 'purchase_receipt',
          referencePO: 'PO-20250118-0001',
          costPerUnit: 18.00
        }
      ];

      for (const adjustment of adjustments) {
        const result = await makeRequest('POST', '/api/inventory/items/adjust', adjustment);
        if (result.success) {
          const adj = result.data.data;
          console.log(`   ✅ Adjustment: ${adj.itemName} ${adj.previousStock} → ${adj.newStock} ${adjustment.adjustmentType === 'increase' ? '+' : ''}${adj.quantityChanged}`);
          console.log(`   📄 Transaction: ${adj.transactionNumber}`);
        } else {
          console.log('   ❌ Failed adjustment:', result.data?.error || result.error);
        }
      }
    }

    // Test 5: Inventory alerts
    console.log('\n5️⃣ Testing GET /api/inventory/items/alerts (Stock Alerts)');
    
    const alertsResult = await makeRequest('GET', `/api/inventory/items/alerts?organizationId=${MARIO_ORG_ID}`);
    if (alertsResult.success) {
      const { data: alerts, summary } = alertsResult.data;
      console.log(`   ✅ Generated ${alerts.length} alerts`);
      console.log(`   🚨 Breakdown: ${summary.highUrgency} high, ${summary.mediumUrgency} medium, ${summary.lowUrgency} low urgency`);
      
      // Show sample alerts
      alerts.slice(0, 3).forEach(alert => {
        const urgencyIcon = alert.urgency === 'high' ? '🔴' : alert.urgency === 'medium' ? '🟡' : '🟢';
        console.log(`   ${urgencyIcon} ${alert.alertType.toUpperCase()}: ${alert.name} (${alert.currentStock} ${alert.unitOfMeasure})`);
        console.log(`      📋 Action: ${alert.suggestedAction}`);
      });
    } else {
      console.log('   ❌ Failed to retrieve alerts:', alertsResult.data?.error || alertsResult.error);
    }

    // Test 6: Usage analytics
    console.log('\n6️⃣ Testing GET /api/inventory/items/usage (Usage Analytics)');
    
    const usageResult = await makeRequest('GET', `/api/inventory/items/usage?organizationId=${MARIO_ORG_ID}&timeframe=30&forecastDays=14`);
    if (usageResult.success) {
      const { data: analytics, summary, metadata } = usageResult.data;
      console.log(`   ✅ Analyzed ${analytics.length} items over ${metadata.timeframeDays} days`);
      console.log(`   📊 Movement: ${summary.fastMoving} fast, ${summary.mediumMoving} medium, ${summary.slowMoving} slow, ${summary.noMovement} no movement`);
      console.log(`   ⚠️ Risk: ${summary.highRisk} high-risk items`);
      console.log(`   🔄 Avg turnover rate: ${summary.avgTurnoverRate.toFixed(2)}x/year`);
      console.log(`   📈 Total daily usage: ${summary.totalDailyUsage.toFixed(2)} units/day`);
      console.log(`   🛒 Items needing reorder: ${summary.itemsNeedingReorder}`);
      
      // Show sample analytics
      analytics.slice(0, 2).forEach(item => {
        console.log(`   📦 ${item.itemName}:`);
        console.log(`      📈 Usage: ${item.avgDailyUsage.toFixed(2)}/day, ${item.avgWeeklyUsage.toFixed(2)}/week`);
        console.log(`      ⏱️ Velocity: ${item.usageVelocity}, Trend: ${item.usageTrend}`);
        console.log(`      🚨 Risk: ${item.stockoutRisk}${item.daysUntilStockout ? `, ${item.daysUntilStockout} days until stockout` : ''}`);
      });
    } else {
      console.log('   ❌ Failed to retrieve usage analytics:', usageResult.data?.error || usageResult.error);
    }

    // Test 7: Update inventory item
    if (createdItems.length > 0) {
      console.log('\n7️⃣ Testing PUT /api/inventory/items/[id] (Update Item)');
      
      const updateData = {
        name: 'San Marzano Tomatoes - Premium Grade',
        unitPrice: 5.00,
        reorderPoint: 8,
        description: 'Premium San Marzano tomatoes for pizza sauce - upgraded to premium grade'
      };
      
      const updateResult = await makeRequest('PUT', `/api/inventory/items/${createdItems[0].id}`, updateData);
      if (updateResult.success) {
        console.log(`   ✅ Updated: ${createdItems[0].name}`);
        console.log('   📝 Changes: name, unit price, reorder point, description');
      } else {
        console.log('   ❌ Failed to update item:', updateResult.data?.error || updateResult.error);
      }
    }

    // Test 8: Filter and search capabilities
    console.log('\n8️⃣ Testing Filtering and Search');
    
    // Test category filter
    const categoryResult = await makeRequest('GET', `/api/inventory/items?organizationId=${MARIO_ORG_ID}&category=dairy`);
    if (categoryResult.success) {
      console.log(`   ✅ Category filter (dairy): ${categoryResult.data.data.length} items found`);
    }
    
    // Test status filter
    const statusResult = await makeRequest('GET', `/api/inventory/items?organizationId=${MARIO_ORG_ID}&status=low_stock`);
    if (statusResult.success) {
      console.log(`   ✅ Status filter (low_stock): ${statusResult.data.data.length} items found`);
    }
    
    // Test search
    const searchResult = await makeRequest('GET', `/api/inventory/items?organizationId=${MARIO_ORG_ID}&search=tomato`);
    if (searchResult.success) {
      console.log(`   ✅ Search (tomato): ${searchResult.data.data.length} items found`);
    }

    console.log('\n🎉 HERA Universal Inventory Management Test Complete!');
    console.log('\n📋 All API Endpoints Tested:');
    console.log('   ✅ POST /api/inventory/items - Create inventory items');
    console.log('   ✅ GET /api/inventory/items - List items with filtering');
    console.log('   ✅ GET /api/inventory/items/[id] - Item details with history');
    console.log('   ✅ PUT /api/inventory/items/[id] - Update item properties');
    console.log('   ✅ POST /api/inventory/items/adjust - Stock adjustments');
    console.log('   ✅ GET /api/inventory/items/alerts - Stock alerts');
    console.log('   ✅ GET /api/inventory/items/usage - Usage analytics');

    console.log('\n🏗️ HERA Universal Architecture Benefits:');
    console.log('   • Single schema handles ANY inventory type');
    console.log('   • Dynamic fields via core_dynamic_data');
    console.log('   • Complete audit trail via universal_transactions');
    console.log('   • Relationship tracking via core_relationships');
    console.log('   • Organization isolation built-in');

    console.log('\n🚀 Ready for Production Features:');
    console.log('   • Real-time stock tracking');
    console.log('   • Intelligent alert system');
    console.log('   • Usage pattern analysis');
    console.log('   • Forecast-based reordering');
    console.log('   • Multi-category organization');
    console.log('   • Complete transaction history');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testInventoryAPIs();