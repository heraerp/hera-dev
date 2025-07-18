'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Coffee, Users, Utensils, CreditCard, DollarSign,
  BarChart3, Package, ChefHat, TrendingUp, Settings, 
  ArrowLeft, Menu, X, Star, Bell, User, LogOut,
  Building, Leaf, Activity, Target, Brain, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/revolutionary-card'
import { Separator } from '@/components/ui/separator'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'

interface RestaurantNavigationProps {
  showBackButton?: boolean
  backUrl?: string
  title?: string
  compact?: boolean
}

interface NavItem {
  id: string
  label: string
  href: string
  icon: any
  badge?: string
  badgeColor?: string
  description?: string
  category: 'core' | 'management' | 'analytics' | 'legacy'
}

const navigationItems: NavItem[] = [
  // Core Business Operations
  {
    id: 'products',
    label: 'Product Catalog',
    href: '/restaurant/products',
    icon: Coffee,
    badge: 'NEW',
    badgeColor: 'bg-green-100 text-green-800',
    description: 'Tea & pastry catalog management',
    category: 'core'
  },
  {
    id: 'customers',
    label: 'Customer Management',
    href: '/restaurant/customers',
    icon: Users,
    badge: 'NEW',
    badgeColor: 'bg-blue-100 text-blue-800',
    description: 'Customer intelligence & loyalty',
    category: 'core'
  },
  {
    id: 'orders',
    label: 'Order Processing',
    href: '/restaurant/orders',
    icon: Utensils,
    badge: 'NEW',
    badgeColor: 'bg-purple-100 text-purple-800',
    description: 'Universal transaction processing',
    category: 'core'
  },
  {
    id: 'payments',
    label: 'Payment Processing',
    href: '/restaurant/payments',
    icon: CreditCard,
    badge: 'NEW',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    description: 'AI-powered payment terminal',
    category: 'core'
  },
  {
    id: 'financials',
    label: 'Financial Accounting',
    href: '/restaurant/financials',
    icon: DollarSign,
    badge: 'NEW',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    description: 'SAP-style accounting system',
    category: 'core'
  },
  {
    id: 'analytics',
    label: 'Analytics Dashboard',
    href: '/restaurant/analytics',
    icon: BarChart3,
    badge: 'HOT',
    badgeColor: 'bg-red-100 text-red-800',
    description: 'AI business intelligence',
    category: 'analytics'
  },
  
  // Management & Operations
  {
    id: 'dashboard',
    label: 'Manager Dashboard',
    href: '/restaurant/dashboard',
    icon: TrendingUp,
    description: 'Central management hub',
    category: 'management'
  },
  {
    id: 'inventory',
    label: 'Smart Inventory',
    href: '/restaurant/inventory',
    icon: Package,
    description: 'AI inventory management',
    category: 'management'
  },
  {
    id: 'kitchen',
    label: 'ChefHat Display',
    href: '/restaurant/kitchen',
    icon: ChefHat,
    description: 'Real-time kitchen orders',
    category: 'management'
  },
  
  // Legacy/Additional Features
  {
    id: 'marketing',
    label: 'Marketing',
    href: '/restaurant/marketing',
    icon: Star,
    description: 'Campaigns & promotions',
    category: 'legacy'
  }
]

export default function RestaurantNavigation({
  showBackButton = true,
  backUrl = '/restaurant',
  title,
  compact = false
}: RestaurantNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { restaurantData, loading } = useRestaurantManagement()

  const isActive = (href: string) => {
    if (href === '/restaurant' && pathname === '/restaurant') return true
    if (href !== '/restaurant' && pathname.startsWith(href)) return true
    return false
  }

  const getNavItemsByCategory = (category: string) => {
    return navigationItems.filter(item => item.category === category)
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Link href={backUrl}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">{title || restaurantData?.businessName}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/restaurant/analytics">
            <Button variant="ghost" size="sm" className={isActive('/restaurant/analytics') ? 'bg-purple-100 text-purple-700' : ''}>
              <BarChart3 className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/restaurant/orders">
            <Button variant="ghost" size="sm" className={isActive('/restaurant/orders') ? 'bg-blue-100 text-blue-700' : ''}>
              <Utensils className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/restaurant/products">
            <Button variant="ghost" size="sm" className={isActive('/restaurant/products') ? 'bg-green-100 text-green-700' : ''}>
              <Coffee className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <Link href={backUrl}>
                  <Button variant="ghost" size="sm" className="mr-2">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {title || restaurantData?.businessName || 'HERA Restaurant'}
                  </h2>
                  <p className="text-sm text-gray-600">Universal Restaurant System</p>
                </div>
              </div>
            </div>
            
            <Badge className="gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <Activity className="w-3 h-3" />
              Live System
            </Badge>
          </div>

          {/* Core Business Operations */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Core Business Operations
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {getNavItemsByCategory('core').map((item) => (
                <Link key={item.id} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-4 ${
                      isActive(item.href) 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <item.icon className="w-5 h-5" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge className={`text-xs ${item.badgeColor}`}>
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs ${isActive(item.href) ? 'text-emerald-100' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Analytics & Intelligence */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Analytics & Intelligence
            </h3>
            <div className="space-y-2">
              {getNavItemsByCategory('analytics').map((item) => (
                <Link key={item.id} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-3 ${
                      isActive(item.href) 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                        : 'hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <item.icon className="w-5 h-5" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge className={`text-xs ${item.badgeColor}`}>
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs ${isActive(item.href) ? 'text-purple-100' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Management & Operations */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Management & Operations
            </h3>
            <div className="space-y-2">
              {getNavItemsByCategory('management').map((item) => (
                <Link key={item.id} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive(item.href) 
                        ? 'bg-orange-500 text-white' 
                        : 'hover:bg-orange-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Link href={backUrl}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">
                {title || restaurantData?.businessName || 'HERA'}
              </span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border-b border-gray-200 overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Link href="/restaurant/orders">
                    <Button variant="outline" size="sm" className="w-full">
                      <Utensils className="w-4 h-4 mr-1" />
                      Orders
                    </Button>
                  </Link>
                  <Link href="/restaurant/products">
                    <Button variant="outline" size="sm" className="w-full">
                      <Coffee className="w-4 h-4 mr-1" />
                      Products
                    </Button>
                  </Link>
                  <Link href="/restaurant/analytics">
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Analytics
                    </Button>
                  </Link>
                </div>

                <Separator />

                {/* All Navigation Items */}
                <div className="space-y-1">
                  {navigationItems.map((item) => (
                    <Link key={item.id} href={item.href}>
                      <Button
                        variant={isActive(item.href) ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge className={`ml-auto text-xs ${item.badgeColor}`}>
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}