/**
 * HERA Universal - Application Navbar
 * 
 * Professional navbar with user details, theme toggle, and navigation
 */

'use client';

import { useState } from 'react';
import { 
  Bell, Search, Settings, User, LogOut, ChevronDown, Menu, X,
  Home, UtensilsCrossed, Calendar, ShoppingBag, Tag, Users,
  ChefHat, Clock, CreditCard, Phone, MapPin, Gear,
  MessageSquare, Heart, Package, Wine, Pizza, Star
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './button';

interface AppNavbarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  onLogout?: () => void;
}

export function AppNavbar({ user, onLogout }: AppNavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const defaultUser = {
    name: user?.name || 'Mario Rossi',
    email: user?.email || 'mario@mariosrestaurant.com',
    role: user?.role || 'Restaurant Manager',
    avatar: user?.avatar
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      console.log('Logout clicked');
    }
    setShowUserMenu(false);
  };

  // Modern Restaurant Navigation Items
  const restaurantNavItems = [
    { label: 'Home', href: '/dashboard', icon: Home, description: 'Main dashboard' },
    { label: 'Menu', href: '/restaurant/menu', icon: UtensilsCrossed, description: 'Food & drinks menu' },
    { label: 'Reservations', href: '/restaurant/reservations', icon: Calendar, description: 'Table bookings' },
    { label: 'Orders', href: '/restaurant/orders', icon: ShoppingBag, description: 'Online ordering' },
    { label: 'Staff', href: '/restaurant/staff', icon: Users, description: 'Team management' },
    { label: 'Kitchen', href: '/restaurant/kitchen', icon: ChefHat, description: 'Chef specialties' },
    { label: 'Offers', href: '/restaurant/offers', icon: Tag, description: 'Deals & promotions' },
    { label: 'Payment', href: '/restaurant/payment', icon: CreditCard, description: 'Billing & payments' },
  ];

  // Admin/Management Navigation
  const adminNavItems = [
    { label: 'Purchasing', href: '/purchasing/purchase-orders', icon: Package, description: 'Purchase orders' },
    { label: 'Inventory', href: '/inventory/items', icon: Package, description: 'Stock management' },
    { label: 'Analytics', href: '/analytics', icon: Star, description: 'Business insights' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  HERA Universal
                </span>
              </div>
            </div>

            {/* Desktop Navigation - Restaurant Items */}
            <div className="hidden lg:block ml-10">
              <div className="flex items-center space-x-1">
                {restaurantNavItems.slice(0, 6).map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      title={item.description}
                      className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                    >
                      <IconComponent className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      <span className="hidden xl:inline">{item.label}</span>
                    </a>
                  );
                })}
                
                {/* More Menu for Additional Items */}
                <div className="relative group">
                  <button className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                    <Menu className="w-4 h-4 mr-1" />
                    <span className="hidden xl:inline">More</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      {[...restaurantNavItems.slice(6), ...adminNavItems].map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <a
                            key={item.label}
                            href={item.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <IconComponent className="w-4 h-4 mr-3" />
                            <div>
                              <div className="font-medium">{item.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {defaultUser.avatar ? (
                  <img
                    src={defaultUser.avatar}
                    alt={defaultUser.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {defaultUser.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {defaultUser.role}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      {defaultUser.avatar ? (
                        <img
                          src={defaultUser.avatar}
                          alt={defaultUser.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {defaultUser.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {defaultUser.email}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          {defaultUser.role}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <a
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </a>
                    <a
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </a>
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 pt-4 pb-3">
            <div className="flex items-center px-4 pb-3">
              {defaultUser.avatar ? (
                <img
                  src={defaultUser.avatar}
                  alt={defaultUser.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="ml-3">
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {defaultUser.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {defaultUser.email}
                </div>
              </div>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile Restaurant Navigation */}
            <div className="space-y-1 px-2">
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 py-2">
                Restaurant
              </div>
              {restaurantNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <IconComponent className="w-5 h-5 mr-3" />
                    <div>
                      <div>{item.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                    </div>
                  </a>
                );
              })}
              
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 py-2 mt-4">
                Management
              </div>
              {adminNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <IconComponent className="w-5 h-5 mr-3" />
                    <div>
                      <div>{item.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                    </div>
                  </a>
                );
              })}
            </div>

            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-1 px-2">
                <a
                  href="/profile"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile
                </a>
                <a
                  href="/settings"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </a>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </nav>
  );
}