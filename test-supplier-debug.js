/**
 * Debug Purchase Order Supplier Information
 * 
 * Tests the approval API to see what supplier data is being returned
 */

const testSupplierData = async () => {
  console.log('🔍 Testing Purchase Order Supplier Data\n');

  const baseURL = 'http://localhost:3005';
  const organizationId = '123e4567-e89b-12d3-a456-426614174000';
  
  try {
    console.log('1️⃣ Testing approval API endpoint...');
    const response = await fetch(`${baseURL}/api/purchasing/purchase-orders/approve?organizationId=${organizationId}&status=all`);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('   Status:', response.status);
    console.log('   POs found:', result.data?.length || 0);
    console.log('   Summary:', result.summary);

    if (result.data && result.data.length > 0) {
      console.log('\n📋 Purchase Order Details:');
      
      result.data.forEach((po, index) => {
        console.log(`\n   ${index + 1}. PO: ${po.poNumber}`);
        console.log(`      Amount: $${po.amount.toLocaleString()}`);
        console.log(`      Status: ${po.status}`);
        console.log(`      Supplier ID: ${po.supplierInfo?.supplierId || 'Not set'}`);
        console.log(`      Supplier Name: ${po.supplierInfo?.supplierName || 'Not set'}`);
        console.log(`      Items: ${po.items?.length || 0} items`);
        console.log(`      Created: ${new Date(po.date).toLocaleDateString()}`);
      });

      // Test specific cases
      const unknownSuppliers = result.data.filter(po => 
        po.supplierInfo?.supplierName === 'Unknown Supplier'
      );

      const knownSuppliers = result.data.filter(po => 
        po.supplierInfo?.supplierName !== 'Unknown Supplier'
      );

      console.log(`\n📊 Supplier Resolution Status:`);
      console.log(`   ✅ Known suppliers: ${knownSuppliers.length}`);
      console.log(`   ❌ Unknown suppliers: ${unknownSuppliers.length}`);

      if (unknownSuppliers.length > 0) {
        console.log(`\n❌ POs with Unknown Suppliers:`);
        unknownSuppliers.forEach(po => {
          console.log(`   - ${po.poNumber}: Supplier ID = ${po.supplierInfo?.supplierId}`);
        });
      }
    } else {
      console.log('\n📋 No purchase orders found');
    }

    console.log('\n✅ Supplier data test completed!');
    
  } catch (error) {
    console.error('\n❌ Supplier data test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure the development server is running:');
      console.log('   npm run dev');
    }
  }
};

// Run the test
testSupplierData();