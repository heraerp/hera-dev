'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Home,
  ChefHat,
  Utensils,
  Package,
  Users,
  BarChart3,
  CreditCard,
  Calendar,
  Bell,
  Settings,
  MoreHorizontal,
  X,
  Search,
  FileText,
  MessageSquare,
  Video,
  Clock,
  Calculator,
  Clipboard,
  HelpCircle,
  Smartphone,
  Plus,
  Brain
} from 'lucide-react';

interface NavigationItem {
  id: string;
  icon: React.ElementType;
  label: string;
  hasNotifications?: boolean;
  notificationCount?: number;
  isActive?: boolean;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  initials: string;
}

interface TeamsStyleSidebarProps {
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

const TeamsStyleSidebar: React.FC<TeamsStyleSidebarProps> = ({
  isExpanded: controlledExpanded,
  onToggle,
  className = ''
}) => {
  const router = useRouter();
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAppsModal, setShowAppsModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ left: 84, top: '50%' });
  const [expandedSections, setExpandedSections] = useState({
    favourites: true,
    chats: true,
    teams: false
  });

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const handleNavigation = (itemId: string) => {
    switch (itemId) {
      case 'dashboard':
        router.push('/restaurant/dashboard');
        break;
      case 'hera-ai':
        router.push('/hera/self-development');
        break;
      case 'kitchen':
        router.push('/restaurant/kitchen');
        break;
      case 'orders':
        router.push('/restaurant/orders');
        break;
      case 'inventory':
        router.push('/restaurant/inventory');
        break;
      case 'staff':
        router.push('/restaurant/staff');
        break;
      case 'analytics':
        router.push('/restaurant/analytics');
        break;
      case 'payments':
        router.push('/restaurant/payments');
        break;
      case 'reservations':
        router.push('/restaurant/reservations');
        break;
      default:
        console.log(`Navigation for ${itemId} not implemented yet`);
    }
  };

  const navigationItems: NavigationItem[] = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', isActive: true },
    { id: 'kitchen', icon: ChefHat, label: 'Kitchen', hasNotifications: true, notificationCount: 3 },
    { id: 'orders', icon: Utensils, label: 'Orders', hasNotifications: true, notificationCount: 7 },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'staff', icon: Users, label: 'Staff' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'payments', icon: CreditCard, label: 'Payments' },
    { id: 'reservations', icon: Calendar, label: 'Bookings' },
    { id: 'hera-ai', icon: Brain, label: 'HERA AI' }
  ];

  const users: User[] = [
    { id: '1', name: 'Sarah Johnson', status: 'online', initials: 'SJ' },
    { id: '2', name: 'Mike Chen', status: 'away', initials: 'MC' },
    { id: '3', name: 'Emma Wilson', status: 'busy', initials: 'EW' },
    { id: '4', name: 'David Brown', status: 'offline', initials: 'DB' },
    { id: '5', name: 'Lisa Garcia', status: 'online', initials: 'LG' }
  ];

  const restaurantApps = [
    { id: 'pos', label: 'POS System', icon: CreditCard, color: 'bg-green-600' },
    { id: 'menu', label: 'Menu Manager', icon: FileText, color: 'bg-blue-600' },
    { id: 'reservations', label: 'Reservations', icon: Calendar, color: 'bg-purple-600' },
    { id: 'chat', label: 'Team Chat', icon: MessageSquare, color: 'bg-indigo-600' },
    { id: 'training', label: 'Training', icon: Video, color: 'bg-red-600' },
    { id: 'scheduling', label: 'Scheduling', icon: Clock, color: 'bg-orange-600' },
    { id: 'finance', label: 'Finance', icon: Calculator, color: 'bg-teal-600' },
    { id: 'inventory', label: 'Inventory', icon: Clipboard, color: 'bg-yellow-600' },
    { id: 'support', label: 'Help & Support', icon: HelpCircle, color: 'bg-gray-600' },
    { id: 'mobile', label: 'Mobile App', icon: Smartphone, color: 'bg-pink-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate optimal modal position
  const calculateModalPosition = () => {
    const sidebarWidth = window.innerWidth >= 640 ? 80 : 64; // 20 (80px) or 16 (64px)
    const modalWidth = window.innerWidth >= 640 ? 384 : 320; // 96 (384px) or 80 (320px)
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate horizontal position
    let leftPosition = sidebarWidth + 16; // sidebar width + 16px margin
    
    // Ensure modal doesn't overflow right side of screen
    if (leftPosition + modalWidth > screenWidth) {
      leftPosition = Math.max(16, screenWidth - modalWidth - 16);
    }
    
    // Calculate vertical position (centered by default)
    let topPosition = '50%';
    
    // Check if modal might overflow vertically
    const modalHeight = 600; // Approximate height
    if (screenHeight < modalHeight + 80) {
      topPosition = '20px'; // Position from top instead of center
    }
    
    setModalPosition({ left: leftPosition, top: topPosition });
  };

  // Update modal position when window resizes or modal opens
  useEffect(() => {
    if (showAppsModal) {
      calculateModalPosition();
      const handleResize = () => calculateModalPosition();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [showAppsModal]);

  return (
    <div
      className={`fixed left-0 top-0 h-full w-20 bg-gray-800 text-gray-200 z-50 flex flex-col shadow-xl md:w-20 sm:w-16 ${className}`}
    >


      {/* Main Navigation */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-2 px-1">
          {navigationItems.map((item) => (
            <div key={item.id} className="relative group">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 relative ${
                  item.isActive 
                    ? 'bg-[#30D5C8]/20 text-[#30D5C8]' 
                    : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                }`}
              >
                <div className="relative mb-1">
                  <item.icon className="w-5 h-5 sm:w-4 sm:h-4" />
                  {item.hasNotifications && item.notificationCount && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-3 sm:h-3 flex items-center justify-center font-medium sm:text-[10px]">
                      {item.notificationCount > 9 ? '9+' : item.notificationCount}
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-center leading-tight sm:text-[10px] sm:leading-none">
                  {item.label}
                </span>
              </motion.button>
            </div>
          ))}
        </nav>

      </div>

      {/* Middle Section - Apps Button (Positioned Higher) */}
      <div className="border-t border-gray-600/30 py-4">
        <div className="relative group px-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAppsModal(true)}
            className="w-full flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200"
          >
            <MoreHorizontal className="w-5 h-5 sm:w-4 sm:h-4 mb-1" />
            <span className="text-xs font-medium text-center leading-tight sm:text-[10px] sm:leading-none">
              Apps
            </span>
          </motion.button>
        </div>
      </div>

      {/* Bottom Section - Settings */}
      <div className="p-1 space-y-2">
        <div className="relative group">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200"
          >
            <Settings className="w-5 h-5 sm:w-4 sm:h-4 mb-1" />
            <span className="text-xs font-medium text-center leading-tight sm:text-[10px] sm:leading-none">
              Settings
            </span>
          </motion.button>
        </div>
      </div>

      {/* Apps Modal */}
      <AnimatePresence>
        {showAppsModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowAppsModal(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              className={`fixed w-96 max-h-[80vh] overflow-y-auto bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 p-6
                sm:w-80 sm:max-h-[70vh] sm:p-4
                ${modalPosition.top === '20px' ? '' : 'transform -translate-y-1/2'}`}
              style={{
                left: `${modalPosition.left}px`,
                top: modalPosition.top,
                maxWidth: 'calc(100vw - 32px)', // Ensure it doesn't exceed screen width with padding
                minWidth: '280px' // Minimum width for usability
              }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Restaurant Apps</h3>
                <button
                  onClick={() => setShowAppsModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for apps"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700/50 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30D5C8]/50 border border-gray-600"
                />
              </div>

              {/* Apps Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {restaurantApps
                  .filter(app => app.label.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((app) => (
                    <motion.button
                      key={app.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-700/50 transition-colors group"
                      onClick={() => {
                        console.log(`Opening ${app.label}`);
                        setShowAppsModal(false);
                      }}
                    >
                      <div className={`w-12 h-12 ${app.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                        <app.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-300 group-hover:text-white text-center leading-tight">
                        {app.label}
                      </span>
                    </motion.button>
                  ))
                }
              </div>

              {/* Get More Apps Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center p-3 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors group"
                onClick={() => {
                  console.log('Opening app store');
                  setShowAppsModal(false);
                }}
              >
                <Plus className="w-4 h-4 mr-2 text-gray-400 group-hover:text-[#30D5C8]" />
                <span className="text-sm font-medium text-gray-400 group-hover:text-[#30D5C8]">
                  Get more apps
                </span>
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TeamsStyleSidebar;