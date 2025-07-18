'use client'

import { useState } from 'react'
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/error-boundaries'
import { motion } from 'framer-motion'
import { 
  ShoppingCart, Brain, TrendingUp, DollarSign, Star, Zap,
  Plus, Settings, Download, Upload, BarChart3, Activity,
  Target, ChefHat, Timer, Receipt, Users, Eye, Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Navbar } from '@/components/ui/navbar'
import IntelligentOrderDashboard from '@/components/restaurant/IntelligentOrderDashboard'
import UniversalBulkUpload from '@/components/ui/universal-bulk-upload'
import type { UniversalTransaction } from '@/lib/services/orderProcessingService'

function RestaurantOrdersPage() {
  const [activeTab, setActiveTab] = useState('processing')
  const [selectedOrder, setSelectedOrder] = useState<UniversalTransaction | null>(null)
  const [showBulkUpload, setShowBulkUpload] = useState(false)

  const handleOrderSelect = (order: UniversalTransaction) => {
    setSelectedOrder(order)
    console.log('Selected order:', order)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Bar with User Info */}
      <Navbar />
      
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Intelligent Order Processing
              </h1>
              <p className="text-xl text-blue-100 mb-4">
                AI-powered order management using HERA Universal Transactions Architecture
              </p>
              <div className="flex items-center justify-center gap-6 text-blue-200 text-sm">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>AI-Powered Intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Real-Time Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Universal Transactions</span>
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
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-sm text-gray-600">Today's Orders</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">₹--</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">₹--</div>
                <div className="text-sm text-gray-600">Avg. Order Value</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Timer className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--m</div>
                <div className="text-sm text-gray-600">Avg. Prep Time</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 bg-gray-50/50">
              <TabsList className="grid w-full grid-cols-4 bg-transparent border-none">
                <TabsTrigger value="processing" className="py-4 px-6">
                  <Brain className="w-4 h-4 mr-2" />
                  Order Processing
                </TabsTrigger>
                <TabsTrigger value="kitchen" className="py-4 px-6">
                  <ChefHat className="w-4 h-4 mr-2" />
                  ChefHat View
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

            <TabsContent value="processing" className="p-6">
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <Button
                    onClick={() => setShowBulkUpload(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Upload Orders
                  </Button>
                </div>

                {/* Bulk Upload Modal */}
                {showBulkUpload && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Bulk Upload Orders</h2>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowBulkUpload(false)}
                        >
                          ×
                        </Button>
                      </div>
                      <UniversalBulkUpload
                        entityType="orders"
                        onSuccess={() => {
                          setShowBulkUpload(false);
                          // Refresh orders data if needed
                        }}
                        onError={(error) => {
                          console.error('Bulk upload failed:', error);
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Order Processing Dashboard */}
                <IntelligentOrderDashboard
                  onOrderSelect={handleOrderSelect}
                  viewMode="staff"
                  showCreateButton={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="kitchen" className="p-6">
              <div className="text-center py-12">
                <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">ChefHat Dashboard</h3>
                <p className="text-gray-600 mb-6">
                  Real-time kitchen view for order preparation and fulfillment.
                </p>
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Timer className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Preparation Queue</h4>
                    <p className="text-sm text-gray-600">Orders ready for kitchen preparation</p>
                  </Card>
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Active Orders</h4>
                    <p className="text-sm text-gray-600">Currently being prepared</p>
                  </Card>
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Ready for Pickup</h4>
                    <p className="text-sm text-gray-600">Completed orders awaiting service</p>
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
                    <p className="text-sm text-gray-600">Revenue and order volume analysis</p>
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
                    <h4 className="font-semibold mb-2">Performance Metrics</h4>
                    <p className="text-sm text-gray-600">Efficiency and operational analytics</p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Order Processing Settings</h3>
                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">AI Order Optimization</h4>
                          <p className="text-sm text-gray-600">Enable AI-powered order recommendations and optimization</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">ChefHat Integration</h4>
                          <p className="text-sm text-gray-600">Real-time kitchen display and notification settings</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Payment Processing</h4>
                          <p className="text-sm text-gray-600">Configure payment methods and transaction handling</p>
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
                      <p className="text-sm text-gray-600 mb-4">Bulk import historical order data</p>
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

        {/* Universal Transactions Architecture Showcase */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="text-center mb-4">
            <Badge className="gap-1 bg-green-500 text-white mb-3">
              <Zap className="w-3 h-3" />
              Universal Transactions Architecture
            </Badge>
            <h3 className="text-lg font-semibold text-green-800">
              Revolutionary Order Processing Technology
            </h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-green-800">AI-Powered Intelligence</div>
              <div className="text-green-600">Smart recommendations and optimization</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-green-800">Real-Time Processing</div>
              <div className="text-green-600">Instant order updates and tracking</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-green-800">Universal Schema</div>
              <div className="text-green-600">Scalable transaction architecture</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <ChefHat className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-green-800">ChefHat Integration</div>
              <div className="text-green-600">Seamless preparation workflow</div>
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
                <Eye className="w-5 h-5" />
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
    </div>
  )
}

function RestaurantOrdersPageWithErrorBoundary() {
  return (
    <PageErrorBoundary pageName="Restaurant Orders">
      <ComponentErrorBoundary componentName="Intelligent Order Dashboard">
        <RestaurantOrdersPage />
      </ComponentErrorBoundary>
    </PageErrorBoundary>
  );
}

export default RestaurantOrdersPageWithErrorBoundary;