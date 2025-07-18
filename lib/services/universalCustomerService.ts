import UniversalCrudService from '@/lib/services/universalCrudService';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient();

// Customer Type Definitions
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  visitCount: number;
  favoriteItems: string[];
  totalSpent: number;
  lastVisit: string;
  customerSince: string;
  status: 'active' | 'inactive';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  preferences: {
    favoriteTeaType?: string;
    dietaryRestrictions?: string[];
    preferredSeating?: string;
    communicationPreference?: 'email' | 'sms' | 'both' | 'none';
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  metadata?: Record<string, any>;
}

export interface CustomerCreateInput {
  name: string;
  email?: string;
  phone?: string;
  preferences?: Customer['preferences'];
  address?: Customer['address'];
}

export interface CustomerUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  preferences?: Customer['preferences'];
  address?: Customer['address'];
  metadata?: Record<string, any>;
}

export interface CustomerOrderHistory {
  orderId: string;
  orderNumber: string;
  date: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
}

export interface CustomerAnalytics {
  averageOrderValue: number;
  orderFrequency: number; // orders per month
  lifetimeValue: number;
  favoriteProducts: Array<{ productName: string; orderCount: number }>;
  visitPatterns: {
    mostFrequentDay: string;
    preferredTime: string;
  };
  loyaltyProgress: {
    currentTier: string;
    pointsToNextTier: number;
    tierBenefits: string[];
  };
}

export class UniversalCustomerService {
  /**
   * Create a new customer
   */
  static async createCustomer(
    organizationId: string,
    customerInput: CustomerCreateInput
  ): Promise<{
    success: boolean;
    customerId?: string;
    error?: string;
  }> {
    try {
      console.log('🧑 Creating customer:', customerInput.name);
      
      const customerId = uuidv4();
      const now = new Date().toISOString();
      
      // Create customer in core_entities
      const { data: entityData, error: entityError } = await supabase
        .from('core_entities')
        .insert({
          id: customerId,
          organization_id: organizationId,
          entity_type: 'customer',
          entity_subtype: 'restaurant_customer',
          entity_name: customerInput.name,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();
      
      if (entityError) throw entityError;
      
      // Store customer metadata
      const metadataEntries = [];
      
      // Basic information
      if (customerInput.email) {
        metadataEntries.push({
          organization_id: organizationId,
          entity_type: 'customer',
          entity_id: customerId,
          metadata_type: 'customer_info',
          metadata_category: 'contact',
          metadata_key: 'email',
          metadata_value: { value: customerInput.email }
        });
      }
      
      if (customerInput.phone) {
        metadataEntries.push({
          organization_id: organizationId,
          entity_type: 'customer',
          entity_id: customerId,
          metadata_type: 'customer_info',
          metadata_category: 'contact',
          metadata_key: 'phone',
          metadata_value: { value: customerInput.phone }
        });
      }
      
      // Initialize customer metrics
      const initialMetrics = {
        loyalty_points: 0,
        visit_count: 0,
        total_spent: 0,
        tier: 'bronze',
        status: 'active',
        customer_since: now,
        last_visit: null
      };
      
      metadataEntries.push({
        organization_id: organizationId,
        entity_type: 'customer',
        entity_id: customerId,
        metadata_type: 'customer_metrics',
        metadata_category: 'analytics',
        metadata_key: 'metrics',
        metadata_value: initialMetrics
      });
      
      // Store preferences if provided
      if (customerInput.preferences) {
        metadataEntries.push({
          organization_id: organizationId,
          entity_type: 'customer',
          entity_id: customerId,
          metadata_type: 'customer_preferences',
          metadata_category: 'preferences',
          metadata_key: 'preferences',
          metadata_value: customerInput.preferences
        });
      }
      
      // Store address if provided
      if (customerInput.address) {
        metadataEntries.push({
          organization_id: organizationId,
          entity_type: 'customer',
          entity_id: customerId,
          metadata_type: 'customer_address',
          metadata_category: 'contact',
          metadata_key: 'address',
          metadata_value: customerInput.address
        });
      }
      
      // Insert all metadata
      if (metadataEntries.length > 0) {
        const { error: metadataError } = await supabase
          .from('core_metadata')
          .insert(metadataEntries);
        
        if (metadataError) throw metadataError;
      }
      
      console.log('✅ Customer created successfully:', customerId);
      
      return {
        success: true,
        customerId
      };
      
    } catch (error) {
      console.error('❌ Error creating customer:', error);
      return {
        success: false,
        error: error.message || 'Failed to create customer'
      };
    }
  }
  
  /**
   * Fetch all customers
   */
  static async fetchCustomers(organizationId: string): Promise<{
    success: boolean;
    customers?: Customer[];
    error?: string;
  }> {
    try {
      console.log('🧑 Fetching customers...');
      
      // Fetch customer entities
      const { data: entities, error: entitiesError } = await supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'customer')
        .order('created_at', { ascending: false });
      
      if (entitiesError) throw entitiesError;
      
      if (!entities || entities.length === 0) {
        return { success: true, customers: [] };
      }
      
      // Fetch metadata for all customers
      const customerIds = entities.map(e => e.id);
      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'customer')
        .in('entity_id', customerIds);
      
      if (metadataError) throw metadataError;
      
      // Process customers
      const customers: Customer[] = entities.map(entity => {
        const customerMetadata = metadata?.filter(m => m.entity_id === entity.id) || [];
        
        // Extract metadata values
        const metricsData = customerMetadata.find(m => m.metadata_key === 'metrics')?.metadata_value || {};
        const emailData = customerMetadata.find(m => m.metadata_key === 'email')?.metadata_value;
        const phoneData = customerMetadata.find(m => m.metadata_key === 'phone')?.metadata_value;
        const preferencesData = customerMetadata.find(m => m.metadata_key === 'preferences')?.metadata_value || {};
        const addressData = customerMetadata.find(m => m.metadata_key === 'address')?.metadata_value;
        
        return {
          id: entity.id,
          name: entity.entity_name,
          email: emailData?.value || '',
          phone: phoneData?.value || '',
          loyaltyPoints: metricsData.loyalty_points || 0,
          visitCount: metricsData.visit_count || 0,
          favoriteItems: metricsData.favorite_items || [],
          totalSpent: metricsData.total_spent || 0,
          lastVisit: metricsData.last_visit || entity.created_at,
          customerSince: metricsData.customer_since || entity.created_at,
          status: metricsData.status || 'active',
          tier: metricsData.tier || 'bronze',
          preferences: preferencesData,
          address: addressData,
          metadata: entity.custom_metadata || {}
        };
      });
      
      console.log(`✅ Fetched ${customers.length} customers`);
      
      return {
        success: true,
        customers
      };
      
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch customers'
      };
    }
  }
  
  /**
   * Get customer by ID
   */
  static async getCustomerById(
    organizationId: string,
    customerId: string
  ): Promise<{
    success: boolean;
    customer?: Customer;
    error?: string;
  }> {
    try {
      console.log('🧑 Fetching customer:', customerId);
      
      // Fetch customer entity
      const { data: entity, error: entityError } = await supabase
        .from('core_entities')
        .select('*')
        .eq('id', customerId)
        .eq('organization_id', organizationId)
        .eq('entity_type', 'customer')
        .single();
      
      if (entityError) throw entityError;
      
      if (!entity) {
        return { success: false, error: 'Customer not found' };
      }
      
      // Fetch customer metadata
      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'customer')
        .eq('entity_id', customerId);
      
      if (metadataError) throw metadataError;
      
      // Extract metadata values
      const metricsData = metadata?.find(m => m.metadata_key === 'metrics')?.metadata_value || {};
      const emailData = metadata?.find(m => m.metadata_key === 'email')?.metadata_value;
      const phoneData = metadata?.find(m => m.metadata_key === 'phone')?.metadata_value;
      const preferencesData = metadata?.find(m => m.metadata_key === 'preferences')?.metadata_value || {};
      const addressData = metadata?.find(m => m.metadata_key === 'address')?.metadata_value;
      
      const customer: Customer = {
        id: entity.id,
        name: entity.entity_name,
        email: emailData?.value || '',
        phone: phoneData?.value || '',
        loyaltyPoints: metricsData.loyalty_points || 0,
        visitCount: metricsData.visit_count || 0,
        favoriteItems: metricsData.favorite_items || [],
        totalSpent: metricsData.total_spent || 0,
        lastVisit: metricsData.last_visit || entity.created_at,
        customerSince: metricsData.customer_since || entity.created_at,
        status: metricsData.status || 'active',
        tier: metricsData.tier || 'bronze',
        preferences: preferencesData,
        address: addressData,
        metadata: entity.custom_metadata || {}
      };
      
      console.log('✅ Customer fetched successfully');
      
      return {
        success: true,
        customer
      };
      
    } catch (error) {
      console.error('❌ Error fetching customer:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch customer'
      };
    }
  }
  
  /**
   * Update customer
   */
  static async updateCustomer(
    organizationId: string,
    customerId: string,
    updates: CustomerUpdateInput
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('🔄 Updating customer:', customerId);
      
      // Update entity name if provided
      if (updates.name) {
        const { error: entityError } = await supabase
          .from('core_entities')
          .update({
            entity_name: updates.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', customerId)
          .eq('organization_id', organizationId);
        
        if (entityError) throw entityError;
      }
      
      // Update metadata entries
      const updatePromises = [];
      
      if (updates.email !== undefined) {
        updatePromises.push(
          supabase
            .from('core_metadata')
            .upsert({
              organization_id: organizationId,
              entity_type: 'customer',
              entity_id: customerId,
              metadata_type: 'customer_info',
              metadata_category: 'contact',
              metadata_key: 'email',
              metadata_value: { value: updates.email }
            })
        );
      }
      
      if (updates.phone !== undefined) {
        updatePromises.push(
          supabase
            .from('core_metadata')
            .upsert({
              organization_id: organizationId,
              entity_type: 'customer',
              entity_id: customerId,
              metadata_type: 'customer_info',
              metadata_category: 'contact',
              metadata_key: 'phone',
              metadata_value: { value: updates.phone }
            })
        );
      }
      
      if (updates.preferences) {
        updatePromises.push(
          supabase
            .from('core_metadata')
            .upsert({
              organization_id: organizationId,
              entity_type: 'customer',
              entity_id: customerId,
              metadata_type: 'customer_preferences',
              metadata_category: 'preferences',
              metadata_key: 'preferences',
              metadata_value: updates.preferences
            })
        );
      }
      
      if (updates.address) {
        updatePromises.push(
          supabase
            .from('core_metadata')
            .upsert({
              organization_id: organizationId,
              entity_type: 'customer',
              entity_id: customerId,
              metadata_type: 'customer_address',
              metadata_category: 'contact',
              metadata_key: 'address',
              metadata_value: updates.address
            })
        );
      }
      
      // Update status if provided
      if (updates.status) {
        const { data: currentMetrics } = await supabase
          .from('core_metadata')
          .select('metadata_value')
          .eq('organization_id', organizationId)
          .eq('entity_type', 'customer')
          .eq('entity_id', customerId)
          .eq('metadata_key', 'metrics')
          .single();
        
        const updatedMetrics = {
          ...(currentMetrics?.metadata_value || {}),
          status: updates.status
        };
        
        updatePromises.push(
          supabase
            .from('core_metadata')
            .upsert({
              organization_id: organizationId,
              entity_type: 'customer',
              entity_id: customerId,
              metadata_type: 'customer_metrics',
              metadata_category: 'analytics',
              metadata_key: 'metrics',
              metadata_value: updatedMetrics
            })
        );
      }
      
      // Execute all updates
      await Promise.all(updatePromises);
      
      console.log('✅ Customer updated successfully');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error updating customer:', error);
      return {
        success: false,
        error: error.message || 'Failed to update customer'
      };
    }
  }
  
  /**
   * Get customer order history
   */
  static async getCustomerOrderHistory(
    organizationId: string,
    customerId: string
  ): Promise<{
    success: boolean;
    orders?: CustomerOrderHistory[];
    error?: string;
  }> {
    try {
      console.log('📋 Fetching customer order history:', customerId);
      
      // Fetch customer metadata to get customer name
      const { data: customerMetadata } = await supabase
        .from('core_metadata')
        .select('metadata_value')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'customer')
        .eq('entity_id', customerId)
        .eq('metadata_key', 'email')
        .single();
      
      const customerEmail = customerMetadata?.metadata_value?.value;
      
      // Fetch orders for this customer
      const { data: orders, error: ordersError } = await supabase
        .from('universal_transactions')
        .select(`
          *,
          universal_transaction_lines (*)
        `)
        .eq('organization_id', organizationId)
        .eq('transaction_type', 'SALES_ORDER')
        .or(`customer_id.eq.${customerId},metadata->customer_email.eq.${customerEmail}`)
        .order('transaction_date', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      if (!orders || orders.length === 0) {
        return { success: true, orders: [] };
      }
      
      // Process orders
      const orderHistory: CustomerOrderHistory[] = orders.map(order => ({
        orderId: order.id,
        orderNumber: order.transaction_number,
        date: order.transaction_date,
        items: order.universal_transaction_lines?.map(line => ({
          productName: line.line_description,
          quantity: line.quantity,
          price: line.unit_price
        })) || [],
        total: order.total_amount,
        status: order.status
      }));
      
      console.log(`✅ Fetched ${orderHistory.length} orders for customer`);
      
      return {
        success: true,
        orders: orderHistory
      };
      
    } catch (error) {
      console.error('❌ Error fetching customer order history:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch order history'
      };
    }
  }
  
  /**
   * Get customer analytics
   */
  static async getCustomerAnalytics(
    organizationId: string,
    customerId: string
  ): Promise<{
    success: boolean;
    analytics?: CustomerAnalytics;
    error?: string;
  }> {
    try {
      console.log('📊 Calculating customer analytics:', customerId);
      
      // Get customer data
      const customerResult = await this.getCustomerById(organizationId, customerId);
      if (!customerResult.success || !customerResult.customer) {
        throw new Error('Customer not found');
      }
      
      const customer = customerResult.customer;
      
      // Get order history
      const ordersResult = await this.getCustomerOrderHistory(organizationId, customerId);
      const orders = ordersResult.orders || [];
      
      // Calculate analytics
      const averageOrderValue = customer.visitCount > 0 
        ? customer.totalSpent / customer.visitCount 
        : 0;
      
      // Calculate order frequency (orders per month)
      const customerAge = new Date().getTime() - new Date(customer.customerSince).getTime();
      const monthsSinceJoined = Math.max(1, customerAge / (1000 * 60 * 60 * 24 * 30));
      const orderFrequency = customer.visitCount / monthsSinceJoined;
      
      // Calculate lifetime value (simple projection)
      const projectedMonths = 24; // 2-year projection
      const lifetimeValue = averageOrderValue * orderFrequency * projectedMonths;
      
      // Calculate favorite products
      const productCounts: Record<string, number> = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          productCounts[item.productName] = (productCounts[item.productName] || 0) + 1;
        });
      });
      
      const favoriteProducts = Object.entries(productCounts)
        .map(([productName, orderCount]) => ({ productName, orderCount }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5);
      
      // Calculate tier progress
      const tierThresholds = {
        bronze: { min: 0, max: 50, benefits: ['Welcome bonus', '5% off birthday month'] },
        silver: { min: 50, max: 150, benefits: ['10% off every 5th order', 'Priority seating'] },
        gold: { min: 150, max: 500, benefits: ['15% off all orders', 'Free birthday dessert', 'VIP events'] },
        platinum: { min: 500, max: Infinity, benefits: ['20% off all orders', 'Personal concierge', 'Exclusive tastings'] }
      };
      
      const currentTierInfo = tierThresholds[customer.tier];
      const nextTier = customer.tier === 'platinum' ? null : 
        Object.entries(tierThresholds).find(([tier, info]) => 
          info.min > customer.loyaltyPoints
        );
      
      const analytics: CustomerAnalytics = {
        averageOrderValue,
        orderFrequency,
        lifetimeValue,
        favoriteProducts,
        visitPatterns: {
          mostFrequentDay: 'Saturday', // Mock data - would calculate from actual order timestamps
          preferredTime: '2:00 PM - 4:00 PM' // Mock data
        },
        loyaltyProgress: {
          currentTier: customer.tier,
          pointsToNextTier: nextTier ? nextTier[1].min - customer.loyaltyPoints : 0,
          tierBenefits: currentTierInfo.benefits
        }
      };
      
      console.log('✅ Customer analytics calculated');
      
      return {
        success: true,
        analytics
      };
      
    } catch (error) {
      console.error('❌ Error calculating customer analytics:', error);
      return {
        success: false,
        error: error.message || 'Failed to calculate analytics'
      };
    }
  }
  
  /**
   * Update customer metrics after order
   */
  static async updateCustomerMetricsAfterOrder(
    organizationId: string,
    customerId: string,
    orderTotal: number,
    loyaltyPointsEarned: number
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('📈 Updating customer metrics after order');
      
      // Get current metrics
      const { data: currentMetricsData } = await supabase
        .from('core_metadata')
        .select('metadata_value')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'customer')
        .eq('entity_id', customerId)
        .eq('metadata_key', 'metrics')
        .single();
      
      const currentMetrics = currentMetricsData?.metadata_value || {};
      
      // Update metrics
      const updatedMetrics = {
        ...currentMetrics,
        loyalty_points: (currentMetrics.loyalty_points || 0) + loyaltyPointsEarned,
        visit_count: (currentMetrics.visit_count || 0) + 1,
        total_spent: (currentMetrics.total_spent || 0) + orderTotal,
        last_visit: new Date().toISOString()
      };
      
      // Calculate new tier
      if (updatedMetrics.loyalty_points >= 500) {
        updatedMetrics.tier = 'platinum';
      } else if (updatedMetrics.loyalty_points >= 150) {
        updatedMetrics.tier = 'gold';
      } else if (updatedMetrics.loyalty_points >= 50) {
        updatedMetrics.tier = 'silver';
      } else {
        updatedMetrics.tier = 'bronze';
      }
      
      // Update metrics in database
      const { error: updateError } = await supabase
        .from('core_metadata')
        .upsert({
          organization_id: organizationId,
          entity_type: 'customer',
          entity_id: customerId,
          metadata_type: 'customer_metrics',
          metadata_category: 'analytics',
          metadata_key: 'metrics',
          metadata_value: updatedMetrics
        });
      
      if (updateError) throw updateError;
      
      console.log('✅ Customer metrics updated');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error updating customer metrics:', error);
      return {
        success: false,
        error: error.message || 'Failed to update customer metrics'
      };
    }
  }
  
  /**
   * Delete customer
   */
  static async deleteCustomer(
    organizationId: string,
    customerId: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('🗑️ Deleting customer:', customerId);
      
      // Delete metadata first
      const { error: metadataError } = await supabase
        .from('core_metadata')
        .delete()
        .eq('organization_id', organizationId)
        .eq('entity_type', 'customer')
        .eq('entity_id', customerId);
      
      if (metadataError) throw metadataError;
      
      // Delete entity
      const { error: entityError } = await supabase
        .from('core_entities')
        .delete()
        .eq('id', customerId)
        .eq('organization_id', organizationId);
      
      if (entityError) throw entityError;
      
      console.log('✅ Customer deleted successfully');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error deleting customer:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete customer'
      };
    }
  }
  
  /**
   * Search customers
   */
  static async searchCustomers(
    organizationId: string,
    query: string
  ): Promise<{
    success: boolean;
    customers?: Customer[];
    error?: string;
  }> {
    try {
      console.log('🔍 Searching customers:', query);
      
      // Search in entities
      const { data: entities, error: entitiesError } = await supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'customer')
        .ilike('entity_name', `%${query}%`)
        .order('created_at', { ascending: false });
      
      if (entitiesError) throw entitiesError;
      
      if (!entities || entities.length === 0) {
        return { success: true, customers: [] };
      }
      
      // Fetch metadata for found customers
      const customerIds = entities.map(e => e.id);
      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'customer')
        .in('entity_id', customerIds);
      
      if (metadataError) throw metadataError;
      
      // Process customers
      const customers: Customer[] = entities.map(entity => {
        const customerMetadata = metadata?.filter(m => m.entity_id === entity.id) || [];
        
        // Extract metadata values
        const metricsData = customerMetadata.find(m => m.metadata_key === 'metrics')?.metadata_value || {};
        const emailData = customerMetadata.find(m => m.metadata_key === 'email')?.metadata_value;
        const phoneData = customerMetadata.find(m => m.metadata_key === 'phone')?.metadata_value;
        const preferencesData = customerMetadata.find(m => m.metadata_key === 'preferences')?.metadata_value || {};
        const addressData = customerMetadata.find(m => m.metadata_key === 'address')?.metadata_value;
        
        return {
          id: entity.id,
          name: entity.entity_name,
          email: emailData?.value || '',
          phone: phoneData?.value || '',
          loyaltyPoints: metricsData.loyalty_points || 0,
          visitCount: metricsData.visit_count || 0,
          favoriteItems: metricsData.favorite_items || [],
          totalSpent: metricsData.total_spent || 0,
          lastVisit: metricsData.last_visit || entity.created_at,
          customerSince: metricsData.customer_since || entity.created_at,
          status: metricsData.status || 'active',
          tier: metricsData.tier || 'bronze',
          preferences: preferencesData,
          address: addressData,
          metadata: entity.custom_metadata || {}
        };
      });
      
      console.log(`✅ Found ${customers.length} customers matching "${query}"`);
      
      return {
        success: true,
        customers
      };
      
    } catch (error) {
      console.error('❌ Error searching customers:', error);
      return {
        success: false,
        error: error.message || 'Failed to search customers'
      };
    }
  }
}