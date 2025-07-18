import { createClient } from '@/lib/supabase/client';
const { createClient } = require('@supabase/supabase-js');

// Test service role configuration
async function testServiceRole() {
  console.log('🔍 Testing Service Role Configuration...\n');
  
  // Check environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Environment Variables:');
  console.log('- SUPABASE_URL:', url ? '✅ Set' : '❌ Missing');
  console.log('- SERVICE_KEY:', serviceKey ? `✅ Set (${serviceKey.slice(0, 20)}...)` : '❌ Missing');
  console.log('- ANON_KEY:', anonKey ? '✅ Set' : '❌ Missing');
  console.log('');
  
  if (!url || !serviceKey) {
    console.error('❌ Missing required environment variables!');
    return;
  }
  
  // Create admin client
  console.log('📝 Creating Supabase admin client...');
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
  
  // Test basic operation
  console.log('\n🧪 Testing service role capabilities...');
  try {
    const testId = crypto.randomUUID();
    console.log('- Test ID:', testId);
    
    // Try to insert
    console.log('- Attempting insert into core_entities...');
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: testId,
        entity_type: 'test',
        entity_name: 'Service Role Test',
        entity_code: 'TEST-001',
        is_active: true
      })
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
      return;
    }
    
    console.log('✅ Insert successful:', insertData);
    
    // Try to delete
    console.log('- Attempting delete...');
    const { error: deleteError } = await supabaseAdmin
      .from('core_entities')
      .delete()
      .eq('id', testId);
    
    if (deleteError) {
      console.error('❌ Delete failed:', deleteError);
      return;
    }
    
    console.log('✅ Delete successful');
    console.log('\n🎉 Service role is working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Error stack:', error.stack);
  }
  
  // Test RLS bypass
  console.log('\n🔐 Testing RLS bypass...');
  try {
    const { count, error } = await supabaseAdmin
      .from('core_entities')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ RLS test failed:', error);
    } else {
      console.log('✅ Can read all rows (count:', count, ') - RLS bypassed successfully');
    }
  } catch (error) {
    console.error('❌ RLS test error:', error);
  }
}

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Run the test
testServiceRole();