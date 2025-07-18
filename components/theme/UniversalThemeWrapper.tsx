/**
 * HERA Universal Theme Wrapper
 * Mobile-first theme system that applies consistent theming across the entire application
 */

"use client";

import React, { useEffect } from 'react';
import { useTheme } from '@/components/providers/theme-provider';

interface UniversalThemeWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const UniversalThemeWrapper: React.FC<UniversalThemeWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  const { theme, getModernThemeColors } = useTheme();
  const modernColors = getModernThemeColors();
  
  const currentTheme = theme === 'auto' ? 
    (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
    theme;
  
  const isDark = currentTheme === 'dark';

  // Apply theme to document root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', currentTheme);
      document.documentElement.classList.toggle('dark', isDark);
      
      // Apply theme colors to CSS variables
      const root = document.documentElement;
      
      // Update custom properties for HERA components
      root.style.setProperty('--hera-background', modernColors.background);
      root.style.setProperty('--hera-surface', modernColors.surface);
      root.style.setProperty('--hera-surface-elevated', modernColors.surfaceElevated);
      root.style.setProperty('--hera-text-primary', modernColors.text);
      root.style.setProperty('--hera-text-secondary', modernColors.textSecondary);
      root.style.setProperty('--hera-text-muted', modernColors.textMuted);
      root.style.setProperty('--hera-border', modernColors.border);
      root.style.setProperty('--hera-orange', modernColors.orange);
      root.style.setProperty('--hera-orange-shadow', modernColors.orangeShadow);
      root.style.setProperty('--hera-shadow', modernColors.shadow);
    }
  }, [currentTheme, isDark, modernColors]);

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${className}`}
      style={{
        backgroundColor: modernColors.background,
        color: modernColors.text,
        '--theme-background': modernColors.background,
        '--theme-surface': modernColors.surface,
        '--theme-surface-elevated': modernColors.surfaceElevated,
        '--theme-text-primary': modernColors.text,
        '--theme-text-secondary': modernColors.textSecondary,
        '--theme-text-muted': modernColors.textMuted,
        '--theme-border': modernColors.border,
        '--theme-orange': modernColors.orange,
        '--theme-orange-shadow': modernColors.orangeShadow,
        '--theme-shadow': modernColors.shadow
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

export default UniversalThemeWrapper;