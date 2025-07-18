/**
 * Test Service Role Fix
 * Verify the service role headers fix resolves the issue
 */

import { createClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client';

console.log('🧪 Testing Service Role Fix...')

// Check environment variables first
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY

console.log('Environment Check:')
console.log('- URL:', url ? '✅ Present' : '❌ Missing')
console.log('- Service Key:', serviceKey ? '✅ Present' : '❌ Missing')

if (!url || !serviceKey) {
  console.error('❌ Missing environment variables - cannot test')
  process.exit(1)
}

async function testOldPattern() {
  console.log('\n🔧 Testing OLD pattern (without headers)...')
  
  try {
    const client = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
      // No global headers
    })
    
    const testId = crypto.randomUUID()
    const { error } = await client
      .from('core_clients')
      .insert({
        id: testId,
        client_name: 'Old Pattern Test',
        client_code: 'OLD-001',
        client_type: 'test',
        is_active: true
      })
    
    if (!error) {
      await client.from('core_clients').delete().eq('id', testId)
      console.log('✅ Old pattern worked (unexpected)')
      return true
    } else {
      console.log('❌ Old pattern failed:', error.message)
      return false
    }
  } catch (error) {
    console.log('❌ Old pattern error:', error.message)
    return false
  }
}

async function testNewPattern() {
  console.log('\n🔧 Testing NEW pattern (with headers)...')
  
  try {
    const client = createClient(url, serviceKey, {
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
    
    const testId = crypto.randomUUID()
    const { error } = await client
      .from('core_clients')
      .insert({
        id: testId,
        client_name: 'New Pattern Test',
        client_code: 'NEW-001',
        client_type: 'test',
        is_active: true
      })
    
    if (!error) {
      await client.from('core_clients').delete().eq('id', testId)
      console.log('✅ New pattern worked!')
      return true
    } else {
      console.log('❌ New pattern failed:', error.message)
      return false
    }
  } catch (error) {
    console.log('❌ New pattern error:', error.message)
    return false
  }
}

async function testActualService() {
  console.log('\n🏪 Testing actual service method...')
  
  try {
    const { default: UniversalRestaurantSetupService } = await import('./lib/services/universalRestaurantSetupService.ts')
    
    const result = await UniversalRestaurantSetupService.testServiceRole()
    
    if (result.success) {
      console.log('✅ Service method worked:', result.message)
      return true
    } else {
      console.log('❌ Service method failed:', result.message)
      if (result.error) {
        console.log('   Error details:', result.error)
      }
      return false
    }
  } catch (error) {
    console.log('❌ Service method error:', error.message)
    return false
  }
}

async function runTests() {
  console.log('🎯 Service Role Fix Tests\n')
  
  const test1 = await testOldPattern()
  const test2 = await testNewPattern()  
  const test3 = await testActualService()
  
  console.log('\n📋 Test Results:')
  console.log(`Old Pattern (no headers): ${test1 ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`New Pattern (with headers): ${test2 ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Service Method: ${test3 ? '✅ PASS' : '❌ FAIL'}`)
  
  if (test2 && test3) {
    console.log('\n🎉 Service role fix successful!')
    console.log('The restaurant setup should now work correctly.')
  } else {
    console.log('\n🚨 Service role still has issues.')
    console.log('Additional debugging may be needed.')
  }
}

runTests().catch(console.error)