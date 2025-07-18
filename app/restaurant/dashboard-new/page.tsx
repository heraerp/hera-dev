"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { 
  DollarSign, TrendingUp, Users, Clock, ChefHat, Star, 
  AlertTriangle, CheckCircle, Utensils, Coffee, Timer, 
  BarChart3, Eye, Zap, Brain, Home, Calendar, Package,
  Store, MapPin, Phone, Mail, Settings, Bell, Plus,
  Activity, Target, Shield, Sparkles, ArrowRight
} from 'lucide-react'
import { Card } from '@/components/ui/revolutionary-card'
import { Button } from '@/components/ui/revolutionary-button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Navbar } from '@/components/ui/navbar'
import UniversalCrudService from '@/lib/services/universalCrudService'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Steve Krug Principle: Clear data structures
interface RestaurantProfile {
  user_id: string
  user_email: string
  user_name: string
  user_role: string
  organization_id: string
  organization_name: string
  restaurant_entity_id: string
  restaurant_name: string
  business_type: string
  cuisine_type: string
  location: string
  seating_capacity: string
  setup_completed: boolean
}

interface DashboardMetrics {
  dailySales: number
  totalOrders: number
  activeOrders: number
  averageOrderValue: number
  customerSatisfaction: number
  staffOnShift: number
  inventoryAlerts: number
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  href: string
  color: string
  badge?: string
}

export default function RestaurantDashboardNew() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [profile, setProfile] = useState<RestaurantProfile | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    dailySales: 1847.50,
    totalOrders: 23,
    activeOrders: 4,
    averageOrderValue: 80.33,
    customerSatisfaction: 4.8,
    staffOnShift: 6,
    inventoryAlerts: 2
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  // Steve Krug Principle: Load user data immediately
  useEffect(() => {
    loadUserProfile()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/restaurant/signin')
        return
      }

      // Get restaurant profile using the function we created
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_user_restaurant_profile', { p_auth_user_id: user.id })

      if (profileError) {
        console.error('Profile error:', profileError)
        setError('Unable to load restaurant profile')
        return
      }

      if (profileData && profileData.length > 0) {
        setProfile(profileData[0])
      } else {
        // User doesn't have a restaurant profile yet
        router.push('/restaurant/signup')
        return
      }

    } catch (error: any) {
      console.error('Dashboard load error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Steve Krug Principle: Logical grouping of actions
  const quickActions: QuickAction[] = [
    {
      id: 'orders',
      title: 'View Orders',
      description: 'Manage current orders',
      icon: Coffee,
      href: '/restaurant/orders',
      color: 'bg-blue-500',
      badge: '4 Active'
    },
    {
      id: 'kitchen',
      title: 'ChefHat Display',
      description: 'Real-time kitchen view',
      icon: ChefHat,
      href: '/restaurant/kitchen',
      color: 'bg-orange-500',
      badge: 'Live'
    },
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'AI-powered stock management',
      icon: Package,
      href: '/restaurant/inventory',
      color: 'bg-green-500',
      badge: '2 Alerts'
    },
    {
      id: 'staff',
      title: 'Staff Login',
      description: 'Team management',
      icon: Users,
      href: '/restaurant/waiter',
      color: 'bg-purple-500',
      badge: '6 Online'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <Card variant="glass" className="p-8 text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading your restaurant dashboard...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
        <Card variant="glass" className="p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Dashboard Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
        <Card variant="glass" className="p-8 text-center max-w-md">
          <Store className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-orange-800 mb-2">No Restaurant Found</h2>
          <p className="text-orange-600 mb-4">You don't have a restaurant profile yet.</p>
          <Link href="/restaurant/signup">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Create Restaurant Profile
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Navigation Bar with User Info */}
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {profile.restaurant_name}
                  </h1>
                  <div className="flex items-center space-x-4 text-muted-foreground">
                    <span className="flex items-center">
                      <Utensils className="w-4 h-4 mr-1" />
                      {profile.cuisine_type}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {profile.location}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {profile.seating_capacity} seats
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="mt-2">
                  <Badge className="bg-green-100 text-green-800">
                    <Activity className="w-3 h-3 mr-1" />
                    Live Dashboard
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link href={action.href}>
                  <Card variant="hover" className="p-6 cursor-pointer h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      {action.badge && (
                        <Badge className="bg-gray-100 text-gray-800">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Today's Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Daily Sales */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <Badge className="bg-green-100 text-green-800">+12%</Badge>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                ${metrics.dailySales.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Daily Sales</p>
            </Card>

            {/* Orders */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-800">{metrics.activeOrders} Active</Badge>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {metrics.totalOrders}
              </div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </Card>

            {/* Average Order */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <Badge className="bg-purple-100 text-purple-800">+8%</Badge>
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                ${metrics.averageOrderValue}
              </div>
              <p className="text-sm text-muted-foreground">Avg. Order Value</p>
            </Card>

            {/* Satisfaction */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Excellent</Badge>
              </div>
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {metrics.customerSatisfaction}/5.0
              </div>
              <p className="text-sm text-muted-foreground">Customer Rating</p>
            </Card>
          </div>
        </motion.div>

        {/* AI Insights & Staff Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          
          {/* AI Insights */}
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                AI Insights
              </h3>
              <Badge className="bg-purple-100 text-purple-800">
                <Sparkles className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-green-800">Peak Performance Detected</h4>
                    <p className="text-sm text-green-600 mt-1">
                      Dragon Well Tea showing 40% higher sales - consider featuring in specials
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">89% confidence</Badge>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-yellow-800">Inventory Alert</h4>
                    <p className="text-sm text-yellow-600 mt-1">
                      Jasmine tea leaves running low (3 days remaining)
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">95% confidence</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Staff Status */}
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Staff Status
              </h3>
              <Badge className="bg-blue-100 text-blue-800">
                {metrics.staffOnShift} Online
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-green-600">EC</span>
                  </div>
                  <div>
                    <p className="font-medium">Emma Chen</p>
                    <p className="text-xs text-muted-foreground">Server • Morning Shift</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">95%</div>
                  <div className="text-xs text-muted-foreground">Performance</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">SK</span>
                  </div>
                  <div>
                    <p className="font-medium">Sarah Kim</p>
                    <p className="text-xs text-muted-foreground">Barista • Full Day</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">92%</div>
                  <div className="text-xs text-muted-foreground">Performance</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="outline" className="p-4 bg-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">Powered by HERA Universal Schema</span>
                <Badge className="bg-gray-100 text-gray-800">v2.1</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Link href="/restaurant">
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Restaurant Home
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}