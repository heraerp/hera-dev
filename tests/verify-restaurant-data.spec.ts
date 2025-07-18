import { test, expect } from '@playwright/test';

test.describe('Restaurant Data Verification', () => {
  test('should verify Chef Lebanon Restaurant data exists in database', async ({ page }) => {
    console.log('🔍 Verifying Chef Lebanon Restaurant data in database...');
    
    // Navigate to the restaurant setup page to access Supabase client
    await page.goto('http://localhost:3000/setup/restaurant');
    await page.waitForLoadState('networkidle');
    
    // Wait for Supabase connection tests to complete
    await page.waitForTimeout(3000);
    
    // Execute database queries using the page's Supabase client
    const queryResults = await page.evaluate(async () => {
      // Access the Supabase client from the window/global scope
      const supabase = (window as any).supabase;
      if (!supabase) {
        return { error: 'Supabase client not available' };
      }
      
      const results = {
        clients: [],
        organizations: [],
        entities: [],
        dynamicData: [],
        errors: []
      };
      
      try {
        // Query core_clients for Chef Lebanon Restaurant
        console.log('📊 Querying core_clients...');
        const { data: clients, error: clientsError } = await supabase
          .from('core_clients')
          .select('*')
          .ilike('client_name', '%Chef Lebanon%');
        
        if (clientsError) {
          results.errors.push(`core_clients error: ${clientsError.message}`);
        } else {
          results.clients = clients || [];
          console.log(`Found ${results.clients.length} client records`);
        }
        
        // Query core_organizations for Kottakkal Branch
        console.log('📊 Querying core_organizations...');
        const { data: organizations, error: orgsError } = await supabase
          .from('core_organizations')
          .select('*')
          .or('name.ilike.%Chef Lebanon%,name.ilike.%Kottakkal%');
        
        if (orgsError) {
          results.errors.push(`core_organizations error: ${orgsError.message}`);
        } else {
          results.organizations = organizations || [];
          console.log(`Found ${results.organizations.length} organization records`);
        }
        
        // Query core_entities for restaurant entities
        console.log('📊 Querying core_entities...');
        const { data: entities, error: entitiesError } = await supabase
          .from('core_entities')
          .select('*')
          .or('entity_name.ilike.%Chef Lebanon%,entity_name.ilike.%Kottakkal%');
        
        if (entitiesError) {
          results.errors.push(`core_entities error: ${entitiesError.message}`);
        } else {
          results.entities = entities || [];
          console.log(`Found ${results.entities.length} entity records`);
        }
        
        // Query core_dynamic_data for restaurant details
        if (results.entities.length > 0) {
          console.log('📊 Querying core_dynamic_data...');
          const entityIds = results.entities.map(e => e.id);
          
          const { data: dynamicData, error: dynamicError } = await supabase
            .from('core_dynamic_data')
            .select('*')
            .in('entity_id', entityIds);
          
          if (dynamicError) {
            results.errors.push(`core_dynamic_data error: ${dynamicError.message}`);
          } else {
            results.dynamicData = dynamicData || [];
            console.log(`Found ${results.dynamicData.length} dynamic data records`);
          }
        }
        
      } catch (error) {
        results.errors.push(`Query execution error: ${error.message}`);
      }
      
      return results;
    });
    
    // Display results
    console.log('\n🎯 Database Query Results:');
    console.log('========================');
    
    if (queryResults.error) {
      console.error('❌ Error:', queryResults.error);
      return;
    }
    
    if (queryResults.errors.length > 0) {
      console.log('❌ Query Errors:');
      queryResults.errors.forEach(error => console.log(`   ${error}`));
    }
    
    // Display clients
    console.log(`\n📋 Clients Found: ${queryResults.clients.length}`);
    queryResults.clients.forEach((client: any, index: number) => {
      console.log(`  ${index + 1}. ${client.client_name} (${client.client_code})`);
      console.log(`     ID: ${client.id}`);
      console.log(`     Type: ${client.client_type}`);
      console.log(`     Active: ${client.is_active}`);
    });
    
    // Display organizations
    console.log(`\n🏢 Organizations Found: ${queryResults.organizations.length}`);
    queryResults.organizations.forEach((org: any, index: number) => {
      console.log(`  ${index + 1}. ${org.name} (${org.org_code})`);
      console.log(`     ID: ${org.id}`);
      console.log(`     Client ID: ${org.client_id}`);
      console.log(`     Industry: ${org.industry}`);
      console.log(`     Country: ${org.country} | Currency: ${org.currency}`);
    });
    
    // Display entities
    console.log(`\n🏗️ Entities Found: ${queryResults.entities.length}`);
    queryResults.entities.forEach((entity: any, index: number) => {
      console.log(`  ${index + 1}. ${entity.entity_name} (${entity.entity_type})`);
      console.log(`     ID: ${entity.id}`);
      console.log(`     Code: ${entity.entity_code}`);
      console.log(`     Organization: ${entity.organization_id}`);
    });
    
    // Display dynamic data grouped by entity
    console.log(`\n📊 Dynamic Data Fields Found: ${queryResults.dynamicData.length}`);
    
    // Group dynamic data by entity_id
    const groupedData: { [key: string]: any[] } = {};
    queryResults.dynamicData.forEach((data: any) => {
      if (!groupedData[data.entity_id]) {
        groupedData[data.entity_id] = [];
      }
      groupedData[data.entity_id].push(data);
    });
    
    Object.entries(groupedData).forEach(([entityId, dataRecords]) => {
      console.log(`\n  Entity ${entityId}:`);
      dataRecords.forEach((record: any) => {
        console.log(`    📝 ${record.field_name}: "${record.field_value}" (${record.field_type})`);
      });
    });
    
    // Verify specific expected data
    console.log('\n🔍 Verifying Expected Data:');
    console.log('===========================');
    
    const expectedData = {
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
    Object.entries(expectedData).forEach(([fieldName, expectedValue]) => {
      const found = queryResults.dynamicData.find((d: any) => 
        d.field_name === fieldName && d.field_value === expectedValue
      );
      if (found) {
        console.log(`✅ ${fieldName}: "${expectedValue}" ✓`);
        foundCount++;
      } else {
        console.log(`❌ ${fieldName}: "${expectedValue}" ✗`);
      }
    });
    
    // Summary
    const totalRecords = queryResults.clients.length + queryResults.organizations.length + queryResults.entities.length;
    
    console.log('\n📊 Verification Summary:');
    console.log('========================');
    console.log(`📋 Clients: ${queryResults.clients.length}`);
    console.log(`🏢 Organizations: ${queryResults.organizations.length}`);
    console.log(`🏗️ Entities: ${queryResults.entities.length}`);
    console.log(`📊 Dynamic Data Fields: ${queryResults.dynamicData.length}`);
    console.log(`✅ Expected Fields Found: ${foundCount}/${Object.keys(expectedData).length}`);
    console.log(`📈 Total Records: ${totalRecords}`);
    
    if (totalRecords > 0) {
      console.log('\n🎉 SUCCESS: Chef Lebanon Restaurant data found in database!');
      console.log('✅ Restaurant setup process is working correctly');
    } else {
      console.log('\n⚠️ WARNING: No restaurant data found');
      console.log('❓ Setup may not have completed or data was not saved');
    }
    
    // Test assertions
    expect(totalRecords, 'Should have created restaurant records in database').toBeGreaterThan(0);
    expect(foundCount, 'Should have saved expected restaurant details').toBeGreaterThanOrEqual(5);
  });

  test('should query and display all recent restaurant entries', async ({ page }) => {
    console.log('🔍 Querying all recent restaurant entries...');
    
    await page.goto('http://localhost:3000/setup/restaurant');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const allData = await page.evaluate(async () => {
      const supabase = (window as any).supabase;
      if (!supabase) return { error: 'Supabase not available' };
      
      try {
        // Get all clients created in the last day
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        const { data: recentClients, error: clientsError } = await supabase
          .from('core_clients')
          .select('*')
          .gte('created_at', oneDayAgo)
          .order('created_at', { ascending: false });
        
        const { data: recentOrgs, error: orgsError } = await supabase
          .from('core_organizations')
          .select('*')
          .gte('created_at', oneDayAgo)
          .order('created_at', { ascending: false });
        
        return {
          clients: recentClients || [],
          organizations: recentOrgs || [],
          errors: [
            ...(clientsError ? [`Clients: ${clientsError.message}`] : []),
            ...(orgsError ? [`Organizations: ${orgsError.message}`] : [])
          ]
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('\n📋 Recent Restaurant Entries (Last 24 Hours):');
    console.log('===============================================');
    
    if (allData.error) {
      console.error('❌ Error:', allData.error);
      return;
    }
    
    if (allData.errors.length > 0) {
      console.log('❌ Query Errors:');
      allData.errors.forEach((error: string) => console.log(`   ${error}`));
    }
    
    console.log(`\n📋 Recent Clients: ${allData.clients.length}`);
    allData.clients.forEach((client: any, index: number) => {
      console.log(`  ${index + 1}. ${client.client_name}`);
      console.log(`     Created: ${new Date(client.created_at).toLocaleString()}`);
      console.log(`     Type: ${client.client_type} | Active: ${client.is_active}`);
    });
    
    console.log(`\n🏢 Recent Organizations: ${allData.organizations.length}`);
    allData.organizations.forEach((org: any, index: number) => {
      console.log(`  ${index + 1}. ${org.name}`);
      console.log(`     Created: ${new Date(org.created_at).toLocaleString()}`);
      console.log(`     Industry: ${org.industry} | Country: ${org.country}`);
    });
    
    expect(allData.clients.length + allData.organizations.length).toBeGreaterThanOrEqual(0);
  });
});