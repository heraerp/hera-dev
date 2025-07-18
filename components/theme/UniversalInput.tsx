/**
 * Universal Input Component
 * Mobile-first input with consistent theming across the entire application
 */

"use client";

import React, { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useMobileTheme } from '@/hooks/useMobileTheme';
import { Eye, EyeOff, Search } from 'lucide-react';

interface UniversalInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  autoComplete?: string;
}

export const UniversalInput = forwardRef<HTMLInputElement, UniversalInputProps>(({
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error,
  label,
  icon,
  className = '',
  fullWidth = true,
  size = 'md',
  required = false,
  autoComplete,
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { getInputStyles, colors } = useMobileTheme();
  
  const inputStyles = getInputStyles(focused);
  
  const sizeStyles = {
    sm: { padding: '0.5rem 0.75rem', fontSize: '0.875rem', minHeight: '36px' },
    md: { padding: '0.75rem 1rem', fontSize: '1rem', minHeight: '44px' },
    lg: { padding: '1rem 1.25rem', fontSize: '1.125rem', minHeight: '52px' },
  };
  
  const finalStyles: React.CSSProperties = {
    ...inputStyles,
    ...sizeStyles[size],
    width: fullWidth ? '100%' : 'auto',
    paddingLeft: icon ? '2.5rem' : sizeStyles[size].padding.split(' ')[1],
    paddingRight: type === 'password' ? '2.5rem' : sizeStyles[size].padding.split(' ')[1],
    borderColor: error ? colors.error : focused ? colors.orange : colors.border,
    boxShadow: error 
      ? `0 0 0 2px ${colors.error}33` 
      : focused 
        ? `0 0 0 2px ${colors.orange}33` 
        : `0 1px 3px ${colors.shadow}`,
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(e);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(e);
  };
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: colors.textPrimary }}
        >
          {label}
          {required && <span style={{ color: colors.error }}>*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10"
            style={{ color: colors.textMuted }}
          >
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className="w-full outline-none transition-all duration-200"
          style={finalStyles}
        />
        
        {type === 'password' && (
          <motion.button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10"
            onClick={() => setShowPassword(!showPassword)}
            whileTap={{ scale: 0.95 }}
            style={{ color: colors.textMuted }}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </motion.button>
        )}
      </div>
      
      {error && (
        <motion.p
          className="mt-1 text-sm"
          style={{ color: colors.error }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

UniversalInput.displayName = 'UniversalInput';

// Search Input Component
export const UniversalSearchInput: React.FC<{
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ placeholder = 'Search...', value, onChange, className = '', size = 'md' }) => {
  return (
    <UniversalInput
      type="search"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      icon={<Search className="w-5 h-5" />}
      className={className}
      size={size}
    />
  );
};

export default UniversalInput;