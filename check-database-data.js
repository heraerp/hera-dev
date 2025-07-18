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

async function checkDatabaseData() {
  console.log('🔍 Checking existing database data...');
  console.log('=====================================');
  
  try {
    // Check core_clients table
    const { data: clients, error: clientError } = await supabase
      .from('core_clients')
      .select('*')
      .limit(10);
    
    if (clientError) {
      console.error('❌ Error querying core_clients:', clientError);
    } else {
      console.log(`📊 core_clients table: ${clients.length} records`);
      clients.forEach((client, index) => {
        console.log(`   ${index + 1}. ID: ${client.id}, Name: "${client.client_name}", Code: "${client.client_code}"`);
      });
    }

    // Check core_entities table
    const { data: entities, error: entityError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('entity_type', 'client')
      .limit(10);
    
    if (entityError) {
      console.error('❌ Error querying core_entities:', entityError);
    } else {
      console.log(`\n📊 core_entities (client type): ${entities.length} records`);
      entities.forEach((entity, index) => {
        console.log(`   ${index + 1}. ID: ${entity.id}, Name: "${entity.entity_name}", Code: "${entity.entity_code}"`);
      });
    }

    // Check core_organizations table
    const { data: orgs, error: orgError } = await supabase
      .from('core_organizations')
      .select('*')
      .limit(10);
    
    if (orgError) {
      console.error('❌ Error querying core_organizations:', orgError);
    } else {
      console.log(`\n📊 core_organizations table: ${orgs.length} records`);
      orgs.forEach((org, index) => {
        console.log(`   ${index + 1}. ID: ${org.id}, Name: "${org.name}", Code: "${org.org_code}"`);
      });
    }

    // Look for Chef Lebanon Restaurant specifically
    console.log('\n🔍 Searching for "Chef Lebanon Restaurant" data...');
    
    const { data: chefLebanonClients } = await supabase
      .from('core_clients')
      .select('*')
      .ilike('client_name', '%Chef Lebanon%');
    
    if (chefLebanonClients && chefLebanonClients.length > 0) {
      console.log(`✅ Found ${chefLebanonClients.length} Chef Lebanon client records:`);
      chefLebanonClients.forEach((client, index) => {
        console.log(`   ${index + 1}. ID: ${client.id}, Name: "${client.client_name}", Code: "${client.client_code}", Active: ${client.is_active}`);
      });
    } else {
      console.log('❌ No Chef Lebanon Restaurant client records found');
    }

    // Check dynamic data for Chef Lebanon
    const { data: dynamicData } = await supabase
      .from('core_dynamic_data')
      .select('*')
      .eq('field_name', 'business_name')
      .eq('field_value', 'Chef Lebanon Restaurant');
    
    if (dynamicData && dynamicData.length > 0) {
      console.log(`✅ Found ${dynamicData.length} Chef Lebanon dynamic data records`);
    } else {
      console.log('❌ No Chef Lebanon dynamic data records found');
    }

  } catch (error) {
    console.error('❌ Database query error:', error);
  }
}

checkDatabaseData();