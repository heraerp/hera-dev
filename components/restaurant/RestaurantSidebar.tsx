/**
 * HERA Universal - Restaurant Sidebar Navigation
 * 
 * Modern, stylish sidebar with restaurant-specific icons
 * Professional design following PO Gold Standard theme
 */

'use client';

import { useState } from 'react';
import { 
  Home, UtensilsCrossed, Calendar, ShoppingBag, Tag, Users,
  ChefHat, Clock, CreditCard, Phone, MapPin, Settings,
  MessageSquare, Heart, Package, Wine, Pizza, Star,
  BarChart3, TrendingUp, ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  description: string;
  badge?: string;
  isActive?: boolean;
}

interface RestaurantSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  currentPath?: string;
}

export function RestaurantSidebar({ 
  isCollapsed = false, 
  onToggle, 
  currentPath = '' 
}: RestaurantSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Restaurant Operations Navigation
  const restaurantNavItems: NavItem[] = [
    { label: 'Home', href: '/dashboard', icon: Home, description: 'Main dashboard' },
    { label: 'Menu', href: '/restaurant/menu', icon: UtensilsCrossed, description: 'Food & drinks menu' },
    { label: 'Reservations', href: '/restaurant/reservations', icon: Calendar, description: 'Table bookings', badge: '3' },
    { label: 'Orders', href: '/restaurant/orders', icon: ShoppingBag, description: 'Online ordering', badge: '12' },
    { label: 'Staff', href: '/restaurant/staff', icon: Users, description: 'Team management' },
    { label: 'Kitchen', href: '/restaurant/kitchen', icon: ChefHat, description: 'Chef specialties' },
    { label: 'Order Status', href: '/restaurant/order-status', icon: Clock, description: 'Track progress' },
    { label: 'Offers', href: '/restaurant/offers', icon: Tag, description: 'Deals & promotions' },
  ];

  // Customer Experience Navigation
  const customerNavItems: NavItem[] = [
    { label: 'Reviews', href: '/restaurant/reviews', icon: MessageSquare, description: 'Customer feedback', badge: '8' },
    { label: 'Favorites', href: '/restaurant/favorites', icon: Heart, description: 'Popular items' },
    { label: 'Takeout', href: '/restaurant/takeout', icon: Package, description: 'Order to-go' },
    { label: 'Bar & Drinks', href: '/restaurant/drinks', icon: Wine, description: 'Beverage menu' },
    { label: 'Cuisine Types', href: '/restaurant/cuisine', icon: Pizza, description: 'Food categories' },
  ];

  // Business Management Navigation
  const managementNavItems: NavItem[] = [
    { label: 'Analytics', href: '/restaurant/analytics', icon: BarChart3, description: 'Business insights' },
    { label: 'Payment', href: '/restaurant/payment', icon: CreditCard, description: 'Billing & payments' },
    { label: 'Performance', href: '/restaurant/performance', icon: TrendingUp, description: 'KPI tracking' },
    { label: 'Location', href: '/restaurant/location', icon: MapPin, description: 'Restaurant info' },
    { label: 'Contact', href: '/restaurant/contact', icon: Phone, description: 'Support & help' },
    { label: 'Settings', href: '/restaurant/settings', icon: Settings, description: 'Preferences' },
  ];

  const isItemActive = (href: string) => {
    return currentPath === href || currentPath.startsWith(href + '/');
  };

  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div className="mb-8">
      {!isCollapsed && (
        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-4">
          {title}
        </h3>
      )}
      <nav className="space-y-1">
        {items.map((item) => {
          const IconComponent = item.icon;
          const active = isItemActive(item.href);
          const isHovered = hoveredItem === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`
                relative flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-all duration-200 group
                ${
                  active
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }
              `}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 dark:bg-blue-400 rounded-r-full" />
              )}
              
              {/* Icon */}
              <IconComponent 
                className={`
                  w-5 h-5 flex-shrink-0 transition-all duration-200
                  ${active ? 'text-blue-600 dark:text-blue-400' : ''}
                  ${isHovered ? 'scale-110' : ''}
                  ${isCollapsed ? 'mx-auto' : 'mr-3'}
                `}
              />
              
              {/* Label and Badge */}
              {!isCollapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && isHovered && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg whitespace-nowrap z-50">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-100" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div 
      className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Toggle Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      )}
      
      {/* Sidebar Content */}
      <div className="h-full overflow-y-auto pt-6 pb-6">
        <NavSection title="Restaurant" items={restaurantNavItems} />
        <NavSection title="Customer" items={customerNavItems} />
        <NavSection title="Management" items={managementNavItems} />
      </div>
      
      {/* Bottom Brand */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                HERA Restaurant
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Mario's Italian
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}