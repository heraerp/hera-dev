"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/error-boundaries';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Navbar } from '@/components/ui/navbar';
import TeamsStyleSidebar from '@/components/ui/TeamsStyleSidebar';
import Link from 'next/link';
import { useUniversalAnalytics } from '@/hooks/useUniversalAnalytics';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock,
  ChefHat,
  Star,
  AlertTriangle,
  CheckCircle,
  Utensils,
  Coffee,
  Timer,
  BarChart3,
  Eye,
  MessageSquare,
  Zap,
  Brain,
  ArrowLeft,
  Home,
  Calendar,
  Package,
  CreditCard,
  Target,
  Activity,
  ThumbsUp,
  TrendingDown,
  Pizza,
  Leaf,
  Plus,
  Building2,
  Settings
} from 'lucide-react';

// Remove duplicate interfaces - using from Universal Analytics Service
import type { DashboardMetrics, AIRecommendation, PerformanceAlert } from '@/lib/services/universalAnalyticsService';

interface OrderStatus {
  id: string;
  table: string;
  items: string[];
  status: 'pending' | 'preparing' | 'ready' | 'served';
  time: string;
  total: number;
  waiter: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  shift: string;
  performance: number;
  ordersServed: number;
  tips: number;
}

interface AIInsight {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  confidence: number;
  action?: string;
}

const RestaurantDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  
  // HERA Universal Architecture: Get user's organization ID and handle multiple restaurants
  const [user, setUser] = useState<any>(null);
  const { 
    restaurantData, 
    allRestaurants,
    hasMultipleRestaurants,
    loading: restaurantLoading, 
    error: restaurantError 
  } = useRestaurantManagement();
  
  // Get current user for localStorage key
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);
  const organizationId = restaurantData?.organizationId;

  // Let the hook handle restaurant selection automatically
  // Remove redirect logic to prevent infinite loops
  
  // Use Universal Analytics for real-time data (only when organizationId is available)
  const {
    metrics,
    realtimeOrders,
    salesAnalytics,
    loading,
    error,
    refreshAll,
    isRealTimeConnected,
    lastUpdate
  } = useUniversalAnalytics(organizationId || '', {
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    enableRealTime: true
  });

  // Enterprise-grade staff data will be loaded from Universal Staff Service
  // Removing dummy data to maintain enterprise standards

  // Update time every second - moved before early returns to fix hook order
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // HERA Universal Architecture: Handle organization loading and error states FIRST
  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#30D5C8] mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Dashboard</h3>
            <p className="text-gray-600">Fetching your restaurant information...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Show restaurant selector if multiple restaurants are available but none selected
  if (!restaurantLoading && hasMultipleRestaurants && !restaurantData && allRestaurants.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <Card className="p-8 max-w-lg w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Select Your Restaurant</h3>
            <p className="text-gray-600 mb-6">
              You have multiple restaurants. Please select one to view its dashboard.
            </p>
            
            <div className="space-y-3 mb-6">
              {allRestaurants.map((restaurant) => (
                <Button
                  key={restaurant.id}
                  onClick={() => {
                    localStorage.setItem(`preferred-restaurant-${user?.id}`, restaurant.id);
                    window.location.reload();
                  }}
                  variant="outline"
                  className="w-full p-4 h-auto flex items-center justify-between hover:bg-[#30D5C8]/5"
                >
                  <div className="text-left">
                    <div className="font-medium">{restaurant.name}</div>
                    <div className="text-sm text-gray-500">{restaurant.location}</div>
                  </div>
                  <div className="text-sm">
                    <Badge variant="outline">{restaurant.role}</Badge>
                  </div>
                </Button>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/setup/restaurant'}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Setup New Restaurant
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show error state only if there's actually an error or no restaurants found
  if (restaurantError || (!restaurantLoading && !restaurantData && allRestaurants.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <Card className="p-8 max-w-lg w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Restaurant Found</h3>
            
            {/* User Profile Information */}
            {user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
                <h4 className="font-medium text-blue-900 mb-2">👤 Logged in as:</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>User ID:</strong> {user.id}</div>
                  <div><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</div>
                  <div><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</div>
                </div>
              </div>
            )}
            
            {/* Debug Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-left">
              <h4 className="font-medium text-gray-900 mb-2">🔍 Debug Information:</h4>
              <div className="text-sm space-y-1">
                <div><strong>Loading:</strong> {restaurantLoading ? 'Yes' : 'No'}</div>
                <div><strong>Has Multiple Restaurants:</strong> {hasMultipleRestaurants ? 'Yes' : 'No'}</div>
                <div><strong>All Restaurants Count:</strong> {allRestaurants?.length || 0}</div>
                <div><strong>Restaurant Data:</strong> {restaurantData ? 'Found' : 'None'}</div>
                <div><strong>Error:</strong> {restaurantError || 'None'}</div>
              </div>
              
              {/* Show available restaurants if any */}
              {allRestaurants && allRestaurants.length > 0 && (
                <div className="mt-3">
                  <strong>Available Restaurants:</strong>
                  <ul className="mt-1 space-y-1">
                    {allRestaurants.map((restaurant, index) => (
                      <li key={restaurant.id} className="text-xs bg-white px-2 py-1 rounded border">
                        {index + 1}. {restaurant.name} ({restaurant.industry}) - {restaurant.role}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 mb-4">
              {restaurantError || "No restaurants were found for your user account. This might be a data linking issue."}
            </p>
            
            <div className="space-y-3">
              {/* Refresh Button to retry loading */}
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                🔄 Refresh & Retry
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/setup/restaurant'}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                Setup New Restaurant
              </Button>
              
              {/* Debug Console Button */}
              <Button 
                onClick={() => {
                  console.log('=== RESTAURANT DEBUG INFO ===');
                  console.log('User:', user);
                  console.log('Restaurant Loading:', restaurantLoading);
                  console.log('Has Multiple Restaurants:', hasMultipleRestaurants);
                  console.log('All Restaurants:', allRestaurants);
                  console.log('Restaurant Data:', restaurantData);
                  console.log('Restaurant Error:', restaurantError);
                  console.log('========================');
                  alert('Debug information logged to console. Press F12 to view.');
                }}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                📋 Log Debug Info to Console
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // At this point, restaurantData is guaranteed to exist

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto animate-pulse">
                <BarChart3 className="w-8 h-8 text-[#30D5C8]" />
              </div>
              <div className="text-xl font-semibold text-gray-700">Loading Dashboard...</div>
              <div className="text-gray-500">Fetching real-time data from Universal Analytics</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-xl font-semibold text-gray-700">Error Loading Dashboard</div>
              <div className="text-gray-500">{error}</div>
              <Button onClick={refreshAll} className="mt-4">
                <Activity className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state when analytics load successfully but no data exists
  if (!loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-[#30D5C8]" />
              </div>
              {restaurantData.businessName} Dashboard
            </h1>
            {hasMultipleRestaurants && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/restaurant/select'}
                className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Switch Restaurant
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-center py-12">
            <Card className="p-8 max-w-2xl w-full mx-4 bg-white/90 backdrop-blur-sm shadow-xl">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChefHat className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Welcome to {restaurantData.businessName}!</h3>
                <p className="text-gray-600 mb-8 text-lg">Your restaurant is all set up. Let's get started with your first steps:</p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="text-left p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-[#30D5C8] font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Add Your Products</h4>
                        <p className="text-sm text-gray-600">Create your menu items and products to start selling</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-[#30D5C8] font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Create Your First Order</h4>
                        <p className="text-sm text-gray-600">Start processing orders to see analytics data</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button 
                    size="lg"
                    onClick={() => window.location.href = '/restaurant/setup-wizard'}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Setup Wizard
                  </Button>
                  <Button 
                    size="lg"
                    onClick={() => window.location.href = '/restaurant/products'}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Add Products
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline" 
                    onClick={() => window.location.href = '/restaurant/orders'}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Order
                  </Button>
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-3">Quick Links</p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Link href="/restaurant/inventory" className="text-sm text-blue-600 hover:text-blue-700">
                      Inventory Management
                    </Link>
                    <Link href="/restaurant/staff-universal" className="text-sm text-blue-600 hover:text-blue-700">
                      Staff Management
                    </Link>
                    <Link href="/restaurant/customers" className="text-sm text-blue-600 hover:text-blue-700">
                      Customer Database
                    </Link>
                    <Link href="/restaurant/analytics" className="text-sm text-blue-600 hover:text-blue-700">
                      Analytics & Reports
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'served': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <ChefHat className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'served': return <Utensils className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'inventory': return <Package className="w-5 h-5 text-blue-600" />;
      case 'customer': return <Users className="w-5 h-5 text-purple-600" />;
      case 'operations': return <Activity className="w-5 h-5 text-[#30D5C8]" />;
      case 'success': return <ThumbsUp className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info': return <Brain className="w-5 h-5 text-blue-600" />;
      default: return <Brain className="w-5 h-5 text-blue-600" />;
    }
  };

  // At this point, restaurantData is guaranteed to exist

  // Show analytics loading overlay only on initial load
  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Navigation Bar with User Info */}
        <Navbar />
        
        <div className="container mx-auto max-w-7xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-[#30D5C8]" />
              </div>
              {restaurantData.businessName} Dashboard
            </h1>
          </div>
          
          <div className="flex items-center justify-center py-20">
            <Card className="p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#30D5C8] mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Analytics</h3>
                <p className="text-gray-600">Fetching real-time data from Universal Analytics...</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Teams Style Sidebar */}
      <TeamsStyleSidebar
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
      />
      
      {/* Main Content */}
      <div className="flex-1 ml-20 sm:ml-16">
        {/* Navigation Bar with User Info */}
        <Navbar />
      
      <div className="container mx-auto max-w-7xl p-6 sm:p-4">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-8">
          <div>
            <h1 className="text-3xl sm:text-2xl font-bold text-gray-900 dark:text-[#30D5C8] flex items-center">
              <Clock className="mr-3 h-8 w-8 sm:h-6 sm:w-6 text-[#30D5C8]" />
              {restaurantData.businessName} Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • {currentTime.toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* User Profile Info */}
            {user && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#30D5C8]" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{user.email}</div>
                    <div className="text-gray-500 text-xs">
                      {user.user_metadata?.full_name || 'Restaurant Manager'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {hasMultipleRestaurants && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/restaurant/select'}
                className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Switch Restaurant
              </Button>
            )}
            <Badge variant="outline" className={isRealTimeConnected ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
              <Activity className="w-4 h-4 mr-1" />
              {isRealTimeConnected ? 'Live Updates' : 'Offline'}
            </Badge>
            {lastUpdate && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                <Clock className="w-4 h-4 mr-1" />
                Updated {lastUpdate.toLocaleTimeString()}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={refreshAll} disabled={loading}>
              <Activity className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Daily Sales</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">${metrics?.dailySales?.toFixed(2) || '0.00'}</p>
                    <p className="text-[#30D5C8] text-sm mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      Today's revenue
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Orders Today</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{metrics?.dailyOrders || 0}</p>
                    <p className="text-[#30D5C8] text-sm mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      Active: {metrics?.activeOrders || 0}
                    </p>
                  </div>
                  <Utensils className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Customer Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{metrics?.customerSatisfaction?.toFixed(1) || '0.0'}</p>
                      <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    </div>
                    <p className="text-[#30D5C8] text-sm mt-1">Excellent rating</p>
                  </div>
                  <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Staff Tips</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">${metrics?.averageTips?.toFixed(2) || '0.00'}</p>
                    <p className="text-[#30D5C8] text-sm mt-1">{metrics?.staffOnShift || 0} staff on shift</p>
                  </div>
                  <ChefHat className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Orders & Staff */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active Orders */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white dark:bg-gray-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Timer className="w-5 h-5 text-[#30D5C8]" />
                    Active Orders ({metrics?.activeOrders || 0})
                  </CardTitle>
                  <Link href="/restaurant/orders">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {realtimeOrders.slice(0, 4).map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getOrderStatusColor(order.status)}`}>
                          {getOrderStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.table}</p>
                          <p className="text-sm text-gray-600">{order.items.join(', ')}</p>
                          <p className="text-xs text-gray-500">{order.customerName} • {order.timeElapsed}m ago</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">Est: {order.estimatedCompletion}</p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Staff Performance */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-white dark:bg-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#30D5C8]" />
                    Staff Performance Today
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Show message for new restaurants with no staff data */}
                  {(!metrics?.staffPerformance || metrics.staffPerformance.length === 0) && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-500 mb-2">No Staff Data Yet</h3>
                      <p className="text-gray-400 mb-4">Staff performance metrics will appear here once you add team members</p>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-400">
                          Staff management coming in next release
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Feature Preview
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  {(metrics?.staffPerformance || []).map((staff, index) => (
                    <motion.div
                      key={staff.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-[#30D5C8]/10 rounded-full flex items-center justify-center text-[#30D5C8] font-semibold">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{staff.name}</p>
                          <p className="text-sm text-gray-600">{staff.role} • {staff.shift} Shift</p>
                          <p className="text-xs text-gray-500">{staff.ordersServed} orders • ${staff.tips.toFixed(2)} tips</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-600">Performance</span>
                          <span className="text-lg font-bold text-green-600">{staff.performance}%</span>
                        </div>
                        <Progress value={staff.performance} className="w-20" />
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - AI Insights & Quick Actions */}
          <div className="space-y-8">
            
            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white dark:bg-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#30D5C8]" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metrics?.aiRecommendations?.slice(0, 3).map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Confidence:</span>
                              <span className="text-xs font-medium text-[#30D5C8]">
                                {insight.confidence}%
                              </span>
                            </div>
                            {insight.action && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => {
                                  console.log('AI Insight action clicked:', insight.action);
                                  // TODO: Implement AI insight actions
                                }}
                              >
                                {insight.action}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="bg-white dark:bg-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#30D5C8]" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Link href="/restaurant/orders">
                    <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-1 hover:bg-[#30D5C8]/5">
                      <Utensils className="w-5 h-5" />
                      <span className="text-xs">New Order</span>
                    </Button>
                  </Link>
                  <Link href="/restaurant/inventory">
                    <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-1 hover:bg-[#30D5C8]/5">
                      <Package className="w-5 h-5" />
                      <span className="text-xs">Inventory</span>
                    </Button>
                  </Link>
                  <Link href="/restaurant/kitchen">
                    <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-1 hover:bg-[#30D5C8]/5">
                      <ChefHat className="w-5 h-5" />
                      <span className="text-xs">ChefHat</span>
                    </Button>
                  </Link>
                  <Link href="/restaurant/analytics">
                    <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-1 hover:bg-[#30D5C8]/5">
                      <BarChart3 className="w-5 h-5" />
                      <span className="text-xs">Reports</span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="bg-white dark:bg-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#30D5C8]" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">POS System</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ChefHat Display</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payment Gateway</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Universal Analytics</span>
                    <Badge className={isRealTimeConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {isRealTimeConnected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

function RestaurantDashboardWithErrorBoundary() {
  return (
    <PageErrorBoundary pageName="Restaurant Dashboard">
      <RestaurantDashboard />
    </PageErrorBoundary>
  );
}

export default RestaurantDashboardWithErrorBoundary;