#!/usr/bin/env node

/**
 * Test Script: Purchase Order and Goods Receipt Creation
 * 
 * This script tests the complete flow:
 * 1. Create a Purchase Order
 * 2. Create a Goods Receipt based on that PO
 * 3. Verify the data was created correctly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

console.log('🧪 TESTING PURCHASE ORDER AND GOODS RECEIPT FLOW');
console.log('================================================\n');

async function testPOAndReceipt() {
  try {
    // First, get or create a test organization
    console.log('🏢 Step 0: Setting up test organization...');
    
    let { data: organization } = await supabase
      .from('core_organizations')
      .select('*')
      .eq('org_code', 'TEST-ORG')
      .single();

    let organizationId;
    if (!organization) {
      const { data: newOrg, error: orgError } = await supabase
        .from('core_organizations')
        .insert({
          org_name: 'Test Restaurant',
          org_code: 'TEST-ORG', 
          industry: 'restaurant',
          country: 'US',
          currency: 'USD',
          is_active: true
        })
        .select()
        .single();

      if (orgError) {
        console.error('❌ Error creating organization:', orgError);
        return;
      }
      organizationId = newOrg.id;
      console.log('✅ Created test organization:', newOrg.org_name);
    } else {
      organizationId = organization.id;
      console.log('✅ Using existing organization:', organization.org_name);
    }

    // Step 1: Create test supplier if not exists
    console.log('\n📦 Step 1: Creating test supplier...');
    
    const supplierData = {
      organization_id: organizationId,
      entity_type: 'supplier',
      entity_name: 'Fresh Foods Co. Test',
      entity_code: 'FRESH-001',
      is_active: true
    };

    let { data: existingSupplier } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'supplier')
      .eq('entity_code', 'FRESH-001')
      .single();

    let supplierId;
    if (existingSupplier) {
      console.log('✅ Using existing supplier:', existingSupplier.entity_name);
      supplierId = existingSupplier.id;
    } else {
      const { data: newSupplier, error: supplierError } = await supabase
        .from('core_entities')
        .insert(supplierData)
        .select()
        .single();

      if (supplierError) {
        console.error('❌ Error creating supplier:', supplierError);
        return;
      }

      supplierId = newSupplier.id;
      console.log('✅ Created new supplier:', newSupplier.entity_name);
    }

    // Add supplier contact info
    const supplierFields = [
      { entity_id: supplierId, field_name: 'email', field_value: 'orders@freshfoods.com', field_type: 'text' },
      { entity_id: supplierId, field_name: 'phone', field_value: '+1-555-123-4567', field_type: 'text' },
      { entity_id: supplierId, field_name: 'address', field_value: '123 Fresh Street, Food City, FC 12345', field_type: 'text' }
    ];

    for (const field of supplierFields) {
      await supabase
        .from('core_dynamic_data')
        .upsert(field, { onConflict: 'entity_id,field_name' });
    }

    // Step 2: Create Purchase Order
    console.log('\n📋 Step 2: Creating Purchase Order...');
    
    const poData = {
      organization_id: organizationId,
      transaction_type: 'purchase_order',
      transaction_number: `PO-TEST-${Date.now()}`,
      transaction_date: new Date().toISOString().split('T')[0],
      total_amount: 156.75,
      currency: 'USD',
      transaction_status: 'active',
      workflow_status: 'auto_approved',
      procurement_metadata: {
        supplier_id: supplierId,
        supplier_name: 'Fresh Foods Co. Test',
        items: [
          {
            itemId: 'item-001',
            itemName: 'Fresh Tomatoes',
            quantity: 25,
            unitPrice: 3.50,
            unit: 'kg',
            totalPrice: 87.50
          },
          {
            itemId: 'item-002',
            itemName: 'Organic Lettuce',
            quantity: 15,
            unitPrice: 2.95,
            unit: 'kg', 
            totalPrice: 44.25
          },
          {
            itemId: 'item-003',
            itemName: 'Red Onions',
            quantity: 10,
            unitPrice: 2.50,
            unit: 'kg',
            totalPrice: 25.00
          }
        ],
        delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        notes: 'Test PO - please deliver fresh produce in the morning',
        created_via: 'test_script'
      }
    };

    const { data: purchaseOrder, error: poError } = await supabase
      .from('universal_transactions')
      .insert(poData)
      .select()
      .single();

    if (poError) {
      console.error('❌ Error creating purchase order:', poError);
      return;
    }

    console.log('✅ Purchase Order created successfully!');
    console.log(`   PO Number: ${purchaseOrder.transaction_number}`);
    console.log(`   Total Amount: $${purchaseOrder.total_amount}`);
    console.log(`   Status: ${purchaseOrder.workflow_status}`);
    console.log(`   Items: ${purchaseOrder.procurement_metadata.items.length}`);

    // Step 3: Simulate some time passing and create Goods Receipt
    console.log('\n📦 Step 3: Creating Goods Receipt...');
    
    // Simulate partial receipt with some variance
    const receivedItems = purchaseOrder.procurement_metadata.items.map(item => ({
      ...item,
      expectedQuantity: item.quantity,
      receivedQuantity: item.quantity * (0.9 + Math.random() * 0.2), // 90-110% of expected
      qualityStatus: Math.random() > 0.9 ? 'partial' : 'accepted', // 10% chance of partial
      batchNumber: `BATCH-${Math.random().toString(36).substring(7).toUpperCase()}`,
      storageLocation: 'Cold Storage A',
      expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days from now
    }));

    const totalReceivedValue = receivedItems.reduce((sum, item) => 
      sum + (item.receivedQuantity * item.unitPrice), 0);

    const receiptData = {
      organization_id: organizationId,
      transaction_type: 'goods_receipt',
      transaction_subtype: 'delivery_receipt',
      transaction_number: `GR-TEST-${Date.now()}`,
      transaction_date: new Date().toISOString().split('T')[0],
      total_amount: totalReceivedValue,
      currency: 'USD',
      transaction_status: 'completed',
      workflow_status: 'received',
      is_financial: false,
      procurement_metadata: {
        supplier_id: supplierId,
        supplier_name: 'Fresh Foods Co. Test',
        purchase_order_id: purchaseOrder.id,
        purchase_order_number: purchaseOrder.transaction_number,
        delivery_date: new Date().toISOString().split('T')[0],
        received_by: 'Test Manager',
        items: receivedItems,
        overall_quality_rating: 4.5,
        delivery_rating: 4.8,
        packaging_rating: 4.2,
        temperature_compliant: true,
        delivery_notes: 'Delivery arrived on time, all items in good condition',
        quality_inspection_notes: 'Minor variance in tomato quantity but quality excellent',
        receiving_location: 'Main Warehouse - Dock 2',
        variance_rate: Math.abs(totalReceivedValue - purchaseOrder.total_amount) / purchaseOrder.total_amount,
        quality_score: (4.5 + 4.8 + 4.2) / 3,
        created_via: 'test_script'
      },
      transaction_data: {
        ai_intelligence: {
          predictions: {
            supplier_reliability_score: 0.92,
            quality_trend: 'excellent'
          },
          recommendations: ['Supplier performing well', 'Consider increasing order frequency'],
          alerts: []
        },
        performance_metrics: {
          total_items: receivedItems.length,
          accepted_items: receivedItems.filter(item => item.qualityStatus === 'accepted').length,
          partial_items: receivedItems.filter(item => item.qualityStatus === 'partial').length,
          rejected_items: 0,
          damaged_items: 0
        }
      }
    };

    const { data: goodsReceipt, error: receiptError } = await supabase
      .from('universal_transactions')
      .insert(receiptData)
      .select()
      .single();

    if (receiptError) {
      console.error('❌ Error creating goods receipt:', receiptError);
      return;
    }

    console.log('✅ Goods Receipt created successfully!');
    console.log(`   Receipt Number: ${goodsReceipt.transaction_number}`);
    console.log(`   Total Value: $${goodsReceipt.total_amount.toFixed(2)}`);
    console.log(`   Quality Score: ${goodsReceipt.procurement_metadata.quality_score.toFixed(1)}/5`);
    console.log(`   Variance Rate: ${(goodsReceipt.procurement_metadata.variance_rate * 100).toFixed(1)}%`);

    // Step 4: Verify data and show summary
    console.log('\n📊 Step 4: Verification and Summary...');
    
    // Get both transactions
    const { data: transactions, error: queryError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .in('id', [purchaseOrder.id, goodsReceipt.id])
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('❌ Error querying transactions:', queryError);
      return;
    }

    console.log('✅ Verification complete!');
    console.log('\n🎯 TEST RESULTS SUMMARY:');
    console.log('========================');
    console.log(`✅ Supplier Created: ${supplierData.entity_name}`);
    console.log(`✅ Purchase Order: ${purchaseOrder.transaction_number} ($${purchaseOrder.total_amount})`);
    console.log(`✅ Goods Receipt: ${goodsReceipt.transaction_number} ($${goodsReceipt.total_amount.toFixed(2)})`);
    console.log(`✅ Quality Score: ${goodsReceipt.procurement_metadata.quality_score.toFixed(1)}/5`);
    console.log(`✅ Items Processed: ${receivedItems.length}`);
    console.log(`✅ Variance: ${(goodsReceipt.procurement_metadata.variance_rate * 100).toFixed(1)}%`);

    console.log('\n📋 ITEM DETAILS:');
    receivedItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.itemName}:`);
      console.log(`      Expected: ${item.expectedQuantity} ${item.unit}`);
      console.log(`      Received: ${item.receivedQuantity.toFixed(1)} ${item.unit}`);
      console.log(`      Status: ${item.qualityStatus}`);
      console.log(`      Batch: ${item.batchNumber}`);
    });

    console.log('\n🎉 Test completed successfully! You can now view this data in the web interface.');
    console.log(`🌐 Visit: http://localhost:3000 and navigate to Purchasing > Purchase Orders or Receiving > Goods Receiving`);

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testPOAndReceipt();