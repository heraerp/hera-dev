/**
 * Restaurant Navbar Component
 * Unified navigation for all restaurant app sections
 * Shows organization name, current section, and user info
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UniversalThemeButton, ThemeToggleButton } from '@/components/theme/UniversalThemeButton'
import { Badge } from '@/components/ui/badge'
import { useMobileTheme } from '@/hooks/useMobileTheme'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import {
  User, LogOut, Settings, Bell, Menu, X, ChevronDown,
  Building2, Home, ShoppingBag, Package, Users, ChefHat,
  CreditCard, BarChart3, FileText
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface UserInfo {
  authUser: any
  coreUser: any
  organizations: any[]
  currentRole: string
}

interface RestaurantNavbarProps {
  currentSection?: string
  sectionIcon?: React.ReactNode
}

// Navigation items configuration
const navItems = [
  { href: '/restaurant/dashboard', label: 'Dashboard', icon: Home },
  { href: '/restaurant/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/restaurant/kitchen', label: 'Kitchen', icon: ChefHat },
  { href: '/restaurant/products', label: 'Products', icon: Package },
  { href: '/restaurant/customers', label: 'Customers', icon: Users },
  { href: '/restaurant/payments', label: 'Payments', icon: CreditCard },
  { href: '/restaurant/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/restaurant/reports-universal', label: 'Reports', icon: FileText },
]

export function RestaurantNavbar({ currentSection, sectionIcon }: RestaurantNavbarProps) {
  const { restaurantData, loading: restaurantLoading } = useRestaurantManagement()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { colors, isDark } = useMobileTheme()
  const supabase = createClient()
  const pathname = usePathname()

  useEffect(() => {
    loadUserInfo()
  }, [restaurantData?.organizationId])

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
        .select('id, email, full_name, user_role, is_active')
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

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'owner': return {
        backgroundColor: isDark ? 'rgba(102, 187, 106, 0.2)' : 'rgba(34, 197, 94, 0.1)',
        color: colors.success,
        borderColor: isDark ? 'rgba(102, 187, 106, 0.4)' : 'rgba(34, 197, 94, 0.2)'
      }
      case 'manager': return {
        backgroundColor: isDark ? 'rgba(255, 87, 34, 0.2)' : 'rgba(255, 71, 1, 0.1)',
        color: colors.orange,
        borderColor: isDark ? 'rgba(255, 87, 34, 0.4)' : 'rgba(255, 71, 1, 0.2)'
      }
      case 'staff': return {
        backgroundColor: isDark ? 'rgba(66, 165, 245, 0.2)' : 'rgba(59, 130, 246, 0.1)',
        color: colors.info,
        borderColor: isDark ? 'rgba(66, 165, 245, 0.4)' : 'rgba(59, 130, 246, 0.2)'
      }
      default: return {
        backgroundColor: isDark ? 'rgba(189, 189, 189, 0.2)' : 'rgba(156, 163, 175, 0.1)',
        color: colors.textMuted,
        borderColor: colors.border
      }
    }
  }

  // Get current page title from pathname
  const getCurrentPageTitle = () => {
    if (currentSection) return currentSection
    const currentNav = navItems.find(item => pathname.startsWith(item.href))
    return currentNav?.label || 'Dashboard'
  }

  const getCurrentPageIcon = () => {
    if (sectionIcon) return sectionIcon
    const currentNav = navItems.find(item => pathname.startsWith(item.href))
    const Icon = currentNav?.icon || Building2
    return <Icon className="w-5 h-5" />
  }

  return (
    <nav 
      className="shadow-sm border-b sticky top-0 z-50"
      style={{ 
        backgroundColor: isDark ? colors.gray800 : colors.surface,
        borderColor: isDark ? colors.gray700 : colors.border,
        boxShadow: isDark ? `0 1px 3px ${colors.shadow}` : undefined
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section: Logo, Organization Name, Current Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                backgroundColor: isDark ? colors.gray700 : colors.surface,
                color: colors.textPrimary,
                border: `1px solid ${isDark ? colors.gray600 : colors.border}`
              }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link 
              href="/restaurant/dashboard"
              className="flex items-center"
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.orange} 0%, ${colors.error} 100%)`
                }}
              >
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </Link>
            
            {/* Section Title & Organization Name */}
            <div className="flex items-center">
              <div className="hidden md:block">
                <div>
                  <h1 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                    {getCurrentPageTitle()}
                  </h1>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    {restaurantData?.businessName || 'HERA Restaurant'}
                  </p>
                </div>
              </div>
              
              {/* Mobile: Show section title prominently */}
              <div className="md:hidden">
                <div>
                  <h1 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                    {getCurrentPageTitle()}
                  </h1>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    {restaurantData?.businessName || 'HERA Restaurant'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: User Menu */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggleButton />
            
            {/* Notifications */}
            <UniversalThemeButton 
              variant="ghost" 
              size="sm" 
              className="relative hidden sm:flex"
              style={{
                backgroundColor: isDark ? colors.gray700 : 'transparent',
                border: `1px solid ${isDark ? colors.gray600 : 'transparent'}`
              }}
            >
              <Bell className="w-5 h-5" />
              <span 
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.error }}
              />
            </UniversalThemeButton>

            {/* User Dropdown */}
            {userInfo ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center space-x-2 p-2 rounded-lg transition-all"
                    style={{
                      backgroundColor: isDark ? colors.gray700 : colors.surface,
                      border: `1px solid ${isDark ? colors.gray600 : colors.border}`
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: isDark ? 'rgba(255, 87, 34, 0.2)' : 'rgba(255, 71, 1, 0.1)',
                        color: colors.orange
                      }}
                    >
                      <User className="w-4 h-4" />
                    </div>
                    <div className="hidden sm:flex items-center space-x-2">
                      <div className="text-left">
                        <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                          {userInfo.coreUser?.full_name || 'User'}
                        </div>
                        <div className="text-xs" style={{ color: colors.textMuted }}>
                          {userInfo.currentRole}
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4" style={{ color: colors.textMuted }} />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-80"
                  style={{
                    backgroundColor: isDark ? colors.gray800 : colors.surface,
                    border: `1px solid ${isDark ? colors.gray700 : colors.border}`
                  }}
                >
                  <DropdownMenuLabel>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255, 87, 34, 0.2)' : 'rgba(255, 71, 1, 0.1)',
                          color: colors.orange
                        }}
                      >
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: colors.textPrimary }}>
                          {userInfo.coreUser?.full_name || 'Unknown User'}
                        </div>
                        <div className="text-sm" style={{ color: colors.textSecondary }}>
                          {userInfo.coreUser?.email || userInfo.authUser?.email}
                        </div>
                        <Badge 
                          className="text-xs mt-1 border"
                          style={getRoleBadgeStyle(userInfo.currentRole)}
                        >
                          {userInfo.currentRole.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator style={{ backgroundColor: isDark ? colors.gray700 : colors.border }} />
                  
                  {/* Current Organization */}
                  <div className="px-2 py-2">
                    <div className="text-xs font-medium mb-2" style={{ color: colors.textMuted }}>
                      CURRENT ORGANIZATION
                    </div>
                    <div 
                      className="p-2 rounded-md"
                      style={{
                        backgroundColor: isDark ? colors.gray700 : colors.surfaceElevated,
                        border: `1px solid ${isDark ? colors.gray600 : colors.border}`
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4" style={{ color: colors.orange }} />
                        <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                          {restaurantData?.businessName || 'No organization'}
                        </span>
                      </div>
                      {restaurantData?.industry && (
                        <div className="text-xs mt-1" style={{ color: colors.textMuted }}>
                          {restaurantData.industry} • {restaurantData?.country}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator style={{ backgroundColor: isDark ? colors.gray700 : colors.border }} />
                  
                  {/* Quick Actions */}
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => window.location.href = '/restaurant/profile'}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => window.location.href = '/restaurant/dashboard'}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    <span>Back to Dashboard</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator style={{ backgroundColor: isDark ? colors.gray700 : colors.border }} />
                  
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/20"
                    style={{ color: colors.error }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isSigningOut ? 'Signing out...' : 'Sign out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Loading state */
              <div 
                className="w-32 h-10 rounded-lg animate-pulse"
                style={{ backgroundColor: isDark ? colors.gray700 : colors.surfaceElevated }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden border-t"
          style={{ 
            backgroundColor: isDark ? colors.gray800 : colors.surface,
            borderColor: isDark ? colors.gray700 : colors.border
          }}
        >
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: isActive 
                      ? (isDark ? colors.gray700 : colors.surfaceElevated)
                      : 'transparent',
                    color: isActive ? colors.orange : colors.textSecondary,
                    border: `1px solid ${isActive 
                      ? (isDark ? colors.gray600 : colors.border)
                      : 'transparent'}`
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}