/**
 * Test script for combo creation functionality
 * Tests the complete combo meal system with HERA Universal Architecture
 */

import { createClient } from '@/lib/supabase/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { MenuManagementService } from '@/lib/services/menuManagementService';

// Initialize Supabase clients
const supabase = createClient();
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY}`
      }
    }
  }
);

async function testComboCreation() {
  console.log('🚀 Starting combo creation test...\n');

  try {
    // Test organization ID (replace with your actual org ID)
    const organizationId = 'demo-org-001';
    
    // Initialize menu service
    const menuService = MenuManagementService.getInstance(organizationId);
    console.log('✅ Menu service initialized');

    // Step 1: Create some test menu items if they don't exist
    console.log('\n📝 Step 1: Creating test menu items...');
    
    const testItems = [
      {
        name: 'Classic Burger',
        description: 'Juicy beef patty with lettuce and tomato',
        base_price: 12.99,
        category_id: null,
        preparation_time: 15,
        is_active: true
      },
      {
        name: 'French Fries',
        description: 'Crispy golden French fries',
        base_price: 4.99,
        category_id: null,
        preparation_time: 5,
        is_active: true
      },
      {
        name: 'Soft Drink',
        description: 'Ice-cold refreshing soft drink',
        base_price: 2.99,
        category_id: null,
        preparation_time: 1,
        is_active: true
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing',
        base_price: 8.99,
        category_id: null,
        preparation_time: 8,
        is_active: true
      }
    ];

    const createdItems = [];
    for (const item of testItems) {
      const result = await menuService.createMenuItem(item);
      if (result.success) {
        createdItems.push({ id: result.data, ...item });
        console.log(`✅ Created: ${item.name} (ID: ${result.data})`);
      }
    }

    // Step 2: Create combo meals
    console.log('\n📦 Step 2: Creating combo meals...');

    const combos = [
      {
        name: 'Classic Burger Combo',
        description: 'Classic burger with fries and a drink - save 15%!',
        components: [
          {
            item_id: createdItems[0].id, // Burger
            quantity: 1,
            role: 'main',
            customizable: true
          },
          {
            item_id: createdItems[1].id, // Fries
            quantity: 1,
            role: 'side',
            customizable: true
          },
          {
            item_id: createdItems[2].id, // Drink
            quantity: 1,
            role: 'beverage',
            customizable: true
          }
        ],
        discount_percentage: 15,
        image_url: 'https://example.com/burger-combo.jpg'
      },
      {
        name: 'Healthy Combo',
        description: 'Caesar salad with a refreshing drink - save 10%!',
        components: [
          {
            item_id: createdItems[3].id, // Salad
            quantity: 1,
            role: 'main',
            customizable: false
          },
          {
            item_id: createdItems[2].id, // Drink
            quantity: 1,
            role: 'beverage',
            customizable: true
          }
        ],
        discount_percentage: 10,
        image_url: 'https://example.com/healthy-combo.jpg'
      }
    ];

    for (const combo of combos) {
      const result = await menuService.createComboMeal(combo);
      if (result.success) {
        console.log(`\n✅ Created combo: ${combo.name}`);
        console.log(`   - Components: ${combo.components.length} items`);
        console.log(`   - Discount: ${combo.discount_percentage}%`);
        console.log(`   - Combo ID: ${result.data.comboId}`);
        console.log(`   - Pricing:`);
        console.log(`     • Individual Total: $${result.data.individual_total}`);
        console.log(`     • Combo Price: $${result.data.combo_price}`);
        console.log(`     • Customer Saves: $${result.data.savings}`);
      } else {
        console.error(`❌ Failed to create combo: ${combo.name}`, result.error);
      }
    }

    // Step 3: Fetch and analyze combos
    console.log('\n📊 Step 3: Fetching and analyzing combos...');
    
    const combosResult = await menuService.getCombos(false);
    if (combosResult.success && combosResult.data) {
      console.log(`\n📋 Found ${combosResult.data.length} active combos:`);
      
      for (const combo of combosResult.data) {
        console.log(`\n🍔 ${combo.entity_name || combo.name}`);
        console.log(`   - Status: ${combo.is_active ? 'Active' : 'Inactive'}`);
        
        if (combo.analysis) {
          console.log(`   - Pricing Analysis:`);
          console.log(`     • Combo Price: $${combo.analysis.pricing_analysis?.combo_price || combo.combo_price}`);
          console.log(`     • You Save: $${combo.analysis.pricing_analysis?.savings || combo.savings}`);
          console.log(`     • Discount: ${combo.analysis.pricing_analysis?.savings_percentage || combo.savings_percentage}%`);
          
          if (combo.analysis.components) {
            console.log(`   - Components:`);
            combo.analysis.components.forEach(comp => {
              console.log(`     • ${comp.quantity}x ${comp.item} ($${comp.individual_price})`);
            });
          }
          
          if (combo.analysis.business_intelligence) {
            console.log(`   - Business Intelligence:`);
            console.log(`     • Value Proposition: ${combo.analysis.business_intelligence.value_proposition}`);
          }
        }
      }
    }

    // Step 4: Test combo pricing calculation
    console.log('\n💰 Step 4: Testing combo pricing calculation...');
    
    if (combosResult.data && combosResult.data.length > 0) {
      const testComboId = combosResult.data[0].id;
      const priceCalc = await menuService.calculateComboMealPrice(testComboId);
      
      if (priceCalc.success) {
        console.log('\n✅ Combo pricing calculation successful:');
        console.log(`   - Combo: ${priceCalc.data.combo_name}`);
        console.log(`   - Components: ${priceCalc.data.components.length}`);
        console.log(`   - Individual Total: $${priceCalc.data.individual_total}`);
        console.log(`   - Combo Price: $${priceCalc.data.combo_price}`);
        console.log(`   - Savings: $${priceCalc.data.savings} (${priceCalc.data.savings_percentage}%)`);
        
        if (priceCalc.data.nutritional_total) {
          console.log(`   - Nutritional Total:`);
          console.log(`     • Calories: ${priceCalc.data.nutritional_total.calories}`);
          console.log(`     • Protein: ${priceCalc.data.nutritional_total.protein}g`);
          console.log(`     • Carbs: ${priceCalc.data.nutritional_total.carbs}g`);
          console.log(`     • Fat: ${priceCalc.data.nutritional_total.fat}g`);
        }
      }
    }

    console.log('\n✅ Combo creation test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testComboCreation();