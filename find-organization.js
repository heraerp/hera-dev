/**
 * Find Organization ID for adding products
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yslviohidtyqjmyslekz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHZpb2hpZHR5cWpteXNsZWt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg5MzUyMSwiZXhwIjoyMDY3NDY5NTIxfQ.VQtaWocR7DBq4mMI0eqhd1caB3HU0pGbSB1rbkB0iUI'
);

async function findOrganization() {
  console.log('🔍 Finding organization ID...');
  
  try {
    // Check core_organizations table
    const { data: orgs, error: orgsError } = await supabase
      .from('core_organizations')
      .select('id, org_name, industry, client_id')
      .eq('is_active', true);
    
    if (orgsError) {
      console.error('❌ Failed to query organizations:', orgsError.message);
      return;
    }
    
    console.log(`\n📋 Found ${orgs.length} organizations:`);
    orgs.forEach((org, index) => {
      console.log(`${index + 1}. ${org.org_name} (${org.industry})`);
      console.log(`   ID: ${org.id}`);
      console.log(`   Client ID: ${org.client_id}`);
      console.log('');
    });
    
    if (orgs.length > 0) {
      const firstOrg = orgs[0];
      console.log(`🎯 Use this organization ID for products: ${firstOrg.id}`);
      console.log(`   Organization: ${firstOrg.org_name}`);
      
      // Update the add-sample-products.js script
      console.log('\n📝 Copy this command to add products:');
      console.log(`sed -i '' 's/f47ac10b-58cc-4372-a567-0e02b2c3d479/${firstOrg.id}/g' add-sample-products.js`);
      console.log('node add-sample-products.js');
    } else {
      console.log('❌ No organizations found. You need to create a restaurant first.');
      console.log('   Visit: http://localhost:3000/setup/restaurant');
    }
    
  } catch (error) {
    console.error('❌ Failed to find organization:', error.message);
  }
}

findOrganization().then(() => process.exit(0));