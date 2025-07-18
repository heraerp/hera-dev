'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { 
  Users, Brain, TrendingUp, DollarSign, Star, Heart,
  Plus, Settings, Download, Upload, BarChart3,
  Target, Activity, Clock, UserPlus, Eye, Award,
  Phone, Mail, Calendar, MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Navbar } from '@/components/ui/navbar'
import CustomerIntelligenceDashboard from '@/components/restaurant/CustomerIntelligenceDashboard'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import { useResponsive } from '@/hooks/useResponsive'
import { HERAUniversalCRUD } from '@/templates/crud/components/HERAUniversalCRUD'
import { createCustomerServiceAdapter } from '@/lib/crud-configs/customer-service-adapter'
import { 
  CustomerCRUDFields, 
  CustomerCRUDFilters, 
  CustomerCRUDActions, 
  CustomerBulkOperations 
} from '@/lib/crud-configs/customer-crud-fields'
import { pageTransition } from '@/lib/animations/smooth-animations'
import MobileCustomerPage from './mobile-page'

export default function RestaurantCustomersPage() {
  const [activeTab, setActiveTab] = useState('crud')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  // ✅ REQUIRED: Get organization context
  const { restaurantData, loading, error } = useRestaurantManagement()
  const { isMobile } = useResponsive()

  // ✅ REQUIRED: Create service adapter
  const serviceAdapter = useMemo(() => createCustomerServiceAdapter(), [])

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ REQUIRED: Success/error handlers
  const handleSuccess = (message: string, operation: string) => {
    toast.success(message, {
      description: `Customer ${operation} completed successfully`,
      duration: 4000
    })
    console.log(`✅ Customer ${operation} successful:`, message)
  }

  const handleError = (error: string) => {
    toast.error('Customer Operation Failed', {
      description: error,
      duration: 6000
    })
    console.error('❌ Customer CRUD operation failed:', error)
  }

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer)
    console.log('Selected customer:', customer)
  }

  const handleItemClick = (customer: any) => {
    console.log('Customer selected:', customer)
    setSelectedCustomer(customer)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </Card>
      </div>
    )
  }

  // Render mobile version for mobile devices
  if (isMobile && restaurantData) {
    return <MobileCustomerPage />
  }

  // Handle loading states
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer management...</p>
        </Card>
      </div>
    )
  }

  if (!restaurantData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Restaurant Setup Required</h3>
          <p className="text-gray-600 mb-4">
            Please complete your restaurant setup to access customer management.
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
      className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50"
    >
      {/* Navigation Bar with User Info */}
      <Navbar />
      
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Customer Intelligence Platform
              </h1>
              <p className="text-xl text-purple-100 mb-4">
                AI-powered customer insights and relationship management using HERA Universal Schema
              </p>
              <div className="flex items-center justify-center gap-6 text-purple-200 text-sm">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>AI-Powered Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Predictive Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>Customer Experience</span>
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
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-sm text-gray-600">Total Customers</div>
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
                <div className="text-sm text-gray-600">Avg. Lifetime Value</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--%</div>
                <div className="text-sm text-gray-600">Engagement Score</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">--</div>
                <div className="text-sm text-gray-600">Loyalty Tiers</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 bg-gray-50/50">
              <TabsList className="grid w-full grid-cols-5 bg-transparent border-none">
                <TabsTrigger value="crud" className="py-4 px-6">
                  <Users className="w-4 h-4 mr-2" />
                  Customer Database
                </TabsTrigger>
                <TabsTrigger value="intelligence" className="py-4 px-6">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Intelligence
                </TabsTrigger>
                <TabsTrigger value="segments" className="py-4 px-6">
                  <Target className="w-4 h-4 mr-2" />
                  Segmentation
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
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Customer Database Management</h2>
                      <p className="text-purple-100">
                        Complete customer relationship management with advanced features
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="gap-1 bg-green-500/20 text-green-100 border-green-400/30">
                        <Activity className="w-3 h-3" />
                        Real-Time Updates
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Customer Intelligence Stats */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-gray-900">--</div>
                      <div className="text-sm text-gray-600">Total Customers</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <Heart className="w-6 h-6 mx-auto mb-2 text-red-600" />
                      <div className="text-2xl font-bold text-gray-900">--</div>
                      <div className="text-sm text-gray-600">VIP Customers</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-gray-900">$--</div>
                      <div className="text-sm text-gray-600">Avg Lifetime Value</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 text-center">
                      <Star className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                      <div className="text-2xl font-bold text-gray-900">--</div>
                      <div className="text-sm text-gray-600">Loyalty Points</div>
                    </div>
                  </div>
                </div>

                {/* CRUD Interface */}
                <div className="px-6 pb-6">
                  <HERAUniversalCRUD
                    entityType="customer"
                    entityTypeLabel="Customers"
                    entitySingular="customer"
                    entitySingularLabel="Customer"
                    service={serviceAdapter}
                    fields={CustomerCRUDFields}
                    filters={CustomerCRUDFilters}
                    actions={CustomerCRUDActions}
                    bulkOperations={CustomerBulkOperations}
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
                    
                    // Pre-applied filters
                    defaultFilters={{
                      isActive: true
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="intelligence" className="p-6">
              <CustomerIntelligenceDashboard
                onCustomerSelect={handleCustomerSelect}
                viewMode="management"
                showInitializeButton={true}
              />
            </TabsContent>

            <TabsContent value="segments" className="p-6">
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Customer Segmentation</h3>
                <p className="text-gray-600 mb-6">
                  Advanced customer segmentation based on behavior, preferences, and value.
                </p>
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Loyalty Tiers</h4>
                    <p className="text-sm text-gray-600">Bronze, Silver, Gold, and Platinum customer tiers</p>
                  </Card>
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Behavioral Groups</h4>
                    <p className="text-sm text-gray-600">Segments based on visit patterns and preferences</p>
                  </Card>
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Value Segments</h4>
                    <p className="text-sm text-gray-600">High, medium, and developing value customers</p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="p-6">
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Customer Analytics</h3>
                <p className="text-gray-600 mb-6">
                  Detailed analytics and insights about customer behavior and trends.
                </p>
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Engagement Metrics</h4>
                    <p className="text-sm text-gray-600">Visit frequency, duration, and interaction quality</p>
                  </Card>
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Predictive Models</h4>
                    <p className="text-sm text-gray-600">Churn prediction and lifetime value forecasting</p>
                  </Card>
                  <Card className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Trend Analysis</h4>
                    <p className="text-sm text-gray-600">Customer acquisition and retention trends</p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Customer Management Settings</h3>
                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">AI Insights Generation</h4>
                          <p className="text-sm text-gray-600">Automatically generate customer insights using AI</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Loyalty Program</h4>
                          <p className="text-sm text-gray-600">Configure loyalty tiers and rewards</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Communication Preferences</h4>
                          <p className="text-sm text-gray-600">Set up automated customer communications</p>
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
                      <h4 className="font-medium mb-2">Import Customers</h4>
                      <p className="text-sm text-gray-600 mb-4">Bulk import from CSV or Excel</p>
                      <Button variant="outline" className="w-full">
                        Choose File
                      </Button>
                    </Card>

                    <Card className="p-6 text-center">
                      <Download className="w-8 h-8 mx-auto mb-3 text-green-600" />
                      <h4 className="font-medium mb-2">Export Customer Data</h4>
                      <p className="text-sm text-gray-600 mb-4">Download complete customer database</p>
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

        {/* AI-Powered Customer Intelligence Showcase */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="text-center mb-4">
            <Badge className="gap-1 bg-purple-500 text-white mb-3">
              <Brain className="w-3 h-3" />
              AI-Powered Customer Intelligence
            </Badge>
            <h3 className="text-lg font-semibold text-purple-800">
              Revolutionary Customer Understanding Technology
            </h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-purple-800">Behavioral Analysis</div>
              <div className="text-purple-600">AI-powered customer behavior insights and patterns</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-purple-800">Predictive Analytics</div>
              <div className="text-purple-600">Next visit probability and churn risk assessment</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-purple-800">Personalization Engine</div>
              <div className="text-purple-600">Individual customer experiences and recommendations</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-purple-800">Real-Time Intelligence</div>
              <div className="text-purple-600">Live insights and automated recommendations</div>
            </div>
          </div>
        </Card>

        {/* Selected Customer Details */}
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Selected Customer Intelligence Profile
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(selectedCustomer, null, 2)}
                </pre>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

