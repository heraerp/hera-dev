import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OnboardingGuidance from './OnboardingGuidance';
import BreadcrumbNavigation from './BreadcrumbNavigation';
import EmptyState, { ProductsEmptyState, OrdersEmptyState } from './EmptyState';
import Link from 'next/link';
import { 
  Coffee, 
  Users, 
  CreditCard, 
  BarChart3,
  Package,
  Utensils,
  DollarSign,
  ChefHat,
  Clock,
  Star,
  ArrowRight,
  Plus,
  TrendingUp,
  Eye,
  Zap
} from 'lucide-react';

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  activeProducts: number;
  totalCustomers: number;
}

interface ImprovedRestaurantDashboardProps {
  stats?: DashboardStats;
  isNewUser?: boolean;
  completedSteps?: string[];
  hasProducts?: boolean;
  hasOrders?: boolean;
}

const ImprovedRestaurantDashboard: React.FC<ImprovedRestaurantDashboardProps> = ({
  stats = {
    todayOrders: 0,
    todayRevenue: 0,
    activeProducts: 0,
    totalCustomers: 0
  },
  isNewUser = true,
  completedSteps = [],
  hasProducts = false,
  hasOrders = false
}) => {
  const [showOnboarding, setShowOnboarding] = useState(isNewUser);

  const quickActions = [
    {
      icon: Plus,
      emoji: "➕",
      title: "Add Product",
      description: "Add items to your menu",
      link: "/restaurant/products/new",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      icon: Utensils,
      emoji: "🛒",
      title: "New Order",
      description: "Create a test order",
      link: "/restaurant/orders/new",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      icon: Eye,
      emoji: "👀",
      title: "Kitchen View",
      description: "See order preparation",
      link: "/restaurant/kitchen",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      icon: BarChart3,
      emoji: "📊",
      title: "Analytics",
      description: "View performance data",
      link: "/restaurant/analytics",
      color: "bg-purple-500 hover:bg-purple-600"
    }
  ];

  const mainFeatures = [
    {
      icon: Coffee,
      emoji: "☕",
      title: "Product Catalog",
      description: "Complete tea and pastry catalog management with Universal Schema",
      link: "/restaurant/products",
      status: "NEW",
      hasData: hasProducts
    },
    {
      icon: Users,
      emoji: "👥",
      title: "Customer Management", 
      description: "Customer intelligence with AI insights and loyalty tracking",
      link: "/restaurant/customers",
      status: "NEW",
      hasData: stats.totalCustomers > 0
    },
    {
      icon: Utensils,
      emoji: "🛒",
      title: "Order Processing",
      description: "Universal transaction processing with real-time order management",
      link: "/restaurant/orders",
      status: "NEW",
      hasData: hasOrders
    },
    {
      icon: CreditCard,
      emoji: "💳",
      title: "Payment Processing",
      description: "Intelligent payment terminal with AI fraud detection",
      link: "/restaurant/payments",
      status: "NEW",
      hasData: false
    },
    {
      icon: DollarSign,
      emoji: "💰",
      title: "Financial Accounting",
      description: "SAP Business One-style accounting with automated journal entries",
      link: "/restaurant/financials",
      status: "NEW",
      hasData: false
    },
    {
      icon: BarChart3,
      emoji: "📊",
      title: "Analytics Dashboard",
      description: "AI-powered business intelligence with predictive insights",
      link: "/restaurant/analytics",
      status: "HOT",
      hasData: stats.todayOrders > 0
    }
  ];

  const statsCards = [
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: Utensils,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Today's Revenue",
      value: `$${stats.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Active Products",
      value: stats.activeProducts,
      icon: Coffee,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <BreadcrumbNavigation showHome={false} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to HERA Universal! 🎉
              </h1>
              <p className="text-gray-600">
                Your intelligent restaurant management system is ready to transform your operations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Zap className="w-3 h-3 mr-1" />
                Live System
              </Badge>
            </div>
          </div>
        </div>

        {/* Onboarding Guidance */}
        {showOnboarding && (
          <OnboardingGuidance
            onDismiss={() => setShowOnboarding(false)}
            completedSteps={completedSteps}
          />
        )}

        {/* Quick Actions */}
        <Card className="mb-8 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.link}>
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {action.emoji} {action.title}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.title} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Features */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Restaurant Features
            </h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {mainFeatures.filter(f => f.hasData).length} of {mainFeatures.length} active
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature) => (
              <Card 
                key={feature.title} 
                className={`hover:shadow-lg transition-all duration-200 cursor-pointer group ${
                  feature.hasData ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        feature.hasData ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <feature.icon className={`w-6 h-6 ${
                          feature.hasData ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <Badge variant="secondary" className={`text-xs ${
                          feature.status === 'HOT' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {feature.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-2xl">
                      {feature.emoji}
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {feature.hasData ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          ✓ Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                          Not Set Up
                        </Badge>
                      )}
                    </div>

                    <Link href={feature.link}>
                      <Button variant="outline" size="sm" className="group-hover:bg-blue-50 group-hover:border-blue-200">
                        {feature.hasData ? 'Manage' : 'Set Up'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty States for Key Features */}
        {!hasProducts && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🍽️ Set Up Your Menu
            </h3>
            <ProductsEmptyState />
          </div>
        )}

        {!hasOrders && hasProducts && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🛒 Start Taking Orders
            </h3>
            <OrdersEmptyState />
          </div>
        )}

        {/* Footer */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">
                HERA Universal Restaurant
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              World's first 2-minute restaurant ERP • Universal Architecture • AI-Powered Intelligence
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span>🚀 Setup in minutes</span>
              <span>🧠 AI-enhanced</span>
              <span>📱 Mobile-first</span>
              <span>🔒 Enterprise security</span>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ImprovedRestaurantDashboard;