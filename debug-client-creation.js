/**
 * Debug Client Creation Issue
 * Test the exact client creation step that's failing
 */

import { createClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client';

console.log('🔍 Debugging Client Creation Issue...')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY

async function testClientCreation() {
  console.log('\n🧪 Testing Client Creation...')
  
  if (!url || !serviceKey) {
    console.error('❌ Missing environment variables')
    return false
  }
  
  try {
    // Create service client with proper headers
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
    
    console.log('✅ Service client created')
    
    // Test data similar to what setup would use
    const testData = {
      clientName: 'Test Restaurant Group',
      clientType: 'restaurant_group'
    }
    
    const clientId = crypto.randomUUID()
    const clientCode = `${testData.clientName.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-CLIENT`
    
    console.log('🔧 Test client data:', {
      id: clientId,
      client_name: testData.clientName,
      client_code: clientCode,
      client_type: testData.clientType
    })
    
    // Step 1: Test core_clients insert
    console.log('\n📝 Step 1: Testing core_clients insert...')
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from('core_clients')
      .insert({
        id: clientId,
        client_name: testData.clientName,
        client_code: clientCode,
        client_type: testData.clientType,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (clientError) {
      console.error('❌ core_clients insert failed:', {
        code: clientError.code,
        message: clientError.message,
        details: clientError.details,
        hint: clientError.hint
      })
      return false
    }
    
    console.log('✅ core_clients insert successful:', clientData)
    
    // Step 2: Test core_entities insert
    console.log('\n📝 Step 2: Testing core_entities insert...')
    const { data: entityData, error: entityError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: clientId,
        organization_id: null,
        entity_type: 'client',
        entity_name: testData.clientName,
        entity_code: clientCode,
        is_active: true
      })
      .select()
    
    if (entityError) {
      console.error('❌ core_entities insert failed:', {
        code: entityError.code,
        message: entityError.message,
        details: entityError.details,
        hint: entityError.hint
      })
      
      // Clean up core_clients if entities failed
      await supabaseAdmin.from('core_clients').delete().eq('id', clientId)
      console.log('🧹 Cleaned up core_clients record')
      return false
    }
    
    console.log('✅ core_entities insert successful:', entityData)
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...')
    await supabaseAdmin.from('core_entities').delete().eq('id', clientId)
    await supabaseAdmin.from('core_clients').delete().eq('id', clientId)
    console.log('✅ Cleanup complete')
    
    return true
    
  } catch (error) {
    console.error('❌ Test error:', error)
    return false
  }
}

async function checkTableStructure() {
  console.log('\n🔍 Checking table structure...')
  
  try {
    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        }
      }
    })
    
    // Check if tables exist and are accessible
    console.log('📋 Testing core_clients table access...')
    const { data: clientsData, error: clientsError } = await supabaseAdmin
      .from('core_clients')
      .select('id')
      .limit(1)
    
    if (clientsError) {
      console.error('❌ core_clients access failed:', clientsError)
    } else {
      console.log('✅ core_clients accessible, sample count:', clientsData?.length || 0)
    }
    
    console.log('📋 Testing core_entities table access...')
    const { data: entitiesData, error: entitiesError } = await supabaseAdmin
      .from('core_entities')
      .select('id')
      .limit(1)
    
    if (entitiesError) {
      console.error('❌ core_entities access failed:', entitiesError)
    } else {
      console.log('✅ core_entities accessible, sample count:', entitiesData?.length || 0)
    }
    
  } catch (error) {
    console.error('❌ Table structure check failed:', error)
  }
}

async function runDebug() {
  console.log('🎯 Client Creation Debug\n')
  
  await checkTableStructure()
  const testResult = await testClientCreation()
  
  console.log('\n📋 Debug Results:')
  console.log(`Client Creation Test: ${testResult ? '✅ PASS' : '❌ FAIL'}`)
  
  if (testResult) {
    console.log('\n🎉 Client creation works correctly!')
    console.log('The issue may be in the form data or validation.')
  } else {
    console.log('\n🚨 Client creation has database-level issues.')
    console.log('Check the error details above for the root cause.')
  }
}

runDebug().catch(console.error)