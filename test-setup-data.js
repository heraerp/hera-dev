/**
 * Test Setup Data Flow
 * Debug what data is being passed to the setup service
 */

// Complete test data matching the form structure
const testSetupData = {
  // Client-level information (Parent Company)
  clientName: 'Test Restaurant Group',
  clientType: 'restaurant_group',
  
  // Restaurant-level information (Specific Location)
  businessName: 'Test Tea Garden',
  businessType: 'restaurant_chain',
  cuisineType: 'Tea & Light Meals',
  establishedYear: '2025',
  locationName: 'Main Branch',
  address: '123 Test Street',
  city: 'Test City',
  state: 'Test State',
  postalCode: '12345',
  country: 'India',
  currency: 'INR',
  primaryPhone: '+91-98765-43210',
  businessEmail: 'test@example.com',
  website: 'https://test.com',
  openingTime: '08:00',
  closingTime: '20:00',
  seatingCapacity: '20',
  managerName: 'Test Manager',
  managerEmail: 'manager@test.com',
  managerPhone: '+91-87654-32109'
}

console.log('🧪 Testing Setup Data Flow...')
console.log('📝 Test Setup Data:', JSON.stringify(testSetupData, null, 2))

async function testSetupService() {
  try {
    console.log('\n🔧 Testing setup service with complete data...')
    
    // Test user ID
    const testUserId = 'test-user-12345'
    
    // Import the service
    const { default: UniversalRestaurantSetupService } = await import('./lib/services/universalRestaurantSetupService.ts')
    
    console.log('🚀 Calling setupRestaurant with test data...')
    const result = await UniversalRestaurantSetupService.setupRestaurant(testSetupData, testUserId)
    
    console.log('\n📊 Setup Result:')
    console.log('Success:', result.success)
    if (result.success) {
      console.log('Data:', result.data)
    } else {
      console.log('Error:', result.error)
      console.log('Details:', result.details)
    }
    
    return result.success
    
  } catch (error) {
    console.error('❌ Test error:', error)
    return false
  }
}

async function validateTestData() {
  console.log('\n🔍 Validating test data...')
  
  // Check required fields for each step
  const requiredFields = {
    1: ['clientName', 'businessName', 'cuisineType', 'businessEmail', 'primaryPhone'],
    2: ['address', 'city', 'state', 'postalCode'],
    3: ['openingTime', 'closingTime', 'seatingCapacity'],
    4: ['managerName', 'managerEmail', 'managerPhone']
  }
  
  let allValid = true
  
  Object.entries(requiredFields).forEach(([step, fields]) => {
    console.log(`\n📋 Step ${step} validation:`)
    
    fields.forEach(field => {
      const value = testSetupData[field]
      const isValid = value && value.toString().trim() !== ''
      console.log(`  ${field}: ${isValid ? '✅' : '❌'} "${value}"`)
      if (!isValid) allValid = false
    })
  })
  
  console.log(`\n📊 Overall validation: ${allValid ? '✅ PASS' : '❌ FAIL'}`)
  return allValid
}

async function runTest() {
  console.log('🎯 Setup Data Flow Test\n')
  
  const dataValid = await validateTestData()
  
  if (!dataValid) {
    console.log('\n🚨 Test data invalid - cannot proceed with setup test')
    return
  }
  
  const setupResult = await testSetupService()
  
  console.log('\n📋 Test Summary:')
  console.log(`Data Validation: ${dataValid ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Setup Service: ${setupResult ? '✅ PASS' : '❌ FAIL'}`)
  
  if (setupResult) {
    console.log('\n🎉 Setup service works with test data!')
    console.log('The issue may be with form data collection.')
  } else {
    console.log('\n🚨 Setup service has issues even with valid test data.')
  }
}

// Auto-run test
if (typeof window !== 'undefined') {
  // Browser environment
  runTest().catch(console.error)
} else if (typeof global !== 'undefined') {
  // Node environment
  console.log('Run this in browser console or with ES modules')
} else {
  console.log('Unknown environment')
}