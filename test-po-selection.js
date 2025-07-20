#!/usr/bin/env node

/**
 * Test PO Selection Feature
 * Creates additional test data to test the PO selection feature
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function createAdditionalTestData() {
  try {
    console.log('🧪 CREATING ADDITIONAL TEST DATA FOR PO SELECTION');
    console.log('==================================================\n');

    // Get test organization
    const { data: organization } = await supabase
      .from('core_organizations')
      .select('*')
      .eq('org_code', 'TEST-ORG')
      .single();

    if (!organization) {
      console.log('❌ Test organization not found. Run test-po-and-receipt.js first.');
      return;
    }

    const organizationId = organization.id;

    // Get existing supplier
    const { data: supplier } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'supplier')
      .eq('entity_code', 'FRESH-001')
      .single();

    if (!supplier) {
      console.log('❌ Test supplier not found. Run test-po-and-receipt.js first.');
      return;
    }

    // Create additional POs for testing the selection feature
    console.log('📋 Creating additional Purchase Orders...');

    const additionalPOs = [
      {
        poNumber: `PO-TEST-${Date.now() + 1000}`,
        items: [
          { itemId: 'item-004', itemName: 'Fresh Carrots', quantity: 20, unitPrice: 2.20, unit: 'kg' },
          { itemId: 'item-005', itemName: 'Potatoes', quantity: 30, unitPrice: 1.80, unit: 'kg' },
          { itemId: 'item-006', itemName: 'Bell Peppers', quantity: 12, unitPrice: 4.50, unit: 'kg' }
        ],
        notes: 'Weekly vegetable order - handle with care'
      },
      {
        poNumber: `PO-TEST-${Date.now() + 2000}`,
        items: [
          { itemId: 'item-007', itemName: 'Organic Spinach', quantity: 8, unitPrice: 3.75, unit: 'kg' },
          { itemId: 'item-008', itemName: 'Cherry Tomatoes', quantity: 15, unitPrice: 5.25, unit: 'kg' }
        ],
        notes: 'Premium organic produce order'
      },
      {
        poNumber: `PO-TEST-${Date.now() + 3000}`,
        items: [
          { itemId: 'item-009', itemName: 'Mixed Salad Greens', quantity: 25, unitPrice: 3.95, unit: 'kg' },
          { itemId: 'item-010', itemName: 'Cucumber', quantity: 18, unitPrice: 2.85, unit: 'kg' },
          { itemId: 'item-011', itemName: 'Radishes', quantity: 5, unitPrice: 4.20, unit: 'kg' }
        ],
        notes: 'Salad bar restock order'
      }
    ];

    const createdPOs = [];

    for (const po of additionalPOs) {
      const totalAmount = po.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

      const poData = {
        organization_id: organizationId,
        transaction_type: 'purchase_order',
        transaction_number: po.poNumber,
        transaction_date: new Date().toISOString().split('T')[0],
        total_amount: totalAmount,
        currency: 'USD',
        transaction_status: 'active',
        workflow_status: 'approved', // Make these approved so they show up for receiving
        procurement_metadata: {
          supplier_id: supplier.id,
          supplier_name: supplier.entity_name,
          items: po.items.map(item => ({
            ...item,
            totalPrice: item.quantity * item.unitPrice
          })),
          delivery_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
          notes: po.notes,
          created_via: 'test_script_additional'
        }
      };

      const { data: createdPO, error } = await supabase
        .from('universal_transactions')
        .insert(poData)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating PO ${po.poNumber}:`, error);
      } else {
        createdPOs.push(createdPO);
        console.log(`✅ Created PO: ${createdPO.transaction_number} ($${createdPO.total_amount})`);
      }
    }

    // Create another supplier for testing
    console.log('\n👥 Creating additional supplier...');
    
    const supplier2Data = {
      organization_id: organizationId,
      entity_type: 'supplier',
      entity_name: 'Quality Meats & Dairy Ltd.',
      entity_code: 'MEAT-001',
      is_active: true
    };

    const { data: supplier2, error: supplier2Error } = await supabase
      .from('core_entities')
      .insert(supplier2Data)
      .select()
      .single();

    if (supplier2Error) {
      console.error('❌ Error creating second supplier:', supplier2Error);
    } else {
      console.log('✅ Created supplier:', supplier2.entity_name);

      // Add supplier contact info
      const supplier2Fields = [
        { entity_id: supplier2.id, field_name: 'email', field_value: 'orders@qualitymeats.com', field_type: 'text' },
        { entity_id: supplier2.id, field_name: 'phone', field_value: '+1-555-987-6543', field_type: 'text' },
        { entity_id: supplier2.id, field_name: 'address', field_value: '456 Meat Avenue, Protein City, PC 54321', field_type: 'text' }
      ];

      for (const field of supplier2Fields) {
        await supabase
          .from('core_dynamic_data')
          .insert(field);
      }

      // Create a PO for the second supplier
      const meatPO = {
        organization_id: organizationId,
        transaction_type: 'purchase_order',
        transaction_number: `PO-MEAT-${Date.now()}`,
        transaction_date: new Date().toISOString().split('T')[0],
        total_amount: 289.50,
        currency: 'USD',
        transaction_status: 'active',
        workflow_status: 'approved',
        procurement_metadata: {
          supplier_id: supplier2.id,
          supplier_name: supplier2.entity_name,
          items: [
            { itemId: 'item-012', itemName: 'Premium Beef Steaks', quantity: 8, unitPrice: 18.50, unit: 'kg', totalPrice: 148.00 },
            { itemId: 'item-013', itemName: 'Fresh Chicken Breast', quantity: 12, unitPrice: 11.50, unit: 'kg', totalPrice: 138.00 },
            { itemId: 'item-014', itemName: 'Organic Eggs', quantity: 3, unitPrice: 1.50, unit: 'dozen', totalPrice: 4.50 }
          ],
          delivery_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day from now
          notes: 'High-quality meat and dairy order - keep refrigerated',
          created_via: 'test_script_additional'
        }
      };

      const { data: meatPOCreated, error: meatPOError } = await supabase
        .from('universal_transactions')
        .insert(meatPO)
        .select()
        .single();

      if (meatPOError) {
        console.error('❌ Error creating meat PO:', meatPOError);
      } else {
        console.log(`✅ Created PO for ${supplier2.entity_name}: ${meatPOCreated.transaction_number} ($${meatPOCreated.total_amount})`);
      }
    }

    // Summary
    console.log('\n🎯 ADDITIONAL TEST DATA SUMMARY:');
    console.log('=================================');
    console.log(`✅ Created ${createdPOs.length} additional POs for Fresh Foods Co.`);
    console.log(`✅ Created 1 additional supplier: ${supplier2?.entity_name || 'Quality Meats & Dairy Ltd.'}`);
    console.log(`✅ Created 1 PO for the meat supplier`);

    // Test the forReceiving filter
    console.log('\n🔍 Testing forReceiving filter...');
    const { data: receivingPOs, error: receivingError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'purchase_order')
      .in('workflow_status', ['approved', 'auto_approved'])
      .order('created_at', { ascending: false });

    if (receivingError) {
      console.error('❌ Error fetching POs for receiving:', receivingError);
    } else {
      console.log(`✅ Found ${receivingPOs.length} POs available for receiving`);
      
      // Group by supplier
      const posBySupplier = {};
      receivingPOs.forEach(po => {
        const supplierId = po.procurement_metadata?.supplier_id;
        const supplierName = po.procurement_metadata?.supplier_name || 'Unknown';
        if (!posBySupplier[supplierId]) {
          posBySupplier[supplierId] = { name: supplierName, pos: [] };
        }
        posBySupplier[supplierId].pos.push(po);
      });

      Object.entries(posBySupplier).forEach(([supplierId, data]) => {
        console.log(`   📦 ${data.name}: ${data.pos.length} POs available`);
        data.pos.forEach(po => {
          console.log(`      • ${po.transaction_number} ($${po.total_amount})`);
        });
      });
    }

    console.log('\n🎉 Additional test data created successfully!');
    console.log('\n📋 NOW YOU CAN TEST:');
    console.log('1. Open the Goods Receiving Form');
    console.log('2. Select "Fresh Foods Co. Test" - should show 4 POs available');
    console.log('3. Select "Quality Meats & Dairy Ltd." - should show 1 PO available');
    console.log('4. Select any PO and verify items are auto-populated');
    console.log('5. Test creating goods receipts with different variance scenarios');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

createAdditionalTestData();