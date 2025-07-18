'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Menu,
  X,
  Home,
  Brain,
  Coffee,
  Utensils,
  ChefHat,
  BarChart3,
  Users,
  Package,
  Settings,
  Zap,
  TrendingUp,
  DollarSign,
  ArrowRight
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
  description?: string;
  isNew?: boolean;
  isHot?: boolean;
}

const navigationItems: NavItem[] = [
  {
    icon: Home,
    label: 'Restaurant Home',
    href: '/restaurant',
    description: 'Main restaurant dashboard'
  },
  {
    icon: Brain,
    label: 'AI Dashboard',
    href: '/restaurant/ai-dashboard',
    badge: 'NEW',
    description: 'AI-powered business intelligence',
    isNew: true
  },
  {
    icon: BarChart3,
    label: 'Manager Dashboard',
    href: '/restaurant/dashboard',
    description: 'Complete business overview'
  },
  {
    icon: Coffee,
    label: 'Product Catalog',
    href: '/restaurant/products',
    description: 'Menu and inventory management'
  },
  {
    icon: Utensils,
    label: 'Order Management',
    href: '/restaurant/orders',
    description: 'Order processing and tracking'
  },
  {
    icon: ChefHat,
    label: 'Kitchen Display',
    href: '/restaurant/kitchen',
    description: 'Real-time kitchen operations'
  },
  {
    icon: Users,
    label: 'Customer Intelligence',
    href: '/restaurant/customers',
    badge: 'HOT',
    description: 'Customer insights and analytics',
    isHot: true
  },
  {
    icon: Package,
    label: 'Smart Inventory',
    href: '/restaurant/inventory',
    description: 'AI-powered inventory management'
  },
  {
    icon: TrendingUp,
    label: 'Analytics',
    href: '/restaurant/analytics',
    description: 'Business performance analytics'
  },
  {
    icon: DollarSign,
    label: 'Financials',
    href: '/restaurant/financials',
    description: 'Financial reporting and accounting'
  },
  {
    icon: Zap,
    label: 'Quick Setup',
    href: '/setup/restaurant',
    badge: '5 min',
    description: 'Fast restaurant setup wizard'
  }
];

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Navigation Trigger */}
      <div className={cn('md:hidden', className)}>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Open navigation menu</span>
            </Button>
          </SheetTrigger>
          
          <SheetContent side="left" className="w-80 p-0">
            <MobileNavigationContent 
              pathname={pathname}
              onItemClick={handleItemClick}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation Hint */}
      <div className="hidden md:block">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Navigate:</span>
          <div className="flex items-center space-x-1">
            {navigationItems.slice(0, 3).map((item, index) => (
              <React.Fragment key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant={pathname === item.href ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    <item.icon className="h-3 w-3 mr-1" />
                    {item.label}
                  </Button>
                </Link>
                {index < 2 && <span className="text-gray-300">•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

interface MobileNavigationContentProps {
  pathname: string;
  onItemClick: () => void;
}

function MobileNavigationContent({ pathname, onItemClick }: MobileNavigationContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🍕</div>
          <div>
            <h2 className="font-bold text-lg text-gray-800">HERA Restaurant</h2>
            <p className="text-sm text-gray-600">Universal Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {navigationItems.map((item, index) => {
            const isActive = pathname === item.href;
            
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={item.href} onClick={onItemClick}>
                  <div className={cn(
                    'flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group',
                    isActive 
                      ? 'bg-orange-100 border-2 border-orange-300 shadow-sm' 
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  )}>
                    <div className={cn(
                      'flex items-center justify-center h-10 w-10 rounded-lg transition-colors',
                      isActive 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-600'
                    )}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className={cn(
                          'font-medium truncate',
                          isActive ? 'text-orange-900' : 'text-gray-900'
                        )}>
                          {item.label}
                        </h3>
                        
                        {item.badge && (
                          <Badge className={cn(
                            'text-xs px-2 py-0.5',
                            item.isNew ? 'bg-purple-100 text-purple-800' :
                            item.isHot ? 'bg-red-100 text-red-800 animate-pulse' :
                            'bg-green-100 text-green-800'
                          )}>
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      
                      {item.description && (
                        <p className={cn(
                          'text-xs truncate mt-0.5',
                          isActive ? 'text-orange-700' : 'text-gray-500'
                        )}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    <ArrowRight className={cn(
                      'h-4 w-4 transition-transform group-hover:translate-x-1',
                      isActive ? 'text-orange-600' : 'text-gray-400'
                    )} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>All systems operational</span>
          </div>
          
          <div className="text-xs text-gray-500">
            HERA Universal v2.1 • AI Engine Active
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick action floating button for mobile
interface QuickActionButtonProps {
  className?: string;
}

export function QuickActionButton({ className }: QuickActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    { icon: Brain, label: 'AI Dashboard', href: '/restaurant/ai-dashboard', color: 'purple' },
    { icon: Utensils, label: 'Orders', href: '/restaurant/orders', color: 'blue' },
    { icon: ChefHat, label: 'Kitchen', href: '/restaurant/kitchen', color: 'red' },
    { icon: BarChart3, label: 'Dashboard', href: '/restaurant/dashboard', color: 'orange' }
  ];

  return (
    <div className={cn('md:hidden fixed bottom-6 right-6 z-40', className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={action.href}>
                  <Button
                    size="lg"
                    className={cn(
                      'h-12 w-12 rounded-full shadow-lg',
                      action.color === 'purple' && 'bg-purple-500 hover:bg-purple-600',
                      action.color === 'blue' && 'bg-blue-500 hover:bg-blue-600',
                      action.color === 'red' && 'bg-red-500 hover:bg-red-600',
                      action.color === 'orange' && 'bg-orange-500 hover:bg-orange-600'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="sr-only">{action.label}</span>
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="lg"
        className={cn(
          'h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all duration-200',
          isOpen && 'rotate-45'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
        <span className="sr-only">Quick actions</span>
      </Button>
    </div>
  );
}