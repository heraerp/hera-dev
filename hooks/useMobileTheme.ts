/**
 * HERA Mobile-First Theme Hook
 * Optimized for mobile devices with touch-friendly interactions
 */

"use client";

import { useTheme } from '@/components/providers/theme-provider';
import { useEffect, useState } from 'react';

export interface MobileThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  surfaceHover?: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Border and accent colors
  border: string;
  borderLight?: string;
  borderFocus?: string;
  orange: string;
  orangeSecondary: string;
  orangeShadow: string;
  shadow: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Depth shades (for dark mode)
  gray900?: string;
  gray800?: string;
  gray700?: string;
  gray600?: string;
  gray500?: string;
  gray400?: string;
  
  // Theme state
  isDark: boolean;
}

export interface MobileThemeUtils {
  // Colors
  colors: MobileThemeColors;
  
  // Utilities
  getButtonStyles: (variant: 'primary' | 'secondary' | 'ghost') => React.CSSProperties;
  getCardStyles: (variant: 'default' | 'elevated' | 'interactive') => React.CSSProperties;
  getInputStyles: (focused?: boolean) => React.CSSProperties;
  getBadgeStyles: (variant: 'default' | 'success' | 'warning' | 'error') => React.CSSProperties;
  
  // Mobile-specific utilities
  getTapTargetStyles: () => React.CSSProperties;
  getResponsiveSpacing: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => string;
  getResponsiveText: (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl') => React.CSSProperties;
  
  // Theme state
  theme: string;
  isDark: boolean;
  toggleTheme: () => void;
}

export const useMobileTheme = (): MobileThemeUtils => {
  const { theme, setTheme, getModernThemeColors } = useTheme();
  const modernColors = getModernThemeColors();
  
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const currentTheme = theme === 'auto' ? 
    (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
    theme;
  
  const isDark = currentTheme === 'dark';
  
  const colors: MobileThemeColors = {
    background: modernColors.background,
    surface: modernColors.surface,
    surfaceElevated: modernColors.surfaceElevated,
    surfaceMuted: isDark ? '#121212' : 'rgba(31, 31, 31, 0.04)',
    surfaceHover: modernColors.surfaceHover,
    
    textPrimary: modernColors.text,
    textSecondary: modernColors.textSecondary,
    textMuted: modernColors.textMuted,
    
    border: modernColors.border,
    borderLight: modernColors.borderLight,
    borderFocus: modernColors.borderFocus,
    orange: modernColors.orange,
    orangeSecondary: modernColors.orangeSecondary || modernColors.orange,
    orangeShadow: modernColors.orangeShadow,
    shadow: modernColors.shadow,
    
    success: isDark ? '#66BB6A' : '#16a34a',
    warning: isDark ? '#FFC107' : '#ca8a04',
    error: isDark ? '#EF5350' : '#dc2626',
    info: isDark ? '#42A5F5' : '#2563eb',
    
    // Depth shades
    gray900: modernColors.gray900,
    gray800: modernColors.gray800,
    gray700: modernColors.gray700,
    gray600: modernColors.gray600,
    gray500: modernColors.gray500,
    gray400: modernColors.gray400,
    
    isDark,
  };
  
  const getButtonStyles = (variant: 'primary' | 'secondary' | 'ghost'): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      lineHeight: '1.25rem',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
      minHeight: '44px', // Touch-friendly
      minWidth: '44px',
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: colors.orange,
          color: '#ffffff',
          boxShadow: `0 2px 4px ${colors.orangeShadow}33`,
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: colors.surface,
          color: colors.textPrimary,
          border: `1px solid ${colors.border}`,
        };
      case 'ghost':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: colors.textPrimary,
        };
      default:
        return baseStyles;
    }
  };
  
  const getCardStyles = (variant: 'default' | 'elevated' | 'interactive'): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      borderRadius: '0.5rem',
      border: `1px solid ${colors.border}`,
      transition: 'all 0.2s ease',
    };
    
    switch (variant) {
      case 'elevated':
        return {
          ...baseStyles,
          backgroundColor: colors.surfaceElevated,
          boxShadow: `0 4px 6px -1px ${colors.shadow}, 0 2px 4px -1px ${colors.shadow}`,
        };
      case 'interactive':
        return {
          ...baseStyles,
          backgroundColor: colors.surface,
          cursor: 'pointer',
          boxShadow: `0 1px 3px ${colors.shadow}`,
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: colors.surface,
          boxShadow: `0 1px 3px ${colors.shadow}`,
        };
    }
  };
  
  const getInputStyles = (focused?: boolean): React.CSSProperties => {
    return {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      lineHeight: '1.5rem',
      backgroundColor: colors.surface,
      border: `2px solid ${focused ? colors.orange : colors.border}`,
      color: colors.textPrimary,
      transition: 'all 0.2s ease',
      outline: 'none',
      minHeight: '44px', // Touch-friendly
      boxShadow: focused ? `0 0 0 2px ${colors.orangeShadow}33` : `0 1px 3px ${colors.shadow}`,
    };
  };
  
  const getBadgeStyles = (variant: 'default' | 'success' | 'warning' | 'error'): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      lineHeight: '1rem',
      border: '1px solid',
    };
    
    switch (variant) {
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: `${colors.success}20`,
          color: colors.success,
          borderColor: `${colors.success}40`,
        };
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: `${colors.warning}20`,
          color: colors.warning,
          borderColor: `${colors.warning}40`,
        };
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: `${colors.error}20`,
          color: colors.error,
          borderColor: `${colors.error}40`,
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: colors.surface,
          color: colors.textPrimary,
          borderColor: colors.border,
        };
    }
  };
  
  const getTapTargetStyles = (): React.CSSProperties => {
    return {
      minHeight: '44px',
      minWidth: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      borderRadius: '0.375rem',
      transition: 'all 0.2s ease',
    };
  };
  
  const getResponsiveSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): string => {
    const spacingMap = {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    };
    return spacingMap[size];
  };
  
  const getResponsiveText = (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'): React.CSSProperties => {
    const textMap = {
      xs: { fontSize: '0.75rem', lineHeight: '1rem' },
      sm: { fontSize: '0.875rem', lineHeight: '1.25rem' },
      base: { fontSize: '1rem', lineHeight: '1.5rem' },
      lg: { fontSize: '1.125rem', lineHeight: '1.75rem' },
      xl: { fontSize: '1.25rem', lineHeight: '1.75rem' },
      '2xl': { fontSize: '1.5rem', lineHeight: '2rem' },
      '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' },
    };
    
    return {
      ...textMap[size],
      color: colors.textPrimary,
      fontWeight: '500',
    };
  };
  
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };
  
  if (!isMounted) {
    // Return default values during SSR
    return {
      colors: {
        background: '#ffffff',
        surface: '#f8f9fa',
        surfaceElevated: '#ffffff',
        surfaceMuted: '#f1f5f9',
        textPrimary: '#1a1a1a',
        textSecondary: '#666666',
        textMuted: '#9ca3af',
        border: '#e5e7eb',
        orange: '#FF4701',
        orangeSecondary: '#ff6b35',
        orangeShadow: 'rgba(255, 71, 1, 0.15)',
        shadow: 'rgba(0, 0, 0, 0.1)',
        success: '#16a34a',
        warning: '#ca8a04',
        error: '#dc2626',
        info: '#2563eb',
        isDark: false,
      },
      getButtonStyles: () => ({}),
      getCardStyles: () => ({}),
      getInputStyles: () => ({}),
      getBadgeStyles: () => ({}),
      getTapTargetStyles: () => ({}),
      getResponsiveSpacing: () => '1rem',
      getResponsiveText: () => ({}),
      theme: 'light',
      isDark: false,
      toggleTheme: () => {},
    };
  }
  
  return {
    colors,
    getButtonStyles,
    getCardStyles,
    getInputStyles,
    getBadgeStyles,
    getTapTargetStyles,
    getResponsiveSpacing,
    getResponsiveText,
    theme: currentTheme,
    isDark,
    toggleTheme,
  };
};

export default useMobileTheme;