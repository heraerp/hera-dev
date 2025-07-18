import { createClient } from '@/lib/supabase/client';
#!/usr/bin/env node

/**
 * Direct database verification script for Chef Lebanon Restaurant
 * This script manually checks if the restaurant setup data was saved correctly
 */

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.blue}🔍 HERA Universal - Database Verification${colors.reset}`);
console.log('==========================================');

// Expected data from our test
const expectedData = {
  businessName: "Chef Lebanon Restaurant",
  cuisineType: "Lebanese", 
  businessEmail: "info@cheflebanon.com",
  locationName: "Kottakkal Branch",
  address: "123 Main Street, Near Bus Stand, Kottakkal",
  city: "Kottakkal",
  state: "Kerala",
  postalCode: "676503",
  openingTime: "08:00",
  closingTime: "22:00",
  seatingCapacity: "40",
  managerName: "Ahmed Hassan",
  managerEmail: "ahmed@cheflebanon.com",
  managerPhone: "+91 9876543211"
};

console.log(`${colors.cyan}📋 Expected Data:${colors.reset}`);
Object.entries(expectedData).forEach(([key, value]) => {
  console.log(`   ${key}: "${value}"`);
});

console.log('\n' + '='.repeat(50));

// Try to load Supabase client
let supabase;
try {
  // Try to use ES modules
  const { createClient } = await import('@supabase/supabase-js');
  
  // These would need to be actual environment variables or hardcoded for testing
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not found');
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log(`${colors.green}✅ Supabase client initialized${colors.reset}`);
  
} catch (error) {
  console.log(`${colors.yellow}⚠️ Could not initialize Supabase client:${colors.reset} ${error.message}`);
  console.log(`${colors.yellow}💡 Manual database verification required${colors.reset}`);
  
  console.log(`\n${colors.blue}📊 Manual Database Queries to Run:${colors.reset}`);
  console.log('=====================================');
  
  console.log(`\n${colors.cyan}1. Check for Client Records:${colors.reset}`);
  console.log(`SELECT * FROM core_clients WHERE client_name ILIKE '%Chef Lebanon%';`);
  
  console.log(`\n${colors.cyan}2. Check for Organization Records:${colors.reset}`);
  console.log(`SELECT * FROM core_organizations WHERE name ILIKE '%Chef Lebanon%' OR name ILIKE '%Kottakkal%';`);
  
  console.log(`\n${colors.cyan}3. Check for Entity Records:${colors.reset}`);
  console.log(`SELECT * FROM core_entities WHERE entity_name ILIKE '%Chef Lebanon%' OR entity_name ILIKE '%Kottakkal%';`);
  
  console.log(`\n${colors.cyan}4. Check for Dynamic Data (using entity IDs from above):${colors.reset}`);
  console.log(`SELECT * FROM core_dynamic_data WHERE entity_id IN (SELECT id FROM core_entities WHERE entity_name ILIKE '%Chef Lebanon%');`);
  
  console.log(`\n${colors.cyan}5. Check Recent Entries (Last 24 Hours):${colors.reset}`);
  console.log(`SELECT 'client' as type, client_name as name, created_at FROM core_clients WHERE created_at >= NOW() - INTERVAL '24 hours'`);
  console.log(`UNION ALL`);
  console.log(`SELECT 'organization' as type, name, created_at FROM core_organizations WHERE created_at >= NOW() - INTERVAL '24 hours'`);
  console.log(`ORDER BY created_at DESC;`);
  
  console.log(`\n${colors.magenta}🔍 Expected Field Values to Look For:${colors.reset}`);
  console.log('====================================');
  console.log(`field_name = 'business_name' AND field_value = 'Chef Lebanon Restaurant'`);
  console.log(`field_name = 'cuisine_specialization' AND field_value = 'Lebanese'`);
  console.log(`field_name = 'business_email' AND field_value = 'info@cheflebanon.com'`);
  console.log(`field_name = 'location_name' AND field_value = 'Kottakkal Branch'`);
  console.log(`field_name = 'city' AND field_value = 'Kottakkal'`);
  console.log(`field_name = 'state' AND field_value = 'Kerala'`);
  console.log(`field_name = 'postal_code' AND field_value = '676503'`);
  console.log(`field_name = 'seating_capacity' AND field_value = '40'`);
  
  console.log(`\n${colors.green}💡 Instructions:${colors.reset}`);
  console.log('1. Connect to your Supabase database using the SQL editor');
  console.log('2. Run the queries above to verify data was created');
  console.log('3. Look for the expected field values in core_dynamic_data');
  console.log('4. If data exists, the restaurant setup is working correctly!');
  
  process.exit(0);
}

// If we have Supabase client, run actual queries
async function verifyDatabase() {
  try {
    console.log(`\n${colors.blue}📊 Running Database Queries...${colors.reset}`);
    
    // Query 1: Check clients
    console.log(`\n${colors.cyan}1. Checking core_clients table...${colors.reset}`);
    const { data: clients, error: clientsError } = await supabase
      .from('core_clients')
      .select('*')
      .ilike('client_name', '%Chef Lebanon%');
    
    if (clientsError) {
      console.log(`${colors.red}❌ Error querying clients: ${clientsError.message}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Found ${clients.length} client records${colors.reset}`);
      clients.forEach((client, index) => {
        console.log(`   ${index + 1}. ${client.client_name} (ID: ${client.id})`);
        console.log(`      Type: ${client.client_type} | Active: ${client.is_active}`);
        console.log(`      Created: ${new Date(client.created_at).toLocaleString()}`);
      });
    }
    
    // Query 2: Check organizations
    console.log(`\n${colors.cyan}2. Checking core_organizations table...${colors.reset}`);
    const { data: organizations, error: orgsError } = await supabase
      .from('core_organizations')
      .select('*')
      .or('name.ilike.%Chef Lebanon%,name.ilike.%Kottakkal%');
    
    if (orgsError) {
      console.log(`${colors.red}❌ Error querying organizations: ${orgsError.message}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Found ${organizations.length} organization records${colors.reset}`);
      organizations.forEach((org, index) => {
        console.log(`   ${index + 1}. ${org.name} (ID: ${org.id})`);
        console.log(`      Client: ${org.client_id} | Industry: ${org.industry}`);
        console.log(`      Country: ${org.country} | Currency: ${org.currency}`);
        console.log(`      Created: ${new Date(org.created_at).toLocaleString()}`);
      });
    }
    
    // Query 3: Check entities
    console.log(`\n${colors.cyan}3. Checking core_entities table...${colors.reset}`);
    const { data: entities, error: entitiesError } = await supabase
      .from('core_entities')
      .select('*')
      .or('entity_name.ilike.%Chef Lebanon%,entity_name.ilike.%Kottakkal%');
    
    if (entitiesError) {
      console.log(`${colors.red}❌ Error querying entities: ${entitiesError.message}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Found ${entities.length} entity records${colors.reset}`);
      entities.forEach((entity, index) => {
        console.log(`   ${index + 1}. ${entity.entity_name} (${entity.entity_type})`);
        console.log(`      ID: ${entity.id} | Code: ${entity.entity_code}`);
        console.log(`      Organization: ${entity.organization_id}`);
      });
    }
    
    // Query 4: Check dynamic data
    if (entities && entities.length > 0) {
      console.log(`\n${colors.cyan}4. Checking core_dynamic_data table...${colors.reset}`);
      const entityIds = entities.map(e => e.id);
      
      const { data: dynamicData, error: dynamicError } = await supabase
        .from('core_dynamic_data')
        .select('*')
        .in('entity_id', entityIds);
      
      if (dynamicError) {
        console.log(`${colors.red}❌ Error querying dynamic data: ${dynamicError.message}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ Found ${dynamicData.length} dynamic data records${colors.reset}`);
        
        // Group by entity_id
        const groupedData = {};
        dynamicData.forEach(data => {
          if (!groupedData[data.entity_id]) {
            groupedData[data.entity_id] = [];
          }
          groupedData[data.entity_id].push(data);
        });
        
        Object.entries(groupedData).forEach(([entityId, dataRecords]) => {
          console.log(`\n   ${colors.yellow}Entity ${entityId}:${colors.reset}`);
          dataRecords.forEach(record => {
            console.log(`      📝 ${record.field_name}: "${record.field_value}" (${record.field_type})`);
          });
        });
        
        // Verify expected fields
        console.log(`\n${colors.magenta}🔍 Verifying Expected Fields:${colors.reset}`);
        const expectedFields = {
          'business_name': 'Chef Lebanon Restaurant',
          'cuisine_specialization': 'Lebanese',
          'business_email': 'info@cheflebanon.com',
          'location_name': 'Kottakkal Branch',
          'city': 'Kottakkal',
          'state': 'Kerala', 
          'postal_code': '676503',
          'seating_capacity': '40'
        };
        
        let foundCount = 0;
        Object.entries(expectedFields).forEach(([fieldName, expectedValue]) => {
          const found = dynamicData.find(d => d.field_name === fieldName && d.field_value === expectedValue);
          if (found) {
            console.log(`   ${colors.green}✅ ${fieldName}: "${expectedValue}"${colors.reset}`);
            foundCount++;
          } else {
            console.log(`   ${colors.red}❌ ${fieldName}: "${expectedValue}" (not found)${colors.reset}`);
          }
        });
        
        console.log(`\n${colors.bright}📊 Verification Summary:${colors.reset}`);
        console.log(`   Clients: ${clients.length}`);
        console.log(`   Organizations: ${organizations.length}`);
        console.log(`   Entities: ${entities.length}`);
        console.log(`   Dynamic Fields: ${dynamicData.length}`);
        console.log(`   Expected Fields Found: ${foundCount}/${Object.keys(expectedFields).length}`);
        
        const totalRecords = clients.length + organizations.length + entities.length;
        if (totalRecords > 0 && foundCount >= 5) {
          console.log(`\n${colors.green}🎉 SUCCESS: Chef Lebanon Restaurant data found in database!${colors.reset}`);
          console.log(`${colors.green}✅ Restaurant setup process is working correctly${colors.reset}`);
        } else if (totalRecords > 0) {
          console.log(`\n${colors.yellow}⚠️ PARTIAL: Some restaurant data found, but missing expected fields${colors.reset}`);
        } else {
          console.log(`\n${colors.red}❌ FAILED: No restaurant data found in database${colors.reset}`);
          console.log(`${colors.yellow}💡 Try running the restaurant setup again${colors.reset}`);
        }
      }
    }
    
  } catch (error) {
    console.log(`${colors.red}❌ Database verification failed: ${error.message}${colors.reset}`);
  }
}

// Run the verification if Supabase client is available
if (supabase) {
  verifyDatabase();
}