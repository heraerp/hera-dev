'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building, Users, DollarSign, TrendingUp, Package, 
  Activity, Star, Clock, Coffee, Utensils, BarChart3,
  CheckCircle, AlertTriangle, Zap, Brain, Target,
  ArrowRight, Eye, Plus, Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import RestaurantLayout from '@/components/restaurant/RestaurantLayout'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import Link from 'next/link'

export default function RestaurantOverviewPage() {
  const { restaurantData, loading } = useRestaurantManagement()

  // Sample data - would come from analytics service in real implementation
  const quickStats = [
    {
      title: 'Today\'s Revenue',
      value: '₹2,847',
      change: '+12.5%',
      positive: true,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Orders Processed',
      value: '47',
      change: '+8.2%',
      positive: true,
      icon: Utensils,
      color: 'text-blue-600'
    },
    {
      title: 'Active Customers',
      value: '156',
      change: '+15.3%',
      positive: true,
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Avg Order Value',
      value: '₹425',
      change: '+5.1%',
      positive: true,
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ]

  const systemModules = [
    {
      title: 'Product Catalog',
      description: 'Manage tea & pastry inventory',
      href: '/restaurant/products',
      icon: Coffee,
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800',
      progress: 100
    },
    {
      title: 'Customer Management',
      description: 'Customer intelligence & loyalty',
      href: '/restaurant/customers',
      icon: Users,
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800',
      progress: 100
    },
    {
      title: 'Order Processing',
      description: 'Universal transaction processing',
      href: '/restaurant/orders',
      icon: Utensils,
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800',
      progress: 100
    },
    {
      title: 'Payment Processing',
      description: 'AI-powered payment terminal',
      href: '/restaurant/payments',
      icon: DollarSign,
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800',
      progress: 100
    },
    {
      title: 'Financial Accounting',
      description: 'SAP-style accounting system',
      href: '/restaurant/financials',
      icon: Building,
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800',
      progress: 100
    },
    {
      title: 'Analytics Dashboard',
      description: 'AI business intelligence',
      href: '/restaurant/analytics',
      icon: BarChart3,
      status: 'Hot',
      statusColor: 'bg-red-100 text-red-800',
      progress: 100
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      message: 'New order #ORD-2024-0115-047 from Table 5',
      time: '2 minutes ago',
      icon: Utensils,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'payment',
      message: 'Payment of ₹425 processed successfully',
      time: '5 minutes ago',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'customer',
      message: 'New customer Sarah Johnson registered',
      time: '12 minutes ago',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'inventory',
      message: 'Earl Grey Tea stock running low (8 units)',
      time: '25 minutes ago',
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    {
      id: 5,
      type: 'analytics',
      message: 'Weekly analytics report generated',
      time: '1 hour ago',
      icon: BarChart3,
      color: 'text-indigo-600'
    }
  ]

  if (loading) {
    return (
      <RestaurantLayout title="System Overview">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading restaurant overview...</p>
          </div>
        </div>
      </RestaurantLayout>
    )
  }

  return (
    <RestaurantLayout title="System Overview">
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to {restaurantData?.businessName || 'Your Restaurant'}
          </h1>
          <p className="text-gray-600">
            Complete overview of your HERA Universal Restaurant Management System
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className={`text-sm flex items-center gap-1 ${
                      stat.positive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-gray-100`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* System Modules Status */}
        <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              System Modules Status
            </h2>
            <Badge className="bg-green-100 text-green-800">
              All Systems Operational
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemModules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Link href={module.href}>
                  <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <module.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{module.title}</h3>
                          <p className="text-sm text-gray-600">{module.description}</p>
                        </div>
                      </div>
                      <Badge className={module.statusColor}>
                        {module.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">System Health</span>
                        <span className="text-xs font-semibold text-green-600">{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="h-2" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Recent Activities & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Recent Activities
              </h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg bg-white`}>
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Insights */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Insights
              </h2>
              <Link href="/restaurant/analytics">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/60 rounded-lg border border-white/40">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Revenue Optimization</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Peak hours (12-2 PM) show 45% higher order values. Consider premium pricing.
                    </p>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      92% Confidence
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/60 rounded-lg border border-white/40">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Customer Behavior</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Tea-pastry combo orders have 35% higher customer satisfaction scores.
                    </p>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      88% Confidence
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/60 rounded-lg border border-white/40">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Inventory Insight</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Earl Grey Tea demand increases 28% on rainy days. Weather-based stocking recommended.
                    </p>
                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                      84% Confidence
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/restaurant/orders">
              <Button className="w-full h-16 flex flex-col items-center gap-2" variant="outline">
                <Plus className="w-5 h-5" />
                <span className="text-sm">New Order</span>
              </Button>
            </Link>
            
            <Link href="/restaurant/products">
              <Button className="w-full h-16 flex flex-col items-center gap-2" variant="outline">
                <Package className="w-5 h-5" />
                <span className="text-sm">Add Product</span>
              </Button>
            </Link>
            
            <Link href="/restaurant/customers">
              <Button className="w-full h-16 flex flex-col items-center gap-2" variant="outline">
                <Users className="w-5 h-5" />
                <span className="text-sm">Add Customer</span>
              </Button>
            </Link>
            
            <Link href="/restaurant/analytics">
              <Button className="w-full h-16 flex flex-col items-center gap-2" variant="outline">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm">View Reports</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </RestaurantLayout>
  )
}