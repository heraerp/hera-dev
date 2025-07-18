import { createClient } from '@/lib/supabase/client';
#!/usr/bin/env node

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

// Load .env.local file if it exists
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

const { createClient } = require('@supabase/supabase-js');

// Create service client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function verifyChefLebanonData() {
  console.log('🔍 Verifying Chef Lebanon Restaurant Data');
  console.log('==========================================');
  
  try {
    // Get the latest Chef Lebanon client record
    const { data: clients, error: clientError } = await supabase
      .from('core_clients')
      .select('*')
      .eq('client_name', 'Chef Lebanon Restaurant')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (clientError || !clients || clients.length === 0) {
      console.log('❌ No Chef Lebanon Restaurant client found');
      return;
    }
    
    const client = clients[0];
    console.log('✅ Client Record Found:');
    console.log(`   Business Name: "${client.client_name}"`);
    console.log(`   Client ID: ${client.id}`);
    console.log(`   Client Code: ${client.client_code}`);
    console.log(`   Client Type: ${client.client_type}`);
    console.log(`   Active: ${client.is_active}`);
    
    // Get associated organization
    const { data: orgs } = await supabase
      .from('core_organizations')
      .select('*')
      .eq('client_id', client.id);
    
    if (orgs && orgs.length > 0) {
      const org = orgs[0];
      console.log('\n✅ Organization Record Found:');
      console.log(`   Organization Name: "${org.name}"`);
      console.log(`   Organization ID: ${org.id}`);
      console.log(`   Organization Code: ${org.org_code}`);
      console.log(`   Industry: ${org.industry}`);
      console.log(`   Country: ${org.country}`);
      console.log(`   Currency: ${org.currency}`);
    }
    
    // Get all dynamic data for both client and organization
    const entityIds = [client.id];
    if (orgs && orgs.length > 0) {
      entityIds.push(orgs[0].id);
    }
    
    const { data: dynamicData } = await supabase
      .from('core_dynamic_data')
      .select('*')
      .in('entity_id', entityIds)
      .order('field_name');
    
    console.log('\n✅ Dynamic Data Records Found:');
    
    // Organize data by field names
    const dataMap = {};
    dynamicData?.forEach(record => {
      dataMap[record.field_name] = record.field_value;
    });
    
    // Display the specific data fields requested by the user
    const requestedFields = {
      'business_name': 'businessName',
      'cuisine_specialization': 'cuisineType', 
      'business_email': 'businessEmail',
      'location_name': 'locationName',
      'full_address': 'address',
      'city': 'city',
      'state': 'state',
      'postal_code': 'postalCode',
      'opening_hours': 'openingTime/closingTime',
      'seating_capacity': 'seatingCapacity',
      'manager_name': 'managerName',
      'manager_email': 'managerEmail',
      'manager_phone': 'managerPhone'
    };
    
    console.log('\n📋 Requested Data Fields:');
    Object.entries(requestedFields).forEach(([dbField, userField]) => {
      const value = dataMap[dbField] || 'Not found';
      console.log(`   ${userField}: "${value}"`);
    });
    
    console.log('\n📊 Summary:');
    console.log(`   Total dynamic data records: ${dynamicData?.length || 0}`);
    console.log(`   Client records: ${clients.length}`);
    console.log(`   Organization records: ${orgs?.length || 0}`);
    
    // Verify all requested data is present
    const missingFields = Object.keys(requestedFields).filter(field => !dataMap[field]);
    if (missingFields.length === 0) {
      console.log('\n🎉 SUCCESS: All requested Chef Lebanon Restaurant data has been created and saved to the database!');
    } else {
      console.log(`\n⚠️  Missing fields: ${missingFields.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Verification error:', error);
  }
}

verifyChefLebanonData();