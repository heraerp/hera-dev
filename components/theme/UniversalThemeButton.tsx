/**
 * Universal Theme Button Component
 * Mobile-first button with consistent theming across the entire application
 */

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useMobileTheme } from '@/hooks/useMobileTheme';
import { Sun, Moon } from 'lucide-react';

interface UniversalThemeButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  loading?: boolean;
}

export const UniversalThemeButton: React.FC<UniversalThemeButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  icon,
  className = '',
  fullWidth = false,
  loading = false,
}) => {
  const { getButtonStyles, colors } = useMobileTheme();
  
  const baseStyles = getButtonStyles(variant);
  
  const sizeStyles = {
    sm: { padding: '0.5rem 0.75rem', fontSize: '0.875rem', minHeight: '36px' },
    md: { padding: '0.75rem 1rem', fontSize: '0.875rem', minHeight: '44px' },
    lg: { padding: '1rem 1.5rem', fontSize: '1rem', minHeight: '52px' },
  };
  
  const buttonStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    position: 'relative',
    overflow: 'hidden',
  };
  
  const hoverStyles = {
    primary: {
      backgroundColor: `${colors.orange}dd`,
      transform: 'translateY(-1px)',
      boxShadow: `0 4px 8px ${colors.orangeShadow}66`,
    },
    secondary: {
      backgroundColor: colors.surfaceElevated,
      boxShadow: `0 2px 4px ${colors.shadow}`,
    },
    ghost: {
      backgroundColor: colors.surface,
    },
  };
  
  return (
    <motion.button
      className={`${className}`}
      style={buttonStyles}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? hoverStyles[variant] : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15 }}
    >
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
      
      <div className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children && <span>{children}</span>}
      </div>
    </motion.button>
  );
};

// Theme Toggle Button - Special component for theme switching
export const ThemeToggleButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useMobileTheme();
  
  return (
    <UniversalThemeButton
      variant="ghost"
      size="md"
      onClick={toggleTheme}
      icon={
        <motion.div
          key={isDark ? 'sun' : 'moon'}
          initial={{ scale: 0.8, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.div>
      }
      className={className}
    />
  );
};

export default UniversalThemeButton;