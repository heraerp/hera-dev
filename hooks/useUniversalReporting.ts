import { useState, useEffect, useCallback } from 'react';
import { UniversalReportingService } from '@/lib/services/universalReportingService';
import type {
  ReportMetrics,
  AnalyticsDashboard,
  DashboardWidget,
  UniversalAnalytics,
  ReportTemplate
} from '@/lib/services/universalReportingService';

export interface UseUniversalReportingReturn {
  // Data
  analytics: UniversalAnalytics | null;
  reports: ReportMetrics[];
  dashboards: AnalyticsDashboard[];
  currentDashboard: AnalyticsDashboard | null;
  
  // Loading states
  loading: boolean;
  generating: boolean;
  loadingDashboards: boolean;
  loadingWidgets: boolean;
  
  // Error states
  error: string | null;
  
  // Analytics actions
  fetchAnalytics: (period: { startDate: string; endDate: string }) => Promise<boolean>;
  generateReport: (
    reportType: ReportMetrics['reportType'],
    period: { startDate: string; endDate: string; type: ReportMetrics['period']['type'] }
  ) => Promise<ReportMetrics | null>;
  
  // Dashboard actions
  createDashboard: (dashboardData: Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateDashboard: (dashboardId: string, updates: Partial<AnalyticsDashboard>) => Promise<boolean>;
  deleteDashboard: (dashboardId: string) => Promise<boolean>;
  setCurrentDashboard: (dashboard: AnalyticsDashboard | null) => void;
  
  // Widget actions
  addWidget: (widget: Omit<DashboardWidget, 'id'>) => Promise<boolean>;
  updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => Promise<boolean>;
  removeWidget: (widgetId: string) => Promise<boolean>;
  getWidgetData: (widget: DashboardWidget) => Promise<any>;
  
  // Report actions
  fetchReports: (reportType?: ReportMetrics['reportType']) => Promise<boolean>;
  deleteReport: (reportId: string) => Promise<boolean>;
  exportReport: (reportId: string, format: 'pdf' | 'excel' | 'csv') => Promise<boolean>;
  
  // Utility functions
  getMetricsByCategory: (category: keyof UniversalAnalytics) => Record<string, any>;
  calculateGrowth: (current: number, previous: number) => number;
  formatMetric: (value: number, type: 'currency' | 'percentage' | 'number') => string;
  
  // Real-time updates
  refreshData: () => Promise<void>;
  
  // Stats
  stats: {
    totalReports: number;
    totalDashboards: number;
    lastGeneratedReport: string | null;
    analyticsLastUpdated: string | null;
  };
}

export function useUniversalReporting(organizationId: string): UseUniversalReportingReturn {
  // State
  const [analytics, setAnalytics] = useState<UniversalAnalytics | null>(null);
  const [reports, setReports] = useState<ReportMetrics[]>([]);
  const [dashboards, setDashboards] = useState<AnalyticsDashboard[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<AnalyticsDashboard | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadingDashboards, setLoadingDashboards] = useState(false);
  const [loadingWidgets, setLoadingWidgets] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Analytics last updated
  const [analyticsLastUpdated, setAnalyticsLastUpdated] = useState<string | null>(null);
  
  // Fetch analytics data
  const fetchAnalytics = useCallback(async (
    period: { startDate: string; endDate: string }
  ): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setError(null);
      
      const result = await UniversalReportingService.getUniversalAnalytics(
        organizationId,
        period
      );
      
      if (result.success && result.analytics) {
        setAnalytics(result.analytics);
        setAnalyticsLastUpdated(new Date().toISOString());
        return true;
      } else {
        throw new Error(result.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      console.error('Error fetching analytics:', err);
      return false;
    }
  }, [organizationId]);
  
  // Generate report
  const generateReport = useCallback(async (
    reportType: ReportMetrics['reportType'],
    period: { startDate: string; endDate: string; type: ReportMetrics['period']['type'] }
  ): Promise<ReportMetrics | null> => {
    if (!organizationId) return null;
    
    try {
      setGenerating(true);
      setError(null);
      
      const result = await UniversalReportingService.generateReport(
        organizationId,
        reportType,
        period
      );
      
      if (result.success && result.report) {
        // Refresh reports list
        await fetchReports();
        return result.report;
      } else {
        throw new Error(result.error || 'Failed to generate report');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      console.error('Error generating report:', err);
      return null;
    } finally {
      setGenerating(false);
    }
  }, [organizationId]);
  
  // Fetch reports
  const fetchReports = useCallback(async (
    reportType?: ReportMetrics['reportType']
  ): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setError(null);
      
      const result = await UniversalReportingService.getReports(organizationId, reportType);
      
      if (result.success && result.reports) {
        setReports(result.reports);
        return true;
      } else {
        throw new Error(result.error || 'Failed to fetch reports');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reports';
      setError(errorMessage);
      console.error('Error fetching reports:', err);
      return false;
    }
  }, [organizationId]);
  
  // Fetch dashboards
  const fetchDashboards = useCallback(async (): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setLoadingDashboards(true);
      setError(null);
      
      const result = await UniversalReportingService.getDashboards(organizationId);
      
      if (result.success && result.dashboards) {
        setDashboards(result.dashboards);
        
        // Set default dashboard if none is selected
        if (!currentDashboard && result.dashboards.length > 0) {
          const defaultDashboard = result.dashboards.find(d => d.isDefault) || result.dashboards[0];
          setCurrentDashboard(defaultDashboard);
        }
        
        return true;
      } else {
        throw new Error(result.error || 'Failed to fetch dashboards');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboards';
      setError(errorMessage);
      console.error('Error fetching dashboards:', err);
      return false;
    } finally {
      setLoadingDashboards(false);
    }
  }, [organizationId, currentDashboard]);
  
  // Create dashboard
  const createDashboard = useCallback(async (
    dashboardData: Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setError(null);
      
      const result = await UniversalReportingService.createDashboard(
        organizationId,
        dashboardData
      );
      
      if (result.success) {
        await fetchDashboards(); // Refresh dashboards
        return true;
      } else {
        throw new Error(result.error || 'Failed to create dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create dashboard';
      setError(errorMessage);
      console.error('Error creating dashboard:', err);
      return false;
    }
  }, [organizationId, fetchDashboards]);
  
  // Update dashboard
  const updateDashboard = useCallback(async (
    dashboardId: string,
    updates: Partial<AnalyticsDashboard>
  ): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setError(null);
      
      // Update local state immediately for optimistic updates
      setDashboards(prev => prev.map(d => 
        d.id === dashboardId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      ));
      
      if (currentDashboard?.id === dashboardId) {
        setCurrentDashboard(prev => 
          prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null
        );
      }
      
      // Here you would call the API to update the dashboard
      // For now, we'll simulate success
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update dashboard';
      setError(errorMessage);
      console.error('Error updating dashboard:', err);
      
      // Revert optimistic update on error
      await fetchDashboards();
      return false;
    }
  }, [organizationId, currentDashboard, fetchDashboards]);
  
  // Delete dashboard
  const deleteDashboard = useCallback(async (dashboardId: string): Promise<boolean> => {
    if (!organizationId) return false;
    
    try {
      setError(null);
      
      // Remove from local state
      setDashboards(prev => prev.filter(d => d.id !== dashboardId));
      
      if (currentDashboard?.id === dashboardId) {
        setCurrentDashboard(null);
      }
      
      // Here you would call the API to delete the dashboard
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete dashboard';
      setError(errorMessage);
      console.error('Error deleting dashboard:', err);
      return false;
    }
  }, [organizationId, currentDashboard]);
  
  // Add widget to current dashboard
  const addWidget = useCallback(async (
    widget: Omit<DashboardWidget, 'id'>
  ): Promise<boolean> => {
    if (!currentDashboard) return false;
    
    try {
      setError(null);
      
      const newWidget: DashboardWidget = {
        ...widget,
        id: crypto.randomUUID()
      };
      
      const updatedDashboard = {
        ...currentDashboard,
        widgets: [...currentDashboard.widgets, newWidget]
      };
      
      return await updateDashboard(currentDashboard.id, { widgets: updatedDashboard.widgets });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add widget';
      setError(errorMessage);
      console.error('Error adding widget:', err);
      return false;
    }
  }, [currentDashboard, updateDashboard]);
  
  // Update widget
  const updateWidget = useCallback(async (
    widgetId: string,
    updates: Partial<DashboardWidget>
  ): Promise<boolean> => {
    if (!currentDashboard) return false;
    
    try {
      setError(null);
      
      const updatedWidgets = currentDashboard.widgets.map(w =>
        w.id === widgetId ? { ...w, ...updates } : w
      );
      
      return await updateDashboard(currentDashboard.id, { widgets: updatedWidgets });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update widget';
      setError(errorMessage);
      console.error('Error updating widget:', err);
      return false;
    }
  }, [currentDashboard, updateDashboard]);
  
  // Remove widget
  const removeWidget = useCallback(async (widgetId: string): Promise<boolean> => {
    if (!currentDashboard) return false;
    
    try {
      setError(null);
      
      const updatedWidgets = currentDashboard.widgets.filter(w => w.id !== widgetId);
      
      return await updateDashboard(currentDashboard.id, { widgets: updatedWidgets });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove widget';
      setError(errorMessage);
      console.error('Error removing widget:', err);
      return false;
    }
  }, [currentDashboard, updateDashboard]);
  
  // Get widget data
  const getWidgetData = useCallback(async (widget: DashboardWidget): Promise<any> => {
    if (!organizationId) return null;
    
    try {
      setLoadingWidgets(true);
      
      const result = await UniversalReportingService.getWidgetData(
        organizationId,
        widget.type,
        widget.config
      );
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to get widget data');
      }
    } catch (err) {
      console.error('Error fetching widget data:', err);
      return null;
    } finally {
      setLoadingWidgets(false);
    }
  }, [organizationId]);
  
  // Delete report
  const deleteReport = useCallback(async (reportId: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Remove from local state
      setReports(prev => prev.filter(r => r.id !== reportId));
      
      // Here you would call the API to delete the report
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete report';
      setError(errorMessage);
      console.error('Error deleting report:', err);
      return false;
    }
  }, []);
  
  // Export report
  const exportReport = useCallback(async (
    reportId: string,
    format: 'pdf' | 'excel' | 'csv'
  ): Promise<boolean> => {
    try {
      setError(null);
      
      // Here you would call the API to export the report
      console.log(`Exporting report ${reportId} as ${format}`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export report';
      setError(errorMessage);
      console.error('Error exporting report:', err);
      return false;
    }
  }, []);
  
  // Utility functions
  const getMetricsByCategory = useCallback((
    category: keyof UniversalAnalytics
  ): Record<string, any> => {
    return analytics?.[category] || {};
  }, [analytics]);
  
  const calculateGrowth = useCallback((current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }, []);
  
  const formatMetric = useCallback((
    value: number,
    type: 'currency' | 'percentage' | 'number'
  ): string => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('en-US').format(value);
      default:
        return value.toString();
    }
  }, []);
  
  // Refresh all data
  const refreshData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const period = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      };
      
      await Promise.all([
        fetchAnalytics(period),
        fetchReports(),
        fetchDashboards()
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchAnalytics, fetchReports, fetchDashboards]);
  
  // Calculate stats
  const stats = {
    totalReports: reports.length,
    totalDashboards: dashboards.length,
    lastGeneratedReport: reports.length > 0 ? reports[0].generatedAt : null,
    analyticsLastUpdated
  };
  
  // Initial load
  useEffect(() => {
    if (organizationId) {
      refreshData();
    }
  }, [organizationId, refreshData]);
  
  return {
    // Data
    analytics,
    reports,
    dashboards,
    currentDashboard,
    
    // Loading states
    loading,
    generating,
    loadingDashboards,
    loadingWidgets,
    
    // Error state
    error,
    
    // Analytics actions
    fetchAnalytics,
    generateReport,
    
    // Dashboard actions
    createDashboard,
    updateDashboard,
    deleteDashboard,
    setCurrentDashboard,
    
    // Widget actions
    addWidget,
    updateWidget,
    removeWidget,
    getWidgetData,
    
    // Report actions
    fetchReports,
    deleteReport,
    exportReport,
    
    // Utility functions
    getMetricsByCategory,
    calculateGrowth,
    formatMetric,
    
    // Real-time updates
    refreshData,
    
    // Stats
    stats
  };
}