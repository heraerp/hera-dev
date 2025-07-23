/**
 * Test the Configuration Control Panel API endpoints
 */

async function testConfigurationAPI() {
  console.log('🧪 Testing Configuration Control Panel API...');
  
  try {
    // Test dashboard API
    console.log('\n1. Testing Dashboard API...');
    const dashboardResponse = await fetch('http://localhost:3000/api/system/configuration/dashboard');
    
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Dashboard API working');
      console.log('📊 Metrics:', JSON.stringify(dashboardData.data.metrics, null, 2));
      console.log('🤖 AI Insights:', dashboardData.data.aiInsights.length, 'insights found');
      console.log('📝 Recent Changes:', dashboardData.data.recentChanges.length, 'changes found');
    } else {
      console.log('❌ Dashboard API failed:', dashboardResponse.status, dashboardResponse.statusText);
      const errorData = await dashboardResponse.text();
      console.log('Error details:', errorData);
    }

    // Test duplicates API
    console.log('\n2. Testing Duplicates API...');
    const duplicatesResponse = await fetch('http://localhost:3000/api/system/configuration/duplicates');
    
    if (duplicatesResponse.ok) {
      const duplicatesData = await duplicatesResponse.json();
      console.log('✅ Duplicates API working');
      console.log('🔍 Duplicates found:', duplicatesData.data?.duplicates?.length || 0);
    } else {
      console.log('⚠️  Duplicates API response:', duplicatesResponse.status);
    }

    // Test templates API
    console.log('\n3. Testing Templates API...');
    const templatesResponse = await fetch('http://localhost:3000/api/system/configuration/templates');
    
    if (templatesResponse.ok) {
      const templatesData = await templatesResponse.json();
      console.log('✅ Templates API working');
      console.log('📋 Templates found:', templatesData.data?.templates?.length || 0);
    } else {
      console.log('⚠️  Templates API response:', templatesResponse.status);
    }

  } catch (error) {
    console.error('❌ API test error:', error.message);
  }
}

// Run the test
testConfigurationAPI();