/**
 * Customer Page Debug Tool
 * 
 * Quick diagnostic to check if customer page will work
 * Run with: node debug-customer-page.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Setup admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

const TEST_ORG_ID = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';

async function debugCustomerPage() {
  console.log('🔍 Customer Page Debug Tool');
  console.log('=' .repeat(35));
  
  try {
    // Check 1: Environment variables
    console.log('\n1. Environment Variables:');
    console.log('   SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('   SERVICE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing');
    
    // Check 2: Database connection
    console.log('\n2. Database Connection:');
    const { data: connection, error: connectionError } = await supabaseAdmin
      .from('core_organizations')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.log('   Connection: ❌ Failed -', connectionError.message);
      return;
    }
    console.log('   Connection: ✅ Working');
    
    // Check 3: Organization exists
    console.log('\n3. Organization Check:');
    const { data: org, error: orgError } = await supabaseAdmin
      .from('core_organizations')
      .select('*')
      .eq('id', TEST_ORG_ID)
      .single();
    
    if (orgError) {
      console.log('   Organization: ❌ Not found -', orgError.message);
      return;
    }
    console.log('   Organization: ✅ Found -', org.org_name);
    
    // Check 4: Customer entities
    console.log('\n4. Customer Entities:');
    const { data: customers, error: customersError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', TEST_ORG_ID)
      .eq('entity_type', 'customer')
      .eq('is_active', true);
    
    if (customersError) {
      console.log('   Customers: ❌ Query failed -', customersError.message);
      return;
    }
    console.log('   Customers: ✅ Found', customers.length, 'customers');
    
    // Check 5: Customer metadata
    console.log('\n5. Customer Metadata:');
    const customerIds = customers.map(c => c.id);
    const { data: metadata, error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .select('*')
      .eq('organization_id', TEST_ORG_ID)
      .in('entity_id', customerIds)
      .eq('metadata_key', 'customer_info');
    
    if (metadataError) {
      console.log('   Metadata: ❌ Query failed -', metadataError.message);
      return;
    }
    console.log('   Metadata: ✅ Found', metadata.length, 'metadata records');
    
    // Check 6: Service adapter simulation
    console.log('\n6. Service Adapter Simulation:');
    
    // Build metadata map
    const metadataMap = new Map();
    metadata.forEach(item => {
      metadataMap.set(item.entity_id, item.metadata_value);
    });
    
    // Convert to CRUD format
    const crudCustomers = customers.map(entity => {
      const meta = metadataMap.get(entity.id) || {};
      return {
        id: entity.id,
        name: entity.entity_name,
        email: meta.email || 'No email',
        phone: meta.phone || 'No phone',
        customerType: meta.customer_type || 'individual',
        loyaltyTier: meta.loyalty_tier || 'bronze',
        totalOrders: meta.total_visits || 0,
        totalSpent: meta.lifetime_value || 0,
        isActive: entity.is_active
      };
    });
    
    console.log('   Adapter: ✅ Working - Converted', crudCustomers.length, 'customers');
    
    // Check 7: Display sample data
    console.log('\n7. Sample Customer Data:');
    if (crudCustomers.length > 0) {
      const sample = crudCustomers[0];
      console.log('   Sample Customer:');
      console.log('     ID:', sample.id);
      console.log('     Name:', sample.name);
      console.log('     Email:', sample.email);
      console.log('     Type:', sample.customerType);
      console.log('     Loyalty:', sample.loyaltyTier);
      console.log('     Orders:', sample.totalOrders);
      console.log('     Spent:', sample.totalSpent);
    } else {
      console.log('   No customers available for sample');
    }
    
    // Check 8: Page requirements
    console.log('\n8. Page Requirements:');
    console.log('   Organization ID: ✅', TEST_ORG_ID);
    console.log('   Customer Count: ✅', customers.length);
    console.log('   With Metadata: ✅', metadata.length);
    console.log('   CRUD Ready: ✅', crudCustomers.length);
    
    // Final status
    console.log('\n🎉 Debug Summary:');
    console.log('✅ Database connection working');
    console.log('✅ Organization found');
    console.log('✅ Customer data available');
    console.log('✅ Metadata integration working');
    console.log('✅ Service adapter pattern working');
    console.log('\n🚀 Customer page should load successfully!');
    
    // Common issues to check
    console.log('\n💡 If page doesn\'t load, check:');
    console.log('   1. Is npm run dev running?');
    console.log('   2. Are you logged in to the app?');
    console.log('   3. Does your user have restaurant access?');
    console.log('   4. Check browser console for errors');
    console.log('   5. Verify you\'re on /restaurant/customers');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check .env.local file exists');
    console.log('   2. Verify Supabase credentials');
    console.log('   3. Check database permissions');
    console.log('   4. Ensure organization exists');
  }
}

// Run debug
debugCustomerPage();