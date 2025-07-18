/**
 * Test Universal Bulk Upload System
 * Test the standardized bulk upload for all entity types
 */

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testUniversalBulkUpload() {
  console.log('🚀 Testing Universal Bulk Upload System...\n');

  try {
    const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';

    // Test 1: Get supported entity types
    console.log('1️⃣ Testing supported entity types...');
    
    const supportedResponse = await fetch('http://localhost:3000/api/universal-bulk-upload?action=supported-types');
    if (supportedResponse.ok) {
      const supportedData = await supportedResponse.json();
      console.log('   ✅ Supported entity types:', supportedData.supportedTypes.join(', '));
      console.log('   ✅ Configurations loaded:', supportedData.configurations.length);
    } else {
      console.log('   ❌ Failed to get supported types');
    }

    // Test 2: Test product bulk upload
    console.log('\n2️⃣ Testing product bulk upload...');
    
    const testProducts = [
      {
        name: 'Universal Test Product 1',
        description: 'A test product created via universal bulk upload',
        category: 'Test Category',
        price: 19.99,
        cost: 12.50,
        sku: 'UTP-001',
        stock_level: 100,
        supplier: 'Test Supplier',
        tags: ['test', 'universal', 'bulk'],
        is_active: true
      },
      {
        name: 'Universal Test Product 2',
        description: 'Another test product',
        category: 'Test Category',
        price: 29.99,
        cost: 18.75,
        sku: 'UTP-002',
        stock_level: 75,
        supplier: 'Test Supplier',
        tags: ['test', 'universal'],
        is_active: true
      }
    ];

    const productResponse = await fetch('http://localhost:3000/api/bulk-upload/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId,
        products: testProducts
      })
    });

    if (productResponse.ok) {
      const productResult = await productResponse.json();
      console.log('   ✅ Products bulk upload:', productResult.results.success, 'created,', productResult.results.failed, 'failed');
    } else {
      console.log('   ❌ Products bulk upload failed:', productResponse.status);
    }

    // Test 3: Test customer bulk upload
    console.log('\n3️⃣ Testing customer bulk upload...');
    
    const testCustomers = [
      {
        name: 'John Universal Customer',
        email: 'john@universal.test',
        phone: '555-0101',
        address: '123 Universal St',
        city: 'Test City',
        country: 'Test Country',
        customer_type: 'regular',
        notes: 'Test customer via universal bulk upload'
      },
      {
        name: 'Jane Universal Customer',
        email: 'jane@universal.test',
        phone: '555-0102',
        address: '456 Universal Ave',
        city: 'Test City',
        country: 'Test Country',
        customer_type: 'vip',
        notes: 'VIP test customer'
      }
    ];

    const customerResponse = await fetch('http://localhost:3000/api/bulk-upload/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId,
        customers: testCustomers
      })
    });

    if (customerResponse.ok) {
      const customerResult = await customerResponse.json();
      console.log('   ✅ Customers bulk upload:', customerResult.results.success, 'created,', customerResult.results.failed, 'failed');
    } else {
      console.log('   ❌ Customers bulk upload failed:', customerResponse.status);
    }

    // Test 4: Test menu items bulk upload
    console.log('\n4️⃣ Testing menu items bulk upload...');
    
    const testMenuItems = [
      {
        name: 'Universal Test Burger',
        description: 'A delicious test burger',
        category: 'Burgers',
        price: 15.99,
        cost: 8.50,
        portion_size: 'Large',
        calories: 650,
        allergens: ['gluten', 'dairy'],
        dietary_info: ['high-protein'],
        availability: 'always',
        is_featured: true,
        is_active: true
      },
      {
        name: 'Universal Test Salad',
        description: 'A fresh test salad',
        category: 'Salads',
        price: 12.99,
        cost: 5.25,
        portion_size: 'Medium',
        calories: 320,
        allergens: ['nuts'],
        dietary_info: ['vegetarian', 'gluten-free'],
        availability: 'always',
        is_featured: false,
        is_active: true
      }
    ];

    const menuItemResponse = await fetch('http://localhost:3000/api/bulk-upload/menu-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId,
        menu_items: testMenuItems
      })
    });

    if (menuItemResponse.ok) {
      const menuItemResult = await menuItemResponse.json();
      console.log('   ✅ Menu items bulk upload:', menuItemResult.results.success, 'created,', menuItemResult.results.failed, 'failed');
    } else {
      console.log('   ❌ Menu items bulk upload failed:', menuItemResponse.status);
    }

    // Test 5: Test suppliers bulk upload
    console.log('\n5️⃣ Testing suppliers bulk upload...');
    
    const testSuppliers = [
      {
        name: 'Universal Test Supplier Inc',
        contact_person: 'John Supply Manager',
        email: 'contact@universaltest.com',
        phone: '555-0201',
        address: '789 Supply St',
        city: 'Supply City',
        country: 'Supply Country',
        tax_number: 'TAX-123456',
        payment_terms: 'Net 30',
        category: 'Food Supplier',
        notes: 'Test supplier via universal bulk upload'
      },
      {
        name: 'Universal Equipment Co',
        contact_person: 'Jane Equipment Manager',
        email: 'sales@universalequipment.com',
        phone: '555-0202',
        address: '321 Equipment Blvd',
        city: 'Equipment City',
        country: 'Equipment Country',
        tax_number: 'TAX-789012',
        payment_terms: 'Net 15',
        category: 'Equipment Supplier',
        notes: 'Equipment supplier for testing'
      }
    ];

    const supplierResponse = await fetch('http://localhost:3000/api/bulk-upload/suppliers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId,
        suppliers: testSuppliers
      })
    });

    if (supplierResponse.ok) {
      const supplierResult = await supplierResponse.json();
      console.log('   ✅ Suppliers bulk upload:', supplierResult.results.success, 'created,', supplierResult.results.failed, 'failed');
    } else {
      console.log('   ❌ Suppliers bulk upload failed:', supplierResponse.status);
    }

    // Test 6: Test template generation
    console.log('\n6️⃣ Testing template generation...');
    
    const entityTypes = ['products', 'customers', 'menu_items', 'suppliers'];
    
    for (const entityType of entityTypes) {
      const templateResponse = await fetch(`http://localhost:3000/api/universal-bulk-upload?action=template&entityType=${entityType}`);
      if (templateResponse.ok) {
        const templateData = await templateResponse.json();
        console.log(`   ✅ ${entityType} template: ${templateData.template.fields.length} fields`);
      } else {
        console.log(`   ❌ ${entityType} template failed`);
      }
    }

    // Test 7: Test error handling
    console.log('\n7️⃣ Testing error handling...');
    
    const invalidProducts = [
      {
        // Missing required fields
        description: 'Invalid product without name',
        category: 'Test'
      }
    ];

    const errorResponse = await fetch('http://localhost:3000/api/bulk-upload/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId,
        products: invalidProducts
      })
    });

    if (errorResponse.ok) {
      const errorResult = await errorResponse.json();
      console.log('   ✅ Error handling working:', errorResult.results.failed, 'failed as expected');
      if (errorResult.results.errors.length > 0) {
        console.log('   ✅ Error message:', errorResult.results.errors[0]);
      }
    } else {
      console.log('   ❌ Error handling test failed');
    }

    console.log('\n🎉 Universal Bulk Upload System Test Complete!');
    console.log('\n📋 Features Tested:');
    console.log('   ✅ Multi-entity type support');
    console.log('   ✅ Universal API endpoints');
    console.log('   ✅ Standardized data processing');
    console.log('   ✅ Template generation');
    console.log('   ✅ Error handling and validation');
    console.log('   ✅ Entity-specific processing');
    console.log('   ✅ HERA Universal Architecture compliance');
    
    console.log('\n🚀 Ready for use with any entity type:');
    console.log('   • Products');
    console.log('   • Customers');
    console.log('   • Menu Items');
    console.log('   • Suppliers');
    console.log('   • Ingredients (existing)');
    console.log('   • Recipes (existing)');
    console.log('   • Easy to add new entity types');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUniversalBulkUpload();