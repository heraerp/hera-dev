'use client'

/**
 * HERA Universal Frontend Template - Dashboard Layout
 * Main application layout with sidebar navigation and header
 * Follows "Don't Make Me Think" principles with clear visual hierarchy
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, Search, Bell, User, Settings, LogOut, 
  Home, Package, Users, BarChart3, FileText, 
  ChevronDown, ChevronRight, Circle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  href: string
  badge?: string | number
  children?: NavItem[]
  description?: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  showSearch?: boolean
  navigation?: NavItem[]
  user?: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
  notifications?: number
  className?: string
}

// Default navigation structure
const defaultNavigation: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/restaurant/dashboard',
    description: 'Overview and key metrics'
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: FileText,
    href: '/restaurant/orders',
    badge: 'Live',
    description: 'Manage customer orders'
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    href: '/restaurant/products',
    description: 'Menu items and inventory'
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    href: '/restaurant/customers',
    description: 'Customer management'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/restaurant/analytics',
    description: 'Reports and insights'
  }
]

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
  showSearch = true,
  navigation = defaultNavigation,
  user,
  notifications = 0,
  className = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [currentPath, setCurrentPath] = useState('')
  
  const { restaurantData } = useRestaurantManagement()

  // Get current path for active navigation highlighting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [])

  // Handle navigation item expansion
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Check if navigation item is active
  const isActiveItem = (item: NavItem) => {
    return currentPath === item.href || currentPath.startsWith(item.href + '/')
  }

  // Render navigation item
  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = isActiveItem(item)
    const isExpanded = expandedItems.has(item.id)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id}>
        <div
          className={`
            group flex items-center justify-between px-3 py-2 mx-2 rounded-lg cursor-pointer
            transition-all duration-200 relative
            ${isActive 
              ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }
            ${level > 0 ? 'ml-4' : ''}
          `}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id)
            } else {
              window.location.href = item.href
            }
          }}
        >
          <div className="flex items-center gap-3">
            {/* Active indicator */}
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
            )}
            
            <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
            
            <div className="flex-1">
              <div className="text-sm font-medium">{item.label}</div>
              {item.description && (
                <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {item.badge && (
              <Badge 
                className={`text-xs px-2 py-0.5 ${
                  item.badge === 'Live' 
                    ? 'bg-green-100 text-green-700 animate-pulse' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {item.badge}
              </Badge>
            )}
            
            {hasChildren && (
              <div className="transition-transform duration-200">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="py-1">
                {item.children!.map(child => renderNavItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:translate-x-0 lg:static lg:z-auto"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">HERA Universal</div>
              <div className="text-xs text-gray-500">
                {restaurantData?.name || 'Restaurant'}
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {navigation.map(item => renderNavItem(item))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <Settings className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-700">Settings</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Left side */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <Menu className="w-5 h-5" />
                </Button>

                <div>
                  {title && (
                    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>

              {/* Center - Search */}
              {showSearch && (
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 w-full"
                    />
                  </div>
                </div>
              )}

              {/* Right side */}
              <div className="flex items-center gap-3">
                {actions}

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5 text-gray-500" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-red-500 text-white">
                      {notifications > 9 ? '9+' : notifications}
                    </Badge>
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback>
                          {user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <div className="text-sm font-medium">{user?.name || 'User'}</div>
                        <div className="text-xs text-gray-500">{user?.role || 'Staff'}</div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout