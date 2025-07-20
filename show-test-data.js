#!/usr/bin/env node

/**
 * Show Test Data Summary
 * Displays all the test data created for PO and Goods Receipt testing
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function showTestData() {
  try {
    console.log('📊 TEST DATA SUMMARY');
    console.log('====================\n');

    // Get test organization
    const { data: organization } = await supabase
      .from('core_organizations')
      .select('*')
      .eq('org_code', 'TEST-ORG')
      .single();

    if (!organization) {
      console.log('❌ No test data found. Run test-po-and-receipt.js first.');
      return;
    }

    const organizationId = organization.id;
    console.log(`🏢 Organization: ${organization.org_name} (${organization.org_code})`);
    console.log(`📅 Created: ${new Date(organization.created_at).toLocaleString()}\n`);

    // Get suppliers
    const { data: suppliers } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'supplier')
      .order('created_at', { ascending: true });

    console.log(`👥 SUPPLIERS (${suppliers.length}):`);
    console.log('================');
    for (const supplier of suppliers) {
      console.log(`📦 ${supplier.entity_name} (${supplier.entity_code})`);
      
      // Get supplier details
      const { data: supplierData } = await supabase
        .from('core_dynamic_data')
        .select('field_name, field_value')
        .eq('entity_id', supplier.id);

      supplierData.forEach(field => {
        console.log(`   ${field.field_name}: ${field.field_value}`);
      });

      // Get POs for this supplier
      const { data: supplierPOs } = await supabase
        .from('universal_transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('transaction_type', 'purchase_order')
        .contains('procurement_metadata', { supplier_id: supplier.id })
        .order('created_at', { ascending: true });

      console.log(`   📋 Purchase Orders: ${supplierPOs.length}`);
      supplierPOs.forEach(po => {
        const metadata = po.procurement_metadata || {};
        const itemCount = metadata.items?.length || 0;
        console.log(`      • ${po.transaction_number}: ${itemCount} items, $${po.total_amount} (${po.workflow_status})`);
      });

      // Get receipts for this supplier
      const { data: supplierReceipts } = await supabase
        .from('universal_transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('transaction_type', 'goods_receipt')
        .contains('procurement_metadata', { supplier_id: supplier.id })
        .order('created_at', { ascending: true });

      console.log(`   📦 Goods Receipts: ${supplierReceipts.length}`);
      supplierReceipts.forEach(receipt => {
        const metadata = receipt.procurement_metadata || {};
        const qualityScore = metadata.quality_score || 0;
        const varianceRate = metadata.variance_rate || 0;
        console.log(`      • ${receipt.transaction_number}: $${receipt.total_amount.toFixed(2)}, Quality: ${qualityScore.toFixed(1)}/5, Variance: ${(varianceRate * 100).toFixed(1)}%`);
      });

      console.log('');
    }

    // Summary statistics
    const { data: allPOs } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'purchase_order');

    const { data: allReceipts } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'goods_receipt');

    const totalPOValue = allPOs.reduce((sum, po) => sum + po.total_amount, 0);
    const totalReceiptValue = allReceipts.reduce((sum, r) => sum + r.total_amount, 0);
    
    const posForReceiving = allPOs.filter(po => 
      ['approved', 'auto_approved'].includes(po.workflow_status)
    );

    console.log('📈 STATISTICS:');
    console.log('==============');
    console.log(`📋 Total Purchase Orders: ${allPOs.length}`);
    console.log(`📦 Total Goods Receipts: ${allReceipts.length}`);
    console.log(`💰 Total PO Value: $${totalPOValue.toFixed(2)}`);
    console.log(`💰 Total Receipt Value: $${totalReceiptValue.toFixed(2)}`);
    console.log(`🔄 POs Available for Receiving: ${posForReceiving.length}`);
    console.log(`👥 Active Suppliers: ${suppliers.length}`);

    if (allReceipts.length > 0) {
      const avgQuality = allReceipts.reduce((sum, r) => {
        return sum + (r.procurement_metadata?.quality_score || 0);
      }, 0) / allReceipts.length;
      console.log(`⭐ Average Quality Score: ${avgQuality.toFixed(1)}/5`);
    }

    console.log('\n🔍 DETAILED ITEMS:');
    console.log('==================');
    
    // Show all unique items from POs
    const allItems = new Map();
    allPOs.forEach(po => {
      const items = po.procurement_metadata?.items || [];
      items.forEach(item => {
        if (!allItems.has(item.itemId)) {
          allItems.set(item.itemId, {
            name: item.itemName,
            unit: item.unit,
            prices: [],
            totalQuantity: 0
          });
        }
        const itemData = allItems.get(item.itemId);
        itemData.prices.push(item.unitPrice);
        itemData.totalQuantity += item.quantity;
      });
    });

    Array.from(allItems.entries()).forEach(([itemId, data]) => {
      const avgPrice = data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length;
      console.log(`🍅 ${data.name}: ${data.totalQuantity} ${data.unit} ordered, avg $${avgPrice.toFixed(2)}/${data.unit}`);
    });

    console.log('\n🎯 TESTING INSTRUCTIONS:');
    console.log('========================');
    console.log('1. Start the server: npm run dev');
    console.log('2. Open http://localhost:3002 in your browser');
    console.log('3. Navigate to "Receiving" > "Goods Receiving"');
    console.log('4. Click "New Receipt" to open the form');
    console.log('5. Test the PO selection feature:');
    console.log('   a. Select "Fresh Foods Co. Test" → Should show 4 POs');
    console.log('   b. Select "Quality Meats & Dairy Ltd." → Should show 1 PO');
    console.log('   c. Select any PO → Items should auto-populate');
    console.log('   d. Adjust quantities to test variance detection');
    console.log('   e. Submit the form to create a goods receipt');
    console.log('6. Check the dashboard to see updated metrics');

    console.log('\n✨ Features to Test:');
    console.log('===================');
    console.log('✅ Supplier-based PO filtering');
    console.log('✅ PO selection dropdown');
    console.log('✅ Automatic item population from PO');
    console.log('✅ Variance detection and highlighting');
    console.log('✅ Quality scoring system');
    console.log('✅ Real-time dashboard updates');
    console.log('✅ Supplier performance tracking');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

showTestData();