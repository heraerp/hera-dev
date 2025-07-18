/**
 * Test the complete POS → Kitchen flow
 * Create a new order and verify it appears in kitchen display
 */

import { UniversalTransactionService } from './lib/services/universalTransactionService.js';

async function testKitchenFlow() {
  console.log('🧪 Testing complete POS → Kitchen flow...\n');
  
  const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';
  
  try {
    // 1. Create a test order
    console.log('📝 Creating test order...');
    const orderResult = await UniversalTransactionService.createOrder({
      organizationId,
      customerName: 'Kitchen Test Customer',
      tableNumber: 'Table 7',
      orderType: 'dine_in',
      specialInstructions: 'Extra spicy, no onions',
      waiterName: 'Test Waiter',
      items: [
        {
          productId: 'test-product-1',
          productName: 'Test Masala Chai',
          quantity: 2,
          unitPrice: 3.50
        },
        {
          productId: 'test-product-2', 
          productName: 'Test Samosa',
          quantity: 3,
          unitPrice: 2.25
        }
      ]
    });
    
    if (!orderResult.success) {
      throw new Error(`Order creation failed: ${orderResult.error}`);
    }
    
    console.log('✅ Order created successfully:', orderResult.data.transactionNumber);
    
    // 2. Wait a moment for any async processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Test kitchen display query
    console.log('\n🍳 Testing kitchen display query...');
    const kitchenResult = await UniversalTransactionService.getOrders(organizationId, {
      status: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'pending', 'confirmed', 'preparing', 'ready'],
      orderBy: { field: 'created_at', direction: 'desc' },
      limit: 10
    });
    
    if (!kitchenResult.success) {
      throw new Error(`Kitchen query failed: ${kitchenResult.error}`);
    }
    
    console.log(`✅ Kitchen query returned ${kitchenResult.data?.length || 0} orders:`);
    
    kitchenResult.data?.forEach((order, index) => {
      console.log(`\n${index + 1}. Order: ${order.transaction_number}`);
      console.log(`   Status: ${order.transaction_status}`);
      console.log(`   Items: ${order.line_items?.length || 0}`);
      console.log(`   Customer: ${order.metadata?.customer_name || 'No metadata'}`);
      console.log(`   Table: ${order.metadata?.table_number || 'No metadata'}`);
      console.log(`   Special Instructions: ${order.metadata?.special_instructions || 'None'}`);
      
      if (order.line_items) {
        order.line_items.forEach((item, itemIndex) => {
          console.log(`     ${itemIndex + 1}. ${item.quantity}x ${item.name} - $${item.price}`);
        });
      }
    });
    
    // 4. Test order status update
    const testOrderId = kitchenResult.data?.[0]?.id;
    if (testOrderId) {
      console.log(`\n🔄 Testing status update for order: ${testOrderId.slice(-8)}`);
      const updateResult = await UniversalTransactionService.updateOrderStatus(testOrderId, 'PREPARING');
      
      if (updateResult.success) {
        console.log('✅ Status update successful');
      } else {
        console.log('❌ Status update failed:', updateResult.error);
      }
    }
    
    console.log('\n🎉 Kitchen flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Kitchen flow test failed:', error);
    process.exit(1);
  }
}

testKitchenFlow();