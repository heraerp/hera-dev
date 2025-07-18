/**
 * Simple kitchen display verification test
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function verifyKitchenDisplay() {
  console.log('🍳 Verifying kitchen display can see orders...\n');
  
  const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';
  
  try {
    // Query exactly like the kitchen display does
    const { data: transactions, error } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('transaction_type', 'SALES_ORDER')
      .in('transaction_status', ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'pending', 'confirmed', 'preparing', 'ready'])
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ Found ${transactions?.length || 0} orders for kitchen display:`);
    
    if (transactions && transactions.length > 0) {
      for (const transaction of transactions) {
        console.log(`\n📋 Order: ${transaction.transaction_number}`);
        console.log(`   Status: ${transaction.transaction_status}`);
        console.log(`   Amount: $${transaction.total_amount}`);
        console.log(`   Created: ${transaction.created_at}`);
        
        // Get line items
        const { data: lines } = await supabase
          .from('universal_transaction_lines')
          .select('*')
          .eq('transaction_id', transaction.id);
        
        console.log(`   Items: ${lines?.length || 0}`);
        lines?.forEach((line, index) => {
          console.log(`     ${index + 1}. ${line.quantity}x ${line.line_description} - $${line.unit_price}`);
        });
        
        // Get metadata
        const { data: metadata } = await supabase
          .from('core_metadata')
          .select('*')
          .eq('entity_type', 'transaction')
          .eq('entity_id', transaction.id);
        
        if (metadata && metadata.length > 0) {
          console.log(`   Metadata: Found ${metadata.length} records`);
          try {
            const orderData = JSON.parse(metadata[0].metadata_value);
            console.log(`   Customer: ${orderData.customer_name || 'N/A'}`);
            console.log(`   Table: ${orderData.table_number || 'N/A'}`);
          } catch (e) {
            console.log(`   Metadata: Parse error`);
          }
        } else {
          console.log(`   Metadata: None (will show defaults in kitchen)`);
        }
      }
      
      console.log('\n🎉 Kitchen display should now show these orders!');
      console.log('\nTo verify:');
      console.log('1. Go to http://localhost:3000/restaurant/kitchen');
      console.log('2. Check that orders appear with proper line items');
      console.log('3. Orders without metadata should show "Walk-in Customer" and "Counter"');
      
    } else {
      console.log('❌ No orders found for kitchen display');
    }
    
  } catch (error) {
    console.error('❌ Kitchen verification failed:', error);
  }
}

verifyKitchenDisplay();