/**
 * Restaurant POS Layout with Premium Brand System
 * Sophisticated hospitality design inspired by Pentagram's approach
 */

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  generateRestaurantCardStyles,
  generateRestaurantButtonStyles,
  generateMenuItemStyles,
  RESTAURANT_BRAND_COLORS,
  RESTAURANT_TYPOGRAPHY,
  RESTAURANT_SPACING
} from '@/lib/design/RestaurantBrandSystem';
import { HERALogo, HERAEnterpriseMarkLogo } from '@/components/branding/HERALogo';
import { useTheme } from '@/components/providers/theme-provider';
import {
  ShoppingCart,
  Plus,
  Minus,
  Coffee,
  Pizza,
  Utensils,
  ChefHat,
  Star,
  Clock,
  CreditCard,
  Receipt,
  Users,
  Tag,
  Sun,
  Moon
} from 'lucide-react';

// Enhanced interfaces for branded components
interface BrandedCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive';
  className?: string;
  onClick?: () => void;
}

interface BrandedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    price: number;
    category: string;
    description?: string;
    image_url?: string;
    isAvailable?: boolean;
  };
  isSelected?: boolean;
  onAdd: () => void;
  quantity?: number;
}

interface CategoryFilterProps {
  categories: Array<{
    id: string;
    name: string;
    icon: React.ReactNode;
    count: number;
  }>;
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

interface CartSummaryProps {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  onCheckout: () => void;
  onItemRemove: (itemId: string) => void;
  onItemQuantityChange: (itemId: string, quantity: number) => void;
}

// Branded Card Component
export const BrandedCard: React.FC<BrandedCardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick
}) => {
  const { getModernThemeColors } = useTheme();
  const modernColors = getModernThemeColors();
  
  const getCardStyles = () => {
    const baseStyles = "rounded-lg border transition-all duration-300";
    
    switch (variant) {
      case 'elevated':
        return `${baseStyles} shadow-lg hover:shadow-xl`;
      case 'interactive':
        return `${baseStyles} shadow-md hover:shadow-lg cursor-pointer`;
      default:
        return `${baseStyles} shadow-sm`;
    }
  };
  
  return (
    <motion.div
      className={`${getCardStyles()} ${className}`}
      style={{
        backgroundColor: variant === 'elevated' ? modernColors.surfaceElevated : modernColors.surface,
        borderColor: modernColors.border,
        color: modernColors.text
      }}
      onClick={onClick}
      whileHover={variant === 'interactive' ? { scale: 1.02 } : undefined}
      whileTap={variant === 'interactive' ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// Branded Button Component
export const BrandedButton: React.FC<BrandedButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  icon,
  className = ''
}) => {
  const { getModernThemeColors } = useTheme();
  const modernColors = getModernThemeColors();
  
  const getButtonStyles = () => {
    const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
    
    if (disabled) {
      return `${baseStyles} opacity-50 cursor-not-allowed`;
    }
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} text-white shadow-md hover:shadow-lg`;
      case 'secondary':
        return `${baseStyles} border shadow-sm hover:shadow-md`;
      case 'ghost':
        return `${baseStyles} hover:shadow-sm`;
      default:
        return baseStyles;
    }
  };
  
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: modernColors.orange,
          color: '#ffffff',
          boxShadow: `0 4px 12px ${modernColors.orangeShadow}`
        };
      case 'secondary':
        return {
          backgroundColor: modernColors.surface,
          color: modernColors.text,
          borderColor: modernColors.border
        };
      case 'ghost':
        return {
          backgroundColor: '#9ca3af',
          color: '#000000',
          border: '1px solid #6b7280'
        };
      default:
        return {
          backgroundColor: modernColors.surface,
          color: modernColors.text
        };
    }
  };
  
  return (
    <motion.button
      className={`${getButtonStyles()} ${className}`}
      style={getButtonStyle()}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { 
        scale: 1.05,
        backgroundColor: variant === 'ghost' 
          ? '#d1d5db'
          : undefined
      } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.15 }}
    >
      {icon}
      {children}
    </motion.button>
  );
};

// Premium Menu Item Card
export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  isSelected = false,
  onAdd,
  quantity = 0
}) => {
  const { getModernThemeColors } = useTheme();
  const modernColors = getModernThemeColors();
  
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      appetizer: <Coffee className="w-4 h-4" />,
      main_course: <Utensils className="w-4 h-4" />,
      dessert: <Star className="w-4 h-4" />,
      beverage: <Coffee className="w-4 h-4" />,
      special: <ChefHat className="w-4 h-4" />,
    };
    return icons[category] || <Tag className="w-4 h-4" />;
  };

  const getCategoryColor = (category: string, isDark: boolean) => {
    if (isDark) {
      const colors: Record<string, string> = {
        appetizer: 'rgba(255, 117, 24, 0.15)',
        main_course: 'rgba(239, 68, 68, 0.15)',
        dessert: 'rgba(236, 72, 153, 0.15)',
        beverage: 'rgba(59, 130, 246, 0.15)',
        special: 'rgba(147, 51, 234, 0.15)',
      };
      return colors[category] || 'rgba(107, 114, 128, 0.15)';
    } else {
      const colors: Record<string, string> = {
        appetizer: 'rgba(255, 117, 24, 0.1)',
        main_course: 'rgba(239, 68, 68, 0.1)',
        dessert: 'rgba(236, 72, 153, 0.1)',
        beverage: 'rgba(59, 130, 246, 0.1)',
        special: 'rgba(147, 51, 234, 0.1)',
      };
      return colors[category] || 'rgba(107, 114, 128, 0.1)';
    }
  };

  const getCategoryTextColor = (category: string, isDark: boolean) => {
    if (isDark) {
      const colors: Record<string, string> = {
        appetizer: '#ffab70',
        main_course: '#fca5a5',
        dessert: '#f9a8d4',
        beverage: '#93c5fd',
        special: '#c4b5fd',
      };
      return colors[category] || '#9ca3af';
    } else {
      const colors: Record<string, string> = {
        appetizer: '#ea580c',
        main_course: '#dc2626',
        dessert: '#db2777',
        beverage: '#2563eb',
        special: '#9333ea',
      };
      return colors[category] || '#374151';
    }
  };

  const isDark = modernColors.background === '#1a1a1a';
  const cardStyle = {
    backgroundColor: isSelected ? modernColors.orange + '15' : modernColors.surface,
    borderColor: isSelected ? modernColors.orange : modernColors.border,
    color: modernColors.text,
    boxShadow: isSelected ? `0 4px 12px ${modernColors.orangeShadow}` : `0 2px 8px ${modernColors.shadow}`
  };

  return (
    <motion.div
      className="p-4 rounded-lg border transition-all duration-300 cursor-pointer hover:shadow-md"
      style={cardStyle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onAdd}
    >
      {/* Item Image */}
      {item.image_url && (
        <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Item Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className={`font-semibold text-lg mb-1`}
             style={{ 
               fontFamily: RESTAURANT_TYPOGRAPHY.fontFamilies.sans,
               color: modernColors.text
             }}>
            {item.name}
          </h3>
          {item.description && (
            <p className="text-sm mb-2 line-clamp-2" style={{ color: modernColors.textSecondary }}>
              {item.description}
            </p>
          )}
        </div>
        <Badge 
          className={`ml-2 flex items-center gap-1`}
          style={{
            backgroundColor: getCategoryColor(item.category, isDark),
            color: getCategoryTextColor(item.category, isDark),
            borderColor: getCategoryColor(item.category, isDark)
          }}
        >
          {getCategoryIcon(item.category)}
          {item.category.replace('_', ' ')}
        </Badge>
      </div>

      {/* Price and Availability */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className={`text-2xl font-bold`}
               style={{ 
                 fontFamily: RESTAURANT_TYPOGRAPHY.fontFamilies.mono,
                 color: modernColors.text
               }}>
            ₹{item.price.toFixed(2)}
          </span>
          {!item.isAvailable && (
            <Badge variant="destructive" className="ml-2">
              Unavailable
            </Badge>
          )}
        </div>
        {quantity > 0 && (
          <Badge 
            className="ml-2"
            style={{
              backgroundColor: isDark ? 'rgba(255, 71, 1, 0.15)' : 'rgba(255, 71, 1, 0.1)',
              color: isDark ? '#ff8a65' : '#e65100',
              borderColor: isDark ? 'rgba(255, 71, 1, 0.25)' : 'rgba(255, 71, 1, 0.2)'
            }}
          >
            {quantity} in cart
          </Badge>
        )}
      </div>

      {/* Add Button */}
      <BrandedButton
        variant="primary"
        onClick={onAdd}
        disabled={!item.isAvailable}
        icon={<Plus className="w-4 h-4" />}
        className="w-full"
      >
        Add to Cart
      </BrandedButton>
    </motion.div>
  );
};

// Category Filter Component
export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect
}) => {
  const { getModernThemeColors } = useTheme();
  const modernColors = getModernThemeColors();
  const isDark = modernColors.background === '#1a1a1a';

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200`}
          style={{
            backgroundColor: selectedCategory === category.id
              ? modernColors.orange
              : modernColors.surface,
            color: selectedCategory === category.id
              ? '#ffffff'
              : modernColors.text,
            borderColor: selectedCategory === category.id
              ? modernColors.orange
              : modernColors.border
          }}
          onClick={() => onCategorySelect(category.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {category.icon}
          <span className="font-medium">{category.name}</span>
          <Badge 
            style={{
              backgroundColor: selectedCategory === category.id 
                ? 'rgba(255, 255, 255, 0.2)' 
                : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              color: selectedCategory === category.id
                ? '#ffffff'
                : modernColors.textSecondary,
              borderColor: selectedCategory === category.id
                ? 'rgba(255, 255, 255, 0.3)'
                : modernColors.border
            }}
          >
            {category.count}
          </Badge>
        </motion.button>
      ))}
    </div>
  );
};

// Enhanced Cart Summary
export const CartSummary: React.FC<CartSummaryProps> = ({
  items,
  subtotal,
  tax,
  total,
  onCheckout,
  onItemRemove,
  onItemQuantityChange
}) => {
  const { getModernThemeColors } = useTheme();
  const modernColors = getModernThemeColors();
  const isDark = modernColors.background === '#1a1a1a';

  return (
    <BrandedCard variant="elevated" className="sticky top-4">
      {/* Cart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" style={{ color: modernColors.textSecondary }} />
          <h3 className={`text-lg font-semibold`}
             style={{ 
               fontFamily: RESTAURANT_TYPOGRAPHY.fontFamilies.sans,
               color: modernColors.text
             }}>
            Order Summary
          </h3>
        </div>
        <Badge 
          style={{
            backgroundColor: isDark ? 'rgba(255, 71, 1, 0.15)' : 'rgba(255, 71, 1, 0.1)',
            color: isDark ? '#ff8a65' : '#e65100',
            borderColor: isDark ? 'rgba(255, 71, 1, 0.25)' : 'rgba(255, 71, 1, 0.2)'
          }}
        >
          {items.length} items
        </Badge>
      </div>

      {/* Cart Items */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex-1">
              <h4 className="font-medium" style={{ color: modernColors.text }}>{item.name}</h4>
              <p className="text-sm" style={{ color: modernColors.textSecondary }}>
                ₹{item.price.toFixed(2)} each
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BrandedButton
                variant="ghost"
                onClick={() => onItemQuantityChange(item.id, item.quantity - 1)}
                className="w-8 h-8 p-0"
              >
                <Minus className="w-4 h-4" />
              </BrandedButton>
              <span className="w-8 text-center font-semibold" style={{ color: modernColors.text }}>
                {item.quantity}
              </span>
              <BrandedButton
                variant="ghost"
                onClick={() => onItemQuantityChange(item.id, item.quantity + 1)}
                className="w-8 h-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </BrandedButton>
            </div>
          </motion.div>
        ))}
      </div>

      {items.length > 0 && (
        <>
          <Separator style={{ borderColor: modernColors.border }} className="my-4" />
          
          {/* Totals */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between" style={{ color: modernColors.textSecondary }}>
              <span>Subtotal:</span>
              <span className={`font-mono`}>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: modernColors.textSecondary }}>
              <span>GST (5%):</span>
              <span className={`font-mono`}>₹{tax.toFixed(2)}</span>
            </div>
            <Separator style={{ borderColor: modernColors.border }} />
            <div className="flex justify-between text-lg font-bold" style={{ color: modernColors.text }}>
              <span>Total:</span>
              <span className={`font-mono`} style={{ color: modernColors.orange }}>
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <BrandedButton
            variant="primary"
            onClick={onCheckout}
            icon={<CreditCard className="w-4 h-4" />}
            className="w-full"
          >
            Proceed to Checkout
          </BrandedButton>
        </>
      )}

      {items.length === 0 && (
        <div className="text-center py-8" style={{ color: modernColors.textMuted }}>
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Your cart is empty</p>
          <p className="text-sm">Add items to get started</p>
        </div>
      )}
    </BrandedCard>
  );
};

// Main POS Layout Component
interface RestaurantPOSLayoutProps {
  children?: React.ReactNode;
  className?: string;
}

export const RestaurantPOSLayout: React.FC<RestaurantPOSLayoutProps> = ({
  children,
  className = ''
}) => {
  const { theme, setTheme, getModernThemeColors } = useTheme();
  
  // Use theme directly instead of getOptimalTheme
  const currentTheme = theme === 'auto' ? 
    (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
    theme;
  
  const isDark = currentTheme === 'dark';
  const modernColors = getModernThemeColors();

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${className}`}
      style={{
        background: isDark 
          ? `linear-gradient(135deg, ${modernColors.background} 0%, #0f0f0f 100%)`
          : `linear-gradient(135deg, ${modernColors.background} 0%, #f8f9fa 100%)`
      }}
    >
      {/* Header */}
      <header 
        className="border-b shadow-sm sticky top-0 z-40 transition-colors duration-300"
        style={{
          backgroundColor: modernColors.surface,
          borderColor: modernColors.border
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <HERAEnterpriseMarkLogo 
                size="md" 
                theme={currentTheme}
                animated={true}
              />
              <div className="border-l pl-4" style={{ borderColor: modernColors.border }}>
                <h1 
                  className="text-lg font-semibold"
                  style={{ 
                    fontFamily: RESTAURANT_TYPOGRAPHY.fontFamilies.display,
                    color: modernColors.text
                  }}
                >
                  Restaurant POS
                </h1>
                <p 
                  className="text-xs tracking-wide"
                  style={{ color: modernColors.textMuted }}
                >
                  POINT OF SALE SYSTEM
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge 
                className="transition-colors duration-300"
                style={{
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
                  color: isDark ? '#4ade80' : '#15803d',
                  borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'
                }}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </Badge>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: modernColors.surface,
                  borderColor: modernColors.border,
                  color: modernColors.text
                }}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              
              <BrandedButton variant="secondary" icon={<Clock className="w-4 h-4" />}>
                Orders
              </BrandedButton>
              <BrandedButton variant="secondary" icon={<Users className="w-4 h-4" />}>
                Tables
              </BrandedButton>
              <BrandedButton variant="secondary" icon={<Receipt className="w-4 h-4" />}>
                Reports
              </BrandedButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

// Export default layout
export default RestaurantPOSLayout;