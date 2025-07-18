'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { 
  ShoppingCart, Receipt, Clock, DollarSign, Activity, TrendingUp,
  Plus, Settings, Download, Upload, BarChart3, Target, CheckCircle,
  AlertCircle, Package, Users, Phone, Mail, MapPin, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import { useResponsive } from '@/hooks/useResponsive'
import { HERAUniversalCRUD } from '@/templates/crud/components/HERAUniversalCRUD'
import { createOrderServiceAdapter } from '@/lib/crud-configs/order-service-adapter'
import { 
  OrderCRUDFields, 
  OrderCRUDFilters, 
  OrderCRUDActions, 
  OrderBulkOperations 
} from '@/lib/crud-configs/order-crud-fields'
import { pageTransition } from '@/lib/animations/smooth-animations'

export default function RestaurantOrdersCRUDPage() {
  const [activeTab, setActiveTab] = useState('crud')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  // ✅ REQUIRED: Get organization context
  const { restaurantData, loading, error } = useRestaurantManagement()
  const { isMobile } = useResponsive()

  // ✅ REQUIRED: Create service adapter
  const serviceAdapter = useMemo(() => createOrderServiceAdapter(), [])

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ REQUIRED: Success/error handlers
  const handleSuccess = (message: string, operation: string) => {
    toast.success(message, {
      description: `Order ${operation} completed successfully`,
      duration: 4000
    })
    console.log(`✅ Order ${operation} successful:`, message)
  }

  const handleError = (error: string) => {
    toast.error('Order Operation Failed', {
      description: error,
      duration: 6000
    })
    console.error('❌ Order CRUD operation failed:', error)
  }

  const handleOrderSelect = (order: any) => {
    setSelectedOrder(order)
    console.log('Selected order:', order)
  }

  const handleItemClick = (order: any) => {
    console.log('Order selected:', order)
    setSelectedOrder(order)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </Card>
      </div>
    )
  }

  // Handle loading states
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order management...</p>
        </Card>
      </div>
    )
  }

  if (!restaurantData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <ShoppingCart className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Restaurant Setup Required</h3>
          <p className="text-gray-600 mb-4">
            Please complete your restaurant setup to access order management.
          </p>
          <Button onClick={() => window.location.href = '/setup/restaurant'}>
            Complete Setup
          </Button>
        </Card>
      </div>
    )
  }

  const organizationId = restaurantData.organizationId

  return (
    <motion.div 
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
    >
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Order Management System
              </h1>
              <p className="text-xl text-blue-100 mb-4">
                Complete order lifecycle management using HERA Universal Transaction Architecture
              </p>
              <div className="flex items-center justify-center gap-6 text-blue-200 text-sm">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  <span>Universal Transactions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Real-Time Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Smart Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 -mt-8 relative z-10">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">$--</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-sm text-gray-600">Avg Prep Time</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 bg-gray-50/50">
              <TabsList className="grid w-full grid-cols-4 bg-transparent border-none">
                <TabsTrigger value="crud" className="py-4 px-6">
                  <Receipt className="w-4 h-4 mr-2" />
                  Order Management
                </TabsTrigger>
                <TabsTrigger value="kitchen" className="py-4 px-6">
                  <Package className="w-4 h-4 mr-2" />
                  Kitchen Display
                </TabsTrigger>
                <TabsTrigger value="analytics" className="py-4 px-6">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="settings" className="py-4 px-6">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="crud" className="p-0">
              <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
                {/* Enhanced CRUD Header */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Order Management Dashboard</h2>
                      <p className="text-blue-100">
                        Complete order lifecycle management with real-time status tracking
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="gap-1 bg-green-500/20 text-green-100 border-green-400/30">
                        <Activity className="w-3 h-3" />
                        Universal Transactions
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Order Status Stats */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <AlertCircle className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                      <div className="text-2xl font-bold text-gray-900">--</div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <CheckCircle className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-gray-900">--</div>
                      <div className="text-sm text-gray-600">Confirmed</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                      <div className="text-2xl font-bold text-gray-900">--</div>
                      <div className="text-sm text-gray-600">Preparing</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <Package className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-gray-900">--</div>
                      <div className="text-sm text-gray-600">Ready</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                      <div className="text-2xl font-bold text-gray-900">--</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
                      <div className="text-2xl font-bold text-gray-900">--</div>
                      <div className="text-sm text-gray-600">Cancelled</div>
                    </div>
                  </div>
                </div>

                {/* CRUD Interface */}
                <div className="px-6 pb-6">
                  <HERAUniversalCRUD
                    entityType="order"
                    entityTypeLabel="Orders"
                    entitySingular="order"
                    entitySingularLabel="Order"
                    service={serviceAdapter}
                    fields={OrderCRUDFields}
                    filters={OrderCRUDFilters}
                    actions={OrderCRUDActions}
                    bulkOperations={OrderBulkOperations}
                    organizationId={organizationId}
                    onSuccess={handleSuccess}
                    onError={handleError}
                    onItemClick={handleItemClick}
                    
                    // Advanced features
                    enableRealTime={true}
                    enableSearch={true}
                    enableFilters={true}
                    enableSorting={true}
                    enablePagination={true}
                    enableBulkActions={true}
                    enableExport={true}
                    
                    // Pagination settings
                    pagination={{
                      pageSize: 25,
                      showPageSizeSelector: true,
                      pageSizeOptions: [10, 25, 50, 100]
                    }}
                    
                    // Default sort by most recent
                    defaultSort={{
                      key: 'createdAt',
                      direction: 'desc'
                    }}
                    
                    // Pre-applied filters - show all orders by default
                    defaultFilters={{
                      // No default filters - show all orders
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="kitchen" className="p-6">
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Kitchen Display System</h3>
                <p className="text-gray-600 mb-6">
                  Real-time kitchen display showing orders in preparation queue.
                </p>
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Preparation Queue</h4>
                    <p className="text-sm text-gray-600">Real-time view of orders being prepared</p>
                  </Card>
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Ready for Pickup</h4>
                    <p className="text-sm text-gray-600">Orders ready for customer pickup</p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="p-6">
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Order Analytics</h3>
                <p className="text-gray-600 mb-6">
                  Comprehensive analytics and insights about order performance and trends.
                </p>
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Sales Trends</h4>
                    <p className="text-sm text-gray-600">Daily, weekly, and monthly sales patterns</p>
                  </Card>
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Performance Metrics</h4>
                    <p className="text-sm text-gray-600">Average preparation time and efficiency</p>
                  </Card>
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Revenue Analysis</h4>
                    <p className="text-sm text-gray-600">Revenue breakdown by order type and time</p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Order Management Settings</h3>
                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Order Numbering</h4>
                          <p className="text-sm text-gray-600">Configure order number format and sequence</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Kitchen Display</h4>
                          <p className="text-sm text-gray-600">Set up kitchen display system preferences</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Notification Settings</h4>
                          <p className="text-sm text-gray-600">Configure order status notifications</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Data Management</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                      <h4 className="font-medium mb-2">Import Orders</h4>
                      <p className="text-sm text-gray-600 mb-4">Bulk import from CSV or Excel</p>
                      <Button variant="outline" className="w-full">
                        Choose File
                      </Button>
                    </Card>

                    <Card className="p-6 text-center">
                      <Download className="w-8 h-8 mx-auto mb-3 text-green-600" />
                      <h4 className="font-medium mb-2">Export Order Data</h4>
                      <p className="text-sm text-gray-600 mb-4">Download complete order history</p>
                      <Button variant="outline" className="w-full">
                        Export CSV
                      </Button>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Universal Transaction Architecture Showcase */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="text-center mb-4">
            <Badge className="gap-1 bg-blue-500 text-white mb-3">
              <Receipt className="w-3 h-3" />
              Universal Transaction Architecture
            </Badge>
            <h3 className="text-lg font-semibold text-blue-800">
              Revolutionary Order Management Technology
            </h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-blue-800">Universal Transactions</div>
              <div className="text-blue-600">All orders stored using universal transaction schema</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-blue-800">Real-Time Updates</div>
              <div className="text-blue-600">Live order status synchronization across all clients</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-blue-800">Organization Isolation</div>
              <div className="text-blue-600">Complete multi-tenant data separation and security</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-blue-800">Smart Analytics</div>
              <div className="text-blue-600">Advanced order insights and performance tracking</div>
            </div>
          </div>
        </Card>

        {/* Selected Order Details */}
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Selected Order Details
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(selectedOrder, null, 2)}
                </pre>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}