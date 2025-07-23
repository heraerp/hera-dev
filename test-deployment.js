/**
 * Test Template Deployment
 */

const baseURL = 'http://localhost:3000';

async function testDeployment() {
  try {
    console.log('🚀 Testing template deployment...\n');
    
    // First, get available packages
    console.log('1. Getting available packages...');
    const packagesResponse = await fetch(`${baseURL}/api/templates/packages?organizationId=00000000-0000-0000-0000-000000000001`);
    
    if (!packagesResponse.ok) {
      throw new Error(`Failed to fetch packages: ${packagesResponse.status}`);
    }
    
    const packagesData = await packagesResponse.json();
    console.log(`   ✅ Found ${packagesData.data.packages.length} packages`);
    
    if (packagesData.data.packages.length === 0) {
      console.log('❌ No packages available for deployment');
      return;
    }
    
    // Find a restaurant template for testing
    const restaurantPackage = packagesData.data.packages.find(p => 
      p.entity_name.toLowerCase().includes('restaurant')
    );
    
    const testPackage = restaurantPackage || packagesData.data.packages[0];
    console.log(`   📦 Testing deployment of: ${testPackage.entity_name}`);
    console.log(`   🏷️  Package ID: ${testPackage.id}`);
    console.log(`   📂 Type: ${testPackage.entity_type}\n`);
    
    // Generate test organization
    const testOrgId = crypto.randomUUID();
    const testOrgName = "Test Deployment Organization";
    
    console.log('2. Creating organization...');
    console.log(`   🏢 Org ID: ${testOrgId}`);
    console.log(`   🏢 Org Name: ${testOrgName}`);
    
    // Step 1: Create the organization first
    const orgPayload = {
      id: testOrgId,
      org_name: testOrgName,
      org_code: `${testOrgName.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4)}${Math.random().toString(36).substring(2, 4).toUpperCase()}ORG`,
      industry: 'restaurant',
      country: 'US',
      currency: 'USD',
      is_active: true
    };
    
    console.log('   🏢 Creating organization:', orgPayload);
    
    const orgResponse = await fetch(`${baseURL}/api/core/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orgPayload),
    });
    
    if (!orgResponse.ok) {
      const orgError = await orgResponse.text();
      console.error('   ❌ Organization creation failed:', orgError);
      throw new Error(`Failed to create organization: ${orgResponse.status} - ${orgError}`);
    }
    
    const orgResult = await orgResponse.json();
    console.log('   ✅ Organization created:', orgResult);
    
    // Step 2: Deploy the template
    console.log('3. Deploying template...');
    const deploymentPayload = {
      deploymentType: 'package', // Based on entity_type
      organizationId: testOrgId,
      organizationName: testOrgName,
      templateId: testPackage.id,
      businessSize: 'medium',
      deploymentOptions: {
        setupChartOfAccounts: true,
        createDefaultWorkflows: true,
        enableAnalytics: true,
      },
      createdBy: testOrgId,
      metadata: {
        templateName: testPackage.entity_name,
        industry: testPackage.industry_type,
        category: 'Complete Solution'
      }
    };
    
    console.log('   📦 Deployment payload:', JSON.stringify(deploymentPayload, null, 2));
    
    // Make deployment request
    const deploymentResponse = await fetch(`${baseURL}/api/templates/deployments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deploymentPayload),
    });

    console.log(`   📡 Response status: ${deploymentResponse.status}`);
    
    if (!deploymentResponse.ok) {
      const errorText = await deploymentResponse.text();
      console.error(`   ❌ Error response: ${errorText}`);
      throw new Error(`Deployment failed: ${deploymentResponse.status}`);
    }

    const deploymentResult = await deploymentResponse.json();
    console.log('   ✅ Deployment response:', JSON.stringify(deploymentResult, null, 2));
    
    console.log('\n🎉 Deployment test completed successfully!');

  } catch (error) {
    console.error('\n❌ Deployment test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testDeployment();