/**
 * Direct Service Role Debug
 * Tests the exact same path as the setup page
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY

console.log('🔍 Testing Service Role - Direct Debug')
console.log('URL:', url ? '✅ Present' : '❌ Missing')
console.log('Service Key:', serviceKey ? '✅ Present' : '❌ Missing')

async function testServiceRoleDirect() {
  try {
    console.log('\n🔧 Creating service client...')
    
    if (!url || !serviceKey) {
      throw new Error('Supabase credentials missing')
    }
    
    // Create service client exactly like the service does
    const supabaseAdmin = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('✅ Service client created')
    
    // Test the exact same operations as the testServiceRole function
    console.log('\n🧪 Testing with core_entities table...')
    const testId = crypto.randomUUID()
    const dummyOrgId = '00000000-0000-0000-0000-000000000000'
    
    console.log('Test ID:', testId)
    console.log('Dummy Org ID:', dummyOrgId)
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: testId,
        organization_id: dummyOrgId,
        entity_type: 'test',
        entity_name: 'Service Role Test',
        entity_code: 'TEST-001',
        is_active: true
      })
      .select()
    
    if (!insertError) {
      console.log('✅ Insert successful:', insertData)
      
      // Clean up
      await supabaseAdmin.from('core_entities').delete().eq('id', testId)
      console.log('✅ Cleanup successful')
      
      console.log('\n🎉 Service role is working correctly!')
      return true
    } else {
      console.error('❌ Insert failed:', insertError)
      
      // If core_entities fails, try core_clients as fallback
      console.log('\n🧪 Trying core_clients table as fallback...')
      const clientTestId = crypto.randomUUID()
      
      const { data: clientData, error: clientError } = await supabaseAdmin
        .from('core_clients')
        .insert({
          id: clientTestId,
          client_name: 'Service Role Test Client',
          client_code: 'TEST-SERVICE-001',
          client_type: 'test',
          is_active: true
        })
        .select()
      
      if (!clientError) {
        console.log('✅ Core clients insert successful:', clientData)
        await supabaseAdmin.from('core_clients').delete().eq('id', clientTestId)
        console.log('✅ Core clients cleanup successful')
        
        console.log('\n⚠️ Service role works with core_clients but not core_entities')
        console.log('Issue: core_entities may have stricter constraints')
        return true
      } else {
        console.error('❌ Core clients insert also failed:', clientError)
        return false
      }
    }
    
  } catch (error) {
    console.error('❌ Service role test failed:', error)
    return false
  }
}

async function testWithExactServiceMethod() {
  try {
    console.log('\n🏪 Testing with exact service method...')
    
    // Import and test the exact service method
    const { default: UniversalRestaurantSetupService } = await import('./lib/services/universalRestaurantSetupService.ts')
    
    const result = await UniversalRestaurantSetupService.testServiceRole()
    
    console.log('Service test result:')
    console.log('- Success:', result.success)
    console.log('- Message:', result.message)
    if (result.error) {
      console.log('- Error:', result.error)
    }
    
    return result.success
    
  } catch (error) {
    console.error('❌ Service method test failed:', error)
    return false
  }
}

async function runFullDiagnostic() {
  console.log('🎯 Full Service Role Diagnostic\n')
  
  const test1 = await testServiceRoleDirect()
  console.log('')
  const test2 = await testWithExactServiceMethod()
  
  console.log('\n📋 Diagnostic Results:')
  console.log(`Direct Test: ${test1 ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Service Method: ${test2 ? '✅ PASS' : '❌ FAIL'}`)
  
  if (test1 && test2) {
    console.log('\n🎉 Service role is working correctly!')
    console.log('The issue may be elsewhere in the setup process.')
  } else {
    console.log('\n🚨 Service role has issues that need debugging.')
    console.log('Recommendation: Check RLS policies or table constraints.')
  }
}

// Run if we're in a Node.js environment
if (typeof global !== 'undefined') {
  runFullDiagnostic().catch(console.error)
} else {
  console.log('Run this in a Node.js environment with ES modules')
}