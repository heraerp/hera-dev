/**
 * Debug Service Role Issue
 * Check current service role configuration and test
 */

import { createClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client';

console.log('🔍 Debugging Service Role Configuration...')

// Check environment variables
console.log('\n📋 Environment Check:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('NEXT_PUBLIC_SUPABASE_SERVICE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing')

// Test service role client creation
async function testServiceRoleClient() {
  try {
    console.log('\n🔧 Testing Service Role Client Creation...')
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
    
    if (!url || !serviceKey) {
      console.error('❌ Missing Supabase credentials')
      return false
    }
    
    // Create service client
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
    })
    
    console.log('✅ Service client created successfully')
    
    // Test with core_clients table (simpler test)
    console.log('\n🧪 Testing with core_clients table...')
    const testId = crypto.randomUUID()
    
    const { error: insertError } = await supabaseAdmin
      .from('core_clients')
      .insert({
        id: testId,
        client_name: 'Service Role Test',
        client_code: 'TEST-SERVICE-001',
        client_type: 'test',
        is_active: true
      })
    
    if (!insertError) {
      console.log('✅ Insert successful - service role working')
      
      // Clean up
      await supabaseAdmin.from('core_clients').delete().eq('id', testId)
      console.log('✅ Cleanup successful')
      return true
    } else {
      console.error('❌ Insert failed:', insertError)
      return false
    }
    
  } catch (error) {
    console.error('❌ Service role test error:', error)
    return false
  }
}

// Test the restaurant setup service
async function testRestaurantSetupService() {
  try {
    console.log('\n🏪 Testing Restaurant Setup Service...')
    
    const { default: UniversalRestaurantSetupService } = await import('./lib/services/universalRestaurantSetupService.ts')
    
    const testResult = await UniversalRestaurantSetupService.testServiceRole()
    
    console.log('📊 Service test result:')
    console.log('Success:', testResult.success)
    console.log('Message:', testResult.message)
    if (testResult.error) {
      console.log('Error:', testResult.error)
    }
    
    return testResult.success
    
  } catch (error) {
    console.error('❌ Restaurant setup service test failed:', error)
    return false
  }
}

// Run all tests
async function runDiagnostics() {
  console.log('🎯 Service Role Diagnostics\n')
  
  const test1 = await testServiceRoleClient()
  const test2 = await testRestaurantSetupService()
  
  console.log('\n📋 Diagnostic Summary:')
  console.log(`Direct Service Client: ${test1 ? '✅ WORKING' : '❌ FAILED'}`)
  console.log(`Restaurant Setup Service: ${test2 ? '✅ WORKING' : '❌ FAILED'}`)
  
  if (test1 && test2) {
    console.log('\n🎉 Service role is working correctly!')
    console.log('The issue may be elsewhere in the setup process.')
  } else {
    console.log('\n🚨 Service role has issues that need to be fixed.')
  }
}

runDiagnostics().catch(console.error)