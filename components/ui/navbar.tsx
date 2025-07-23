'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UniversalThemeButton, ThemeToggleButton } from '@/components/theme/UniversalThemeButton'
import { UniversalCard } from '@/components/theme/UniversalCard'
import { Badge } from '@/components/ui/badge'
import { useMobileTheme } from '@/hooks/useMobileTheme'
import {
  User, LogOut, LogIn, Building2, ChevronDown,
  Settings, Bell, Menu, X, Search, ChevronLeft, ChevronRight,
  Phone, Video, UserPlus, MessageSquare, Moon, Sun
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'

interface UserInfo {
  authUser: any
  coreUser: any
  organizations: any[]
  currentRole: string
}

export function Navbar() {
  const { restaurantData, loading: restaurantLoading } = useRestaurantManagement()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const { colors, isDark } = useMobileTheme()
  const supabase = createClient()

  // Restaurant apps for search
  const restaurantApps = [
    { id: 'dashboard', name: 'Restaurant Dashboard', description: 'Main dashboard and analytics', category: 'Management', path: '/restaurant/dashboard' },
    { id: 'orders', name: 'Order Management', description: 'Track and manage orders', category: 'Operations', path: '/restaurant/orders' },
    { id: 'kitchen', name: 'Kitchen Display', description: 'Kitchen order management', category: 'Operations', path: '/restaurant/kitchen' },
    { id: 'inventory', name: 'Inventory Management', description: 'Stock and inventory tracking', category: 'Management', path: '/restaurant/inventory' },
    { id: 'menu', name: 'Menu Management', description: 'Create and update menus', category: 'Management', path: '/restaurant/menu-management' },
    { id: 'staff', name: 'Staff Management', description: 'Employee scheduling and management', category: 'HR', path: '/restaurant/staff' },
    { id: 'customers', name: 'Customer Management', description: 'CRM and customer data', category: 'CRM', path: '/restaurant/customers' },
    { id: 'pos', name: 'Point of Sale', description: 'POS system integration', category: 'Sales', path: '/restaurant/pos' },
    { id: 'analytics', name: 'Analytics & Reports', description: 'Business intelligence and reporting', category: 'Analytics', path: '/restaurant/analytics' },
    { id: 'payments', name: 'Payment Management', description: 'Payment processing and billing', category: 'Finance', path: '/restaurant/payments' },
    { id: 'templates', name: 'Templates Marketplace', description: 'Deploy complete ERP systems in 2 minutes', category: 'Templates', path: '/templates' },
    { id: 'template-deployments', name: 'Template Deployments', description: 'Monitor and manage ERP deployments', category: 'Templates', path: '/templates/deployments' },
    { id: 'template-analytics', name: 'Template Analytics', description: 'Templates usage and performance insights', category: 'Templates', path: '/templates/analytics' },
    { id: 'template-create', name: 'Create Template', description: 'Build custom ERP templates', category: 'Templates', path: '/templates/create' }
  ]

  // Filter apps based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = restaurantApps.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filtered)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  useEffect(() => {
    loadUserInfo()
  }, [restaurantData?.organizationId])

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      const isDarkMode = JSON.parse(savedDarkMode)
      setDarkMode(isDarkMode)
      // Apply dark mode to document on load
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode))
    
    // Apply dark mode to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const loadUserInfo = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        setUserInfo(null)
        return
      }
      
      // Get core user details
      const { data: coreUser, error: coreUserError } = await supabase
        .from('core_users')
        .select('id, email, full_name, user_role, is_active, created_at')
        .eq('auth_user_id', user.id)
        .single()
      
      if (coreUserError || !coreUser) {
        setUserInfo({
          authUser: user,
          coreUser: null,
          organizations: [],
          currentRole: 'no_access'
        })
        return
      }
      
      // Get user's organizations
      const { data: userOrgs, error: orgsError } = await supabase
        .from('user_organizations')
        .select(`
          organization_id,
          role,
          is_active,
          created_at,
          core_organizations (
            id,
            org_name,
            industry,
            country,
            is_active
          )
        `)
        .eq('user_id', coreUser.id)
        .eq('is_active', true)
      
      const organizations = userOrgs || []
      
      // Determine current role for the selected restaurant
      const currentOrgLink = organizations.find(org => 
        org.organization_id === restaurantData?.organizationId
      )
      const currentRole = currentOrgLink?.role || 'no_access'
      
      setUserInfo({
        authUser: user,
        coreUser: coreUser,
        organizations: organizations,
        currentRole: currentRole
      })
      
    } catch (error) {
      console.error('❌ Failed to load user info:', error)
      setUserInfo(null)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        setUserInfo(null)
        window.location.href = '/restaurant/signin'
      }
    } catch (error) {
      console.error('Sign out failed:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleSignIn = () => {
    window.location.href = '/restaurant/signin'
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return { backgroundColor: colors.success, color: '#ffffff' }
      case 'manager': return { backgroundColor: colors.orange, color: '#ffffff' }
      case 'staff': return { backgroundColor: colors.info, color: '#ffffff' }
      default: return { backgroundColor: colors.textMuted, color: '#ffffff' }
    }
  }

  return (
    <nav className="bg-gray-800 border-b border-gray-700 shadow-sm">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left Section - Navigation and App Name */}
          <div className="flex items-center space-x-4">
            {/* Navigation Arrows */}
            <div className="flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 rounded hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 rounded hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.button>
            </div>

            {/* App Title */}
            <div className="flex items-center">
              <h1 className="text-white text-lg font-medium">
                {restaurantData?.businessName || 'Restaurant Dashboard'}
              </h1>
            </div>
          </div>

          {/* Center Section - Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for apps, people, and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30D5C8]/50 focus:bg-gray-600 transition-all duration-200"
              />
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {(isSearchFocused && (searchQuery || searchResults.length > 0)) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto"
                >
                  {searchQuery && searchResults.length === 0 && (
                    <div className="p-4 text-gray-400 text-sm">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                  
                  {searchResults.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-400 mb-2 px-2">
                        RESTAURANT APPS ({searchResults.length})
                      </div>
                      {searchResults.map((app: any) => (
                        <motion.a
                          key={app.id}
                          href={app.path}
                          whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.7)' }}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 bg-[#30D5C8] rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{app.name}</div>
                            <div className="text-gray-400 text-xs">{app.description}</div>
                          </div>
                          <Badge className="bg-gray-700 text-gray-300 text-xs border-0">
                            {app.category}
                          </Badge>
                        </motion.a>
                      ))}
                    </div>
                  )}
                  
                  {!searchQuery && (
                    <div className="p-4">
                      <div className="text-xs font-medium text-gray-400 mb-3">RECENT APPS</div>
                      {restaurantApps.slice(0, 5).map((app) => (
                        <motion.a
                          key={app.id}
                          href={app.path}
                          whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.7)' }}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 bg-[#30D5C8] rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{app.name}</div>
                            <div className="text-gray-400 text-xs">{app.description}</div>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Section - User and Controls */}
          <div className="flex items-center space-x-2">
            
            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>

            {/* More Options */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              <Menu className="w-4 h-4" />
            </motion.button>

            {/* User Profile */}
            {userInfo ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#30D5C8] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden md:flex flex-col items-start text-xs">
                      <span className="text-white font-medium">
                        {userInfo.coreUser?.full_name?.split(' ')[0] || 'User'}
                      </span>
                      <Badge className="bg-gray-700 text-gray-300 text-[10px] border-0 px-1.5 py-0">
                        {userInfo.currentRole.toUpperCase()}
                      </Badge>
                    </div>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-gray-800 border-gray-600">
                  <DropdownMenuLabel>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#30D5C8] rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {userInfo.coreUser?.full_name || 'Unknown User'}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {userInfo.coreUser?.email || userInfo.authUser?.email}
                        </div>
                        <Badge className="bg-gray-700 text-gray-300 text-xs mt-1 border-0">
                          {userInfo.currentRole.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator className="bg-gray-600" />
                  
                  <div className="px-2 py-2">
                    <div className="text-xs font-medium mb-1 text-gray-400">
                      CURRENT RESTAURANT
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-white">
                        {restaurantData?.businessName || 'No restaurant'}
                      </span>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator className="bg-gray-600" />
                  
                  <DropdownMenuItem 
                    onClick={() => window.location.href = '/settings'}
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isSigningOut ? 'Signing out...' : 'Sign out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignIn}
                className="flex items-center space-x-2 bg-[#30D5C8] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#30D5C8]/90 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
