// Simple test to verify order creation works
// Run with: node test-order-creation.js

import { createClient } from '@/lib/supabase/client';
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yslviohidtyqjmyslekz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHZpb2hpZHR5cWpteXNsZWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTM1MjEsImV4cCI6MjA2NzQ2OTUyMX0.j7W2RpnpaNpvJReLeJpUMUUg3tbpSacvSsu3m9tcNmE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrderCreation() {
  console.log('Testing order creation...');
  
  try {
    const orgId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10)}-${Date.now().toString().slice(-3)}`;
    
    console.log('1. Creating order transaction...');
    
    // Step 1: Create the main order transaction
    const { data: orderTransaction, error: orderError } = await supabase
      .from('universal_transactions')
      .insert({
        organization_id: orgId,
        transaction_type: 'SALES_ORDER',
        transaction_number: orderNumber,
        transaction_date: new Date().toISOString().split('T')[0],
        total_amount: 25.50,
        currency: 'USD',
        status: 'PENDING'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create order transaction:', orderError);
      return;
    }

    console.log('✅ Order transaction created:', orderTransaction);

    // Step 2: Create order line items (mock products)
    console.log('2. Creating order line items...');
    
    const orderLines = [
      {
        transaction_id: orderTransaction.id,
        entity_id: 'mock-product-1',
        line_description: 'Masala Chai',
        quantity: 2,
        unit_price: 8.50,
        line_amount: 17.00,
        line_order: 1
      },
      {
        transaction_id: orderTransaction.id,
        entity_id: 'mock-product-2', 
        line_description: 'Samosa',
        quantity: 1,
        unit_price: 8.50,
        line_amount: 8.50,
        line_order: 2
      }
    ];

    const { data: lineItems, error: lineError } = await supabase
      .from('universal_transaction_lines')
      .insert(orderLines)
      .select();

    if (lineError) {
      console.error('Failed to create line items:', lineError);
      return;
    }

    console.log('✅ Line items created:', lineItems);

    // Step 3: Add order metadata
    console.log('3. Creating order metadata...');
    
    const orderMetadata = [
      {
        organization_id: orgId,
        entity_id: orderTransaction.id,
        entity_type: 'transaction',
        field_name: 'customer_id',
        field_value: 'walk-in-customer',
        field_type: 'text',
        is_active: true
      },
      {
        organization_id: orgId,
        entity_id: orderTransaction.id,
        entity_type: 'transaction',
        field_name: 'table_number',
        field_value: '5',
        field_type: 'text',
        is_active: true
      },
      {
        organization_id: orgId,
        entity_id: orderTransaction.id,
        entity_type: 'transaction',
        field_name: 'order_type',
        field_value: 'dine_in',
        field_type: 'text',
        is_active: true
      },
      {
        organization_id: orgId,
        entity_id: orderTransaction.id,
        entity_type: 'transaction',
        field_name: 'preparation_status',
        field_value: 'pending',
        field_type: 'text',
        is_active: true
      },
      {
        organization_id: orgId,
        entity_id: orderTransaction.id,
        entity_type: 'transaction',
        field_name: 'special_instructions',
        field_value: 'Extra spicy',
        field_type: 'text',
        is_active: true
      }
    ];

    const { data: metadata, error: metadataError } = await supabase
      .from('core_dynamic_data')
      .insert(orderMetadata)
      .select();

    if (metadataError) {
      console.error('Failed to create metadata:', metadataError);
      return;
    }

    console.log('✅ Metadata created:', metadata);

    // Step 4: Test retrieving the complete order
    console.log('4. Testing order retrieval...');
    
    const { data: retrievedOrder, error: retrieveError } = await supabase
      .from('universal_transactions')
      .select(`
        *,
        universal_transaction_lines (*),
        core_dynamic_data (*)
      `)
      .eq('id', orderTransaction.id)
      .single();

    if (retrieveError) {
      console.error('Failed to retrieve order:', retrieveError);
      return;
    }

    console.log('✅ Complete order retrieved:', JSON.stringify(retrievedOrder, null, 2));

    // Test the orders list query
    console.log('5. Testing orders list query...');
    
    const { data: ordersList, error: listError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('transaction_type', 'SALES_ORDER')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (listError) {
      console.error('Failed to retrieve orders list:', listError);
      return;
    }

    console.log(`✅ Orders list retrieved: ${ordersList.length} orders found`);
    ordersList.forEach(order => {
      console.log(`   - ${order.transaction_number}: $${order.total_amount} (${order.status})`);
    });

    console.log('\n🎉 Order creation test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Order Number: ${orderNumber}`);
    console.log(`   Order ID: ${orderTransaction.id}`);
    console.log(`   Total Amount: $${orderTransaction.total_amount}`);
    console.log(`   Line Items: ${lineItems.length}`);
    console.log(`   Metadata Fields: ${metadata.length}`);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testOrderCreation();