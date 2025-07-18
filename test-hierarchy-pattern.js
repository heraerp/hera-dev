/**
 * Test Client → Organization Hierarchy Pattern
 * Verify the foreign key relationship works correctly
 */

import { createClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client';

console.log('🧪 Testing Client → Organization Hierarchy Pattern...')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY

async function testHierarchyPattern() {
  if (!url || !serviceKey) {
    console.error('❌ Missing environment variables')
    return false
  }

  try {
    // Create service client with proper headers
    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        }
      }
    })

    console.log('✅ Service client created')

    // Step 1: Create Client (Parent) 
    console.log('\n📋 Step 1: Creating Client in core_clients...')
    const clientId = crypto.randomUUID()
    const clientCode = 'TESTCLIENT-001'
    
    console.log('🔧 Client data:', {
      id: clientId,
      client_name: 'Test Client Hierarchy',
      client_code: clientCode,
      client_type: 'restaurant_group'
    })

    const { data: clientData, error: clientError } = await supabaseAdmin
      .from('core_clients')
      .insert({
        id: clientId,
        client_name: 'Test Client Hierarchy',
        client_code: clientCode,
        client_type: 'restaurant_group',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (clientError) {
      console.error('❌ Client creation failed:', {
        code: clientError.code,
        message: clientError.message,
        details: clientError.details,
        hint: clientError.hint
      })
      return false
    }

    console.log('✅ Client created successfully:', clientData)

    // Step 2: Create Organization (Child) using clientId
    console.log('\n📋 Step 2: Creating Organization in core_organizations...')
    const organizationId = crypto.randomUUID()
    const orgCode = 'TESTORG-001'
    
    console.log('🔧 Organization data:', {
      id: organizationId,
      client_id: clientId,  // 🎯 Foreign key reference
      org_name: 'Test Restaurant',
      org_code: orgCode,
      industry: 'restaurant'
    })

    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('core_organizations')
      .insert({
        id: organizationId,
        client_id: clientId,  // 🎯 This is the foreign key reference
        org_name: 'Test Restaurant',
        org_code: orgCode,
        industry: 'restaurant',
        country: 'US',
        currency: 'USD',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (orgError) {
      console.error('❌ Organization creation failed:', {
        code: orgError.code,
        message: orgError.message,
        details: orgError.details,
        hint: orgError.hint
      })
      
      // Clean up client
      await supabaseAdmin.from('core_clients').delete().eq('id', clientId)
      console.log('🧹 Cleaned up client record')
      return false
    }

    console.log('✅ Organization created successfully:', orgData)

    // Step 3: Verify the hierarchy relationship
    console.log('\n📋 Step 3: Verifying hierarchy relationship...')
    const { data: hierarchyData, error: hierarchyError } = await supabaseAdmin
      .from('core_organizations')
      .select(`
        id,
        org_name,
        client_id,
        core_clients (
          id,
          client_name,
          client_type
        )
      `)
      .eq('id', organizationId)
      .single()

    if (hierarchyError) {
      console.error('❌ Hierarchy verification failed:', hierarchyError)
    } else {
      console.log('✅ Hierarchy verified:', hierarchyData)
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    await supabaseAdmin.from('core_organizations').delete().eq('id', organizationId)
    await supabaseAdmin.from('core_clients').delete().eq('id', clientId)
    console.log('✅ Cleanup complete')

    return true

  } catch (error) {
    console.error('❌ Test error:', error)
    return false
  }
}

async function testServiceImplementation() {
  console.log('\n🏪 Testing actual service implementation...')
  
  try {
    const testData = {
      clientName: 'Service Test Client',
      clientType: 'restaurant_group',
      businessName: 'Service Test Restaurant',
      locationName: 'Main Branch',
      country: 'US',
      currency: 'USD',
      managerName: 'Test Manager',
      managerEmail: 'test@example.com',
      managerPhone: '+1-555-1234',
      businessEmail: 'business@test.com',
      primaryPhone: '+1-555-5678',
      cuisineType: 'Test Cuisine',
      address: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      postalCode: '12345',
      openingTime: '08:00',
      closingTime: '20:00',
      seatingCapacity: '20',
      establishedYear: '2025'
    }

    const { default: UniversalRestaurantSetupService } = await import('./lib/services/universalRestaurantSetupService.ts')
    
    const result = await UniversalRestaurantSetupService.setupRestaurant(testData, 'test-user-123')
    
    console.log('📊 Service result:', {
      success: result.success,
      error: result.error,
      data: result.data
    })
    
    return result.success
    
  } catch (error) {
    console.error('❌ Service test error:', error)
    return false
  }
}

async function runTests() {
  console.log('🎯 Client → Organization Hierarchy Tests\n')
  
  const test1 = await testHierarchyPattern()
  const test2 = await testServiceImplementation()
  
  console.log('\n📋 Test Results:')
  console.log(`Direct Hierarchy Test: ${test1 ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Service Implementation: ${test2 ? '✅ PASS' : '❌ FAIL'}`)
  
  if (test1 && test2) {
    console.log('\n🎉 Hierarchy pattern works correctly!')
    console.log('The issue may be in form data or validation.')
  } else if (test1 && !test2) {
    console.log('\n⚠️ Hierarchy works but service has issues.')
    console.log('Check service implementation for bugs.')
  } else {
    console.log('\n🚨 Database hierarchy has issues.')
    console.log('Check foreign key constraints and table structure.')
  }
}

runTests().catch(console.error)