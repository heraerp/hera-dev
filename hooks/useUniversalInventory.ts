import { useState, useEffect, useCallback } from 'react';
import { UniversalInventoryService } from '@/lib/services/universalInventoryService';
import type { 
  InventoryItem, 
  InventoryTransaction,
  ReorderAlert,
  InventoryAnalytics
} from '@/lib/services/universalInventoryService';

export interface UseUniversalInventoryReturn {
  // Data
  inventoryItems: InventoryItem[];
  transactions: InventoryTransaction[];
  reorderAlerts: ReorderAlert[];
  analytics: InventoryAnalytics | null;
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  createInventoryItem: (productId: string, inventoryData: any) => Promise<boolean>;
  updateStock: (itemId: string, stockChange: number, type: string, options?: any) => Promise<boolean>;
  processOrderUpdate: (orderItems: any[], orderId: string) => Promise<{ success: boolean; insufficientStock?: any[] }>;
  refetch: () => Promise<void>;
  
  // Stats
  stats: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    criticalItems: number;
    reorderAlerts: number;
    averageTurnover: number;
    wasteValue: number;
  };
}

export function useUniversalInventory(organizationId: string): UseUniversalInventoryReturn {
  // State
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [reorderAlerts, setReorderAlerts] = useState<ReorderAlert[]>([]);
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Fetch inventory items
  const fetchInventoryItems = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      setError(null);
      
      const result = await UniversalInventoryService.getInventoryItems(organizationId);
      
      if (result.success && result.items) {
        setInventoryItems(result.items);
      } else {
        throw new Error(result.error || 'Failed to fetch inventory items');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory';
      setError(errorMessage);
      console.error('Error fetching inventory items:', err);
    }
  }, [organizationId]);
  
  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      const result = await UniversalInventoryService.getInventoryTransactions(organizationId);
      
      if (result.success && result.transactions) {
        setTransactions(result.transactions);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  }, [organizationId]);
  
  // Fetch reorder alerts
  const fetchReorderAlerts = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      const result = await UniversalInventoryService.getReorderAlerts(organizationId);
      
      if (result.success && result.alerts) {
        setReorderAlerts(result.alerts);
      }
    } catch (err) {
      console.error('Error fetching reorder alerts:', err);
    }
  }, [organizationId]);
  
  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      const result = await UniversalInventoryService.getInventoryAnalytics(organizationId);
      
      if (result.success && result.analytics) {
        setAnalytics(result.analytics);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  }, [organizationId]);
  
  // Fetch all data
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchInventoryItems(),
        fetchTransactions(),
        fetchReorderAlerts(),
        fetchAnalytics()
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchInventoryItems, fetchTransactions, fetchReorderAlerts, fetchAnalytics]);
  
  // Create inventory item
  const createInventoryItem = useCallback(async (
    productId: string, 
    inventoryData: any
  ): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setCreating(true);
      setError(null);
      
      const result = await UniversalInventoryService.createInventoryItem(
        organizationId, 
        productId, 
        inventoryData
      );
      
      if (result.success) {
        await refetch(); // Refresh all data
        return true;
      } else {
        throw new Error(result.error || 'Failed to create inventory item');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create inventory item';
      setError(errorMessage);
      console.error('Error creating inventory item:', err);
      return false;
    } finally {
      setCreating(false);
    }
  }, [organizationId, refetch]);
  
  // Update stock
  const updateStock = useCallback(async (
    itemId: string,
    stockChange: number,
    type: string,
    options: any = {}
  ): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setUpdating(true);
      setError(null);
      
      const result = await UniversalInventoryService.updateStock(
        organizationId,
        itemId,
        stockChange,
        type as any,
        options
      );
      
      if (result.success) {
        await refetch(); // Refresh all data
        return true;
      } else {
        throw new Error(result.error || 'Failed to update stock');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update stock';
      setError(errorMessage);
      console.error('Error updating stock:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [organizationId, refetch]);
  
  // Process order inventory update
  const processOrderUpdate = useCallback(async (
    orderItems: any[],
    orderId: string
  ): Promise<{ success: boolean; insufficientStock?: any[] }> => {
    if (!organizationId) return { success: false };
    
    try {
      setUpdating(true);
      setError(null);
      
      const result = await UniversalInventoryService.processOrderInventoryUpdate(
        organizationId,
        orderItems,
        orderId
      );
      
      if (result.success) {
        await refetch(); // Refresh all data
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process order update';
      setError(errorMessage);
      console.error('Error processing order update:', err);
      return { success: false };
    } finally {
      setUpdating(false);
    }
  }, [organizationId, refetch]);
  
  // Calculate stats
  const stats = {
    totalItems: inventoryItems.length,
    totalValue: inventoryItems.reduce((sum, item) => sum + item.totalValue, 0),
    lowStockItems: inventoryItems.filter(item => item.status === 'low').length,
    criticalItems: inventoryItems.filter(item => item.status === 'critical').length,
    reorderAlerts: reorderAlerts.length,
    averageTurnover: analytics?.averageTurnover || 0,
    wasteValue: analytics?.wasteAnalysis.wasteValue || 0
  };
  
  // Initial load
  useEffect(() => {
    if (organizationId) {
      refetch();
    }
  }, [organizationId, refetch]);
  
  return {
    // Data
    inventoryItems,
    transactions,
    reorderAlerts,
    analytics,
    
    // Loading states
    loading,
    creating,
    updating,
    
    // Error state
    error,
    
    // Actions
    createInventoryItem,
    updateStock,
    processOrderUpdate,
    refetch,
    
    // Stats
    stats
  };
}