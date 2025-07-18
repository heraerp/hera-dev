'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UniversalThemeButton, ThemeToggleButton } from '@/components/theme/UniversalThemeButton'
import { UniversalCard } from '@/components/theme/UniversalCard'
import { Badge } from '@/components/ui/badge'
import { useMobileTheme } from '@/hooks/useMobileTheme'
import {
  User, LogOut, LogIn, Building2, ChevronDown,
  Settings, Bell, Menu, X
} from 'lucide-react'
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
  const { colors, isDark } = useMobileTheme()
  const supabase = createClient()

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
    <nav 
      className="shadow-sm border-b"
      style={{ 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Restaurant Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.orange }}
              >
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span 
                className="ml-2 text-xl font-bold"
                style={{ color: colors.textPrimary }}
              >
                HERA
              </span>
            </div>
            
            {restaurantData && (
              <div className="hidden md:flex items-center text-sm">
                <span className="mr-2" style={{ color: colors.textMuted }}>•</span>
                <Building2 className="w-4 h-4 mr-1" style={{ color: colors.textMuted }} />
                <span className="font-medium" style={{ color: colors.textSecondary }}>
                  {restaurantData.businessName}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="/restaurant/dashboard" 
              className="transition-colors hover:underline"
              style={{ 
                color: colors.textSecondary,
                textDecorationColor: colors.orange
              }}
              onMouseEnter={(e) => e.target.style.color = colors.textPrimary}
              onMouseLeave={(e) => e.target.style.color = colors.textSecondary}
            >
              Dashboard
            </a>
            <a 
              href="/restaurant/orders" 
              className="transition-colors hover:underline"
              style={{ 
                color: colors.textSecondary,
                textDecorationColor: colors.orange
              }}
              onMouseEnter={(e) => e.target.style.color = colors.textPrimary}
              onMouseLeave={(e) => e.target.style.color = colors.textSecondary}
            >
              Orders
            </a>
            <a 
              href="/restaurant/products" 
              className="transition-colors hover:underline"
              style={{ 
                color: colors.textSecondary,
                textDecorationColor: colors.orange
              }}
              onMouseEnter={(e) => e.target.style.color = colors.textPrimary}
              onMouseLeave={(e) => e.target.style.color = colors.textSecondary}
            >
              Products
            </a>
            <a 
              href="/restaurant/menu-management" 
              className="transition-colors hover:underline"
              style={{ 
                color: colors.textSecondary,
                textDecorationColor: colors.orange
              }}
              onMouseEnter={(e) => e.target.style.color = colors.textPrimary}
              onMouseLeave={(e) => e.target.style.color = colors.textSecondary}
            >
              Menu
            </a>
            <a 
              href="/restaurant/customers" 
              className="transition-colors hover:underline"
              style={{ 
                color: colors.textSecondary,
                textDecorationColor: colors.orange
              }}
              onMouseEnter={(e) => e.target.style.color = colors.textPrimary}
              onMouseLeave={(e) => e.target.style.color = colors.textSecondary}
            >
              Customers
            </a>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggleButton />
            
            {/* Notifications */}
            <UniversalThemeButton variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span 
                className="absolute top-0 right-0 w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.error }}
              ></span>
            </UniversalThemeButton>

            {/* User Dropdown */}
            {userInfo ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <UniversalThemeButton variant="ghost" className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: colors.isDark ? colors.orange + '20' : colors.orange + '10',
                        color: colors.orange
                      }}
                    >
                      <User className="w-4 h-4" />
                    </div>
                    <div className="hidden md:flex flex-col items-start text-sm">
                      <span className="font-medium" style={{ color: colors.textPrimary }}>
                        {userInfo.coreUser?.full_name || 'User'}
                      </span>
                      <Badge 
                        className="text-xs border-0" 
                        style={getRoleBadgeColor(userInfo.currentRole)}
                      >
                        {userInfo.currentRole.toUpperCase()}
                      </Badge>
                    </div>
                    <ChevronDown className="w-4 h-4" style={{ color: colors.textMuted }} />
                  </UniversalThemeButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: colors.isDark ? colors.orange + '20' : colors.orange + '10',
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
                          className="text-xs mt-1 border-0" 
                          style={getRoleBadgeColor(userInfo.currentRole)}
                        >
                          {userInfo.currentRole.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Current Restaurant */}
                  <div className="px-2 py-2">
                    <div className="text-xs font-medium mb-1" style={{ color: colors.textMuted }}>
                      CURRENT RESTAURANT
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4" style={{ color: colors.textMuted }} />
                      <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        {restaurantData?.businessName || 'No restaurant'}
                      </span>
                    </div>
                    {restaurantData?.organizationId && (
                      <div className="text-xs mt-1" style={{ color: colors.textMuted }}>
                        ID: {restaurantData.organizationId.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Organizations */}
                  {userInfo.organizations.length > 0 && (
                    <>
                      <div className="px-2 py-2">
                        <div className="text-xs font-medium mb-2" style={{ color: colors.textMuted }}>
                          ALL ORGANIZATIONS ({userInfo.organizations.length})
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {userInfo.organizations.map((org: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="truncate" style={{ color: colors.textSecondary }}>
                                {org.core_organizations?.org_name}
                              </span>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ 
                                  borderColor: colors.border,
                                  color: colors.textSecondary
                                }}
                              >
                                {org.role}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {/* Account Info */}
                  <div className="px-2 py-2">
                    <div className="text-xs font-medium mb-1" style={{ color: colors.textMuted }}>
                      ACCOUNT
                    </div>
                    <div className="text-xs space-y-1" style={{ color: colors.textSecondary }}>
                      <div>Auth ID: {userInfo.authUser?.id?.slice(0, 8)}...</div>
                      <div>Core ID: {userInfo.coreUser?.id?.slice(0, 8)}...</div>
                      <div>Linked: {userInfo.coreUser ? '✅' : '❌'}</div>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    style={{ color: colors.error }}
                    className="focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isSigningOut ? 'Signing out...' : 'Sign out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Sign In Button */
              <UniversalThemeButton 
                variant="primary" 
                onClick={handleSignIn}
                icon={<LogIn className="w-4 h-4" />}
              >
                Sign In
              </UniversalThemeButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
