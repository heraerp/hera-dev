/**
 * Universal Card Component
 * Mobile-first card with consistent theming across the entire application
 */

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useMobileTheme } from '@/hooks/useMobileTheme';

interface UniversalCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive';
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const UniversalCard: React.FC<UniversalCardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  padding = 'md',
  animated = true,
}) => {
  const { getCardStyles, colors } = useMobileTheme();
  
  const baseStyles = getCardStyles(variant);
  
  const paddingStyles = {
    none: { padding: '0' },
    sm: { padding: '0.75rem' },
    md: { padding: '1rem' },
    lg: { padding: '1.5rem' },
  };
  
  const cardStyles: React.CSSProperties = {
    ...baseStyles,
    ...paddingStyles[padding],
  };
  
  const hoverStyles = variant === 'interactive' ? {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 25px -8px ${colors.shadow}`,
  } : undefined;
  
  const Component = animated ? motion.div : 'div';
  
  const motionProps = animated ? {
    style: cardStyles,
    className: className,
    onClick: onClick,
    whileHover: hoverStyles,
    whileTap: variant === 'interactive' ? { scale: 0.98 } : undefined,
    transition: { duration: 0.2 },
  } : {
    style: cardStyles,
    className: className,
    onClick: onClick,
  };
  
  return (
    <Component {...motionProps}>
      {children}
    </Component>
  );
};

// Card Header Component
export const UniversalCardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const { colors } = useMobileTheme();
  
  return (
    <div 
      className={`border-b pb-3 mb-4 ${className}`}
      style={{ borderColor: colors.border }}
    >
      {children}
    </div>
  );
};

// Card Title Component
export const UniversalCardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const { getResponsiveText } = useMobileTheme();
  
  return (
    <h3 
      className={`font-semibold ${className}`}
      style={getResponsiveText('lg')}
    >
      {children}
    </h3>
  );
};

// Card Content Component
export const UniversalCardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const { colors } = useMobileTheme();
  
  return (
    <div 
      className={className}
      style={{ color: colors.textSecondary }}
    >
      {children}
    </div>
  );
};

// Card Footer Component
export const UniversalCardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const { colors } = useMobileTheme();
  
  return (
    <div 
      className={`border-t pt-3 mt-4 ${className}`}
      style={{ borderColor: colors.border }}
    >
      {children}
    </div>
  );
};

export default UniversalCard;