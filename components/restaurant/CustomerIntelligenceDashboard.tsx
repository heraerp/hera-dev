'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserPlus, Search, Filter, Heart, TrendingUp, Star,
  Calendar, Phone, Mail, MapPin, Coffee, Cake, Award,
  Eye, Edit, MessageSquare, Gift, AlertTriangle, CheckCircle,
  BarChart3, PieChart, Activity, Clock, DollarSign, Target,
  Sparkles, Brain, Zap, ChevronRight, ChevronDown, Plus,
  Settings, Download, Upload, RefreshCw, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { CustomerCrudService } from '@/lib/services/customerCrudService'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'

interface CustomerIntelligenceDashboardProps {
  onCustomerSelect?: (customer: any) => void
  viewMode?: 'management' | 'analytics' | 'intelligence'
  showInitializeButton?: boolean
}

interface DashboardState {
  customers: any[]
  insights: any[]
  segments: any[]
  loading: boolean
  error: string | null
  searchTerm: string
  selectedSegment: string
  selectedCustomer: any
  showCustomerDetails: boolean
  stats: {
    totalCustomers: number
    newThisMonth: number
    activeCustomers: number
    averageLifetimeValue: number
    churnRisk: number
  }
}

export default function CustomerIntelligenceDashboard({
  onCustomerSelect,
  viewMode = 'management',
  showInitializeButton = true
}: CustomerIntelligenceDashboardProps) {
  const { restaurantData, loading: restaurantLoading } = useRestaurantManagement()
  const [isInitializing, setIsInitializing] = useState(false)
  const [initProgress, setInitProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  
  const [state, setState] = useState<DashboardState>({
    customers: [],
    insights: [],
    segments: [],
    loading: true,
    error: null,
    searchTerm: '',
    selectedSegment: 'all',
    selectedCustomer: null,
    showCustomerDetails: false,
    stats: {
      totalCustomers: 0,
      newThisMonth: 0,
      activeCustomers: 0,
      averageLifetimeValue: 0,
      churnRisk: 0
    }
  })

  useEffect(() => {
    if (restaurantData?.organizationId) {
      loadCustomerData()
    }
  }, [restaurantData?.organizationId])

  const loadCustomerData = async () => {
    if (!restaurantData?.organizationId) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      console.log('🔍 Loading customer data for organization:', restaurantData.organizationId)
      
      const result = await CustomerCrudService.listCustomers(
        restaurantData.organizationId,
        {
          search: '',
          isActive: true,
          limit: 100,
          offset: 0
        }
      )
      
      if (result.success) {
        const customers = result.data?.customers || []
        
        // Calculate dashboard statistics
        const stats = calculateDashboardStats(customers)
        
        setState(prev => ({
          ...prev,
          customers,
          stats,
          loading: false
        }))
        
        console.log('✅ Customer data loaded:', { customers: customers.length, stats })
      } else {
        throw new Error(result.error || 'Failed to load customers')
      }
    } catch (error) {
      console.error('❌ Failed to load customer data:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load customers',
        loading: false
      }))
    }
  }

  const initializeCustomerManagement = async () => {
    if (!restaurantData?.organizationId) return

    setIsInitializing(true)
    setInitProgress(0)

    try {
      console.log('🚀 Initializing customer management...')
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setInitProgress(prev => Math.min(prev + 15, 90))
      }, 300)

      await CustomerCrudService.initializeCustomerData(restaurantData.organizationId)
      
      clearInterval(progressInterval)
      setInitProgress(100)
      
      setTimeout(() => {
        setIsInitializing(false)
        loadCustomerData()
      }, 1000)
      
    } catch (error) {
      console.error('❌ Customer management initialization failed:', error)
      setIsInitializing(false)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Initialization failed'
      }))
    }
  }

  const handleSearch = async () => {
    if (!restaurantData?.organizationId) return

    setState(prev => ({ ...prev, loading: true }))

    try {
      const result = await CustomerCrudService.listCustomers(
        restaurantData.organizationId,
        {
          search: state.searchTerm,
          loyaltyTier: state.selectedSegment !== 'all' ? state.selectedSegment as any : undefined,
          isActive: true,
          limit: 100,
          offset: 0
        }
      )

      if (result.success) {
        setState(prev => ({
          ...prev,
          customers: result.data?.customers || [],
          loading: false
        }))
      } else {
        throw new Error(result.error || 'Search failed')
      }
    } catch (error) {
      console.error('❌ Customer search failed:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Search failed',
        loading: false
      }))
    }
  }

  const handleCustomerSelect = async (customer: any) => {
    setState(prev => ({ ...prev, selectedCustomer: customer, showCustomerDetails: true }))
    onCustomerSelect?.(customer)

    // Generate AI insights for selected customer
    if (restaurantData?.organizationId) {
      try {
        // TODO: Implement customer insights generation with new service
        const insightsResult = { success: true, data: [] }
        
        if (insightsResult.success) {
          setState(prev => ({
            ...prev,
            selectedCustomer: {
              ...customer,
              aiInsights: insightsResult.data
            }
          }))
        }
      } catch (error) {
        console.error('Failed to generate customer insights:', error)
      }
    }
  }

  const calculateDashboardStats = (customers: any[]) => {
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => 
      c.fields.customer_status?.value === 'active' || 
      c.fields.customer_status?.value === 'regular' ||
      c.fields.customer_status?.value === 'vip'
    ).length
    
    const totalLifetimeValue = customers.reduce((sum, c) => 
      sum + parseFloat(c.fields.lifetime_value?.value || '0'), 0
    )
    const averageLifetimeValue = totalCustomers > 0 ? totalLifetimeValue / totalCustomers : 0
    
    const newThisMonth = customers.filter(c => {
      const createdDate = new Date(c.created_at)
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      return createdDate > oneMonthAgo
    }).length

    const churnRisk = customers.filter(c => {
      const lastVisit = c.fields.last_visit_date?.value
      if (!lastVisit) return true
      const daysSinceVisit = (new Date().getTime() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceVisit > 30
    }).length

    return {
      totalCustomers,
      newThisMonth,
      activeCustomers,
      averageLifetimeValue,
      churnRisk
    }
  }

  const getCustomerIcon = (customer: any) => {
    const tier = customer.fields.loyalty_tier?.value || 'bronze'
    switch (tier) {
      case 'platinum': return <Award className="w-4 h-4 text-purple-600" />
      case 'gold': return <Award className="w-4 h-4 text-yellow-600" />
      case 'silver': return <Award className="w-4 h-4 text-gray-600" />
      default: return <Users className="w-4 h-4 text-blue-600" />
    }
  }

  const getCustomerStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'regular': return 'bg-green-100 text-green-800 border-green-200'
      case 'returning': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'new': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const loyaltyTiers = [
    { id: 'all', name: 'All Customers', color: 'bg-blue-500' },
    { id: 'platinum', name: 'Platinum', color: 'bg-purple-500' },
    { id: 'gold', name: 'Gold', color: 'bg-yellow-500' },
    { id: 'silver', name: 'Silver', color: 'bg-gray-500' },
    { id: 'bronze', name: 'Bronze', color: 'bg-orange-500' }
  ]

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
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
        <h3 className="text-lg font-semibold mb-2">Restaurant Setup Required</h3>
        <p className="text-gray-600 mb-4">
          Please complete your restaurant setup to access customer management.
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
            <Brain className="w-7 h-7 text-purple-600" />
            Customer Intelligence
          </h1>
          <p className="text-gray-600">
            AI-powered customer insights and relationship management
          </p>
        </div>
        
        <div className="flex gap-3">
          {state.customers.length === 0 && showInitializeButton && (
            <Button
              onClick={initializeCustomerManagement}
              disabled={isInitializing}
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Initialize Customer Intelligence
                </>
              )}
            </Button>
          )}
          
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Initialization Progress */}
      {isInitializing && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              <span className="font-medium text-purple-800">
                Initializing Customer Intelligence Platform...
              </span>
            </div>
            <Progress value={initProgress} className="h-2" />
            <p className="text-sm text-purple-700">
              Creating customer groups, sample customers, and AI profiles
            </p>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {state.error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadCustomerData}
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Dashboard Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{state.stats.totalCustomers}</div>
              <div className="text-sm text-gray-600">Total Customers</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{state.stats.newThisMonth}</div>
              <div className="text-sm text-gray-600">New This Month</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{state.stats.activeCustomers}</div>
              <div className="text-sm text-gray-600">Active Customers</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">₹{state.stats.averageLifetimeValue.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Avg. Lifetime Value</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{state.stats.churnRisk}</div>
              <div className="text-sm text-gray-600">At Risk</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search customers by name, email, or phone..."
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            
            <Select
              value={state.selectedSegment}
              onValueChange={(value) => setState(prev => ({ ...prev, selectedSegment: value }))}
            >
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Loyalty Tier" />
              </SelectTrigger>
              <SelectContent>
                {loyaltyTiers.map((tier) => (
                  <SelectItem key={tier.id} value={tier.id}>
                    {tier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleSearch} variant="outline">
              Search
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Customer Directory
            </h3>
            
            {state.loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading customers...</p>
              </div>
            ) : state.customers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h4 className="text-lg font-semibold mb-2">No Customers Found</h4>
                <p className="text-gray-600 mb-4">
                  {state.searchTerm
                    ? `No customers match "${state.searchTerm}"`
                    : 'Start by adding your first customer or initializing sample data'}
                </p>
                {!state.searchTerm && showInitializeButton && (
                  <Button onClick={initializeCustomerManagement} variant="outline">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Initialize Sample Customers
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {state.customers.map((customer) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      state.selectedCustomer?.id === customer.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                          {getCustomerIcon(customer)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{customer.entity_name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{customer.fields.email?.value}</span>
                            {customer.fields.phone?.value && (
                              <>
                                <span>•</span>
                                <span>{customer.fields.phone?.value}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getCustomerStatusColor(customer.fields.customer_status?.value || 'new')}>
                          {customer.fields.customer_status?.value || 'new'}
                        </Badge>
                        <div className="text-sm text-gray-600 mt-1">
                          {customer.fields.total_visits?.value || '0'} visits • ₹{customer.fields.lifetime_value?.value || '0'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Customer Details Sidebar */}
        <div className="lg:col-span-1">
          {state.selectedCustomer ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Customer Details
                </h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Customer Profile */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    {getCustomerIcon(state.selectedCustomer)}
                  </div>
                  <h4 className="font-semibold text-lg">{state.selectedCustomer.entity_name}</h4>
                  <p className="text-sm text-gray-600">{state.selectedCustomer.fields.preferred_name?.value}</p>
                  <Badge className={getCustomerStatusColor(state.selectedCustomer.fields.customer_status?.value || 'new')}>
                    {state.selectedCustomer.fields.loyalty_tier?.value || 'bronze'} • {state.selectedCustomer.fields.customer_status?.value || 'new'}
                  </Badge>
                </div>

                <Separator />

                {/* Customer Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {state.selectedCustomer.fields.total_visits?.value || '0'}
                    </div>
                    <div className="text-xs text-gray-600">Total Visits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      ₹{state.selectedCustomer.fields.lifetime_value?.value || '0'}
                    </div>
                    <div className="text-xs text-gray-600">Lifetime Value</div>
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-2">
                  <h5 className="font-medium text-sm text-gray-700">Contact</h5>
                  {state.selectedCustomer.fields.email?.value && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{state.selectedCustomer.fields.email.value}</span>
                    </div>
                  )}
                  {state.selectedCustomer.fields.phone?.value && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{state.selectedCustomer.fields.phone.value}</span>
                    </div>
                  )}
                </div>

                {/* AI Insights */}
                {state.selectedCustomer.aiInsights && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        AI Insights
                      </h5>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Engagement Score</span>
                          <span className="font-medium">
                            {Math.round(state.selectedCustomer.aiInsights.behavioralAnalysis.engagementScore)}%
                          </span>
                        </div>
                        <Progress 
                          value={state.selectedCustomer.aiInsights.behavioralAnalysis.engagementScore} 
                          className="h-2" 
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Next Visit Probability</span>
                          <span className="font-medium">
                            {Math.round(state.selectedCustomer.aiInsights.predictiveIntelligence.nextVisitProbability * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={state.selectedCustomer.aiInsights.predictiveIntelligence.nextVisitProbability * 100} 
                          className="h-2" 
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Churn Risk</span>
                          <span className="font-medium text-red-600">
                            {Math.round(state.selectedCustomer.aiInsights.predictiveIntelligence.churnProbability * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={state.selectedCustomer.aiInsights.predictiveIntelligence.churnProbability * 100} 
                          className="h-2 bg-red-100" 
                        />
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Track Visit
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Gift className="w-4 h-4 mr-2" />
                    Send Offer
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h4 className="font-semibold mb-2">Select a Customer</h4>
              <p className="text-sm text-gray-600">
                Choose a customer from the list to view their profile and AI insights
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Customer Intelligence Summary */}
      {state.customers.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="text-center mb-4">
            <Badge className="gap-1 bg-purple-500 text-white mb-3">
              <Brain className="w-3 h-3" />
              AI-Powered Customer Intelligence
            </Badge>
            <h3 className="text-lg font-semibold text-purple-800">
              Revolutionary Customer Understanding
            </h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-purple-800">Behavioral Analysis</div>
              <div className="text-purple-600">AI-powered customer behavior insights</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-purple-800">Predictive Analytics</div>
              <div className="text-purple-600">Next visit and order predictions</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-purple-800">Personalization</div>
              <div className="text-purple-600">Individual customer experiences</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-purple-800">Real-Time Intelligence</div>
              <div className="text-purple-600">Live insights and recommendations</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}