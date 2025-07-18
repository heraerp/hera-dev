import { useState, useEffect, useCallback } from 'react';
import { UniversalAnalyticsService } from '@/lib/services/universalAnalyticsService';
import type { 
  DashboardMetrics, 
  RealtimeOrderStatus, 
  SalesAnalytics,
  AIRecommendation,
  PerformanceAlert 
} from '@/lib/services/universalAnalyticsService';

export interface UseUniversalAnalyticsReturn {
  // Core metrics
  metrics: DashboardMetrics | null;
  realtimeOrders: RealtimeOrderStatus[];
  salesAnalytics: SalesAnalytics | null;
  
  // Loading states
  loading: boolean;
  metricsLoading: boolean;
  ordersLoading: boolean;
  analyticsLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Refresh functions
  refreshMetrics: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Real-time status
  isRealTimeConnected: boolean;
  lastUpdate: Date | null;
}

export function useUniversalAnalytics(
  organizationId: string,
  options: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    enableRealTime?: boolean;
  } = {}
): UseUniversalAnalyticsReturn {
  
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableRealTime = true
  } = options;
  
  // State
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [realtimeOrders, setRealtimeOrders] = useState<RealtimeOrderStatus[]>([]);
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // Error and real-time states
  const [error, setError] = useState<string | null>(null);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Refresh metrics
  const refreshMetrics = useCallback(async () => {
    try {
      setMetricsLoading(true);
      setError(null);
      
      console.log('📊 Analytics disabled - skipping metrics refresh');
      
      // Return mock data instead of calling analytics service
      const mockMetrics = {
        dailySales: 0,
        weeklyRevenue: 0,
        monthlyGrowth: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topProducts: [],
        recentActivity: [],
        alerts: []
      };
      
      setMetrics(mockMetrics);
      setLastUpdate(new Date());
      console.log('✅ Mock metrics loaded (analytics disabled)');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analytics disabled';
      setError(errorMessage);
      console.error('❌ Analytics disabled:', err);
    } finally {
      setMetricsLoading(false);
    }
  }, [organizationId]);
  
  // Refresh real-time orders
  const refreshOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      
      console.log('📊 Analytics disabled - skipping real-time orders');
      
      // Return empty orders array (analytics disabled)
      setRealtimeOrders([]);
      console.log('✅ Real-time orders disabled (analytics off)');
    } catch (err) {
      console.error('❌ Error refreshing orders:', err);
      // Don't set error for orders as it's non-critical
    } finally {
      setOrdersLoading(false);
    }
  }, [organizationId]);
  
  // Refresh sales analytics
  const refreshAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      
      console.log('📊 Analytics disabled - skipping sales analytics');
      
      // Return mock sales analytics (analytics disabled)
      const mockSalesAnalytics = {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topProducts: [],
        hourlyTrends: [],
        conversionRate: 0
      };
      
      setSalesAnalytics(mockSalesAnalytics);
      console.log('✅ Mock sales analytics loaded (analytics disabled)');
    } catch (err) {
      console.error('❌ Error refreshing analytics:', err);
      // Don't set error for analytics as it's non-critical
    } finally {
      setAnalyticsLoading(false);
    }
  }, [organizationId]);
  
  // Refresh all data
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        refreshMetrics(),
        refreshOrders(),
        refreshAnalytics()
      ]);
    } finally {
      setLoading(false);
    }
  }, [refreshMetrics, refreshOrders, refreshAnalytics]);
  
  // Initial data load
  useEffect(() => {
    if (organizationId) {
      console.log('📊 Initializing Universal Analytics for organization:', organizationId);
      refreshAll();
    } else {
      // No organizationId provided, set loading to false to prevent infinite loading
      setLoading(false);
      console.log('⏭️ No organization ID provided, skipping analytics load');
    }
  }, [organizationId, refreshAll]);
  
  // Auto refresh setup
  useEffect(() => {
    if (!autoRefresh || !organizationId) return;
    
    console.log(`⏰ Setting up auto refresh every ${refreshInterval}ms`);
    const interval = setInterval(() => {
      refreshMetrics();
      refreshOrders();
    }, refreshInterval);
    
    return () => {
      clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, organizationId, refreshMetrics, refreshOrders]);
  
  // Real-time subscriptions
  useEffect(() => {
    if (!enableRealTime || !organizationId) return;
    
    console.log('📊 Analytics disabled - skipping real-time subscriptions');
    
    try {
      // Analytics disabled - no real-time subscriptions
      const unsubscribe = () => {
        console.log('📊 No analytics subscriptions to unsubscribe');
      };
      
      setIsRealTimeConnected(false); // No real-time connection when analytics disabled
      
      return () => {
        console.log('📊 Analytics cleanup (no subscriptions to clean)');
        unsubscribe();
        setIsRealTimeConnected(false);
      };
    } catch (error) {
      console.warn('⚠️ Failed to set up real-time subscriptions:', error);
      setIsRealTimeConnected(false);
    }
  }, [enableRealTime, organizationId, refreshMetrics, refreshOrders]);
  
  return {
    // Core metrics
    metrics,
    realtimeOrders,
    salesAnalytics,
    
    // Loading states
    loading,
    metricsLoading,
    ordersLoading,
    analyticsLoading,
    
    // Error state
    error,
    
    // Refresh functions
    refreshMetrics,
    refreshOrders,
    refreshAnalytics,
    refreshAll,
    
    // Real-time status
    isRealTimeConnected,
    lastUpdate
  };
}