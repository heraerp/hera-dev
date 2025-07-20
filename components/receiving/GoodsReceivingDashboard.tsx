/**
 * HERA Universal - Goods Receiving Dashboard
 * 
 * Professional dark/light theme with depth hierarchy
 * Real-time data integration with AI supplier analytics
 * Following purchase order golden standard patterns
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Filter, Download, Search, Eye, Edit, Truck, 
  Package, DollarSign, TrendingUp, AlertTriangle, 
  CheckCircle, Clock, Brain, Activity, Zap,
  BarChart3, Users, Calendar, MapPin, ThermometerSun,
  Camera, Scan, Star, ArrowUp, ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MetricsCard } from '@/components/ui/MetricsCard';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import GoodsReceivingService, { 
  GoodsReceipt, 
  ReceivingDashboardMetrics, 
  SupplierPerformance,
  QualityAlert 
} from '@/lib/services/goodsReceivingService';
import { GoodsReceivingForm } from './GoodsReceivingForm';

interface GoodsReceivingDashboardProps {
  organizationId: string;
}

export function GoodsReceivingDashboard({ organizationId }: GoodsReceivingDashboardProps) {
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [metrics, setMetrics] = useState<ReceivingDashboardMetrics | null>(null);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>([]);
  const [qualityAlerts, setQualityAlerts] = useState<QualityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'receipts' | 'suppliers' | 'analytics'>('dashboard');

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch receipts
      const receiptsResult = await GoodsReceivingService.getGoodsReceipts(organizationId, {
        limit: 100
      });
      
      if (receiptsResult.success && receiptsResult.data) {
        setReceipts(receiptsResult.data);
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

    } catch (error) {
      console.error('Error fetching receiving data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchData();
    }
  }, [organizationId]);

  // Filter receipts
  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    const matchesSupplier = supplierFilter === 'all' || receipt.supplierId === supplierFilter;
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  // Get unique suppliers for filter
  const uniqueSuppliers = Array.from(new Set(receipts.map(r => r.supplierId)))
    .map(id => receipts.find(r => r.supplierId === id))
    .filter(Boolean);


  const getQualityColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-blue-600';
    if (score >= 2.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-red-400 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            🚚 Goods Receiving
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered receiving management with supplier analytics
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Receipt
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Total Receipts"
            value={metrics.totalReceipts.toString()}
            icon={Package}
            trend="+12% from last month"
            color="blue"
          />
          <MetricsCard
            title="Total Value"
            value={`$${metrics.totalValue.toLocaleString()}`}
            icon={DollarSign}
            trend="+8% from last month"
            color="green"
          />
          <MetricsCard
            title="Avg Quality Score"
            value={metrics.avgQualityScore.toFixed(1)}
            icon={Star}
            trend={metrics.avgQualityScore >= 4.0 ? "Excellent quality" : "Needs improvement"}
            color={metrics.avgQualityScore >= 4.0 ? "green" : "orange"}
          />
          <MetricsCard
            title="Quality Alerts"
            value={metrics.qualityAlerts.toString()}
            icon={AlertTriangle}
            trend={metrics.qualityAlerts > 0 ? "Requires attention" : "All good"}
            color={metrics.qualityAlerts > 0 ? "orange" : "green"}
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { key: 'receipts', label: 'Receipts', icon: Package },
            { key: 'suppliers', label: 'Suppliers', icon: Users },
            { key: 'analytics', label: 'Analytics', icon: Brain }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quality Alerts */}
              {qualityAlerts.length > 0 && (
                <Card className="p-6 border-l-4 border-l-red-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                      Quality Alerts ({qualityAlerts.length})
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {qualityAlerts.slice(0, 5).map((alert, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {alert.type.replace('_', ' ').toUpperCase()}
                          </p>
                        </div>
                        <Badge className={getAlertSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recent Activity */}
              {metrics?.recentActivity && (
                <Card className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Recent Activity
                  </h3>
                  
                  <div className="space-y-3">
                    {metrics.recentActivity.slice(0, 5).map((receipt) => (
                      <div key={receipt.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {receipt.receiptNumber}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {receipt.supplierName} • ${receipt.totalValue.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${getQualityColor(receipt.qualityScore || 0)}`}>
                            ★ {(receipt.qualityScore || 0).toFixed(1)}
                          </span>
                          <StatusBadge 
                            status={receipt.status}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Top Suppliers */}
              {metrics?.topSuppliers && (
                <Card className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Top Performing Suppliers
                  </h3>
                  
                  <div className="space-y-3">
                    {metrics.topSuppliers.map((supplier, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {supplier.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {supplier.receipts} receipts
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${getQualityColor(supplier.qualityScore)}`}>
                            ★ {supplier.qualityScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'receipts' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <SearchInput
                    placeholder="Search receipts..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                    className="w-full sm:w-64"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="received">Received</option>
                      <option value="inspected">Inspected</option>
                      <option value="completed">Completed</option>
                      <option value="disputed">Disputed</option>
                    </select>
                    
                    <select
                      value={supplierFilter}
                      onChange={(e) => setSupplierFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    >
                      <option value="all">All Suppliers</option>
                      {uniqueSuppliers.map((supplier) => (
                        <option key={supplier!.supplierId} value={supplier!.supplierId}>
                          {supplier!.supplierName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Receipts Table */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Receipt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Quality
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredReceipts.map((receipt) => (
                        <tr key={receipt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {receipt.receiptNumber}
                              </div>
                              {receipt.purchaseOrderNumber && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  PO: {receipt.purchaseOrderNumber}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {receipt.supplierName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {new Date(receipt.deliveryDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              ${receipt.totalValue.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${getQualityColor(receipt.qualityScore || 0)}`}>
                              ★ {(receipt.qualityScore || 0).toFixed(1)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge 
                              status={receipt.status}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div className="space-y-6">
              {/* Supplier Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supplierPerformance.map((supplier) => (
                  <Card key={supplier.supplierId} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {supplier.supplierName}
                      </h4>
                      <Badge className={supplier.monthlyTrend === 'improving' ? 'bg-green-500' : 
                                       supplier.monthlyTrend === 'declining' ? 'bg-red-500' : 'bg-gray-500'}>
                        {supplier.monthlyTrend === 'improving' && <ArrowUp className="w-3 h-3 mr-1" />}
                        {supplier.monthlyTrend === 'declining' && <ArrowDown className="w-3 h-3 mr-1" />}
                        {supplier.monthlyTrend}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Deliveries</span>
                        <span className="text-sm font-medium">{supplier.totalDeliveries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">On Time</span>
                        <span className="text-sm font-medium">
                          {((supplier.onTimeDeliveries / supplier.totalDeliveries) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Quality Score</span>
                        <span className={`text-sm font-medium ${getQualityColor(supplier.qualityScore)}`}>
                          ★ {supplier.qualityScore.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Variance Rate</span>
                        <span className="text-sm font-medium">
                          {(supplier.varianceRate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {supplier.aiRecommendations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                          <Brain className="w-3 h-3 mr-1" />
                          AI Recommendations
                        </p>
                        <div className="space-y-1">
                          {supplier.aiRecommendations.slice(0, 2).map((rec, index) => (
                            <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
                              • {rec}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-gray-600 mb-6">
                  Comprehensive analytics and AI insights for receiving performance.
                </p>
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Performance Trends</h4>
                    <p className="text-sm text-gray-600">Supplier and quality performance over time</p>
                  </Card>
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-2">AI Insights</h4>
                    <p className="text-sm text-gray-600">Machine learning powered recommendations</p>
                  </Card>
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Quality Metrics</h4>
                    <p className="text-sm text-gray-600">Detailed quality and variance analysis</p>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Goods Receipt Form Modal */}
      {showCreateForm && (
        <GoodsReceivingForm
          organizationId={organizationId}
          onClose={() => setShowCreateForm(false)}
          onSuccess={(receiptNumber) => {
            setShowCreateForm(false);
            fetchData(); // Refresh the data
            console.log(`✅ Goods Receipt Created: ${receiptNumber}`);
          }}
        />
      )}
    </div>
  );
}