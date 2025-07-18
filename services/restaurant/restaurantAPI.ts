/**
 * Restaurant API Service Layer
 * Following universal transaction patterns and core entity architecture
 */

import UniversalCrudService from '@/lib/services/universalCrudService';
import { SupabaseClient } from '@supabase/supabase-js';

// ===================================================================
// TYPES AND INTERFACES
// ===================================================================

export interface RestaurantEntity {
  id: string;
  organization_id: string;
  entity_type: string;
  entity_name: string;
  entity_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface RestaurantTransaction {
  id: string;
  organization_id: string;
  transaction_type: string;
  transaction_number: string;
  transaction_date: string;
  total_amount: number;
  currency: string;
  status: string;
  transaction_status?: string;
  procurement_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  lines?: RestaurantTransactionLine[];
}

export interface RestaurantTransactionLine {
  id: string;
  transaction_id: string;
  entity_id: string;
  line_description: string;
  quantity: number;
  unit_price: number;
  line_amount: number;
  line_order: number;
  created_at: string;
}

export interface MenuItem extends RestaurantEntity {
  price: number;
  cost: number;
  category_id: string;
  prep_time_minutes: number;
  calories?: number;
  spice_level?: number;
  dietary_flags?: string[];
  ingredients?: string[];
}

export interface RestaurantTable extends RestaurantEntity {
  seats: number;
  section: string;
  features?: string[];
  qr_code?: string;
  current_status?: 'available' | 'occupied' | 'reserved' | 'cleaning';
}

export interface RestaurantStaff extends RestaurantEntity {
  role: string;
  email: string;
  permissions: string[];
  hourly_rate: number;
  shift_preference?: string;
}

export interface CreateOrderRequest {
  table_id?: string;
  waiter_id: string;
  customer_id?: string;
  customer_count: number;
  order_type: 'dine_in' | 'takeout' | 'delivery';
  special_instructions?: string;
  items: OrderItem[];
}

export interface OrderItem {
  menu_item_id: string;
  quantity: number;
  modifications?: string[];
  special_notes?: string;
}

export interface UpdateOrderStatusRequest {
  order_id: string;
  kitchen_status?: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  payment_status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ProcessPaymentRequest {
  order_id: string;
  payment_method: 'cash' | 'card' | 'digital_wallet';
  amount: number;
  tip_amount?: number;
  payment_processor?: string;
  authorization_code?: string;
}

export interface InventoryUpdateRequest {
  item_id: string;
  quantity_change: number;
  reason: string;
  reference_id?: string;
}

// ===================================================================
// BASE SERVICE CLASS
// ===================================================================

export class BaseRestaurantService {
  protected supabase: SupabaseClient;
  protected organizationId: string;

  constructor(organizationId: string) {
    this.supabase = createClient();
    this.organizationId = organizationId;
  }

  protected async validateAccess(userId: string, requiredPermissions: string[]): Promise<boolean> {
    try {
      const { data: staff } = await this.supabase
        .from('core_entities')
        .select(`
          *,
          core_metadata!inner(metadata_value)
        `)
        .eq('entity_type', 'restaurant_staff')
        .eq('organization_id', this.organizationId)
        .eq('core_metadata.metadata_key', 'email')
        .eq('core_metadata.metadata_value', userId)
        .single();

      if (!staff) return false;

      // Get permissions from metadata
      const { data: permissions } = await this.supabase
        .from('core_metadata')
        .select('metadata_value')
        .eq('entity_id', staff.id)
        .eq('metadata_key', 'permissions')
        .single();

      if (!permissions) return false;

      const staffPermissions = JSON.parse(permissions.metadata_value);
      return requiredPermissions.every(permission => 
        staffPermissions.includes(permission) || staffPermissions.includes('admin')
      );
    } catch (error) {
      console.error('Permission validation error:', error);
      return false;
    }
  }

  protected async auditLog(action: string, entityId: string, data: any): Promise<void> {
    try {
      await this.supabase
        .from('core_events_timeseries')
        .insert({
          timestamp: new Date().toISOString(),
          entity_id: entityId,
          event_type: action,
          event_data: data,
          metadata: { source: 'restaurant_api' }
        });
    } catch (error) {
      console.error('Audit log error:', error);
    }
  }

  protected async getEntityMetadata(entityId: string): Promise<Record<string, any>> {
    try {
      const { data: metadata } = await this.supabase
        .from('core_metadata')
        .select('metadata_key, metadata_value, metadata_value_type')
        .eq('entity_id', entityId)
        .eq('is_active', true);

      if (!metadata) return {};

      return metadata.reduce((acc, item) => {
        let value = item.metadata_value;
        
        // Parse based on type
        switch (item.metadata_value_type) {
          case 'json':
            value = JSON.parse(value);
            break;
          case 'integer':
            value = parseInt(value);
            break;
          case 'decimal':
            value = parseFloat(value);
            break;
          case 'boolean':
            value = value === 'true';
            break;
        }
        
        acc[item.metadata_key] = value;
        return acc;
      }, {} as Record<string, any>);
    } catch (error) {
      console.error('Get entity metadata error:', error);
      return {};
    }
  }
}

// ===================================================================
// MENU SERVICE
// ===================================================================

export class MenuService extends BaseRestaurantService {
  async getMenuItems(categoryId?: string): Promise<MenuItem[]> {
    try {
      let query = this.supabase
        .from('core_entities')
        .select('*')
        .eq('entity_type', 'menu_item')
        .eq('organization_id', this.organizationId)
        .eq('is_active', true);

      const { data: items, error } = await query;
      
      if (error) throw error;

      // Enrich with metadata
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const metadata = await this.getEntityMetadata(item.id);
          return {
            ...item,
            ...metadata
          } as MenuItem;
        })
      );

      // Filter by category if specified
      if (categoryId) {
        return enrichedItems.filter(item => item.category_id === categoryId);
      }

      return enrichedItems;
    } catch (error) {
      console.error('Get menu items error:', error);
      throw error;
    }
  }

  async getMenuCategories(): Promise<RestaurantEntity[]> {
    try {
      const { data: categories, error } = await this.supabase
        .from('core_entities')
        .select('*')
        .eq('entity_type', 'menu_category')
        .eq('organization_id', this.organizationId)
        .eq('is_active', true)
        .order('created_at');

      if (error) throw error;

      return categories;
    } catch (error) {
      console.error('Get menu categories error:', error);
      throw error;
    }
  }

  async getPopularItems(limit: number = 10): Promise<MenuItem[]> {
    try {
      // Get popular items based on order frequency
      const { data: popularItems, error } = await this.supabase
        .from('universal_transaction_lines')
        .select(`
          entity_id,
          COUNT(*) as order_count,
          SUM(quantity) as total_quantity,
          core_entities!inner(*)
        `)
        .eq('core_entities.entity_type', 'menu_item')
        .eq('core_entities.organization_id', this.organizationId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .group('entity_id, core_entities.id')
        .order('order_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Enrich with metadata
      const enrichedItems = await Promise.all(
        popularItems.map(async (item) => {
          const metadata = await this.getEntityMetadata(item.entity_id);
          return {
            ...item.core_entities,
            ...metadata,
            popularity_score: item.order_count
          } as MenuItem;
        })
      );

      return enrichedItems;
    } catch (error) {
      console.error('Get popular items error:', error);
      throw error;
    }
  }
}

// ===================================================================
// ORDER SERVICE
// ===================================================================

export class OrderService extends BaseRestaurantService {
  async createOrder(orderData: CreateOrderRequest, userId: string): Promise<RestaurantTransaction> {
    try {
      // Validate permissions
      const hasPermission = await this.validateAccess(userId, ['take_order']);
      if (!hasPermission) {
        throw new Error('Insufficient permissions to create order');
      }

      // Calculate total amount
      const totalAmount = await this.calculateOrderTotal(orderData.items);

      // Create transaction
      const orderId = crypto.randomUUID();
      const orderNumber = `ORDER-${Date.now()}`;

      const { data: order, error: orderError } = await this.supabase
        .from('universal_transactions')
        .insert({
          id: orderId,
          organization_id: this.organizationId,
          transaction_type: 'restaurant_order',
          transaction_number: orderNumber,
          transaction_date: new Date().toISOString().split('T')[0],
          total_amount: totalAmount,
          currency: 'USD',
          status: 'APPROVED',
          transaction_status: 'IN_PROGRESS',
          procurement_metadata: {
            order_type: orderData.order_type,
            table_id: orderData.table_id,
            waiter_id: orderData.waiter_id,
            customer_id: orderData.customer_id,
            customer_count: orderData.customer_count,
            special_instructions: orderData.special_instructions,
            order_time: new Date().toISOString(),
            kitchen_status: 'pending',
            payment_status: 'pending',
            ai_metadata: {
              confidence_score: 0.95,
              fraud_risk_score: 0.02,
              estimated_prep_time: await this.estimatePreparationTime(orderData.items)
            }
          }
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order lines
      const orderLines = orderData.items.map((item, index) => ({
        id: crypto.randomUUID(),
        transaction_id: orderId,
        entity_id: item.menu_item_id,
        line_description: `Menu item ${item.menu_item_id}`,
        quantity: item.quantity,
        unit_price: 0, // Will be updated with actual price
        line_amount: 0, // Will be calculated
        line_order: index + 1
      }));

      // Get menu item prices and update lines
      for (const line of orderLines) {
        const metadata = await this.getEntityMetadata(line.entity_id);
        line.unit_price = metadata.price || 0;
        line.line_amount = line.quantity * line.unit_price;
        
        // Update line description with actual name
        const { data: menuItem } = await this.supabase
          .from('core_entities')
          .select('entity_name')
          .eq('id', line.entity_id)
          .single();
          
        if (menuItem) {
          line.line_description = menuItem.entity_name;
        }
      }

      const { error: linesError } = await this.supabase
        .from('universal_transaction_lines')
        .insert(orderLines);

      if (linesError) throw linesError;

      // Update inventory
      await this.updateInventoryForOrder(orderData.items);

      // Audit log
      await this.auditLog('order_created', orderId, {
        order_number: orderNumber,
        total_amount: totalAmount,
        item_count: orderData.items.length
      });

      return { ...order, lines: orderLines };
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }

  async updateOrderStatus(request: UpdateOrderStatusRequest, userId: string): Promise<boolean> {
    try {
      // Validate permissions
      const hasPermission = await this.validateAccess(userId, ['update_order_status']);
      if (!hasPermission) {
        throw new Error('Insufficient permissions to update order status');
      }

      // Call database function
      const { error } = await this.supabase
        .rpc('update_order_status', {
          p_order_id: request.order_id,
          p_kitchen_status: request.kitchen_status,
          p_payment_status: request.payment_status
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }

  async getActiveOrders(): Promise<RestaurantTransaction[]> {
    try {
      const { data: orders, error } = await this.supabase
        .from('universal_transactions')
        .select(`
          *,
          universal_transaction_lines(*)
        `)
        .eq('transaction_type', 'restaurant_order')
        .eq('organization_id', this.organizationId)
        .in('status', ['APPROVED', 'IN_PROGRESS'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return orders;
    } catch (error) {
      console.error('Get active orders error:', error);
      throw error;
    }
  }

  async getOrdersByTable(tableId: string): Promise<RestaurantTransaction[]> {
    try {
      const { data: orders, error } = await this.supabase
        .from('universal_transactions')
        .select(`
          *,
          universal_transaction_lines(*)
        `)
        .eq('transaction_type', 'restaurant_order')
        .eq('organization_id', this.organizationId)
        .eq('procurement_metadata->>table_id', tableId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return orders;
    } catch (error) {
      console.error('Get orders by table error:', error);
      throw error;
    }
  }

  private async calculateOrderTotal(items: OrderItem[]): Promise<number> {
    let total = 0;
    
    for (const item of items) {
      const metadata = await this.getEntityMetadata(item.menu_item_id);
      total += (metadata.price || 0) * item.quantity;
    }
    
    return total;
  }

  private async estimatePreparationTime(items: OrderItem[]): Promise<number> {
    let maxPrepTime = 0;
    
    for (const item of items) {
      const metadata = await this.getEntityMetadata(item.menu_item_id);
      const prepTime = metadata.prep_time_minutes || 0;
      if (prepTime > maxPrepTime) {
        maxPrepTime = prepTime;
      }
    }
    
    return maxPrepTime;
  }

  private async updateInventoryForOrder(items: OrderItem[]): Promise<void> {
    for (const item of items) {
      const metadata = await this.getEntityMetadata(item.menu_item_id);
      const ingredients = metadata.ingredients || [];
      
      for (const ingredient of ingredients) {
        // This would need more sophisticated recipe management
        // For now, we'll skip inventory updates
      }
    }
  }
}

// ===================================================================
// PAYMENT SERVICE
// ===================================================================

export class PaymentService extends BaseRestaurantService {
  async processPayment(request: ProcessPaymentRequest, userId: string): Promise<RestaurantTransaction> {
    try {
      // Validate permissions
      const hasPermission = await this.validateAccess(userId, ['process_payment']);
      if (!hasPermission) {
        throw new Error('Insufficient permissions to process payment');
      }

      const paymentId = crypto.randomUUID();
      const paymentNumber = `PAY-${Date.now()}`;

      const { data: payment, error } = await this.supabase
        .from('universal_transactions')
        .insert({
          id: paymentId,
          organization_id: this.organizationId,
          transaction_type: 'payment',
          transaction_number: paymentNumber,
          transaction_date: new Date().toISOString().split('T')[0],
          total_amount: request.amount + (request.tip_amount || 0),
          currency: 'USD',
          status: 'APPROVED',
          transaction_status: 'COMPLETED',
          procurement_metadata: {
            payment_method: request.payment_method,
            related_order_id: request.order_id,
            order_total: request.amount,
            tip_amount: request.tip_amount || 0,
            payment_processor: request.payment_processor,
            authorization_code: request.authorization_code,
            processed_by: userId,
            ai_metadata: {
              fraud_risk_score: 0.01,
              payment_time_optimal: true
            }
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Update order payment status
      await this.updateOrderStatus({
        order_id: request.order_id,
        payment_status: 'completed'
      }, userId);

      // Audit log
      await this.auditLog('payment_processed', paymentId, {
        payment_method: request.payment_method,
        amount: request.amount,
        order_id: request.order_id
      });

      return payment;
    } catch (error) {
      console.error('Process payment error:', error);
      throw error;
    }
  }
}

// ===================================================================
// INVENTORY SERVICE
// ===================================================================

export class InventoryService extends BaseRestaurantService {
  async getInventoryStatus(): Promise<any[]> {
    try {
      const { data: inventory, error } = await this.supabase
        .from('v_inventory_status')
        .select('*')
        .order('stock_status', { ascending: false });

      if (error) throw error;

      return inventory;
    } catch (error) {
      console.error('Get inventory status error:', error);
      throw error;
    }
  }

  async updateInventoryStock(request: InventoryUpdateRequest, userId: string): Promise<boolean> {
    try {
      // Validate permissions
      const hasPermission = await this.validateAccess(userId, ['manage_inventory']);
      if (!hasPermission) {
        throw new Error('Insufficient permissions to update inventory');
      }

      // Call database function
      const { error } = await this.supabase
        .rpc('update_inventory_stock', {
          p_item_id: request.item_id,
          p_quantity_change: request.quantity_change,
          p_reason: request.reason
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Update inventory stock error:', error);
      throw error;
    }
  }

  async getCriticalStockItems(): Promise<any[]> {
    try {
      const { data: items, error } = await this.supabase
        .from('v_inventory_status')
        .select('*')
        .in('stock_status', ['critical', 'low'])
        .order('stock_status', { ascending: false });

      if (error) throw error;

      return items;
    } catch (error) {
      console.error('Get critical stock items error:', error);
      throw error;
    }
  }
}

// ===================================================================
// TABLE SERVICE
// ===================================================================

export class TableService extends BaseRestaurantService {
  async getTables(): Promise<RestaurantTable[]> {
    try {
      const { data: tables, error } = await this.supabase
        .from('core_entities')
        .select('*')
        .eq('entity_type', 'restaurant_table')
        .eq('organization_id', this.organizationId)
        .eq('is_active', true)
        .order('entity_name');

      if (error) throw error;

      // Enrich with metadata
      const enrichedTables = await Promise.all(
        tables.map(async (table) => {
          const metadata = await this.getEntityMetadata(table.id);
          return {
            ...table,
            ...metadata
          } as RestaurantTable;
        })
      );

      return enrichedTables;
    } catch (error) {
      console.error('Get tables error:', error);
      throw error;
    }
  }

  async getTableStatus(tableId: string): Promise<any> {
    try {
      // Get current orders for table
      const { data: orders, error } = await this.supabase
        .from('universal_transactions')
        .select('*')
        .eq('transaction_type', 'restaurant_order')
        .eq('organization_id', this.organizationId)
        .eq('procurement_metadata->>table_id', tableId)
        .in('status', ['APPROVED', 'IN_PROGRESS'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Determine table status
      let status = 'available';
      if (orders && orders.length > 0) {
        const activeOrder = orders[0];
        const kitchenStatus = activeOrder.procurement_metadata?.kitchen_status;
        const paymentStatus = activeOrder.procurement_metadata?.payment_status;
        
        if (paymentStatus === 'completed') {
          status = 'cleaning';
        } else if (kitchenStatus === 'ready') {
          status = 'ready_to_serve';
        } else {
          status = 'occupied';
        }
      }

      return {
        table_id: tableId,
        status,
        current_orders: orders,
        customer_count: orders[0]?.procurement_metadata?.customer_count || 0
      };
    } catch (error) {
      console.error('Get table status error:', error);
      throw error;
    }
  }
}

// ===================================================================
// ANALYTICS SERVICE
// ===================================================================

export class AnalyticsService extends BaseRestaurantService {
  async getDailySales(date?: string): Promise<any> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const { data: sales, error } = await this.supabase
        .from('v_daily_sales_summary')
        .select('*')
        .eq('transaction_date', targetDate)
        .single();

      if (error) throw error;

      return sales;
    } catch (error) {
      console.error('Get daily sales error:', error);
      throw error;
    }
  }

  async getPopularItems(days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: items, error } = await this.supabase
        .from('universal_transaction_lines')
        .select(`
          entity_id,
          COUNT(*) as order_count,
          SUM(quantity) as total_quantity,
          SUM(line_amount) as total_revenue,
          core_entities!inner(entity_name)
        `)
        .eq('core_entities.entity_type', 'menu_item')
        .eq('core_entities.organization_id', this.organizationId)
        .gte('created_at', startDate.toISOString())
        .group('entity_id, core_entities.entity_name')
        .order('order_count', { ascending: false })
        .limit(20);

      if (error) throw error;

      return items;
    } catch (error) {
      console.error('Get popular items error:', error);
      throw error;
    }
  }
}

// ===================================================================
// MAIN RESTAURANT API CLASS
// ===================================================================

export class RestaurantAPI {
  public menu: MenuService;
  public orders: OrderService;
  public payments: PaymentService;
  public inventory: InventoryService;
  public tables: TableService;
  public analytics: AnalyticsService;

  constructor(organizationId: string) {
    this.menu = new MenuService(organizationId);
    this.orders = new OrderService(organizationId);
    this.payments = new PaymentService(organizationId);
    this.inventory = new InventoryService(organizationId);
    this.tables = new TableService(organizationId);
    this.analytics = new AnalyticsService(organizationId);
  }

  // Real-time subscription methods
  subscribeToOrders(callback: (payload: any) => void) {
    const supabase = createClient();
    
    return supabase
      .channel('restaurant-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'universal_transactions',
          filter: `transaction_type=eq.restaurant_order`
        },
        callback
      )
      .subscribe();
  }

  subscribeToInventoryAlerts(callback: (payload: any) => void) {
    const supabase = createClient();
    
    return supabase
      .channel('inventory-alerts')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'core_metadata',
        filter: `metadata_key=eq.current_stock`
      }, callback)
      .subscribe();
  }

  subscribeToTableStatus(callback: (payload: any) => void) {
    const supabase = createClient();
    
    return supabase
      .channel('table-status')
      .on('presence', { event: 'sync' }, callback)
      .subscribe();
  }
}

// Default export for convenience
export default RestaurantAPI;