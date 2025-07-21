/**
 * Modern Sidebar Navigation - PO Gold Standard Theme
 * Sleek, glassmorphism-style navigation with icon bar and primary sidebar
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Plus,
  Star,
  MessageSquare,
  Calendar,
  Activity,
  Utensils,
  Receipt,
  Truck,
  Building2,
  TrendingUp,
  Shield,
  Database,
  Zap,
  ClipboardList,
  ChefHat,
  Flame,
  LayoutGrid,
  PieChart,
  Boxes,
  ListChecks,
  AlertCircle,
  Sliders,
  Home,
  Phone,
  LifeBuoy,
  User,
  UserCircle,
  Clock
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isActive?: boolean;
  subItems?: NavigationItem[];
}

interface SidebarSection {
  id: string;
  title: string;
  items: NavigationItem[];
}

export type SidebarVariant = 'default' | 'pos' | 'purchasing' | 'inventory' | 'analytics';

interface ModernSidebarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  onNavigate?: (href: string) => void;
  variant?: SidebarVariant;
}

// Default icon bar for general business management
const defaultIconBarItems: NavigationItem[] = [
  { id: 'activity', label: 'Activity', href: '/activity', icon: Activity },
  { id: 'messages', label: 'Messages', href: '/messages', icon: MessageSquare, badge: 3 },
  { id: 'calendar', label: 'Calendar', href: '/calendar', icon: Calendar },
  { id: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell, badge: 5 },
  { id: 'search', label: 'Search', href: '/search', icon: Search },
];

// POS-specific icon bar for restaurant operations
const posIconBarItems: NavigationItem[] = [
  { id: 'orders', label: 'Orders', href: '/restaurant/pos', icon: ClipboardList, badge: 8 },
  { id: 'kitchen', label: 'Kitchen', href: '/restaurant/kitchen', icon: ChefHat, badge: 3 },
  { id: 'tables', label: 'Tables', href: '/restaurant/tables', icon: LayoutGrid },
  { id: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell, badge: 2 },
  { id: 'support', label: 'Support', href: '/support', icon: LifeBuoy },
];

// Function to get icon bar items based on variant
const getIconBarItems = (variant: SidebarVariant = 'default'): NavigationItem[] => {
  switch (variant) {
    case 'pos':
      return posIconBarItems;
    case 'purchasing':
    case 'inventory':
    case 'analytics':
    default:
      return defaultIconBarItems;
  }
};

// Default sidebar sections for general business management
const defaultSidebarSections: SidebarSection[] = [
  {
    id: 'main',
    title: 'Main Navigation',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { id: 'pos', label: 'Point of Sale', href: '/restaurant/pos', icon: Utensils, badge: 2 },
      { id: 'purchasing', label: 'Purchase Orders', href: '/purchasing/purchase-orders', icon: ShoppingCart },
      { id: 'inventory', label: 'Inventory', href: '/inventory', icon: Package },
      { id: 'suppliers', label: 'Suppliers', href: '/suppliers', icon: Truck },
    ]
  },
  {
    id: 'business',
    title: 'Business Management',
    items: [
      { id: 'customers', label: 'Customers', href: '/customers', icon: Users },
      { id: 'invoicing', label: 'Invoicing', href: '/invoicing', icon: Receipt },
      { id: 'reports', label: 'Reports', href: '/reports', icon: FileText },
      { id: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart3 },
      { id: 'organization', label: 'Organization', href: '/organization', icon: Building2 },
    ]
  },
  {
    id: 'system',
    title: 'System & Tools',
    items: [
      { id: 'performance', label: 'Performance', href: '/performance', icon: TrendingUp },
      { id: 'security', label: 'Security', href: '/security', icon: Shield },
      { id: 'integrations', label: 'Integrations', href: '/integrations', icon: Zap },
      { id: 'database', label: 'Database', href: '/database', icon: Database },
      { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
      { id: 'help', label: 'Help & Support', href: '/help', icon: HelpCircle },
    ]
  }
];

// POS-specific sidebar sections for restaurant operations
const posSidebarSections: SidebarSection[] = [
  {
    id: 'orders',
    title: 'Order Management',
    items: [
      { id: 'pos', label: 'Point of Sale', href: '/restaurant/pos', icon: ClipboardList, badge: 8 },
      { id: 'kitchen', label: 'Kitchen View', href: '/restaurant/kitchen', icon: ChefHat, badge: 3 },
      { id: 'prep', label: 'Prep Station', href: '/restaurant/prep', icon: Flame },
      { id: 'tables', label: 'Tables & Seating', href: '/restaurant/tables', icon: LayoutGrid },
    ]
  },
  {
    id: 'operations',
    title: 'Restaurant Operations',
    items: [
      { id: 'menu', label: 'Menu Management', href: '/restaurant/menu', icon: ListChecks },
      { id: 'inventory', label: 'Inventory', href: '/restaurant/inventory', icon: Boxes, badge: 5 },
      { id: 'staff', label: 'Staff & Shifts', href: '/restaurant/staff', icon: Users },
      { id: 'customers', label: 'Customer Orders', href: '/restaurant/customers', icon: Receipt },
    ]
  },
  {
    id: 'insights',
    title: 'Reports & Analytics',
    items: [
      { id: 'daily-reports', label: 'Daily Reports', href: '/restaurant/reports/daily', icon: BarChart3 },
      { id: 'sales-analytics', label: 'Sales Analytics', href: '/restaurant/analytics/sales', icon: PieChart },
      { id: 'performance', label: 'Performance', href: '/restaurant/performance', icon: TrendingUp },
    ]
  },
  {
    id: 'settings',
    title: 'Settings & Support',
    items: [
      { id: 'restaurant-settings', label: 'Restaurant Settings', href: '/restaurant/settings', icon: Sliders },
      { id: 'system-settings', label: 'System Settings', href: '/settings', icon: Settings },
      { id: 'support', label: 'Support & Help', href: '/support', icon: Phone },
    ]
  }
];

// Function to get sidebar sections based on variant
const getSidebarSections = (variant: SidebarVariant = 'default'): SidebarSection[] => {
  switch (variant) {
    case 'pos':
      return posSidebarSections;
    case 'purchasing':
    case 'inventory':
    case 'analytics':
    default:
      return defaultSidebarSections;
  }
};

// Default favorites for general business management
const defaultFavoriteItems: NavigationItem[] = [
  { id: 'fav-orders', label: 'Today\'s Orders', href: '/restaurant/pos', icon: Utensils, badge: 8 },
  { id: 'fav-inventory', label: 'Low Stock Items', href: '/inventory/alerts', icon: Package, badge: 3 },
  { id: 'fav-reports', label: 'Daily Reports', href: '/reports/daily', icon: FileText },
];

// POS-specific favorites for restaurant operations
const posFavoriteItems: NavigationItem[] = [
  { id: 'fav-current-orders', label: 'Active Orders', href: '/restaurant/pos', icon: ClipboardList, badge: 12 },
  { id: 'fav-kitchen-queue', label: 'Kitchen Queue', href: '/restaurant/kitchen', icon: ChefHat, badge: 4 },
  { id: 'fav-table-status', label: 'Table Status', href: '/restaurant/tables', icon: LayoutGrid, badge: 2 },
  { id: 'fav-daily-sales', label: 'Today\'s Sales', href: '/restaurant/reports/daily', icon: BarChart3 },
];

// Function to get favorite items based on variant
const getFavoriteItems = (variant: SidebarVariant = 'default'): NavigationItem[] => {
  switch (variant) {
    case 'pos':
      return posFavoriteItems;
    case 'purchasing':
    case 'inventory':
    case 'analytics':
    default:
      return defaultFavoriteItems;
  }
};

export function ModernSidebar({ user, onNavigate, variant = 'default' }: ModernSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showAutoCollapseHint, setShowAutoCollapseHint] = useState(false);

  // Get configuration based on variant
  const iconBarItems = getIconBarItems(variant);
  const sidebarSections = getSidebarSections(variant);
  const favoriteItems = getFavoriteItems(variant);

  // Auto-collapse functionality
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      setLastActivity(Date.now());
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      // Only set timer if sidebar is expanded
      if (!isCollapsed) {
        // Show hint after 4 seconds, collapse after 5 seconds
        const hintTimer = setTimeout(() => {
          setShowAutoCollapseHint(true);
        }, 4000);
        
        inactivityTimer = setTimeout(() => {
          setIsCollapsed(true);
          setShowAutoCollapseHint(false);
        }, 5000); // Auto-collapse after 5 seconds of inactivity
        
        return () => {
          clearTimeout(hintTimer);
        };
      }
    };

    // Track user activity
    const handleActivity = () => {
      setShowAutoCollapseHint(false);
      resetTimer();
    };

    // Add event listeners for activity tracking (only on client side)
    const sidebarElement = typeof window !== 'undefined' ? document.querySelector('[data-sidebar]') : null;
    if (sidebarElement && !isCollapsed) {
      sidebarElement.addEventListener('mouseenter', handleActivity);
      sidebarElement.addEventListener('mousemove', handleActivity);
      sidebarElement.addEventListener('click', handleActivity);
      sidebarElement.addEventListener('scroll', handleActivity);
      
      // Start the timer
      resetTimer();
    }

    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      if (sidebarElement) {
        sidebarElement.removeEventListener('mouseenter', handleActivity);
        sidebarElement.removeEventListener('mousemove', handleActivity);
        sidebarElement.removeEventListener('click', handleActivity);
        sidebarElement.removeEventListener('scroll', handleActivity);
      }
    };
  }, [isCollapsed]);

  // Reset activity when sidebar is expanded
  const handleExpand = () => {
    setIsCollapsed(false);
    setLastActivity(Date.now());
    setShowAutoCollapseHint(false);
  };

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Icon Bar - Far Left */}
        <motion.div 
          className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 z-10"
          style={{
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Logo/Brand */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-6 shadow-md">
            <span className="text-white font-bold text-lg">H</span>
          </div>

          {/* Icon Navigation */}
          <div className="flex flex-col gap-3 flex-1">
            {iconBarItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    className="relative"
                    onHoverStart={() => setHoveredIcon(item.id)}
                    onHoverEnd={() => setHoveredIcon(null)}
                  >
                    <Link
                      href={item.href}
                      onClick={() => onNavigate?.(item.href)}
                      className={`
                        relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
                        ${isActiveRoute(item.href)
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-md'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-300'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      
                      {/* Badge */}
                      {item.badge && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {item.badge > 9 ? '9+' : item.badge}
                        </div>
                      )}

                      {/* Active Indicator */}
                      {isActiveRoute(item.href) && (
                        <motion.div
                          layoutId="iconActiveIndicator"
                          className="absolute -left-4 top-1/2 w-1 h-6 bg-blue-600 rounded-r-full"
                          style={{ transform: 'translateY(-50%)' }}
                        />
                      )}
                    </Link>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* User Avatar */}
          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    getUserInitials(user.name)
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                <div className="text-sm">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-gray-600 dark:text-gray-400">{user.role}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </motion.div>

        {/* Primary Sidebar */}
        <motion.div
          animate={{
            width: isCollapsed ? 0 : 280,
            opacity: isCollapsed ? 0 : 1
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
          className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden"
          style={{
            boxShadow: '2px 0 12px rgba(0, 0, 0, 0.08)'
          }}
          data-sidebar
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {variant === 'pos' ? 'Restaurant POS' : 'HERA Universal'}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {variant === 'pos' ? 'Order Management' : 'Business Management'}
                  </p>
                </div>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Favorites Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Favorites
                  </h3>
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="space-y-1">
                  {favoriteItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => onNavigate?.(item.href)}
                      className={`
                        group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                        ${isActiveRoute(item.href)
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{item.label}</span>
                      {item.badge && (
                        <Badge 
                          className="ml-auto bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-0 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              <Separator className="border-gray-200 dark:border-gray-700" />

              {/* Main Navigation Sections */}
              {sidebarSections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => onNavigate?.(item.href)}
                        className={`
                          group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                          ${isActiveRoute(item.href)
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{item.label}</span>
                        {item.badge && (
                          <Badge 
                            className="ml-auto bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-0 text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>System Online</span>
              </div>
              
              {/* Auto-collapse hint */}
              <AnimatePresence>
                {showAutoCollapseHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Auto-closing in 1s...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Collapse Button - When Collapsed */}
        <AnimatePresence>
          {isCollapsed && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={handleExpand}
              className="fixed left-16 top-4 z-20 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-400 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

export default ModernSidebar;