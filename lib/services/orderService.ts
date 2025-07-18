import UniversalCrudService from '@/lib/services/universalCrudService';
import { OrderEntity, OrderWithDetails, OrderInput, OrderSearchFilters, CustomerWithDetails, CustomerInput } from '@/types/order';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Order field definitions following HERA universal schema
export const ORDER_FIELDS = {
  customer_id: 'text',
  customer_name: 'text',
  customer_phone: 'text',
  customer_email: 'text',
  order_type: 'text',
  table_number: 'text',
  status: 'text',
  priority: 'text',
  order_time: 'timestamp',
  estimated_ready_time: 'timestamp',
  actual_ready_time: 'timestamp',
  delivery_time: 'timestamp',
  subtotal: 'decimal',
  tax_amount: 'decimal',
  discount_amount: 'decimal',
  delivery_fee: 'decimal',
  total_amount: 'decimal',
  payment_status: 'text',
  payment_method: 'text',
  items: 'json',
  special_instructions: 'text',
  discount_code: 'text',
  delivery_address: 'text',
  staff_notes: 'text',
  source: 'text',
  created_by: 'text',
  updated_by: 'text'
} as const;

// Customer field definitions
export const CUSTOMER_FIELDS = {
  email: 'text',
  phone: 'text',
  preferred_name: 'text',
  dietary_preferences: 'text',
  loyalty_points: 'integer',
  visit_count: 'integer',
  favorite_tea_type: 'text',
  customer_since: 'date',
  address: 'text',
  delivery_instructions: 'text',
  customer_type: 'text',
  marketing_consent: 'boolean',
  created_by: 'text',
  updated_by: 'text'
} as const;

export class OrderService {
  /**
   * Transform raw database data into order objects
   */
  private static transformOrderData(entities: any[]): OrderWithDetails[] {
    return entities.map(entity => {
      const order: OrderWithDetails = {
        id: entity.id,
        organization_id: entity.organization_id,
        entity_type: entity.entity_type,
        entity_name: entity.entity_name,
        entity_code: entity.entity_code,
        is_active: entity.is_active,
        created_at: entity.created_at,
        updated_at: entity.updated_at,
        // Default values
        customer_id: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        order_type: 'dine_in',
        table_number: '',
        status: 'pending',
        priority: 'normal',
        order_time: entity.created_at,
        estimated_ready_time: '',
        actual_ready_time: '',
        delivery_time: '',
        subtotal: 0,
        tax_amount: 0,
        discount_amount: 0,
        delivery_fee: 0,
        total_amount: 0,
        payment_status: 'pending',
        payment_method: 'cash',
        items: [],
        special_instructions: '',
        discount_code: '',
        delivery_address: '',
        staff_notes: '',
        source: 'pos',
        created_by: '',
        updated_by: ''
      };

      // Apply metadata
      if (entity.core_metadata) {
        entity.core_metadata.forEach((metadata: any) => {
          const fieldName = metadata.metadata_key;
          let fieldValue = metadata.metadata_value;

          // Type conversion based on field type
          if (metadata.metadata_value_type === 'decimal' || metadata.metadata_value_type === 'integer') {
            fieldValue = parseFloat(fieldValue) || 0;
          } else if (metadata.metadata_value_type === 'boolean') {
            fieldValue = fieldValue === 'true';
          } else if (metadata.metadata_value_type === 'json') {
            try {
              fieldValue = JSON.parse(fieldValue);
            } catch (e) {
              fieldValue = [];
            }
          }

          order[fieldName] = fieldValue;
        });
      }

      return order;
    });
  }

  /**
   * Transform raw database data into customer objects
   */
  private static transformCustomerData(entities: any[]): CustomerWithDetails[] {
    return entities.map(entity => {
      const customer: CustomerWithDetails = {
        id: entity.id,
        organization_id: entity.organization_id,
        entity_type: entity.entity_type,
        entity_name: entity.entity_name,
        entity_code: entity.entity_code,
        is_active: entity.is_active,
        created_at: entity.created_at,
        updated_at: entity.updated_at,
        // Default values
        email: '',
        phone: '',
        preferred_name: '',
        dietary_preferences: 'none',
        loyalty_points: 0,
        visit_count: 0,
        favorite_tea_type: 'green_tea',
        customer_since: entity.created_at,
        address: '',
        delivery_instructions: '',
        customer_type: 'new',
        marketing_consent: false,
        created_by: '',
        updated_by: '',
        // Calculated fields
        total_orders: 0,
        total_spent: 0,
        average_order_value: 0,
        last_order_date: ''
      };

      // Apply metadata
      if (entity.core_metadata) {
        entity.core_metadata.forEach((metadata: any) => {
          const fieldName = metadata.metadata_key;
          let fieldValue = metadata.metadata_value;

          // Type conversion based on field type
          if (metadata.metadata_value_type === 'decimal' || metadata.metadata_value_type === 'integer') {
            fieldValue = parseFloat(fieldValue) || 0;
          } else if (metadata.metadata_value_type === 'boolean') {
            fieldValue = fieldValue === 'true';
          } else if (metadata.metadata_value_type === 'date') {
            fieldValue = fieldValue;
          }

          customer[fieldName] = fieldValue;
        });
      }

      return customer;
    });
  }

  /**
   * Fetch all orders for an organization
   */
  static async fetchOrders(organizationId: string): Promise<OrderWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('core_entities')
        .select(`
          *,
          core_metadata (
            metadata_key,
            metadata_value,
            metadata_value_type,
            created_at,
            updated_at
          )
        `)
        .eq('organization_id', organizationId)
        .eq('entity_type', 'order')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return this.transformOrderData(data || []);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      throw error;
    }
  }

  /**
   * Fetch a single order by ID
   */
  static async fetchOrderById(orderId: string): Promise<OrderWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('core_entities')
        .select(`
          *,
          core_metadata (
            metadata_key,
            metadata_value,
            metadata_value_type,
            created_at,
            updated_at
          )
        `)
        .eq('id', orderId)
        .eq('entity_type', 'order')
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        throw error;
      }

      if (!data) return null;

      const orders = this.transformOrderData([data]);
      return orders[0] || null;
    } catch (error) {
      console.error('Error in fetchOrderById:', error);
      throw error;
    }
  }

  /**
   * Create a new order
   */
  static async createOrder(orderInput: OrderInput): Promise<OrderWithDetails> {
    try {
      // Start transaction
      const { data: entity, error: entityError } = await supabase
        .from('core_entities')
        .insert({
          organization_id: orderInput.organizationId,
          entity_type: 'order',
          entity_name: orderInput.entity_name,
          entity_code: orderInput.entity_code,
          is_active: true
        })
        .select()
        .single();

      if (entityError) {
        console.error('Error creating order entity:', entityError);
        throw entityError;
      }

      // Create metadata entries
      const metadata = Object.entries(orderInput.fields || {})
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([fieldName, fieldValue]) => ({
          organization_id: orderInput.organizationId,
          entity_id: entity.id,
          entity_type: 'order',
          metadata_type: 'order_data',
          metadata_category: 'order',
          metadata_scope: 'public',
          metadata_key: fieldName,
          metadata_value: typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : String(fieldValue),
          metadata_value_type: ORDER_FIELDS[fieldName as keyof typeof ORDER_FIELDS] || 'text',
          is_active: true
        }));

      if (metadata.length > 0) {
        const { error: metadataError } = await supabase
          .from('core_metadata')
          .insert(metadata);

        if (metadataError) {
          console.error('Error creating order metadata:', metadataError);
          // Clean up entity if metadata fails
          await supabase
            .from('core_entities')
            .delete()
            .eq('id', entity.id);
          throw metadataError;
        }
      }

      // Fetch the complete order
      const createdOrder = await this.fetchOrderById(entity.id);
      if (!createdOrder) {
        throw new Error('Failed to fetch created order');
      }

      return createdOrder;
    } catch (error) {
      console.error('Error in createOrder:', error);
      throw error;
    }
  }

  /**
   * Update an existing order
   */
  static async updateOrder(orderId: string, orderInput: OrderInput): Promise<OrderWithDetails> {
    try {
      // Update entity
      const { error: entityError } = await supabase
        .from('core_entities')
        .update({
          entity_name: orderInput.entity_name,
          entity_code: orderInput.entity_code,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (entityError) {
        console.error('Error updating order entity:', entityError);
        throw entityError;
      }

      // Delete existing metadata
      const { error: deleteError } = await supabase
        .from('core_metadata')
        .delete()
        .eq('entity_id', orderId)
        .eq('entity_type', 'order');

      if (deleteError) {
        console.error('Error deleting existing metadata:', deleteError);
        throw deleteError;
      }

      // Insert new metadata
      const metadata = Object.entries(orderInput.fields || {})
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([fieldName, fieldValue]) => ({
          organization_id: orderInput.organizationId,
          entity_id: orderId,
          entity_type: 'order',
          metadata_type: 'order_data',
          metadata_category: 'order',
          metadata_scope: 'public',
          metadata_key: fieldName,
          metadata_value: typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : String(fieldValue),
          metadata_value_type: ORDER_FIELDS[fieldName as keyof typeof ORDER_FIELDS] || 'text',
          is_active: true
        }));

      if (metadata.length > 0) {
        const { error: metadataError } = await supabase
          .from('core_metadata')
          .insert(metadata);

        if (metadataError) {
          console.error('Error creating updated metadata:', metadataError);
          throw metadataError;
        }
      }

      // Fetch the updated order
      const updatedOrder = await this.fetchOrderById(orderId);
      if (!updatedOrder) {
        throw new Error('Failed to fetch updated order');
      }

      return updatedOrder;
    } catch (error) {
      console.error('Error in updateOrder:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: string, updatedBy: string): Promise<void> {
    try {
      // Get organization_id
      const { data: entity, error: entityError } = await supabase
        .from('core_entities')
        .select('organization_id')
        .eq('id', orderId)
        .single();

      if (entityError) {
        console.error('Error fetching order entity:', entityError);
        throw entityError;
      }

      // Update status metadata
      const { error: statusError } = await supabase
        .from('core_metadata')
        .upsert({
          organization_id: entity.organization_id,
          entity_id: orderId,
          entity_type: 'order',
          metadata_type: 'order_data',
          metadata_category: 'order',
          metadata_scope: 'public',
          metadata_key: 'status',
          metadata_value: status,
          metadata_value_type: 'text',
          is_active: true
        }, {
          onConflict: 'entity_id,metadata_key'
        });

      if (statusError) {
        console.error('Error updating order status:', statusError);
        throw statusError;
      }

      // Update updated_by metadata
      const { error: updatedByError } = await supabase
        .from('core_metadata')
        .upsert({
          organization_id: entity.organization_id,
          entity_id: orderId,
          entity_type: 'order',
          metadata_type: 'order_data',
          metadata_category: 'order',
          metadata_scope: 'public',
          metadata_key: 'updated_by',
          metadata_value: updatedBy,
          metadata_value_type: 'text',
          is_active: true
        }, {
          onConflict: 'entity_id,metadata_key'
        });

      if (updatedByError) {
        console.error('Error updating updated_by:', updatedByError);
        throw updatedByError;
      }
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(orderId: string, reason: string, cancelledBy: string): Promise<void> {
    try {
      await this.updateOrderStatus(orderId, 'cancelled', cancelledBy);
      
      // Add cancellation reason
      const { data: entity, error: entityError } = await supabase
        .from('core_entities')
        .select('organization_id')
        .eq('id', orderId)
        .single();

      if (entityError) {
        console.error('Error fetching order entity:', entityError);
        throw entityError;
      }

      const { error: reasonError } = await supabase
        .from('core_metadata')
        .upsert({
          organization_id: entity.organization_id,
          entity_id: orderId,
          entity_type: 'order',
          metadata_type: 'order_data',
          metadata_category: 'order',
          metadata_scope: 'public',
          metadata_key: 'cancellation_reason',
          metadata_value: reason,
          metadata_value_type: 'text',
          is_active: true
        }, {
          onConflict: 'entity_id,metadata_key'
        });

      if (reasonError) {
        console.error('Error updating cancellation reason:', reasonError);
        throw reasonError;
      }
    } catch (error) {
      console.error('Error in cancelOrder:', error);
      throw error;
    }
  }

  /**
   * Search orders
   */
  static async searchOrders(
    organizationId: string,
    query: string,
    filters: OrderSearchFilters = {}
  ): Promise<OrderWithDetails[]> {
    try {
      let supabaseQuery = supabase
        .from('core_entities')
        .select(`
          *,
          core_metadata (
            metadata_key,
            metadata_value,
            metadata_value_type,
            created_at,
            updated_at
          )
        `)
        .eq('organization_id', organizationId)
        .eq('entity_type', 'order')
        .eq('is_active', true);

      // Add text search
      if (query) {
        supabaseQuery = supabaseQuery.or(`entity_name.ilike.%${query}%,entity_code.ilike.%${query}%`);
      }

      const { data, error } = await supabaseQuery.order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching orders:', error);
        throw error;
      }

      let orders = this.transformOrderData(data || []);

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        orders = orders.filter(o => o.status === filters.status);
      }

      if (filters.order_type && filters.order_type !== 'all') {
        orders = orders.filter(o => o.order_type === filters.order_type);
      }

      if (filters.payment_status && filters.payment_status !== 'all') {
        orders = orders.filter(o => o.payment_status === filters.payment_status);
      }

      if (filters.table_number) {
        orders = orders.filter(o => o.table_number.includes(filters.table_number!));
      }

      if (filters.customer_name) {
        orders = orders.filter(o => o.customer_name.toLowerCase().includes(filters.customer_name!.toLowerCase()));
      }

      // Apply text search on other fields
      if (query) {
        const queryLower = query.toLowerCase();
        orders = orders.filter(o => 
          o.entity_name.toLowerCase().includes(queryLower) ||
          o.entity_code.toLowerCase().includes(queryLower) ||
          o.customer_name.toLowerCase().includes(queryLower) ||
          o.customer_phone.includes(query) ||
          o.table_number.includes(query)
        );
      }

      return orders;
    } catch (error) {
      console.error('Error in searchOrders:', error);
      throw error;
    }
  }

  /**
   * Get order statistics
   */
  static async getOrderStats(organizationId: string): Promise<{
    totalOrders: number;
    pendingOrders: number;
    preparingOrders: number;
    readyOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    todayRevenue: number;
    averageOrderValue: number;
  }> {
    try {
      const orders = await this.fetchOrders(organizationId);
      
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(o => o.created_at.startsWith(today));
      
      const stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        preparingOrders: orders.filter(o => o.status === 'preparing').length,
        readyOrders: orders.filter(o => o.status === 'ready').length,
        completedOrders: orders.filter(o => o.status === 'delivered').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        todayRevenue: todayOrders.reduce((sum, o) => sum + o.total_amount, 0),
        averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length : 0
      };

      return stats;
    } catch (error) {
      console.error('Error in getOrderStats:', error);
      throw error;
    }
  }

  /**
   * Fetch all customers for an organization
   */
  static async fetchCustomers(organizationId: string): Promise<CustomerWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('core_entities')
        .select(`
          *,
          core_metadata (
            metadata_key,
            metadata_value,
            metadata_value_type,
            created_at,
            updated_at
          )
        `)
        .eq('organization_id', organizationId)
        .eq('entity_type', 'customer')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      return this.transformCustomerData(data || []);
    } catch (error) {
      console.error('Error in fetchCustomers:', error);
      throw error;
    }
  }

  /**
   * Create a new customer
   */
  static async createCustomer(customerInput: CustomerInput): Promise<CustomerWithDetails> {
    try {
      // Start transaction
      const { data: entity, error: entityError } = await supabase
        .from('core_entities')
        .insert({
          organization_id: customerInput.organizationId,
          entity_type: 'customer',
          entity_name: customerInput.entity_name,
          entity_code: customerInput.entity_code,
          is_active: true
        })
        .select()
        .single();

      if (entityError) {
        console.error('Error creating customer entity:', entityError);
        throw entityError;
      }

      // Create metadata entries
      const metadata = Object.entries(customerInput.fields || {})
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([fieldName, fieldValue]) => ({
          organization_id: customerInput.organizationId,
          entity_id: entity.id,
          entity_type: 'customer',
          metadata_type: 'customer_data',
          metadata_category: 'customer',
          metadata_scope: 'public',
          metadata_key: fieldName,
          metadata_value: String(fieldValue),
          metadata_value_type: CUSTOMER_FIELDS[fieldName as keyof typeof CUSTOMER_FIELDS] || 'text',
          is_active: true
        }));

      if (metadata.length > 0) {
        const { error: metadataError } = await supabase
          .from('core_metadata')
          .insert(metadata);

        if (metadataError) {
          console.error('Error creating customer metadata:', metadataError);
          // Clean up entity if metadata fails
          await supabase
            .from('core_entities')
            .delete()
            .eq('id', entity.id);
          throw metadataError;
        }
      }

      // Fetch the complete customer
      const { data: createdCustomer, error: fetchError } = await supabase
        .from('core_entities')
        .select(`
          *,
          core_metadata (
            metadata_key,
            metadata_value,
            metadata_value_type,
            created_at,
            updated_at
          )
        `)
        .eq('id', entity.id)
        .single();

      if (fetchError) {
        console.error('Error fetching created customer:', fetchError);
        throw fetchError;
      }

      const customers = this.transformCustomerData([createdCustomer]);
      return customers[0];
    } catch (error) {
      console.error('Error in createCustomer:', error);
      throw error;
    }
  }

  /**
   * Subscribe to order changes
   */
  static subscribeToOrders(
    organizationId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'core_entities',
          filter: `organization_id=eq.${organizationId} AND entity_type=eq.order`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'core_metadata'
        },
        callback
      )
      .subscribe();
  }

  /**
   * Generate order code
   */
  static generateOrderCode(orderType: string): string {
    const typeCode = orderType.toUpperCase().slice(0, 2);
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${typeCode}${timestamp}${random}`;
  }
}