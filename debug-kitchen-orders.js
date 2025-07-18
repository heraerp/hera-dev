/**
 * Debug script to check what orders exist in the database
 * Run this to see why orders aren't showing in kitchen
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function debugKitchenOrders() {
  console.log('🔍 Debugging kitchen orders...');
  
  try {
    // Check all transactions
    const { data: allTransactions, error: allError } = await supabase
      .from('universal_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (allError) {
      console.error('❌ Error fetching transactions:', allError);
      return;
    }
    
    console.log('📊 Recent transactions:', allTransactions?.length || 0);
    allTransactions?.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.transaction_number} - Status: ${tx.transaction_status} - Org: ${tx.organization_id}`);
    });
    
    // Check for specific organization
    const orgId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2'; // From logs
    
    const { data: orgTransactions, error: orgError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', orgId)
      .eq('transaction_type', 'SALES_ORDER');
    
    console.log(`\n🏢 Transactions for org ${orgId}:`, orgTransactions?.length || 0);
    orgTransactions?.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.transaction_number} - Status: ${tx.transaction_status} - Created: ${tx.created_at}`);
    });
    
    // Check transaction lines
    if (orgTransactions && orgTransactions.length > 0) {
      const txIds = orgTransactions.map(tx => tx.id);
      const { data: lines, error: linesError } = await supabase
        .from('universal_transaction_lines')
        .select('*')
        .in('transaction_id', txIds);
      
      console.log(`\n📦 Transaction lines:`, lines?.length || 0);
      lines?.forEach((line, index) => {
        console.log(`${index + 1}. ${line.line_description} - Qty: ${line.quantity} - Price: ${line.unit_price}`);
      });
    }
    
    // Check metadata
    if (orgTransactions && orgTransactions.length > 0) {
      const txIds = orgTransactions.map(tx => tx.id);
      const { data: metadata, error: metaError } = await supabase
        .from('core_metadata')
        .select('*')
        .eq('entity_type', 'transaction')
        .in('entity_id', txIds);
      
      console.log(`\n📝 Metadata records:`, metadata?.length || 0);
      metadata?.forEach((meta, index) => {
        console.log(`${index + 1}. ${meta.metadata_key} - Value:`, meta.metadata_value);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugKitchenOrders();