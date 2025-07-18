/**
 * Customer Service Integration Test
 * 
 * Tests the CustomerCrudService TypeScript service
 * Run with: node test-customer-service-integration.js
 */

const { CustomerCrudService } = require('./lib/services/customerCrudService.ts');
require('dotenv').config({ path: '.env.local' });

// Test configuration
const TEST_ORG_ID = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';

async function testCustomerService() {
  console.log('🧪 Testing CustomerCrudService Integration');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Create Customer
    console.log('\n📝 Creating customer via service...');
    const customerInput = {
      organizationId: TEST_ORG_ID,
      entity_name: 'Service Test Customer',
      entity_code: 'SVC-TEST-001',
      metadata: {
        email: 'service.test@example.com',
        phone: '+1-555-SERVICE',
        first_name: 'Service',
        last_name: 'Test',
        customer_type: 'individual',
        birth_date: '1990-05-15',
        preferred_name: 'Service',
        acquisition_source: 'test',
        preferred_contact_method: 'email',
        notes: 'Test customer created via service',
        total_visits: 0,
        lifetime_value: 0,
        average_order_value: 0,
        last_visit_date: '2024-01-15',
        loyalty_tier: 'bronze',
        loyalty_points: 0,
        favorite_teas: ['earl_grey'],
        caffeine_preference: 'moderate',
        temperature_preference: 'hot',
        dietary_restrictions: [],
        allergies: [],
        status: 'active',
        is_draft: false,
        created_by: 'test_system',
        updated_by: 'test_system'
      }
    };
    
    const createResult = await CustomerCrudService.createCustomer(customerInput);
    
    if (createResult.success) {
      console.log('✅ Customer created successfully!');
      console.log('   ID:', createResult.data.id);
      console.log('   Name:', createResult.data.entity_name);
      console.log('   Email:', createResult.data.metadata.email);
      
      const customerId = createResult.data.id;
      
      // Test 2: Get Customer
      console.log('\n📖 Getting customer via service...');
      const getResult = await CustomerCrudService.getCustomer(TEST_ORG_ID, customerId);
      
      if (getResult.success) {
        console.log('✅ Customer retrieved successfully!');
        console.log('   Name:', getResult.data.entity_name);
        console.log('   Email:', getResult.data.metadata.email);
      } else {
        console.error('❌ Failed to get customer:', getResult.error);
      }
      
      // Test 3: List Customers
      console.log('\n📋 Listing customers via service...');
      const listResult = await CustomerCrudService.listCustomers(TEST_ORG_ID, {
        limit: 10,
        offset: 0
      });
      
      if (listResult.success) {
        console.log('✅ Customers listed successfully!');
        console.log('   Total customers:', listResult.data.total);
        console.log('   Customers returned:', listResult.data.customers.length);
      } else {
        console.error('❌ Failed to list customers:', listResult.error);
      }
      
      // Test 4: Update Customer
      console.log('\n📝 Updating customer via service...');
      const updateResult = await CustomerCrudService.updateCustomer(TEST_ORG_ID, customerId, {
        entity_name: 'Updated Service Test Customer',
        metadata: {
          email: 'updated.service.test@example.com',
          customer_type: 'vip',
          loyalty_tier: 'gold'
        }
      });
      
      if (updateResult.success) {
        console.log('✅ Customer updated successfully!');
        console.log('   Name:', updateResult.data.entity_name);
        console.log('   Email:', updateResult.data.metadata.email);
        console.log('   Type:', updateResult.data.metadata.customer_type);
      } else {
        console.error('❌ Failed to update customer:', updateResult.error);
      }
      
      // Test 5: Delete Customer
      console.log('\n🗑️ Deleting customer via service...');
      const deleteResult = await CustomerCrudService.deleteCustomer(TEST_ORG_ID, customerId);
      
      if (deleteResult.success) {
        console.log('✅ Customer deleted successfully!');
      } else {
        console.error('❌ Failed to delete customer:', deleteResult.error);
      }
      
    } else {
      console.error('❌ Failed to create customer:', createResult.error);
    }
    
    console.log('\n🎉 Service integration test completed!');
    
  } catch (error) {
    console.error('❌ Service integration test failed:', error);
  }
}

// Run test
testCustomerService();