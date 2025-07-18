import { createClient } from '@/lib/supabase/client';
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test transaction service with the fixed admin client
async function testTransactionService() {
  console.log('🔍 Testing Universal Transaction Service with Admin Client...\n');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
  
  const supabaseAdmin = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    }
  });
  
  const testOrganizationId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // Sample org ID from the service
  
  console.log('🧪 Test 1: Creating a test transaction...');
  try {
    const transactionId = '550e8400-e29b-41d4-a716-446655440050'; // Same as in service
    
    // First check if transaction already exists
    const { data: existing } = await supabaseAdmin
      .from('universal_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (existing) {
      console.log('✅ Sample transaction already exists:', existing);
    } else {
      const { data, error } = await supabaseAdmin
        .from('universal_transactions')
        .insert({
          id: transactionId,
          organization_id: testOrganizationId,
          transaction_type: 'SALES_ORDER',
          transaction_number: 'ORD-20240115-001',
          transaction_date: '2024-01-15',
          total_amount: 7.75,
          currency: 'USD',
          status: 'PENDING'
        })
        .select();
      
      if (error) {
        console.error('❌ Test 1 failed:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      } else {
        console.log('✅ Test 1 successful! Transaction created:', data[0]);
      }
    }
    
    // Test 2: Creating transaction lines
    console.log('\n🧪 Test 2: Creating transaction lines...');
    const lineId1 = '550e8400-e29b-41d4-a716-446655440060';
    const lineId2 = '550e8400-e29b-41d4-a716-446655440061';
    
    const { data: existingLines } = await supabaseAdmin
      .from('universal_transaction_lines')
      .select('*')
      .in('id', [lineId1, lineId2]);
    
    if (existingLines && existingLines.length > 0) {
      console.log('✅ Sample transaction lines already exist:', existingLines.length, 'lines');
    } else {
      const { data: lineData, error: lineError } = await supabaseAdmin
        .from('universal_transaction_lines')
        .insert([
          {
            id: lineId1,
            transaction_id: transactionId,
            entity_id: '550e8400-e29b-41d4-a716-446655440030',
            line_description: 'Premium Jasmine Green Tea',
            quantity: 1,
            unit_price: 4.50,
            line_amount: 4.50,
            line_order: 1
          },
          {
            id: lineId2,
            transaction_id: transactionId,
            entity_id: '550e8400-e29b-41d4-a716-446655440031',
            line_description: 'Fresh Blueberry Scone',
            quantity: 1,
            unit_price: 3.25,
            line_amount: 3.25,
            line_order: 2
          }
        ])
        .select();
      
      if (lineError) {
        console.error('❌ Test 2 failed:', {
          message: lineError.message,
          code: lineError.code,
          details: lineError.details
        });
      } else {
        console.log('✅ Test 2 successful! Transaction lines created:', lineData.length, 'lines');
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
  
  console.log('\n🎉 Transaction service test complete!');
}

testTransactionService();