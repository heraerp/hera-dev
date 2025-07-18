import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

test.describe('Database Verification Tests', () => {
  test('should verify restaurant data was created in database', async ({ page }) => {
    console.log('🔍 Verifying database entries for Chef Lebanon Restaurant...');
    
    // First, let's run the setup process to ensure data is created
    await page.goto('http://localhost:3000/setup/restaurant');
    await page.waitForLoadState('networkidle');
    
    // Complete the setup workflow
    console.log('📝 Running setup workflow to create data...');
    
    // Step 1: Business Information
    await page.fill('#businessName', 'Chef Lebanon Restaurant');
    await page.fill('#cuisineType', 'Lebanese');
    await page.fill('#businessEmail', 'info@cheflebanon.com');
    await page.fill('#primaryPhone', '+91 9876543210');
    await page.fill('#website', 'www.cheflebanon.com');
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    // Step 2: Location Details
    await page.fill('#locationName', 'Kottakkal Branch');
    await page.fill('#address', '123 Main Street, Near Bus Stand, Kottakkal');
    await page.fill('#city', 'Kottakkal');
    await page.fill('#postalCode', '676503');
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    // Step 3: Operations Setup
    await page.fill('#openingTime', '08:00');
    await page.fill('#closingTime', '22:00');
    await page.fill('#seatingCapacity', '40');
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    // Step 4: Manager Information
    await page.fill('#managerName', 'Ahmed Hassan');
    await page.fill('#managerEmail', 'ahmed@cheflebanon.com');
    await page.fill('#managerPhone', '+91 9876543211');
    
    // Complete setup
    await page.click('button:has-text("Complete Setup")');
    await page.waitForTimeout(5000); // Wait for database operations
    
    console.log('✅ Setup completed, now querying database...');
    
    // Now query the database to verify data was created
    await verifyDatabaseEntries();
  });

  test('should query existing restaurant data from database', async () => {
    console.log('🔍 Querying database for existing Chef Lebanon Restaurant data...');
    await verifyDatabaseEntries();
  });
});

async function verifyDatabaseEntries() {
  console.log('📊 Checking core_clients table...');
  
  // Query core_clients for Chef Lebanon Restaurant
  const { data: clients, error: clientsError } = await supabase
    .from('core_clients')
    .select('*')
    .ilike('client_name', '%Chef Lebanon%');
  
  if (clientsError) {
    console.error('❌ Error querying core_clients:', clientsError);
  } else {
    console.log(`✅ Found ${clients?.length || 0} client records:`);
    clients?.forEach((client, index) => {
      console.log(`  Client ${index + 1}:`);
      console.log(`    ID: ${client.id}`);
      console.log(`    Name: ${client.client_name}`);
      console.log(`    Code: ${client.client_code}`);
      console.log(`    Type: ${client.client_type}`);
      console.log(`    Active: ${client.is_active}`);
    });
  }
  
  console.log('📊 Checking core_organizations table...');
  
  // Query core_organizations for Kottakkal Branch
  const { data: organizations, error: orgsError } = await supabase
    .from('core_organizations')
    .select('*')
    .or('name.ilike.%Chef Lebanon%,name.ilike.%Kottakkal%');
  
  if (orgsError) {
    console.error('❌ Error querying core_organizations:', orgsError);
  } else {
    console.log(`✅ Found ${organizations?.length || 0} organization records:`);
    organizations?.forEach((org, index) => {
      console.log(`  Organization ${index + 1}:`);
      console.log(`    ID: ${org.id}`);
      console.log(`    Name: ${org.name}`);
      console.log(`    Code: ${org.org_code}`);
      console.log(`    Client ID: ${org.client_id}`);
      console.log(`    Industry: ${org.industry}`);
      console.log(`    Country: ${org.country}`);
      console.log(`    Currency: ${org.currency}`);
    });
  }
  
  console.log('📊 Checking core_entities table...');
  
  // Query core_entities for restaurant entities
  const { data: entities, error: entitiesError } = await supabase
    .from('core_entities')
    .select('*')
    .or('entity_name.ilike.%Chef Lebanon%,entity_name.ilike.%Kottakkal%');
  
  if (entitiesError) {
    console.error('❌ Error querying core_entities:', entitiesError);
  } else {
    console.log(`✅ Found ${entities?.length || 0} entity records:`);
    entities?.forEach((entity, index) => {
      console.log(`  Entity ${index + 1}:`);
      console.log(`    ID: ${entity.id}`);
      console.log(`    Type: ${entity.entity_type}`);
      console.log(`    Name: ${entity.entity_name}`);
      console.log(`    Code: ${entity.entity_code}`);
      console.log(`    Org ID: ${entity.organization_id}`);
    });
  }
  
  console.log('📊 Checking core_dynamic_data table...');
  
  // Get entity IDs to query dynamic data
  if (entities && entities.length > 0) {
    const entityIds = entities.map(e => e.id);
    
    const { data: dynamicData, error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .select('*')
      .in('entity_id', entityIds);
    
    if (dynamicError) {
      console.error('❌ Error querying core_dynamic_data:', dynamicError);
    } else {
      console.log(`✅ Found ${dynamicData?.length || 0} dynamic data records:`);
      
      // Group by entity_id for better display
      const groupedData: { [key: string]: any[] } = {};
      dynamicData?.forEach(data => {
        if (!groupedData[data.entity_id]) {
          groupedData[data.entity_id] = [];
        }
        groupedData[data.entity_id].push(data);
      });
      
      Object.entries(groupedData).forEach(([entityId, dataRecords]) => {
        console.log(`  Entity ${entityId}:`);
        dataRecords.forEach(record => {
          console.log(`    ${record.field_name}: ${record.field_value} (${record.field_type})`);
        });
      });
      
      // Verify specific data fields
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
      
      console.log('🔍 Verifying expected field values...');
      Object.entries(expectedFields).forEach(([fieldName, expectedValue]) => {
        const found = dynamicData?.find(d => d.field_name === fieldName && d.field_value === expectedValue);
        if (found) {
          console.log(`✅ ${fieldName}: ${expectedValue} ✓`);
        } else {
          console.log(`❌ ${fieldName}: ${expectedValue} ✗`);
        }
      });
    }
  }
  
  // Final summary
  const totalRecords = (clients?.length || 0) + (organizations?.length || 0) + (entities?.length || 0);
  console.log('');
  console.log('📊 Database Verification Summary:');
  console.log(`   Clients: ${clients?.length || 0}`);
  console.log(`   Organizations: ${organizations?.length || 0}`);
  console.log(`   Entities: ${entities?.length || 0}`);
  console.log(`   Dynamic Data Fields: ${dynamicData?.length || 0}`);
  console.log(`   Total Records: ${totalRecords}`);
  
  if (totalRecords > 0) {
    console.log('🎉 Restaurant data successfully found in database!');
  } else {
    console.log('⚠️ No restaurant data found - setup may not have completed successfully');
  }
}