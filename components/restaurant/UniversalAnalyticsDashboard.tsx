'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3, TrendingUp, DollarSign, Users, Package, Star,
  Activity, Target, Brain, Zap, Eye, Settings, Download,
  AlertTriangle, CheckCircle, Clock, Award, Loader2,
  PieChart, LineChart, BarChart, Calendar, Filter,
  Bell, Lightbulb, TrendingDown, ArrowUp, ArrowDown,
  Minus, Plus, RefreshCw, ExternalLink, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import AnalyticsService from '@/lib/services/analyticsService'
import type {
  DashboardOverview,
  RealTimeMetrics,
  PerformanceAnalytics,
  PredictiveInsights,
  BusinessMetric
} from '@/lib/services/analyticsService'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'

interface UniversalAnalyticsDashboardProps {
  onMetricSelect?: (metric: BusinessMetric) => void
  onInsightSelect?: (insight: any) => void
  viewMode?: 'executive' | 'manager' | 'analyst'
  showPredictive?: boolean
}

interface DashboardState {
  overview: DashboardOverview | null
  realTimeMetrics: RealTimeMetrics | null
  performanceAnalytics: PerformanceAnalytics | null
  predictiveInsights: PredictiveInsights | null
  customMetrics: BusinessMetric[]
  loading: boolean
  error: string | null
  lastUpdated: string | null
  refreshInterval: number
  selectedTimeframe: 'today' | 'week' | 'month' | 'quarter' | 'year'
  selectedMetricCategory: 'all' | 'financial' | 'operational' | 'customer' | 'product'
}

export default function UniversalAnalyticsDashboard({
  onMetricSelect,
  onInsightSelect,
  viewMode = 'manager',
  showPredictive = true
}: UniversalAnalyticsDashboardProps) {
  const { restaurantData, loading: restaurantLoading } = useRestaurantManagement()
  const [activeTab, setActiveTab] = useState('overview')
  const [isInitializing, setIsInitializing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  const [state, setState] = useState<DashboardState>({
    overview: null,
    realTimeMetrics: null,
    performanceAnalytics: null,
    predictiveInsights: null,
    customMetrics: [],
    loading: true,
    error: null,
    lastUpdated: null,
    refreshInterval: 30000, // 30 seconds
    selectedTimeframe: 'today',
    selectedMetricCategory: 'all'
  })

  useEffect(() => {
    if (restaurantData?.organizationId) {
      loadAnalyticsData()
    }
  }, [restaurantData?.organizationId, state.selectedTimeframe, state.selectedMetricCategory])

  useEffect(() => {
    if (autoRefresh && restaurantData?.organizationId) {
      const interval = setInterval(() => {
        loadRealTimeMetrics()
      }, state.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, restaurantData?.organizationId, state.refreshInterval])

  const loadAnalyticsData = async () => {
    if (!restaurantData?.organizationId) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Load all analytics data in parallel
      const [overview, realTime, performance, predictive] = await Promise.all([
        AnalyticsService.getDashboardOverview(restaurantData.organizationId),
        AnalyticsService.getRealTimeMetrics(restaurantData.organizationId),
        AnalyticsService.getPerformanceAnalytics(restaurantData.organizationId),
        showPredictive ? AnalyticsService.getPredictiveInsights(restaurantData.organizationId) : null
      ])

      setState(prev => ({
        ...prev,
        overview,
        realTimeMetrics: realTime,
        performanceAnalytics: performance,
        predictiveInsights: predictive,
        loading: false,
        lastUpdated: new Date().toISOString()
      }))

      console.log('✅ Analytics data loaded successfully')

    } catch (error) {
      console.error('❌ Failed to load analytics data:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load analytics data'
      }))
    }
  }

  const loadRealTimeMetrics = async () => {
    if (!restaurantData?.organizationId) return

    try {
      const realTimeMetrics = await AnalyticsService.getRealTimeMetrics(restaurantData.organizationId)
      setState(prev => ({
        ...prev,
        realTimeMetrics,
        lastUpdated: new Date().toISOString()
      }))
    } catch (error) {
      console.error('❌ Failed to refresh real-time metrics:', error)
    }
  }

  const handleInitializeAnalytics = async () => {
    if (!restaurantData?.organizationId) return

    try {
      setIsInitializing(true)
      const result = await AnalyticsService.initializeAnalyticsDashboard(restaurantData.organizationId)
      
      if (result.success) {
        console.log('✅ Analytics initialized:', result.message)
        await loadAnalyticsData()
      } else {
        setState(prev => ({ ...prev, error: result.message || 'Failed to initialize analytics' }))
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to initialize analytics' 
      }))
    } finally {
      setIsInitializing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-500" />
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  const getMetricStatusColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 120) return 'text-green-600 bg-green-100'
    if (percentage >= 100) return 'text-blue-600 bg-blue-100'
    if (percentage >= 80) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  if (restaurantLoading || state.loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading comprehensive business analytics...</p>
        </div>
      </div>
    )
  }

  if (!restaurantData?.organizationId) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Restaurant Context</h3>
        <p className="text-gray-600 mb-4">Please set up your restaurant first to access analytics.</p>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Error</h3>
        <p className="text-gray-600 mb-4">{state.error}</p>
        <div className="space-x-4">
          <Button onClick={loadAnalyticsData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button onClick={handleInitializeAnalytics} disabled={isInitializing}>
            {isInitializing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Settings className="w-4 h-4 mr-2" />
            )}
            Initialize Analytics
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Business Intelligence Dashboard</h2>
          <Badge className="gap-1">
            <Activity className="w-3 h-3" />
            Live Analytics
          </Badge>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={state.selectedTimeframe} onValueChange={(value: any) => 
            setState(prev => ({ ...prev, selectedTimeframe: value }))
          }>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <Activity className={`w-4 h-4 mr-2 ${autoRefresh ? 'text-green-600' : 'text-gray-500'}`} />
            {autoRefresh ? 'Live' : 'Manual'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-Time Status */}
      {state.lastUpdated && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Last updated: {new Date(state.lastUpdated).toLocaleTimeString()}</span>
          </div>
          {state.realTimeMetrics?.alerts && state.realTimeMetrics.alerts.length > 0 && (
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-700">{state.realTimeMetrics.alerts.length} alerts</span>
            </div>
          )}
        </div>
      )}

      {/* Quick Metrics Overview */}
      {state.overview && (
        <div className="grid md:grid-cols-5 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              {getTrendIcon(state.overview.revenueGrowth)}
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(state.overview.totalRevenue)}
              </div>
              <div className="text-sm text-blue-700">Total Revenue</div>
              <div className="text-xs text-blue-600">
                {formatPercentage(state.overview.revenueGrowth)} vs last period
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              {getTrendIcon(state.overview.orderGrowth)}
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-900">{state.overview.totalOrders}</div>
              <div className="text-sm text-green-700">Total Orders</div>
              <div className="text-xs text-green-600">
                {formatCurrency(state.overview.averageOrderValue)} avg
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              {getTrendIcon(state.overview.customerGrowth)}
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-900">{state.overview.customerCount}</div>
              <div className="text-sm text-purple-700">Active Customers</div>
              <div className="text-xs text-purple-600">
                {formatPercentage(state.overview.customerGrowth)} growth
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <CheckCircle className="w-4 h-4 text-orange-600" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-900">{state.overview.productCount}</div>
              <div className="text-sm text-orange-700">Active Products</div>
              <div className="text-xs text-orange-600">Catalog items</div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <Star className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-emerald-900">
                {state.overview.profitMargin.toFixed(1)}%
              </div>
              <div className="text-sm text-emerald-700">Profit Margin</div>
              <div className="text-xs text-emerald-600">Target: 15%</div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200 bg-gray-50/50">
            <TabsList className="grid w-full grid-cols-4 bg-transparent border-none">
              <TabsTrigger value="overview" className="py-4 px-6">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="performance" className="py-4 px-6">
                <TrendingUp className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="insights" className="py-4 px-6">
                <Brain className="w-4 h-4 mr-2" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="realtime" className="py-4 px-6">
                <Activity className="w-4 h-4 mr-2" />
                Real-Time
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-6">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Business Overview & Trends
              </h3>

              {/* Top Products & Customers */}
              {state.overview && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      Top Performing Products
                    </h4>
                    <div className="space-y-3">
                      {state.overview.topProducts.map((product, index) => (
                        <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500 text-white' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              index === 2 ? 'bg-orange-600 text-white' :
                              'bg-gray-200 text-gray-700'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{product.productName}</div>
                              <div className="text-sm text-gray-600">{product.salesCount} units sold</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(product.revenue)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Top Customers
                    </h4>
                    <div className="space-y-3">
                      {state.overview.topCustomers.map((customer, index) => (
                        <div key={customer.customerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-blue-500 text-white' :
                              index === 1 ? 'bg-green-500 text-white' :
                              index === 2 ? 'bg-purple-500 text-white' :
                              'bg-gray-200 text-gray-700'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{customer.customerName}</div>
                              <div className="text-sm text-gray-600">{customer.orderCount} orders</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(customer.totalSpent)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Daily Trends Chart */}
              {state.overview?.dailyTrends && (
                <Card className="p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-green-600" />
                    7-Day Performance Trends
                  </h4>
                  <div className="grid grid-cols-7 gap-2">
                    {state.overview.dailyTrends.map((day, index) => (
                      <div key={day.date} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="font-semibold text-sm">{day.orders}</div>
                        <div className="text-xs text-gray-600">orders</div>
                        <div className="text-xs font-medium text-green-600 mt-1">
                          {formatCurrency(day.revenue)}
                        </div>
                        <div className="text-xs text-blue-600">{day.customers} customers</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="p-6">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Performance Analytics & KPIs
              </h3>

              {/* Financial Performance */}
              {state.performanceAnalytics && (
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <h4 className="font-semibold mb-4 text-blue-800">Financial Performance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Gross Revenue</span>
                        <span className="font-semibold">{formatCurrency(state.performanceAnalytics.financialPerformance.grossRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Revenue</span>
                        <span className="font-semibold">{formatCurrency(state.performanceAnalytics.financialPerformance.netRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Costs</span>
                        <span className="font-semibold text-red-600">-{formatCurrency(state.performanceAnalytics.financialPerformance.totalCosts)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-semibold">Net Profit</span>
                        <span className="font-bold text-green-600">{formatCurrency(state.performanceAnalytics.financialPerformance.netProfit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit Margin</span>
                        <span className="font-semibold">{state.performanceAnalytics.financialPerformance.profitMargin.toFixed(1)}%</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4 text-green-800">Operational Performance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Order Accuracy</span>
                        <span className="font-semibold">{state.performanceAnalytics.operationalPerformance.orderAccuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fulfillment Time</span>
                        <span className="font-semibold">{state.performanceAnalytics.operationalPerformance.orderFulfillmentTime} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Satisfaction</span>
                        <span className="font-semibold">{state.performanceAnalytics.operationalPerformance.customerSatisfaction}/5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Employee Productivity</span>
                        <span className="font-semibold">{state.performanceAnalytics.operationalPerformance.employeeProductivity}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Inventory Turnover</span>
                        <span className="font-semibold">{state.performanceAnalytics.operationalPerformance.inventoryTurnover}x</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4 text-purple-800">Customer Analytics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>New Customers</span>
                        <span className="font-semibold text-green-600">+{state.performanceAnalytics.customerAnalytics.newCustomers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Returning Customers</span>
                        <span className="font-semibold">{state.performanceAnalytics.customerAnalytics.returningCustomers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retention Rate</span>
                        <span className="font-semibold">{state.performanceAnalytics.customerAnalytics.customerRetentionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Acquisition Cost</span>
                        <span className="font-semibold">{formatCurrency(state.performanceAnalytics.customerAnalytics.customerAcquisitionCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Visit Frequency</span>
                        <span className="font-semibold">{state.performanceAnalytics.customerAnalytics.averageVisitFrequency}x/month</span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Best Selling Products */}
              {state.performanceAnalytics?.productAnalytics && (
                <Card className="p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Product Performance Analysis
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Product</th>
                          <th className="text-right py-2">Units Sold</th>
                          <th className="text-right py-2">Revenue</th>
                          <th className="text-right py-2">Profit Margin</th>
                          <th className="text-right py-2">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.performanceAnalytics.productAnalytics.bestSellingProducts.slice(0, 5).map((product, index) => (
                          <tr key={product.productId} className="border-b">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index < 3 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {index + 1}
                                </div>
                                <span className="font-medium">{product.productName}</span>
                              </div>
                            </td>
                            <td className="text-right py-3 font-semibold">{product.unitsSold}</td>
                            <td className="text-right py-3 font-semibold">{formatCurrency(product.revenue)}</td>
                            <td className="text-right py-3">
                              <Badge className={`${getMetricStatusColor(product.profitMargin, 30)}`}>
                                {product.profitMargin}%
                              </Badge>
                            </td>
                            <td className="text-right py-3">
                              <div className="w-16 bg-gray-200 rounded-full h-2 ml-auto">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${Math.min(100, (product.unitsSold / 50) * 100)}%` }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="p-6">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                AI-Powered Predictive Insights
              </h3>

              {/* Revenue Forecasting */}
              {state.predictiveInsights && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Revenue Forecasting
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span>Next Day</span>
                        <span className="font-bold text-green-700">
                          {formatCurrency(state.predictiveInsights.revenueForecasting.nextDay)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span>Next Week</span>
                        <span className="font-bold text-blue-700">
                          {formatCurrency(state.predictiveInsights.revenueForecasting.nextWeek)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span>Next Month</span>
                        <span className="font-bold text-purple-700">
                          {formatCurrency(state.predictiveInsights.revenueForecasting.nextMonth)}
                        </span>
                      </div>
                      <div className="text-center">
                        <Badge className="bg-gray-100 text-gray-700">
                          <Target className="w-3 h-3 mr-1" />
                          {(state.predictiveInsights.revenueForecasting.confidence * 100).toFixed(0)}% Confidence
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-600" />
                      Demand Forecasting
                    </h4>
                    <div className="space-y-3">
                      {state.predictiveInsights.demandForecasting.slice(0, 4).map((item) => (
                        <div key={item.productId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-gray-600">
                              {(item.confidence * 100).toFixed(0)}% confidence
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{item.predictedDemand} units</div>
                            <div className="text-sm text-gray-600">
                              Stock: {item.recommendedStock}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Customer Behavior Insights */}
              {state.predictiveInsights?.customerBehavior && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Churn Risk Analysis
                    </h4>
                    <div className="space-y-3">
                      {state.predictiveInsights.customerBehavior.churnRisk.map((customer) => (
                        <div key={customer.customerId} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <div>
                            <div className="font-medium">{customer.customerName}</div>
                            <div className="text-sm text-gray-600">
                              Last visit: {new Date(customer.lastVisit).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge className="bg-red-100 text-red-800">
                            {(customer.riskScore * 100).toFixed(0)}% risk
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      Upsell Opportunities
                    </h4>
                    <div className="space-y-3">
                      {state.predictiveInsights.customerBehavior.upsellOpportunities.map((opportunity) => (
                        <div key={opportunity.customerId} className="p-3 bg-yellow-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium">{opportunity.customerName}</div>
                            <Badge className="bg-green-100 text-green-800">
                              {formatCurrency(opportunity.potentialValue)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            Recommended: {opportunity.recommendedProducts.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Operational Optimization */}
              {state.predictiveInsights?.operationalOptimization && (
                <Card className="p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Operational Optimization Recommendations
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-3">Staffing Recommendations (Peak Hours)</h5>
                      <div className="space-y-2">
                        {state.predictiveInsights.operationalOptimization.staffingRecommendations
                          .filter(s => s.recommendedStaff > 2)
                          .slice(0, 6)
                          .map((staffing) => (
                          <div key={staffing.hour} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">
                              {staffing.hour}:00 - {staffing.hour + 1}:00
                            </span>
                            <div className="text-right">
                              <div className="font-semibold">{staffing.recommendedStaff} staff</div>
                              <div className="text-xs text-gray-600">{staffing.expectedOrders} orders</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-3">Inventory Optimization</h5>
                      <div className="space-y-2">
                        {state.predictiveInsights.operationalOptimization.inventoryOptimization.map((item) => (
                          <div key={item.productId} className="p-2 bg-gray-50 rounded">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Stock Level</span>
                              <Badge className="bg-green-100 text-green-800">
                                Save {formatCurrency(item.potentialSavings)}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Current: {item.currentStock} → Optimal: {item.optimalStock}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="realtime" className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Activity className="w-6 h-6 text-green-600" />
                  Real-Time Business Metrics
                </h3>
                <Badge className="gap-1 bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live Data
                </Badge>
              </div>

              {/* Real-Time Metrics */}
              {state.realTimeMetrics && (
                <div className="grid md:grid-cols-4 gap-4">
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-sm font-medium text-blue-700">Current Hour</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 mb-1">{state.realTimeMetrics.currentHourOrders}</div>
                    <div className="text-sm text-blue-600">orders</div>
                    <div className="text-lg font-semibold text-blue-800 mt-2">
                      {formatCurrency(state.realTimeMetrics.currentHourRevenue)}
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-sm font-medium text-green-700">Today Total</div>
                    </div>
                    <div className="text-2xl font-bold text-green-900 mb-1">{state.realTimeMetrics.todayOrders}</div>
                    <div className="text-sm text-green-600">orders</div>
                    <div className="text-lg font-semibold text-green-800 mt-2">
                      {formatCurrency(state.realTimeMetrics.todayRevenue)}
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-sm font-medium text-purple-700">Active</div>
                    </div>
                    <div className="text-2xl font-bold text-purple-900 mb-1">{state.realTimeMetrics.activeCustomers}</div>
                    <div className="text-sm text-purple-600">customers</div>
                    <div className="text-sm text-purple-700 mt-2">
                      {state.realTimeMetrics.pendingOrders} pending orders
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-sm font-medium text-orange-700">Avg Time</div>
                    </div>
                    <div className="text-2xl font-bold text-orange-900 mb-1">{state.realTimeMetrics.averageOrderTime}</div>
                    <div className="text-sm text-orange-600">minutes</div>
                    <div className="text-sm text-orange-700 mt-2">
                      Peak: {state.realTimeMetrics.peakHourPrediction}:00
                    </div>
                  </Card>
                </div>
              )}

              {/* Revenue Projection */}
              {state.realTimeMetrics && (
                <Card className="p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Today's Revenue Projection
                  </h4>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-3xl font-bold text-blue-900">
                        {formatCurrency(state.realTimeMetrics.revenueProjection)}
                      </div>
                      <div className="text-sm text-gray-600">Projected end-of-day revenue</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold text-green-600">
                        {formatCurrency(state.realTimeMetrics.todayRevenue)}
                      </div>
                      <div className="text-sm text-gray-600">Current revenue</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${Math.min(100, (state.realTimeMetrics.todayRevenue / state.realTimeMetrics.revenueProjection) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {((state.realTimeMetrics.todayRevenue / state.realTimeMetrics.revenueProjection) * 100).toFixed(1)}% of projected revenue achieved
                  </div>
                </Card>
              )}

              {/* Live Alerts */}
              {state.realTimeMetrics?.alerts && state.realTimeMetrics.alerts.length > 0 && (
                <Card className="p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-600" />
                    Live Alerts & Notifications
                  </h4>
                  <div className="space-y-3">
                    {state.realTimeMetrics.alerts.map((alert, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        alert.type === 'error' ? 'bg-red-50 border-red-500' :
                        alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-blue-50 border-blue-500'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {alert.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                            {alert.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                            <span className="font-medium">{alert.message}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Analytics Actions */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-gray-600">
          <Eye className="w-4 h-4" />
          <span className="text-sm">Universal Analytics Dashboard powered by HERA Architecture</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Advanced Analytics
          </Button>
        </div>
      </div>
    </div>
  )
}