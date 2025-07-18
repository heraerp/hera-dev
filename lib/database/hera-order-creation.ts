// HERA Order Creation - Universal Schema Implementation
import { supabase } from './supabase';

// Function to create new order in universal_transactions
export async function createOrder(orderData: {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  specialInstructions?: string;
  tableNumber?: string;
  orderType?: string;
}) {
  try {
    // Step 1: Create the main order transaction
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10)}-${Date.now().toString().slice(-3)}`;
    
    const { data: orderTransaction, error: orderError } = await supabase
      .from('universal_transactions')
      .insert({
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        transaction_type: 'SALES_ORDER',
        transaction_number: orderNumber,
        transaction_date: new Date().toISOString().split('T')[0],
        total_amount: orderData.totalAmount,
        currency: 'USD',
        status: 'PENDING'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Step 2: Create order line items
    const orderLines = orderData.items.map((item, index) => ({
      transaction_id: orderTransaction.id,
      entity_id: item.productId,
      line_description: `Order item ${index + 1}`,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_amount: item.quantity * item.unitPrice,
      line_order: index + 1
    }));

    const { data: lineItems, error: lineError } = await supabase
      .from('universal_transaction_lines')
      .insert(orderLines)
      .select();

    if (lineError) throw lineError;

    // Step 3: Add order metadata
    const { error: metadataError } = await supabase
      .from('core_metadata')
      .insert({
        organization_id: '550e8400-e29b-41d4-a716-446655440001',
        entity_type: 'transaction',
        entity_id: orderTransaction.id,
        metadata_type: 'order_context',
        metadata_category: 'customer_experience',
        metadata_key: 'order_details',
        metadata_value: {
          customer_id: orderData.customerId,
          order_time: new Date().toISOString(),
          special_instructions: orderData.specialInstructions || '',
          order_channel: 'pos_system',
          table_number: orderData.tableNumber || '5',
          order_type: orderData.orderType || 'dine_in'
        },
        is_system_generated: false,
        created_by: '550e8400-e29b-41d4-a716-446655440011' // Mike (staff)
      });

    if (metadataError) throw metadataError;

    console.log('✅ Order successfully created in HERA Universal Schema:', {
      orderNumber: orderNumber,
      orderId: orderTransaction.id,
      customerId: orderData.customerId,
      totalAmount: orderData.totalAmount,
      itemCount: lineItems.length
    });

    return {
      success: true,
      order: orderTransaction,
      lineItems: lineItems,
      orderNumber: orderNumber
    };

  } catch (error) {
    console.error('Order creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to get product details for order creation
export async function getProductsForOrder() {
  try {
    // Get product entities
    const { data: products, error: productError } = await supabase
      .from('core_entities')
      .select('id, entity_name, entity_code')
      .eq('entity_type', 'product')
      .eq('organization_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479')
      .eq('is_active', true);

    if (productError) throw productError;

    // Get product dynamic data (prices, descriptions, etc.)
    const productIds = products.map(p => p.id);
    const { data: productData, error: dataError } = await supabase
      .from('core_dynamic_data')
      .select('entity_id, field_name, field_value, field_type')
      .in('entity_id', productIds);

    if (dataError) throw dataError;

    // Combine product info with dynamic data
    const productsWithData = products.map(product => {
      const fields = productData.filter(d => d.entity_id === product.id);
      const fieldMap = {};
      fields.forEach(field => {
        fieldMap[field.field_name] = field.field_value;
      });

      return {
        id: product.id,
        name: product.entity_name,
        code: product.entity_code,
        price: parseFloat(fieldMap.price || '0'),
        description: fieldMap.description || '',
        category: fieldMap.category || '',
        inventory_count: parseInt(fieldMap.inventory_count || '0'),
        ...fieldMap
      };
    });

    return { success: true, products: productsWithData };

  } catch (error) {
    console.error('Product fetch error:', error);
    return { success: false, error: error.message };
  }
}

// Function to get customer data for order creation
export async function getCustomersForOrder() {
  try {
    // Get customer entities
    const { data: customers, error: customerError } = await supabase
      .from('core_entities')
      .select('id, entity_name, entity_code')
      .eq('entity_type', 'customer')
      .eq('organization_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479')
      .eq('is_active', true);

    if (customerError) throw customerError;

    // Get customer dynamic data
    const customerIds = customers.map(c => c.id);
    const { data: customerData, error: dataError } = await supabase
      .from('core_dynamic_data')
      .select('entity_id, field_name, field_value')
      .in('entity_id', customerIds);

    if (dataError) throw dataError;

    // Combine customer info with dynamic data
    const customersWithData = customers.map(customer => {
      const fields = customerData.filter(d => d.entity_id === customer.id);
      const fieldMap = {};
      fields.forEach(field => {
        fieldMap[field.field_name] = field.field_value;
      });

      return {
        id: customer.id,
        name: customer.entity_name,
        code: customer.entity_code,
        email: fieldMap.email || '',
        phone: fieldMap.phone || '',
        loyaltyPoints: parseInt(fieldMap.loyalty_points || '0'),
        visitCount: parseInt(fieldMap.visit_count || '0'),
        ...fieldMap
      };
    });

    return { success: true, customers: customersWithData };

  } catch (error) {
    console.error('Customer fetch error:', error);
    return { success: false, error: error.message };
  }
}

// Function to get orders with proper HERA Universal Schema queries
export async function getOrdersWithUniversalSchema() {
  try {
    console.log('📋 Querying orders with filters:', {
      transaction_type: 'SALES_ORDER',
      organization_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    });
    
    // Get order transactions
    const { data: orders, error: orderError } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('transaction_type', 'SALES_ORDER')
      .eq('organization_id', 'f47ac10b-58cc-4372-a567-0e02b2c3d479')
      .order('created_at', { ascending: false })
      .limit(50);

    if (orderError) {
      console.error('❌ Order query error:', orderError);
      throw orderError;
    }
    
    console.log(`📦 Found ${orders?.length || 0} orders in universal_transactions table`);

    // Get order line items
    const orderIds = orders.map(o => o.id);
    console.log(`🔍 Loading line items for ${orderIds.length} orders`);
    
    const { data: lineItems, error: lineError } = await supabase
      .from('universal_transaction_lines')
      .select('*')
      .in('transaction_id', orderIds);

    if (lineError) {
      console.error('❌ Line items query error:', lineError);
      throw lineError;
    }
    
    console.log(`📝 Found ${lineItems?.length || 0} line items`);

    // Get order metadata from core_dynamic_data
    console.log(`🏷️ Loading metadata for orders`);
    const { data: metadata, error: metadataError } = await supabase
      .from('core_dynamic_data')
      .select('*')
      .eq('entity_type', 'transaction')
      .in('entity_id', orderIds)
      .in('entity_id', orderIds);

    if (metadataError) {
      console.error('❌ Metadata query error:', metadataError);
      throw metadataError;
    }
    
    console.log(`🏷️ Found ${metadata?.length || 0} metadata records`);

    // Combine all data
    console.log('🔄 Combining order data...');
    const ordersWithDetails = orders.map(order => {
      const items = lineItems.filter(item => item.transaction_id === order.id);
      const orderMetadata = metadata.filter(m => m.entity_id === order.id);
      
      // Build metadata object from field-value pairs
      const metaData: any = {};
      orderMetadata.forEach(field => {
        metaData[field.field_name] = field.field_value;
      });
      
      const combinedOrder = {
        id: order.id,
        transaction_number: order.transaction_number,
        transaction_date: order.transaction_date,
        status: order.status,
        total_amount: order.total_amount,
        currency: order.currency,
        order_items: items,
        metadata: metaData,
        customer_name: metaData.customer_id || 'Unknown',
        special_instructions: metaData.special_instructions || '',
        table_number: metaData.table_number || '',
        order_type: metaData.order_type || 'dine_in',
        preparation_status: metaData.preparation_status || 'pending',
        order_time: order.created_at,
        created_at: order.created_at,
        updated_at: order.updated_at
      };
      
      console.log(`📋 Order ${order.transaction_number}:`, {
        id: order.id,
        status: order.status,
        items: items.length,
        hasMetadata: orderMetadata.length > 0,
        customer: metaData.customer_id || 'None',
        table: metaData.table_number || 'None',
        prepStatus: metaData.preparation_status || 'pending'
      });
      
      return combinedOrder;
    });

    console.log(`✅ Successfully combined ${ordersWithDetails.length} orders with full details`);
    return { success: true, orders: ordersWithDetails };

  } catch (error) {
    console.error('Orders fetch error:', error);
    return { success: false, error: error.message };
  }
}