import { useState, useEffect, useCallback } from 'react';
import { UniversalCustomerService } from '@/lib/services/universalCustomerService';
import type { 
  Customer, 
  CustomerCreateInput, 
  CustomerUpdateInput,
  CustomerOrderHistory,
  CustomerAnalytics 
} from '@/lib/services/universalCustomerService';

export interface UseUniversalCustomersReturn {
  // Data
  customers: Customer[];
  selectedCustomer: Customer | null;
  customerOrders: CustomerOrderHistory[];
  customerAnalytics: CustomerAnalytics | null;
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  createCustomer: (customerInput: CustomerCreateInput) => Promise<boolean>;
  updateCustomer: (customerId: string, updates: CustomerUpdateInput) => Promise<boolean>;
  deleteCustomer: (customerId: string) => Promise<boolean>;
  selectCustomer: (customerId: string) => Promise<void>;
  searchCustomers: (query: string) => Promise<void>;
  updateCustomerMetricsAfterOrder: (customerId: string, orderTotal: number, loyaltyPoints: number) => Promise<boolean>;
  refetch: () => Promise<void>;
  
  // Stats
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    newCustomersThisMonth: number;
    totalLoyaltyPoints: number;
    averageOrderValue: number;
    topTier: { bronze: number; silver: number; gold: number; platinum: number };
  };
}

export function useUniversalCustomers(organizationId: string): UseUniversalCustomersReturn {
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrderHistory[]>([]);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await UniversalCustomerService.fetchCustomers(organizationId);
      
      if (result.success && result.customers) {
        setCustomers(result.customers);
      } else {
        throw new Error(result.error || 'Failed to fetch customers');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customers';
      setError(errorMessage);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);
  
  // Create customer
  const createCustomer = useCallback(async (customerInput: CustomerCreateInput): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setCreating(true);
      setError(null);
      
      const result = await UniversalCustomerService.createCustomer(organizationId, customerInput);
      
      if (result.success) {
        await fetchCustomers(); // Refresh list
        return true;
      } else {
        throw new Error(result.error || 'Failed to create customer');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create customer';
      setError(errorMessage);
      console.error('Error creating customer:', err);
      return false;
    } finally {
      setCreating(false);
    }
  }, [organizationId, fetchCustomers]);
  
  // Update customer
  const updateCustomer = useCallback(async (customerId: string, updates: CustomerUpdateInput): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setUpdating(true);
      setError(null);
      
      const result = await UniversalCustomerService.updateCustomer(organizationId, customerId, updates);
      
      if (result.success) {
        await fetchCustomers(); // Refresh list
        
        // Update selected customer if it's the one being updated
        if (selectedCustomer?.id === customerId) {
          await selectCustomer(customerId);
        }
        
        return true;
      } else {
        throw new Error(result.error || 'Failed to update customer');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer';
      setError(errorMessage);
      console.error('Error updating customer:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [organizationId, fetchCustomers, selectedCustomer]);
  
  // Delete customer
  const deleteCustomer = useCallback(async (customerId: string): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setDeleting(true);
      setError(null);
      
      const result = await UniversalCustomerService.deleteCustomer(organizationId, customerId);
      
      if (result.success) {
        await fetchCustomers(); // Refresh list
        
        // Clear selection if deleted customer was selected
        if (selectedCustomer?.id === customerId) {
          setSelectedCustomer(null);
          setCustomerOrders([]);
          setCustomerAnalytics(null);
        }
        
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete customer');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer';
      setError(errorMessage);
      console.error('Error deleting customer:', err);
      return false;
    } finally {
      setDeleting(false);
    }
  }, [organizationId, fetchCustomers, selectedCustomer]);
  
  // Select customer and load details
  const selectCustomer = useCallback(async (customerId: string) => {
    if (!organizationId) return;
    
    try {
      setError(null);
      
      // Get customer details
      const customerResult = await UniversalCustomerService.getCustomerById(organizationId, customerId);
      
      if (customerResult.success && customerResult.customer) {
        setSelectedCustomer(customerResult.customer);
        
        // Load order history
        const ordersResult = await UniversalCustomerService.getCustomerOrderHistory(organizationId, customerId);
        if (ordersResult.success && ordersResult.orders) {
          setCustomerOrders(ordersResult.orders);
        }
        
        // Load analytics
        const analyticsResult = await UniversalCustomerService.getCustomerAnalytics(organizationId, customerId);
        if (analyticsResult.success && analyticsResult.analytics) {
          setCustomerAnalytics(analyticsResult.analytics);
        }
      }
    } catch (err) {
      console.error('Error selecting customer:', err);
    }
  }, [organizationId]);
  
  // Search customers
  const searchCustomers = useCallback(async (query: string) => {
    if (!organizationId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (!query.trim()) {
        await fetchCustomers(); // Reset to all customers
        return;
      }
      
      const result = await UniversalCustomerService.searchCustomers(organizationId, query);
      
      if (result.success && result.customers) {
        setCustomers(result.customers);
      }
    } catch (err) {
      console.error('Error searching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, fetchCustomers]);
  
  // Update customer metrics after order
  const updateCustomerMetricsAfterOrder = useCallback(async (
    customerId: string, 
    orderTotal: number, 
    loyaltyPoints: number
  ): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      const result = await UniversalCustomerService.updateCustomerMetricsAfterOrder(
        organizationId,
        customerId,
        orderTotal,
        loyaltyPoints
      );
      
      if (result.success) {
        await fetchCustomers(); // Refresh customer list
        
        // Refresh selected customer if it's the one being updated
        if (selectedCustomer?.id === customerId) {
          await selectCustomer(customerId);
        }
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error updating customer metrics:', err);
      return false;
    }
  }, [organizationId, fetchCustomers, selectedCustomer, selectCustomer]);
  
  // Calculate stats
  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    newCustomersThisMonth: customers.filter(c => {
      const customerDate = new Date(c.customerSince);
      const now = new Date();
      return customerDate.getMonth() === now.getMonth() && 
             customerDate.getFullYear() === now.getFullYear();
    }).length,
    totalLoyaltyPoints: customers.reduce((sum, c) => sum + c.loyaltyPoints, 0),
    averageOrderValue: customers.length > 0 
      ? customers.reduce((sum, c) => sum + (c.visitCount > 0 ? c.totalSpent / c.visitCount : 0), 0) / customers.length 
      : 0,
    topTier: {
      bronze: customers.filter(c => c.tier === 'bronze').length,
      silver: customers.filter(c => c.tier === 'silver').length,
      gold: customers.filter(c => c.tier === 'gold').length,
      platinum: customers.filter(c => c.tier === 'platinum').length
    }
  };
  
  // Initial load
  useEffect(() => {
    if (organizationId) {
      fetchCustomers();
    }
  }, [organizationId, fetchCustomers]);
  
  return {
    // Data
    customers,
    selectedCustomer,
    customerOrders,
    customerAnalytics,
    
    // Loading states
    loading,
    creating,
    updating,
    deleting,
    
    // Error state
    error,
    
    // Actions
    createCustomer,
    updateCustomer,
    deleteCustomer,
    selectCustomer,
    searchCustomers,
    updateCustomerMetricsAfterOrder,
    refetch: fetchCustomers,
    
    // Stats
    stats
  };
}