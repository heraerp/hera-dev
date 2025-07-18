/**
 * Detailed debug script to check kitchen display issue
 * Checking organization IDs, order data, and metadata parsing
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function debugKitchenDetailed() {
  console.log('🔍 Detailed Kitchen Debug Analysis...\n');
  
  try {
    // 1. Check the specific order we know exists
    const targetOrderNumber = 'ORD-20250716-833';
    console.log(`🎯 Checking specific order: ${targetOrderNumber}`);
    
    const { data: targetOrder, error: targetError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('transaction_number', targetOrderNumber)
      .single();
    
    if (targetError) {
      console.error('❌ Error fetching target order:', targetError);
      return;
    }
    
    if (!targetOrder) {
      console.log('❌ Target order not found');
      return;
    }
    
    console.log('✅ Target order found:');
    console.log(`   ID: ${targetOrder.id}`);
    console.log(`   Organization ID: ${targetOrder.organization_id}`);
    console.log(`   Status: ${targetOrder.transaction_status}`);
    console.log(`   Created: ${targetOrder.created_at}`);
    console.log('');
    
    // 2. Check what organization IDs exist in user_organizations
    console.log('🏢 Checking user organizations:');
    const { data: userOrgs, error: userOrgsError } = await supabase
      .from('user_organizations')
      .select(`
        *,
        core_organizations (
          id,
          org_name,
          industry
        ),
        core_users (
          id,
          email,
          full_name
        )
      `);
    
    if (userOrgsError) {
      console.error('❌ Error fetching user organizations:', userOrgsError);
    } else {
      userOrgs?.forEach((userOrg, index) => {
        console.log(`${index + 1}. User: ${userOrg.core_users?.email} → Org: ${userOrg.core_organizations?.org_name} (${userOrg.organization_id})`);
      });
    }
    console.log('');
    
    // 3. Simulate kitchen query exactly as kitchen page does
    console.log('🍳 Simulating kitchen display query...');
    const organizationId = targetOrder.organization_id;
    const statusFilter = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'pending', 'confirmed', 'preparing', 'ready'];
    
    const { data: kitchenOrders, error: kitchenError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'SALES_ORDER')
      .in('transaction_status', statusFilter)
      .order('created_at', { ascending: false })
      .limit(50);
    
    console.log(`   Organization ID: ${organizationId}`);
    console.log(`   Status filter: [${statusFilter.join(', ')}]`);
    console.log(`   Found orders: ${kitchenOrders?.length || 0}`);
    
    if (kitchenError) {
      console.error('❌ Kitchen query error:', kitchenError);
    }
    
    kitchenOrders?.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.transaction_number} - ${order.transaction_status} - ${order.created_at}`);
    });
    console.log('');
    
    // 4. Check transaction lines for the target order
    console.log('📦 Checking transaction lines:');
    const { data: lines, error: linesError } = await supabase
      .from('universal_transaction_lines')
      .select('*')
      .eq('transaction_id', targetOrder.id);
    
    if (linesError) {
      console.error('❌ Error fetching lines:', linesError);
    } else {
      console.log(`   Found ${lines?.length || 0} line items:`);
      lines?.forEach((line, index) => {
        console.log(`   ${index + 1}. ${line.line_description} - Qty: ${line.quantity} - Price: $${line.unit_price}`);
      });
    }
    console.log('');
    
    // 5. Check metadata for the target order
    console.log('📝 Checking order metadata:');
    const { data: metadata, error: metaError } = await supabase
      .from('core_metadata')
      .select('*')
      .eq('entity_type', 'transaction')
      .eq('entity_id', targetOrder.id);
    
    if (metaError) {
      console.error('❌ Error fetching metadata:', metaError);
    } else {
      console.log(`   Found ${metadata?.length || 0} metadata records:`);
      metadata?.forEach((meta, index) => {
        console.log(`   ${index + 1}. Key: ${meta.metadata_key}`);
        console.log(`      Type: ${meta.metadata_type}`);
        console.log(`      Category: ${meta.metadata_category}`);
        try {
          const parsedValue = typeof meta.metadata_value === 'string' 
            ? JSON.parse(meta.metadata_value) 
            : meta.metadata_value;
          console.log(`      Value:`, parsedValue);
        } catch (e) {
          console.log(`      Value (raw):`, meta.metadata_value);
        }
      });
    }
    console.log('');
    
    // 6. Check if there are any RLS issues by trying different approaches
    console.log('🛡️ Checking RLS (Row Level Security) issues:');
    
    // Try with service role (should bypass RLS)
    const { data: serviceRoleData, error: serviceRoleError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('id', targetOrder.id);
    
    console.log(`   Service role access: ${serviceRoleData ? '✅ Success' : '❌ Failed'}`);
    if (serviceRoleError) {
      console.log(`   Service role error:`, serviceRoleError);
    }
    
    // 7. Test the exact data transformation the kitchen page does
    console.log('🔄 Testing kitchen data transformation:');
    if (kitchenOrders && kitchenOrders.length > 0) {
      const transformedOrders = kitchenOrders.map(order => {
        const lines = lines || []; // We have this from step 4
        const orderMetadata = metadata?.find(m => m.entity_id === order.id)?.metadata_value || {};
        
        let parsedMetadata = {};
        try {
          parsedMetadata = typeof orderMetadata === 'string' 
            ? JSON.parse(orderMetadata) 
            : orderMetadata;
        } catch (e) {
          parsedMetadata = {};
        }
        
        return {
          id: order.id,
          transaction_number: order.transaction_number,
          transaction_status: order.transaction_status?.toLowerCase() || 'pending',
          total_amount: order.total_amount,
          currency: order.currency,
          line_items: lines.map(line => ({
            id: line.id,
            name: line.line_description,
            quantity: line.quantity,
            price: line.unit_price
          })),
          metadata: parsedMetadata,
          created_at: order.created_at,
          updated_at: order.updated_at
        };
      });
      
      console.log(`   Transformed ${transformedOrders.length} orders for kitchen display:`);
      transformedOrders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.transaction_number}:`);
        console.log(`      Status: ${order.transaction_status}`);
        console.log(`      Items: ${order.line_items.length}`);
        console.log(`      Metadata keys: [${Object.keys(order.metadata).join(', ')}]`);
        console.log(`      Customer: ${order.metadata.customer_name || 'N/A'}`);
        console.log(`      Table: ${order.metadata.table_number || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugKitchenDetailed();