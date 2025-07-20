/**
 * HERA Universal - Goods Receiving Hook
 * 
 * Custom React hook for managing goods receiving operations
 * Integrates with inventory management and supplier analytics
 * Follows HERA Universal patterns with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import GoodsReceivingService, {
  GoodsReceipt,
  ReceivingDashboardMetrics,
  SupplierPerformance,
  QualityAlert,
  CreateReceiptRequest
} from '@/lib/services/goodsReceivingService';
import InventoryManagementService from '@/lib/services/inventoryManagementService';

interface UseGoodsReceivingReturn {
  // Data
  receipts: GoodsReceipt[];
  metrics: ReceivingDashboardMetrics | null;
  supplierPerformance: SupplierPerformance[];
  qualityAlerts: QualityAlert[];
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  createReceipt: (receiptData: CreateReceiptRequest) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateReceiptStatus: (receiptId: string, status: GoodsReceipt['status'], notes?: string) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Filters and pagination
  filters: {
    status: string;
    supplier: string;
    dateFrom: string;
    dateTo: string;
  };
  setFilters: (filters: Partial<UseGoodsReceivingReturn['filters']>) => void;
  
  // Real-time integration
  lastUpdate: Date | null;
  autoRefresh: boolean;
  setAutoRefresh: (enabled: boolean) => void;
}

export function useGoodsReceiving(organizationId: string): UseGoodsReceivingReturn {
  // State management
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [metrics, setMetrics] = useState<ReceivingDashboardMetrics | null>(null);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>([]);
  const [qualityAlerts, setQualityAlerts] = useState<QualityAlert[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  
  // Filters and real-time updates
  const [filters, setFiltersState] = useState({
    status: 'all',
    supplier: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      console.log('🚚 Fetching goods receiving data for organization:', organizationId);
      
      // Fetch receipts with current filters
      const receiptsResult = await GoodsReceivingService.getGoodsReceipts(organizationId, {
        status: filters.status !== 'all' ? filters.status : undefined,
        supplierId: filters.supplier !== 'all' ? filters.supplier : undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        limit: 100
      });
      
      if (receiptsResult.success && receiptsResult.data) {
        setReceipts(receiptsResult.data);
      } else {
        throw new Error(receiptsResult.error || 'Failed to fetch receipts');
      }

      // Fetch metrics
      const metricsResult = await GoodsReceivingService.getReceivingMetrics(organizationId);
      if (metricsResult.success && metricsResult.data) {
        setMetrics(metricsResult.data);
      }

      // Fetch supplier performance
      const performanceResult = await GoodsReceivingService.getSupplierPerformance(organizationId);
      if (performanceResult.success && performanceResult.data) {
        setSupplierPerformance(performanceResult.data);
      }

      // Fetch quality alerts
      const alertsResult = await GoodsReceivingService.getQualityAlerts(organizationId);
      if (alertsResult.success && alertsResult.data) {
        setQualityAlerts(alertsResult.data);
      }

      setLastUpdate(new Date());
      console.log('✅ Goods receiving data fetched successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch receiving data';
      setError(errorMessage);
      console.error('❌ Error fetching receiving data:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, filters]);

  // Create new receipt with inventory integration
  const createReceipt = useCallback(async (receiptData: CreateReceiptRequest) => {
    try {
      setCreating(true);
      setError(null);

      console.log('🚚 Creating new goods receipt...');

      // Create the receipt
      const result = await GoodsReceivingService.createGoodsReceipt(receiptData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create receipt');
      }

      console.log('✅ Receipt created successfully:', result.data);

      // Update inventory levels for received items
      await updateInventoryFromReceipt(receiptData);

      // Refresh data to show the new receipt
      await fetchData();

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create receipt';
      setError(errorMessage);
      console.error('❌ Error creating receipt:', err);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setCreating(false);
    }
  }, [fetchData]);

  // Update receipt status
  const updateReceiptStatus = useCallback(async (
    receiptId: string, 
    status: GoodsReceipt['status'], 
    notes?: string
  ) => {
    try {
      setUpdating(true);
      setError(null);

      console.log('📝 Updating receipt status:', receiptId, 'to', status);

      const result = await GoodsReceivingService.updateReceiptStatus(receiptId, status, notes);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update receipt status');
      }

      // Refresh data to show updated status
      await fetchData();

      console.log('✅ Receipt status updated successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update receipt status';
      setError(errorMessage);
      console.error('❌ Error updating receipt status:', err);
    } finally {
      setUpdating(false);
    }
  }, [fetchData]);

  // Set filters with data refresh
  const setFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Refresh data manually
  const refreshData = useCallback(async () => {
    setLoading(true);
    await fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    if (organizationId) {
      fetchData();
    }
  }, [organizationId, fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing goods receiving data...');
      fetchData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  // Update inventory when receipt is created
  const updateInventoryFromReceipt = async (receiptData: CreateReceiptRequest) => {
    try {
      console.log('📦 Updating inventory from receipt...');

      for (const item of receiptData.items) {
        if (item.qualityStatus === 'accepted' || item.qualityStatus === 'partial') {
          const quantityToAdd = item.receivedQuantity;
          
          // Update inventory using the existing inventory service
          const updateResult = await InventoryManagementService.updateStock(
            receiptData.organizationId,
            item.itemId,
            {
              quantity_change: quantityToAdd,
              adjustment_type: 'purchase',
              reason: `Goods receipt - ${item.qualityStatus}`,
              reference_id: receiptData.purchaseOrderId,
              notes: `Received via goods receipt. Quality: ${item.qualityStatus}`
            }
          );

          if (updateResult.success) {
            console.log(`✅ Inventory updated for ${item.itemName}: +${quantityToAdd} ${item.unit}`);
          } else {
            console.warn(`⚠️ Failed to update inventory for ${item.itemName}:`, updateResult.error);
          }
        }
      }

      console.log('📦 Inventory updates completed');

    } catch (error) {
      console.error('❌ Error updating inventory from receipt:', error);
      // Don't throw here as the receipt was already created successfully
    }
  };

  return {
    // Data
    receipts,
    metrics,
    supplierPerformance,
    qualityAlerts,
    
    // Loading states
    loading,
    creating,
    updating,
    
    // Error handling
    error,
    
    // Actions
    createReceipt,
    updateReceiptStatus,
    refreshData,
    
    // Filters and pagination
    filters,
    setFilters,
    
    // Real-time integration
    lastUpdate,
    autoRefresh,
    setAutoRefresh
  };
}

export default useGoodsReceiving;