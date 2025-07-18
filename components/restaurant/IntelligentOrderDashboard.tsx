'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Plus, Users, Clock, DollarSign, Check,
  Coffee, Cake, Star, Brain, TrendingUp, Activity,
  ChefHat, Bell, CreditCard, Gift, Target, Zap,
  Eye, Edit, Trash2, CheckCircle, AlertCircle,
  Loader2, Search, Filter, Settings, Download,
  Timer, Receipt, MessageSquare, User, Building2,
  Mail, Shield, Calendar, Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import OrderServiceSimplified from '@/lib/services/orderServiceSimplified'
import { createClient } from '@/lib/supabase/client'
// Types for order management
interface OrderSession {
  id: string
  organizationId: string
  customerId?: string
  staffMemberId?: string
  sessionStatus: string
  orderSource: string
  serviceType: string
  tableNumber?: string
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  loyaltyPointsEarned: number
  createdAt: string
  updatedAt: string
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  lineAmount: number
  specialInstructions?: string
  createdAt: string
  updatedAt: string
}

interface UniversalTransaction {
  id: string
  transaction_number: string
  transaction_date: string
  status: string
  total_amount: number
}

interface Recommendation {
  id: string
  productName: string
  reason: string
}
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'

interface IntelligentOrderDashboardProps {
  onOrderSelect?: (order: UniversalTransaction) => void
  viewMode?: 'staff' | 'customer' | 'kitchen' | 'analytics'
  showCreateButton?: boolean
}

interface DashboardState {
  currentSession: OrderSession | null
  recentOrders: UniversalTransaction[]
  recommendations: Recommendation[]
  loading: boolean
  processing: boolean
  error: string | null
  selectedCustomer: any
  orderTotal: number
  loyaltyPoints: number
  stats: {
    todayOrders: number
    totalRevenue: number
    averageOrderValue: number
    preparationTime: number
  }
}

interface UserInfo {
  authUser: any
  coreUser: any
  organizations: any[]
  currentRole: string
}

export default function IntelligentOrderDashboard({
  onOrderSelect,
  viewMode = 'staff',
  showCreateButton = true
}: IntelligentOrderDashboardProps) {
  const { restaurantData, loading: restaurantLoading, allRestaurants, selectedRestaurant } = useRestaurantManagement()
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [activeTab, setActiveTab] = useState('current')
  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const supabase = createClient()
  
  const [state, setState] = useState<DashboardState>({
    currentSession: null,
    recentOrders: [],
    recommendations: [],
    loading: true,
    processing: false,
    error: null,
    selectedCustomer: null,
    orderTotal: 0,
    loyaltyPoints: 0,
    stats: {
      todayOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      preparationTime: 0
    }
  })

  useEffect(() => {
    if (restaurantData?.organizationId) {
      loadOrderData()
      loadProducts()
    }
  }, [restaurantData?.organizationId])

  const loadOrderData = async () => {
    if (!restaurantData?.organizationId) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      console.log('🔍 Loading order data for organization:', restaurantData.organizationId)
      
      // Get recent orders using simplified service
      const ordersResult = await OrderServiceSimplified.getOrders(
        restaurantData.organizationId
      )
      
      if (ordersResult.success) {
        const orders = ordersResult.data || []
        
        // Calculate basic stats
        const todayOrders = orders.filter(o => 
          new Date(o.transaction_date).toDateString() === new Date().toDateString()
        ).length
        
        const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0)
        const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
        
        setState(prev => ({
          ...prev,
          recentOrders: orders,
          stats: {
            todayOrders,
            totalRevenue,
            averageOrderValue,
            preparationTime: 8 // Mock value
          },
          loading: false
        }))
        
        console.log('✅ Order data loaded:', { orders: orders.length, todayOrders, totalRevenue })
      } else {
        throw new Error(ordersResult.error || 'Failed to load orders')
      }
    } catch (error) {
      console.error('❌ Failed to load order data:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load orders',
        loading: false
      }))
    }
  }

  const loadProducts = async () => {
    if (!restaurantData?.organizationId) return

    setLoadingProducts(true)

    try {
      console.log('📦 Loading products for organization:', restaurantData.organizationId)
      
      // Get products using simplified service
      const productsResult = await OrderServiceSimplified.getProducts(
        restaurantData.organizationId
      )
      
      if (productsResult.success) {
        setProducts(productsResult.data || [])
        console.log('✅ Products loaded successfully:', productsResult.data?.length || 0)
      } else {
        console.error('❌ Failed to load products:', productsResult.error)
      }
      
    } catch (error) {
      console.error('❌ Failed to load products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const startNewOrder = async () => {
    if (!restaurantData?.organizationId) return

    setIsCreatingOrder(true)

    try {
      console.log('🏭 Toyota Method: Starting new order using OrderServiceSimplified...')
      
      // Create a simple order using the Toyota method
      const orderResult = await OrderServiceSimplified.createOrder({
        organizationId: restaurantData.organizationId,
        customerName: state.selectedCustomer?.name || 'Walk-in Customer',
        tableNumber: 'T-05',
        orderType: 'dine_in',
        items: [] // Start with empty items
      })
      
      if (orderResult.success && orderResult.orderId) {
        // Create a simple session object for the UI
        const newSession = {
          id: orderResult.orderId,
          organizationId: restaurantData.organizationId,
          customerId: state.selectedCustomer?.id,
          staffMemberId: 'staff-001',
          sessionStatus: 'active',
          orderSource: 'in_store',
          serviceType: 'dine_in',
          tableNumber: 'T-05',
          items: [],
          subtotal: 0,
          taxAmount: 0,
          discountAmount: 0,
          totalAmount: 0,
          loyaltyPointsEarned: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        setState(prev => ({
          ...prev,
          currentSession: newSession,
          recommendations: []
        }))
        
        console.log('✅ Toyota Method: Order created successfully:', orderResult.orderId)
      } else {
        throw new Error(orderResult.error || 'Failed to create order')
      }
      
    } catch (error) {
      console.error('❌ Toyota Method: Failed to start new order:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start new order'
      }))
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const addProductToOrder = async (product: any) => {
    if (!state.currentSession || !restaurantData?.organizationId) return

    setState(prev => ({ ...prev, processing: true }))

    try {
      console.log('🏭 Toyota Method: Adding product to order:', product.entity_name)
      
      // Create order item from product
      const orderItem = {
        id: `item-${Date.now()}`,
        productId: product.id,
        productName: product.entity_name,
        quantity: 1,
        unitPrice: product.price || 0,
        lineAmount: product.price || 0,
        specialInstructions: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Update current session with new item
      setState(prev => ({
        ...prev,
        currentSession: prev.currentSession ? {
          ...prev.currentSession,
          items: [...prev.currentSession.items, orderItem]
        } : null
      }))
      
      // Recalculate order total
      calculateOrderTotal()
      
      console.log('✅ Toyota Method: Product added to order successfully')
      
    } catch (error) {
      console.error('❌ Toyota Method: Failed to add product to order:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add product to order'
      }))
    } finally {
      setState(prev => ({ ...prev, processing: false }))
    }
  }

  const addSampleItem = async () => {
    if (!state.currentSession || !restaurantData?.organizationId) return

    setState(prev => ({ ...prev, processing: true }))

    try {
      console.log('🏭 Toyota Method: Adding sample item...')
      
      // Create a simple sample item
      const sampleItem = {
        id: `item-${Date.now()}`,
        productId: 'sample-product-id',
        productName: 'Sample Tea',
        quantity: 1,
        unitPrice: 4.50,
        lineAmount: 4.50,
        specialInstructions: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Update current session with new item
      setState(prev => ({
        ...prev,
        currentSession: prev.currentSession ? {
          ...prev.currentSession,
          items: [...prev.currentSession.items, sampleItem]
        } : null
      }))
      
      // Recalculate order total
      calculateOrderTotal()
      
      console.log('✅ Toyota Method: Sample item added successfully')
      
    } catch (error) {
      console.error('❌ Toyota Method: Failed to add sample item:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add sample item'
      }))
    } finally {
      setState(prev => ({ ...prev, processing: false }))
    }
  }

  const calculateOrderTotal = () => {
    if (!state.currentSession) return

    try {
      const subtotal = state.currentSession.items.reduce((sum, item) => sum + item.lineAmount, 0)
      const taxAmount = subtotal * 0.1 // 10% tax
      const totalAmount = subtotal + taxAmount
      const loyaltyPoints = Math.floor(totalAmount * 0.1) // 10% loyalty points
      
      setState(prev => ({
        ...prev,
        orderTotal: totalAmount,
        loyaltyPoints,
        currentSession: prev.currentSession ? {
          ...prev.currentSession,
          subtotal,
          taxAmount,
          totalAmount,
          loyaltyPointsEarned: loyaltyPoints
        } : null
      }))
      
      console.log('✅ Toyota Method: Order total calculated:', totalAmount)
    } catch (error) {
      console.error('❌ Toyota Method: Failed to calculate order total:', error)
    }
  }

  const confirmCurrentOrder = async () => {
    if (!state.currentSession || !restaurantData?.organizationId) return

    setState(prev => ({ ...prev, processing: true }))

    try {
      console.log('🏭 Toyota Method: Confirming current order...')
      
      // Update order status using simplified method
      const result = await OrderServiceSimplified.updateOrderStatus(
        restaurantData.organizationId,
        state.currentSession.id,
        'COMPLETED'
      )
      
      if (result.success) {
        // Create a completed order object for UI
        const completedOrder = {
          id: state.currentSession.id,
          transaction_number: `ORD-${Date.now()}`,
          transaction_date: new Date().toISOString(),
          status: 'COMPLETED',
          total_amount: state.orderTotal
        }
        
        // Add to recent orders
        setState(prev => ({
          ...prev,
          recentOrders: [completedOrder, ...prev.recentOrders],
          currentSession: null,
          orderTotal: 0,
          loyaltyPoints: 0
        }))
        
        // Refresh order data
        loadOrderData()
        
        console.log('✅ Toyota Method: Order confirmed successfully:', completedOrder.id)
      } else {
        throw new Error(result.error || 'Failed to confirm order')
      }
      
    } catch (error) {
      console.error('❌ Toyota Method: Failed to confirm order:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to confirm order'
      }))
    } finally {
      setState(prev => ({ ...prev, processing: false }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'ready': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'preparing': return <ChefHat className="w-4 h-4" />
      case 'ready': return <Bell className="w-4 h-4" />
      case 'completed': return <Check className="w-4 h-4" />
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (restaurantLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading restaurant data...</p>
      </Card>
    )
  }

  if (!restaurantData?.organizationId) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
        <h3 className="text-lg font-semibold mb-2">Restaurant Setup Required</h3>
        <p className="text-gray-600 mb-4">
          Please complete your restaurant setup to access order processing.
        </p>
        <Button onClick={() => window.location.href = '/setup/restaurant'}>
          Complete Setup
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-blue-600" />
            Intelligent Order Processing
          </h1>
          <p className="text-gray-600">
            AI-powered order management with universal transactions architecture
          </p>
        </div>
        
        {showCreateButton && (
          <div className="flex gap-3">
            {!state.currentSession && (
              <Button
                onClick={startNewOrder}
                disabled={isCreatingOrder}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    New Order
                  </>
                )}
              </Button>
            )}
            
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {state.error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadOrderData()
                loadUserInfo()
              }}
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        </Card>
      )}
      
      {/* Debug Info for Development */}
      {process.env.NODE_ENV === 'development' && userInfo && (
        <Card className="p-3 bg-gray-50 border-gray-200">
          <details className="text-xs">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              🔧 Development Debug Info
            </summary>
            <div className="space-y-2 text-gray-600">
              <div>
                <span className="font-medium">Auth User:</span> {userInfo.authUser?.email} ({userInfo.authUser?.id})
              </div>
              <div>
                <span className="font-medium">Core User:</span> {userInfo.coreUser?.full_name} ({userInfo.coreUser?.id})
              </div>
              <div>
                <span className="font-medium">Restaurant:</span> {restaurantData?.businessName} ({restaurantData?.organizationId})
              </div>
              <div>
                <span className="font-medium">Organizations:</span> {userInfo.organizations.length} total
              </div>
              <div>
                <span className="font-medium">Current Role:</span> {userInfo.currentRole}
              </div>
              {userInfo.organizations.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium">All Organizations:</span>
                  <ul className="ml-4 mt-1 space-y-1">
                    {userInfo.organizations.map((org: any, index: number) => (
                      <li key={index}>
                        {org.core_organizations?.org_name} ({org.core_organizations?.industry}) - {org.role}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        </Card>
      )}

      {/* Action Bar */}
      {showCreateButton && !state.currentSession && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <Button
            onClick={startNewOrder}
            disabled={isCreatingOrder}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isCreatingOrder ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                New Order
              </>
            )}
          </Button>
        </div>
      )}

      {/* Order Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{state.stats.todayOrders}</div>
              <div className="text-sm text-gray-600">Today's Orders</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">₹{state.stats.totalRevenue.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">₹{state.stats.averageOrderValue.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Avg. Order Value</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Timer className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{state.stats.preparationTime}m</div>
              <div className="text-sm text-gray-600">Avg. Prep Time</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Current Order Session */}
      {state.currentSession && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Current Order Session
                </h3>
                <p className="text-sm text-blue-600">
                  {state.currentSession.tableNumber} • {state.currentSession.serviceType.replace('_', ' ')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-800">₹{state.orderTotal.toFixed(2)}</div>
                <div className="text-sm text-blue-600">{state.loyaltyPoints} points</div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              {state.currentSession.items.length === 0 ? (
                <div className="text-center py-4 text-blue-600">
                  <Coffee className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No items added yet. Start by selecting products.</p>
                </div>
              ) : (
                state.currentSession.items.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Coffee className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity} • ₹{item.unitPrice}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{item.lineAmount.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Order Actions */}
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={() => addSampleItem()}
                disabled={state.processing}
                variant="outline"
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sample Item
              </Button>
              
              {state.currentSession.items.length > 0 && (
                <Button
                  onClick={confirmCurrentOrder}
                  disabled={state.processing}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {state.processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Confirm Order
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Product Selection */}
      {state.currentSession && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-blue-600" />
            Available Products
          </h3>
          {loadingProducts ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Coffee className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold mb-2">No Products Available</h4>
              <p className="text-gray-600 mb-4">
                Add products to your catalog to start taking orders.
              </p>
              <Button variant="outline" onClick={() => window.open('/restaurant/products', '_blank')}>
                <Plus className="w-4 h-4 mr-2" />
                Manage Products
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => addProductToOrder(product)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.entity_name}</h4>
                      <p className="text-sm text-gray-600">{product.category || 'Uncategorized'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ₹{(product.price || 0).toFixed(2)}
                      </div>
                      {product.preparation_time && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {product.preparation_time}min
                        </div>
                      )}
                    </div>
                  </div>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant={product.available ? 'default' : 'secondary'}>
                      {product.available ? 'Available' : 'Unavailable'}
                    </Badge>
                    <Button
                      size="sm"
                      disabled={!product.available || state.processing}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* AI Recommendations */}
      {state.recommendations.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Recommendations
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {state.recommendations.map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{rec.productName}</h4>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(rec.confidence * 100)}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">₹{rec.priceImpact.toFixed(2)}</span>
                  <Button
                    size="sm"
                    onClick={() => addItemToCurrentOrder({
                      productId: rec.productId,
                      quantity: 1
                    })}
                    disabled={!state.currentSession || state.processing}
                  >
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Orders */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Recent Orders
          </h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        
        {state.loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : state.recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-semibold mb-2">No Orders Found</h4>
            <p className="text-gray-600 mb-4">
              Start by creating your first order using the "New Order" button above.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {state.recentOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => onOrderSelect?.(order)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{order.transaction_number}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{order.transaction_date}</span>
                        <span>•</span>
                        <span>ORDER</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-1">
                      ₹{order.total_amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Universal Transactions Architecture Showcase */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
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
    </div>
  )
}