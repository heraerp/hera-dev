import { createClient } from '@/lib/supabase/client';
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test the updated service role function
async function testUpdatedServiceRole() {
  console.log('🔍 Testing Updated Service Role Configuration...\n');
  
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
  
  console.log('🧪 Test 1: With dummy organization_id...');
  try {
    const testId = crypto.randomUUID();
    const dummyOrgId = '00000000-0000-0000-0000-000000000000';
    
    const { data, error } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: testId,
        organization_id: dummyOrgId,
        entity_type: 'test',
        entity_name: 'Service Role Test',
        entity_code: 'TEST-001',
        is_active: true
      })
      .select();
    
    if (error) {
      console.error('❌ Test 1 failed:', error.message);
      console.log('\n🧪 Test 2: Trying with core_clients table...');
      
      const clientTestId = crypto.randomUUID();
      const { data: clientData, error: clientError } = await supabaseAdmin
        .from('core_clients')
        .insert({
          id: clientTestId,
          client_name: 'Service Role Test Client',
          client_code: 'TEST-SERVICE-001',
          client_type: 'test',
          is_active: true
        })
        .select();
      
      if (clientError) {
        console.error('❌ Test 2 also failed:', clientError.message);
      } else {
        console.log('✅ Test 2 successful! Service role works with core_clients');
        
        // Clean up
        await supabaseAdmin.from('core_clients').delete().eq('id', clientTestId);
        console.log('✅ Cleanup successful');
      }
    } else {
      console.log('✅ Test 1 successful! Service role works with dummy org');
      
      // Clean up
      await supabaseAdmin.from('core_entities').delete().eq('id', testId);
      console.log('✅ Cleanup successful');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
  
  console.log('\n🔐 Testing if we can bypass RLS...');
  try {
    const { count, error } = await supabaseAdmin
      .from('core_clients')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ RLS bypass test failed:', error.message);
    } else {
      console.log(`✅ Can read all clients (count: ${count}) - RLS bypassed successfully`);
    }
  } catch (error) {
    console.error('❌ RLS test error:', error);
  }
}

testUpdatedServiceRole();