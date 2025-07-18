/**
 * Simple Service Role Test
 * Test the service role issue directly
 */

import { createClient } from '@supabase/supabase-js'

async function testServiceRole() {
  console.log('🧪 Testing Service Role...')
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
  
  if (!url || !serviceKey) {
    console.error('❌ Missing credentials')
    return false
  }
  
  try {
    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    // Test with core_clients (simpler table)
    const testId = crypto.randomUUID()
    console.log('🔧 Testing insert with ID:', testId)
    
    const { error } = await supabaseAdmin
      .from('core_clients')
      .insert({
        id: testId,
        client_name: 'Test Client',
        client_code: 'TEST-001',
        client_type: 'test',
        is_active: true
      })
    
    if (!error) {
      console.log('✅ Service role working')
      await supabaseAdmin.from('core_clients').delete().eq('id', testId)
      return true
    } else {
      console.error('❌ Service role failed:', error)
      return false
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
    return false
  }
}

testServiceRole().then(success => {
  console.log(success ? '✅ SUCCESS' : '❌ FAILED')
}).catch(console.error)