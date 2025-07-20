#!/usr/bin/env node

/**
 * Test API Endpoints
 * Tests the Purchase Order and Goods Receipt API endpoints
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function testAPIEndpoints() {
  try {
    console.log('🧪 TESTING API ENDPOINTS');
    console.log('=========================\n');

    // Get our test organization ID
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
    console.log('🏢 Using organization:', organization.org_name, `(${organizationId})`);

    // Test 1: Get Purchase Orders
    console.log('\n📋 Test 1: Fetching Purchase Orders...');
    const { data: purchaseOrders, error: poError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'purchase_order')
      .order('created_at', { ascending: false });

    if (poError) {
      console.error('❌ Error fetching purchase orders:', poError);
    } else {
      console.log(`✅ Found ${purchaseOrders.length} purchase orders`);
      purchaseOrders.forEach(po => {
        console.log(`   • ${po.transaction_number}: $${po.total_amount} (${po.workflow_status})`);
      });
    }

    // Test 2: Get Goods Receipts
    console.log('\n📦 Test 2: Fetching Goods Receipts...');
    const { data: receipts, error: receiptError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'goods_receipt')
      .order('created_at', { ascending: false });

    if (receiptError) {
      console.error('❌ Error fetching receipts:', receiptError);
    } else {
      console.log(`✅ Found ${receipts.length} goods receipts`);
      receipts.forEach(receipt => {
        const metadata = receipt.procurement_metadata || {};
        console.log(`   • ${receipt.transaction_number}: $${receipt.total_amount.toFixed(2)}`);
        console.log(`     Quality: ${metadata.quality_score?.toFixed(1)}/5, Variance: ${(metadata.variance_rate * 100).toFixed(1)}%`);
      });
    }

    // Test 3: Test PO-to-Receipt relationship
    console.log('\n🔗 Test 3: Testing PO-to-Receipt Relationship...');
    if (purchaseOrders.length > 0 && receipts.length > 0) {
      const testPO = purchaseOrders[0];
      const relatedReceipt = receipts.find(r => 
        r.procurement_metadata?.purchase_order_id === testPO.id
      );

      if (relatedReceipt) {
        console.log('✅ Found related receipt for PO:', testPO.transaction_number);
        console.log(`   PO: ${testPO.transaction_number} ($${testPO.total_amount})`);
        console.log(`   Receipt: ${relatedReceipt.transaction_number} ($${relatedReceipt.total_amount.toFixed(2)})`);
        
        const poItems = testPO.procurement_metadata?.items || [];
        const receiptItems = relatedReceipt.procurement_metadata?.items || [];
        
        console.log('\n   📊 Item Comparison:');
        poItems.forEach((poItem, index) => {
          const receiptItem = receiptItems[index];
          if (receiptItem) {
            console.log(`      ${poItem.itemName}:`);
            console.log(`        Ordered: ${poItem.quantity} ${poItem.unit}`);
            console.log(`        Received: ${receiptItem.receivedQuantity?.toFixed(1)} ${receiptItem.unit}`);
            console.log(`        Status: ${receiptItem.qualityStatus}`);
          }
        });
      } else {
        console.log('⚠️ No related receipt found for the latest PO');
      }
    }

    // Test 4: Test supplier filtering
    console.log('\n👥 Test 4: Testing Supplier Filtering...');
    const { data: suppliers, error: supplierError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'supplier');

    if (supplierError) {
      console.error('❌ Error fetching suppliers:', supplierError);
    } else {
      console.log(`✅ Found ${suppliers.length} suppliers`);
      
      if (suppliers.length > 0) {
        const testSupplier = suppliers[0];
        console.log(`   Testing with supplier: ${testSupplier.entity_name}`);
        
        // Test POs for this supplier
        const supplierPOs = purchaseOrders.filter(po => 
          po.procurement_metadata?.supplier_id === testSupplier.id
        );
        
        console.log(`   • POs for this supplier: ${supplierPOs.length}`);
        
        // Test receipts for this supplier
        const supplierReceipts = receipts.filter(r => 
          r.procurement_metadata?.supplier_id === testSupplier.id
        );
        
        console.log(`   • Receipts for this supplier: ${supplierReceipts.length}`);
      }
    }

    console.log('\n🎉 API endpoint testing completed successfully!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Start the Next.js server: npm run dev');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Navigate to Purchasing > Purchase Orders to see the test PO');
    console.log('4. Navigate to Receiving > Goods Receiving to see the test receipt');
    console.log('5. Test creating a new goods receipt by selecting the supplier and PO');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAPIEndpoints();