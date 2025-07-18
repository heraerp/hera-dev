import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Some features may not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// TypeScript interfaces for HERA Universal Schema
export interface CoreEntity {
  id: string;
  organization_id: string;
  entity_type: string;
  entity_name: string;
  entity_code: string;
  parent_entity_id?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CoreDynamicData {
  id?: string;
  entity_id: string;
  field_name: string;
  field_value: any;
  field_type: string;
  is_encrypted?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface UniversalTransaction {
  id: string;
  organization_id: string;
  transaction_number: string;
  transaction_type: string;
  transaction_date: string;
  status: string;
  description?: string;
  total_amount: number;
  currency: string;
  reference_type?: string;
  reference_id?: string;
  workflow_instance_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface RestaurantOrder extends UniversalTransaction {
  customer_id?: string;
  customer_name?: string;
  table_number?: string;
  waiter_id?: string;
  waiter_name?: string;
  order_items?: OrderItem[];
  subtotal?: number;
  tax_amount?: number;
  tip_amount?: number;
  payment_status?: string;
  preparation_status?: string;
  special_instructions?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  status?: string;
  prepared_by?: string;
  preparation_time?: number;
}

// Database query functions
export const db = {
  // Entity operations
  entities: {
    async create(entity: Omit<CoreEntity, 'id' | 'created_at' | 'updated_at'>): Promise<CoreEntity | null> {
      try {
        const { data, error } = await supabase
          .from('core_entities')
          .insert(entity)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating entity:', error);
        return null;
      }
    },

    async findById(id: string): Promise<CoreEntity | null> {
      try {
        const { data, error } = await supabase
          .from('core_entities')
          .select('*')
          .eq('id', id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
      } catch (error) {
        console.error('Error finding entity:', error);
        return null;
      }
    },

    async findByType(organization_id: string, entity_type: string): Promise<CoreEntity[]> {
      try {
        const { data, error } = await supabase
          .from('core_entities')
          .select('*')
          .eq('organization_id', organization_id)
          .eq('entity_type', entity_type)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error finding entities by type:', error);
        return [];
      }
    },

    async update(id: string, updates: Partial<CoreEntity>): Promise<CoreEntity | null> {
      try {
        const { data, error } = await supabase
          .from('core_entities')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating entity:', error);
        return null;
      }
    }
  },

  // Dynamic data operations
  dynamicData: {
    async create(data: Omit<CoreDynamicData, 'id' | 'created_at' | 'updated_at'>): Promise<CoreDynamicData | null> {
      try {
        const { data: result, error } = await supabase
          .from('core_dynamic_data')
          .insert(data)
          .select()
          .single();

        if (error) throw error;
        return result;
      } catch (error) {
        console.error('Error creating dynamic data:', error);
        return null;
      }
    },

    async createBatch(data: Omit<CoreDynamicData, 'id' | 'created_at' | 'updated_at'>[]): Promise<CoreDynamicData[]> {
      try {
        const { data: result, error } = await supabase
          .from('core_dynamic_data')
          .insert(data)
          .select();

        if (error) throw error;
        return result || [];
      } catch (error) {
        console.error('Error creating dynamic data batch:', error);
        return [];
      }
    },

    async findByEntity(entity_id: string): Promise<CoreDynamicData[]> {
      try {
        const { data, error } = await supabase
          .from('core_dynamic_data')
          .select('*')
          .eq('entity_id', entity_id)
          .order('field_name');

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error finding dynamic data:', error);
        return [];
      }
    },

    async findByEntityAndField(entity_id: string, field_name: string): Promise<CoreDynamicData | null> {
      try {
        const { data, error } = await supabase
          .from('core_dynamic_data')
          .select('*')
          .eq('entity_id', entity_id)
          .eq('field_name', field_name)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
        return data;
      } catch (error) {
        console.error('Error finding dynamic data by field:', error);
        return null;
      }
    },

    async update(entity_id: string, field_name: string, field_value: any): Promise<CoreDynamicData | null> {
      try {
        const { data, error } = await supabase
          .from('core_dynamic_data')
          .update({ field_value, updated_at: new Date().toISOString() })
          .eq('entity_id', entity_id)
          .eq('field_name', field_name)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating dynamic data:', error);
        return null;
      }
    }
  },

  // Transaction operations
  transactions: {
    async create(transaction: Omit<UniversalTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<UniversalTransaction | null> {
      try {
        const { data, error } = await supabase
          .from('universal_transactions')
          .insert(transaction)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating transaction:', error);
        return null;
      }
    },

    async findById(id: string): Promise<UniversalTransaction | null> {
      try {
        const { data, error } = await supabase
          .from('universal_transactions')
          .select('*')
          .eq('id', id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
      } catch (error) {
        console.error('Error finding transaction:', error);
        return null;
      }
    },

    async findByType(organization_id: string, transaction_type: string, limit = 50): Promise<UniversalTransaction[]> {
      try {
        const { data, error } = await supabase
          .from('universal_transactions')
          .select('*')
          .eq('organization_id', organization_id)
          .eq('transaction_type', transaction_type)
          .order('transaction_date', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error finding transactions by type:', error);
        return [];
      }
    },

    async findByDateRange(
      organization_id: string, 
      startDate: string, 
      endDate: string,
      transaction_type?: string
    ): Promise<UniversalTransaction[]> {
      try {
        let query = supabase
          .from('universal_transactions')
          .select('*')
          .eq('organization_id', organization_id)
          .gte('transaction_date', startDate)
          .lte('transaction_date', endDate);

        if (transaction_type) {
          query = query.eq('transaction_type', transaction_type);
        }

        const { data, error } = await query.order('transaction_date', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error finding transactions by date range:', error);
        return [];
      }
    },

    async update(id: string, updates: Partial<UniversalTransaction>): Promise<UniversalTransaction | null> {
      try {
        const { data, error } = await supabase
          .from('universal_transactions')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating transaction:', error);
        return null;
      }
    },

    async updateStatus(id: string, status: string): Promise<UniversalTransaction | null> {
      return this.update(id, { status });
    }
  },

  // Real-time subscriptions
  realtime: {
    subscribeToOrders(organization_id: string, callback: (payload: any) => void) {
      return supabase
        .channel(`orders:${organization_id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'universal_transactions',
            filter: `organization_id=eq.${organization_id},transaction_type=eq.restaurant_order`
          },
          callback
        )
        .subscribe();
    },

    subscribeToOrderStatus(order_id: string, callback: (payload: any) => void) {
      return supabase
        .channel(`order:${order_id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'universal_transactions',
            filter: `id=eq.${order_id}`
          },
          callback
        )
        .subscribe();
    },

    unsubscribe(channel: any) {
      if (channel) {
        supabase.removeChannel(channel);
      }
    }
  }
};

// Helper function to build complete order data
export async function buildCompleteOrder(order: UniversalTransaction): Promise<RestaurantOrder> {
  try {
    // Get order items from dynamic data
    const itemsData = await db.dynamicData.findByEntityAndField(order.id, 'order_items');
    const orderItems = itemsData?.field_value ? JSON.parse(itemsData.field_value) : [];

    // Get additional order metadata
    const metadata = order.metadata || {};

    return {
      ...order,
      customer_id: metadata.customer_id,
      customer_name: metadata.customer_name,
      table_number: metadata.table_number,
      waiter_id: metadata.waiter_id,
      waiter_name: metadata.waiter_name,
      order_items: orderItems,
      subtotal: metadata.subtotal || order.total_amount,
      tax_amount: metadata.tax_amount || 0,
      tip_amount: metadata.tip_amount || 0,
      payment_status: metadata.payment_status || 'pending',
      preparation_status: metadata.preparation_status || 'pending',
      special_instructions: metadata.special_instructions
    };
  } catch (error) {
    console.error('Error building complete order:', error);
    return {
      ...order,
      customer_id: order.metadata?.customer_id,
      customer_name: order.metadata?.customer_name || 'Unknown',
      table_number: order.metadata?.table_number,
      waiter_id: order.metadata?.waiter_id,
      waiter_name: order.metadata?.waiter_name || 'Unknown',
      order_items: [],
      subtotal: order.total_amount,
      tax_amount: 0,
      tip_amount: 0,
      payment_status: 'pending',
      preparation_status: 'pending',
      special_instructions: order.metadata?.special_instructions
    };
  }
}

// Helper function to safely check if a record exists
export async function recordExists(table: string, id: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .eq('id', id)
      .single();
    
    // Return true only if there's no error and data exists
    return !error && !!data;
  } catch (error) {
    console.log(`Record check failed for ${table}:${id}`, error);
    return false;
  }
}

// Export types
export type { Database } from '@/types/supabase';