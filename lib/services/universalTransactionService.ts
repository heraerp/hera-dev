import UniversalCrudService from '@/lib/services/universalCrudService';
import { createClient } from '@/lib/supabase/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabase = createClient();

// Admin client for RLS bypass on write operations
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!}`
      }
    }
  }
);

// Universal Transaction Types
export interface UniversalTransaction {
  id: string;
  organization_id: string;
  transaction_type: string;
  transaction_number: string;
  transaction_date: string;
  total_amount: number;
  currency: string;
  transaction_status: string;
  created_at?: string;
  updated_at?: string;
}

export interface UniversalTransactionLine {
  id: string;
  transaction_id: string;
  entity_id: string;
  line_description: string;
  quantity: number;
  unit_price: number;
  line_amount: number;
  line_order: number;
}

export interface OrderMetadata {
  customer_id?: string;
  staff_member?: string;
  order_time?: string;
  table_number?: string;
  order_channel?: string;
  special_instructions?: string;
  estimated_prep_time?: string;
  customer_mood?: string;
  weather?: string;
}

export interface OrderCreateInput {
  organizationId: string;
  customerName: string;
  tableNumber?: string;
  orderType: 'dine_in' | 'takeout' | 'delivery';
  specialInstructions?: string;
  waiterName?: string;
  createdBy?: string; // User ID who created the order
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    specialInstructions?: string;
  }>;
}

export class UniversalTransactionService {
  // In-memory user cache for metadata creation
  private static currentUser: {
    id: string;
    email: string;
    fullName: string;
  } | null = null;

  /**
   * Set current user context for metadata creation
   */
  static setCurrentUser(user: { id: string; email: string; fullName: string }) {
    this.currentUser = user;
    console.log('🔐 User context set for UniversalTransactionService:', user.fullName);
  }

  /**
   * Get current user ID for metadata, with fallback to system user
   */
  static getCurrentUserId(): string {
    if (this.currentUser) {
      return this.currentUser.id;
    }
    
    // Fallback to system user if no user context is set
    console.warn('⚠️ No user context set, using fallback system user');
    return '97c87eca-24c9-4539-a542-acf65bc9b9c7';
  }

  /**
   * Clear user context (useful for logout)
   */
  static clearCurrentUser() {
    this.currentUser = null;
    console.log('🔐 User context cleared from UniversalTransactionService');
  }

  /**
   * Initialize universal transaction tables if they don't exist
   */
  static async initializeTables(): Promise<void> {
    try {
      // First, let's check if tables exist by trying to query them
      console.log('🔍 Checking if universal_transactions table exists...');
      
      // Try to insert the sample data directly - this will help us understand the table structure
      const { data: existingOrder, error: checkError } = await supabase
        .from('universal_transactions')
        .select('*')
        .eq('transaction_number', 'ORD-20240115-001')
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        console.log('✅ universal_transactions table exists but no sample data found');
        
        // Insert sample data using admin client for RLS bypass
        const { error: insertError } = await supabaseAdmin
          .from('universal_transactions')
          .insert({
            id: '550e8400-e29b-41d4-a716-446655440050',
            organization_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            transaction_type: 'SALES_ORDER',
            transaction_number: 'ORD-20240115-001',
            transaction_date: '2024-01-15',
            total_amount: 7.75,
            currency: 'USD',
            transaction_status: 'PENDING'
          });

        if (insertError && insertError.code !== '23505') { // 23505 is duplicate key error
          console.error('❌ Error inserting sample transaction:', {
            error: insertError,
            message: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint
          });
        } else {
          console.log('✅ Sample transaction inserted successfully');
        }

        // Insert sample line items using admin client
        const { error: linesError } = await supabaseAdmin
          .from('universal_transaction_lines')
          .insert([
            {
              id: '550e8400-e29b-41d4-a716-446655440060',
              transaction_id: '550e8400-e29b-41d4-a716-446655440050',
              entity_id: '550e8400-e29b-41d4-a716-446655440030',
              line_description: 'Premium Jasmine Green Tea',
              quantity: 1,
              unit_price: 4.50,
              line_amount: 4.50,
              line_order: 1
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440061',
              transaction_id: '550e8400-e29b-41d4-a716-446655440050',
              entity_id: '550e8400-e29b-41d4-a716-446655440031',
              line_description: 'Fresh Blueberry Scone',
              quantity: 1,
              unit_price: 3.25,
              line_amount: 3.25,
              line_order: 2
            }
          ]);

        if (linesError && linesError.code !== '23505') {
          console.error('❌ Error inserting sample line items:', {
            error: linesError,
            message: linesError.message,
            code: linesError.code,
            details: linesError.details,
            hint: linesError.hint
          });
        } else {
          console.log('✅ Sample line items inserted successfully');
        }

        // Skip metadata insertion for now - it's optional and may have audit trigger issues
        // The universal transaction system works without metadata
        console.log('⏭️ Skipping metadata insertion - transactions work without metadata');

      } else if (existingOrder) {
        console.log('✅ Sample data already exists:', existingOrder.transaction_number);
      } else {
        console.error('❌ universal_transactions table does not exist:', checkError);
        console.log('📝 Please create the tables using the provided SQL in Supabase SQL Editor');
        throw new Error('Universal transaction tables do not exist. Please run the setup SQL first.');
      }

      console.log('✅ Universal transaction tables initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing tables:', error);
      throw error;
    }
  }

  /**
   * Generate order number
   */
  static generateOrderNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = Date.now().toString().slice(-3);
    return `ORD-${dateStr}-${timeStr}`;
  }

  /**
   * Create a new order using universal_transactions
   */
  static async createOrder(orderInput: OrderCreateInput): Promise<{
    success: boolean;
    data?: {
      transactionNumber: string;
      orderId: string;
    };
    error?: string;
  }> {
    try {
      // First, ensure tables exist
      await this.initializeTables();

      const orderNumber = this.generateOrderNumber();
      const orderId = crypto.randomUUID();
      
      // Calculate totals
      const subtotal = orderInput.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const tax = subtotal * 0.0875; // 8.75% tax
      const total = subtotal + tax;

      // Create universal transaction using admin client for RLS bypass
      const { error: transactionError } = await supabaseAdmin
        .from('universal_transactions')
        .insert({
          id: orderId,
          organization_id: orderInput.organizationId,
          transaction_type: 'SALES_ORDER',
          transaction_number: orderNumber,
          transaction_date: new Date().toISOString().split('T')[0],
          total_amount: total,
          currency: 'USD',
          transaction_status: 'PENDING'
        });

      if (transactionError) {
        console.error('Error creating universal transaction:', transactionError);
        throw transactionError;
      }

      // Create transaction lines for each item
      const transactionLines = orderInput.items.map((item, index) => ({
        id: crypto.randomUUID(),
        transaction_id: orderId,
        entity_id: item.productId,
        line_description: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_amount: item.quantity * item.unitPrice,
        line_order: index + 1
      }));

      const { error: linesError } = await supabaseAdmin
        .from('universal_transaction_lines')
        .insert(transactionLines);

      if (linesError) {
        console.error('Error creating transaction lines:', linesError);
        // Clean up transaction if lines fail
        await supabaseAdmin
          .from('universal_transactions')
          .delete()
          .eq('id', orderId);
        throw linesError;
      }

      // Add order metadata exactly as you specified
      const orderMetadata = {
        customer_name: orderInput.customerName,
        staff_member: orderInput.waiterName || 'system',
        waiter_name: orderInput.waiterName,
        order_time: new Date().toISOString(),
        table_number: orderInput.tableNumber || '',
        order_type: orderInput.orderType,
        order_channel: 'in_store',
        special_instructions: orderInput.specialInstructions || '',
        estimated_prep_time: '7 minutes',
        customer_mood: 'satisfied',
        weather: 'pleasant'
      };

      // Try to insert metadata, but don't fail order creation if it fails
      try {
        const { error: metadataError } = await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: orderInput.organizationId,
            entity_type: 'transaction',
            entity_id: orderId,
            metadata_type: 'order_context',
            metadata_category: 'customer_experience',
            metadata_key: 'order_details',
            metadata_value: JSON.stringify(orderMetadata),
            created_by: orderInput.createdBy || this.getCurrentUserId() // Use provided user ID or current user
          });

        if (metadataError) {
          console.warn('⚠️ Metadata creation failed (non-critical):', metadataError);
          // Continue without metadata - order functionality works without it
        } else {
          console.log('✅ Order metadata created successfully');
        }
      } catch (metadataError) {
        console.warn('⚠️ Metadata creation failed (non-critical):', metadataError);
        // Continue without metadata - order functionality works without it
      }

      return {
        success: true,
        data: {
          transactionNumber: orderNumber,
          orderId
        }
      };

    } catch (error) {
      console.error('Error in createOrder:', error);
      return {
        success: false,
        error: error.message || 'Failed to create order'
      };
    }
  }

  /**
   * Fetch orders using universal_transactions
   */
  static async fetchOrders(organizationId: string): Promise<{
    success: boolean;
    orders?: any[];
    error?: string;
  }> {
    try {
      // Skip initialization on fetch - should be done during setup only
      // This prevents errors on every dashboard load
      // await this.initializeTables();

      // Fetch transactions first (without joins to avoid relationship errors)
      const { data: transactions, error: transactionError } = await supabase
        .from('universal_transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('transaction_type', 'SALES_ORDER')
        .order('created_at', { ascending: false });

      if (transactionError) {
        console.error('Error fetching transactions:', transactionError);
        
        // If table doesn't exist, return empty array instead of throwing
        if (transactionError.code === '42P01') {
          console.warn('Universal transaction tables not yet created');
          return { success: true, orders: [] };
        }
        
        throw transactionError;
      }

      // If no transactions, return empty array
      if (!transactions || transactions.length === 0) {
        return { success: true, orders: [] };
      }

      // Fetch transaction lines separately
      const transactionIds = transactions.map(t => t.id);
      const { data: transactionLines, error: linesError } = await supabase
        .from('universal_transaction_lines')
        .select('*')
        .in('transaction_id', transactionIds);

      if (linesError) {
        console.warn('Error fetching transaction lines:', linesError);
      }

      // Group lines by transaction
      const linesByTransaction = (transactionLines || []).reduce((acc, line) => {
        if (!acc[line.transaction_id]) acc[line.transaction_id] = [];
        acc[line.transaction_id].push(line);
        return acc;
      }, {} as Record<string, any[]>);

      // Transform to order format
      const orders = transactions.map(transaction => {
        // Get lines for this transaction
        const lines = linesByTransaction[transaction.id] || [];

        return {
          id: transaction.id,
          transaction_number: transaction.transaction_number,
          transaction_date: transaction.transaction_date,
          status: (transaction.transaction_status || 'pending').toLowerCase(),
          total_amount: transaction.total_amount,
          currency: transaction.currency,
          customer_name: 'Walk-in', // No metadata for now
          table_number: '', // No metadata for now
          special_instructions: '', // No metadata for now
          order_type: 'dine_in', // Default
          preparation_status: (transaction.transaction_status || 'pending').toLowerCase(),
          payment_status: 'pending',
          order_items: lines.map(line => ({
            id: line.id,
            product_id: line.entity_id,
            product_name: line.line_description,
            quantity: line.quantity,
            unit_price: line.unit_price,
            total_price: line.line_amount,
            status: 'pending'
          })),
          metadata: {}, // No metadata for now
          created_at: transaction.created_at,
          updated_at: transaction.updated_at
        };
      }) || [];

      return {
        success: true,
        orders
      };

    } catch (error) {
      console.error('Error in fetchOrders:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch orders'
      };
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabaseAdmin
        .from('universal_transactions')
        .update({ 
          transaction_status: status.toUpperCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      return { success: true };

    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return {
        success: false,
        error: error.message || 'Failed to update order status'
      };
    }
  }

  /**
   * Get order statistics
   */
  static async getOrderStats(organizationId: string): Promise<{
    success: boolean;
    stats?: any;
    error?: string;
  }> {
    try {
      const ordersResult = await this.fetchOrders(organizationId);
      
      if (!ordersResult.success) {
        throw new Error(ordersResult.error);
      }

      const orders = ordersResult.orders || [];
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(o => o.transaction_date === today);

      const stats = {
        total: todayOrders.length,
        pending: todayOrders.filter(o => o.status === 'pending').length,
        preparing: todayOrders.filter(o => o.preparation_status === 'preparing').length,
        ready: todayOrders.filter(o => o.preparation_status === 'ready').length,
        completed: todayOrders.filter(o => o.status === 'completed').length,
        cancelled: todayOrders.filter(o => o.status === 'cancelled').length,
        revenue: todayOrders.reduce((sum, o) => sum + o.total_amount, 0),
        averageOrderValue: todayOrders.length > 0 
          ? todayOrders.reduce((sum, o) => sum + o.total_amount, 0) / todayOrders.length 
          : 0,
        averagePreparationTime: 15
      };

      return {
        success: true,
        stats
      };

    } catch (error) {
      console.error('Error in getOrderStats:', error);
      return {
        success: false,
        error: error.message || 'Failed to get order statistics'
      };
    }
  }

  /**
   * Get transaction analytics for dashboard
   */
  static async getTransactionAnalytics(
    organizationId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{
    success: boolean;
    analytics?: {
      totalTransactions: number;
      totalRevenue: number;
      averageOrderValue: number;
      hourlyData: Array<{ hour: string; revenue: number; orders: number }>;
      statusBreakdown: Record<string, number>;
    };
    error?: string;
  }> {
    try {
      console.log('📊 Fetching transaction analytics for organization:', organizationId);
      
      // HERA Universal Architecture: Always filter by organization_id
      const { data: transactions, error: transactionError } = await supabase
        .from('universal_transactions')
        .select('*')
        .eq('organization_id', organizationId) // SACRED PRINCIPLE
        .eq('transaction_type', 'SALES_ORDER')
        .gte('transaction_date', startDate.split('T')[0])
        .lte('transaction_date', endDate.split('T')[0]);

      if (transactionError) {
        console.error('Error fetching transaction analytics:', transactionError);
        throw transactionError;
      }

      const filteredTransactions = transactions || [];
      
      // Calculate basic metrics
      const totalTransactions = filteredTransactions.length;
      const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total_amount, 0);
      const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      // Generate hourly data (simplified - could be enhanced with actual hour-by-hour data)
      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        revenue: totalRevenue * (Math.random() * 0.1 + 0.02), // Mock distribution
        orders: Math.floor(totalTransactions * (Math.random() * 0.1 + 0.02))
      }));

      // Status breakdown
      const statusBreakdown = filteredTransactions.reduce((acc, t) => {
        acc[t.transaction_status] = (acc[t.transaction_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        success: true,
        analytics: {
          totalTransactions,
          totalRevenue,
          averageOrderValue,
          hourlyData,
          statusBreakdown
        }
      };

    } catch (error) {
      console.error('Error in getTransactionAnalytics:', error);
      return {
        success: false,
        error: error.message || 'Failed to get transaction analytics'
      };
    }
  }

  /**
   * Get orders with filtering options (for Kitchen Display)
   */
  static async getOrders(organizationId: string, options?: {
    status?: string[];
    orderBy?: { field: string; direction: 'asc' | 'desc' };
    limit?: number;
    fromDate?: string;
  }): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      console.log('🍳 Fetching orders for kitchen display...');
      console.log('🍳 Organization ID:', organizationId);
      console.log('🍳 Status filter:', options?.status);
      
      let query = supabase
        .from('universal_transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('transaction_type', 'SALES_ORDER');

      // Apply status filter if provided
      if (options?.status && options.status.length > 0) {
        query = query.in('transaction_status', options.status);
      }

      // Apply date filter if provided
      if (options?.fromDate) {
        query = query.gte('created_at', options.fromDate);
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.field, { 
          ascending: options.orderBy.direction === 'asc' 
        });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data: transactions, error: transactionError } = await query;

      console.log('🍳 Raw transactions from DB:', transactions);
      console.log('🍳 Transaction error:', transactionError);

      if (transactionError) {
        console.error('Error fetching orders:', transactionError);
        throw transactionError;
      }

      if (!transactions || transactions.length === 0) {
        console.log('🍳 No transactions found for organization:', organizationId);
        return { success: true, data: [] };
      }

      // Fetch transaction lines separately
      const transactionIds = transactions.map(t => t.id);
      const { data: transactionLines, error: linesError } = await supabase
        .from('universal_transaction_lines')
        .select('*')
        .in('transaction_id', transactionIds);

      if (linesError) {
        console.warn('Error fetching transaction lines:', linesError);
      }

      // Group lines by transaction
      const linesByTransaction = (transactionLines || []).reduce((acc, line) => {
        if (!acc[line.transaction_id]) acc[line.transaction_id] = [];
        acc[line.transaction_id].push(line);
        return acc;
      }, {} as Record<string, any[]>);

      // Fetch metadata for each transaction
      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .select('entity_id, metadata_value')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'transaction')
        .in('entity_id', transactionIds);

      if (metadataError) {
        console.warn('Error fetching metadata:', metadataError);
      }

      // Group metadata by transaction
      const metadataByTransaction = (metadata || []).reduce((acc, meta) => {
        try {
          // Parse JSON metadata if it's a string
          acc[meta.entity_id] = typeof meta.metadata_value === 'string' 
            ? JSON.parse(meta.metadata_value) 
            : meta.metadata_value;
        } catch (e) {
          console.warn('Failed to parse metadata for transaction:', meta.entity_id);
          acc[meta.entity_id] = meta.metadata_value;
        }
        return acc;
      }, {} as Record<string, any>);

      // Transform to order format with line items and metadata
      const orders = transactions.map(transaction => {
        const lines = linesByTransaction[transaction.id] || [];
        const orderMetadata = metadataByTransaction[transaction.id] || {};

        return {
          id: transaction.id,
          transaction_number: transaction.transaction_number,
          transaction_status: transaction.transaction_status?.toLowerCase() || 'pending',
          total_amount: transaction.total_amount,
          currency: transaction.currency,
          line_items: lines.map(line => ({
            id: line.id,
            name: line.line_description,
            quantity: line.quantity,
            price: line.unit_price
          })),
          metadata: orderMetadata,
          created_at: transaction.created_at,
          updated_at: transaction.updated_at
        };
      });

      console.log('✅ Orders fetched successfully:', orders.length);
      return {
        success: true,
        data: orders
      };

    } catch (error) {
      console.error('Error in getOrders:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch orders'
      };
    }
  }

  /**
   * Subscribe to order changes
   */
  static subscribeToOrderChanges(
    organizationId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel('universal-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'universal_transactions',
          filter: `organization_id=eq.${organizationId} AND transaction_type=eq.SALES_ORDER`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'universal_transaction_lines'
        },
        callback
      )
      .subscribe();
  }
}