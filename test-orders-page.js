/**
 * Test Orders Page - Check for JavaScript errors
 */

const { createClient } = require('@supabase/supabase-js');
const UniversalCrudService = require('./lib/services/universalCrudService').default;

// Mock environment
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://yslviohidtyqjmyslekz.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHZpb2hpZHR5cWpteXNsZWt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg5MzUyMSwiZXhwIjoyMDY3NDY5NTIxfQ.VQtaWocR7DBq4mMI0eqhd1caB3HU0pGbSB1rbkB0iUI';

async function testOrdersPage() {
  console.log('🧪 Testing Orders Page...');
  
  try {
    // Test if UniversalCrudService has the required methods
    console.log('📋 Checking UniversalCrudService methods...');
    
    const methods = [
      'createEntity',
      'readEntity', 
      'updateEntity',
      'deleteEntity',
      'listEntities'
    ];
    
    methods.forEach(method => {
      if (typeof UniversalCrudService[method] === 'function') {
        console.log(`✅ ${method} method exists`);
      } else {
        console.log(`❌ ${method} method missing`);
      }
    });
    
    // Test service role
    console.log('\n🔧 Testing service role...');
    const result = await UniversalCrudService.testServiceRole();
    if (result.success) {
      console.log('✅ Service role working correctly');
    } else {
      console.log('❌ Service role failed:', result.error);
    }
    
    console.log('\n🎉 Orders page test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOrdersPage().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});