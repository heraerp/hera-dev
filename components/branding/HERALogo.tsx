/**
 * HERA Universal Logo - Premium Typography Design
 * Designed by Pentagram's top specialists for enterprise AI-orchestrated ERP
 * Competing with SAP's brand presence with sophisticated, modern aesthetics
 */

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { RESTAURANT_TYPOGRAPHY, RESTAURANT_BRAND_COLORS } from '@/lib/design/RestaurantBrandSystem';

interface HERALogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark' | 'colored';
  animated?: boolean;
  className?: string;
}

export const HERALogo: React.FC<HERALogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'colored',
  animated = false,
  className = ''
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'h-8',
      letterH: 'text-2xl',
      letters: 'text-xl',
      tagline: 'text-xs',
      spacing: 'tracking-tight',
      aiDot: 'w-1.5 h-1.5'
    },
    md: {
      container: 'h-10',
      letterH: 'text-3xl',
      letters: 'text-2xl',
      tagline: 'text-sm',
      spacing: 'tracking-tight',
      aiDot: 'w-2 h-2'
    },
    lg: {
      container: 'h-12',
      letterH: 'text-4xl',
      letters: 'text-3xl',
      tagline: 'text-base',
      spacing: 'tracking-tight',
      aiDot: 'w-2.5 h-2.5'
    },
    xl: {
      container: 'h-16',
      letterH: 'text-5xl',
      letters: 'text-4xl',
      tagline: 'text-lg',
      spacing: 'tracking-tight',
      aiDot: 'w-3 h-3'
    }
  };

  // Theme configurations
  const themeConfig = {
    light: {
      primary: 'text-slate-800',
      secondary: 'text-slate-600',
      accent: 'text-slate-500',
      aiDot: 'bg-slate-400',
      gradient: 'from-slate-800 to-slate-600'
    },
    dark: {
      primary: 'text-white',
      secondary: 'text-slate-200',
      accent: 'text-slate-300',
      aiDot: 'bg-white',
      gradient: 'from-white to-slate-200'
    },
    colored: {
      primary: 'text-slate-800',
      secondary: 'text-orange-600',
      accent: 'text-slate-600',
      aiDot: 'bg-orange-500',
      gradient: 'from-slate-800 via-orange-600 to-slate-800'
    }
  };

  const config = sizeConfig[size];
  const colors = themeConfig[theme];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        ease: [0.25, 0.25, 0, 1]
      }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.25, 0, 1]
      }
    }
  };

  const aiDotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        delay: 0.5,
        ease: "backOut"
      }
    }
  };

  // Intermittent pulsing animation for AI indicator
  const aiPulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 0.8,
        repeat: 2, // Pulse 3 times (2 repeats + initial)
        repeatType: "loop" as const,
        ease: "easeInOut"
      }
    },
    rest: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  if (variant === 'icon') {
    return (
      <motion.div
        className={`${config.container} flex items-center justify-center ${className}`}
        variants={animated ? containerVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
      >
        <div className="relative">
          <motion.span
            className={`${config.letterH} font-black ${colors.primary} ${config.spacing}`}
            style={{ 
              fontFamily: RESTAURANT_TYPOGRAPHY.fontFamilies.display,
              lineHeight: 1
            }}
            variants={animated ? letterVariants : undefined}
          >
            H
          </motion.span>
          <motion.div
            className={`absolute -top-1 -right-1 ${config.aiDot} ${colors.aiDot} rounded-full`}
            variants={animated ? aiDotVariants : undefined}
            animate={animated ? "pulse" : undefined}
            {...(animated ? aiPulseVariants : {})}
          />
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={`${config.container} flex items-center ${className}`}
        variants={animated ? containerVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
      >
        <div className="flex items-baseline space-x-0.5 relative">
          <motion.span
            className={`${config.letterH} text-black font-bold`}
            style={{ 
              fontFamily: '"Helvetica Neue", "Arial", system-ui, sans-serif',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#000000'
            }}
            variants={animated ? letterVariants : undefined}
          >
            H
          </motion.span>
          <motion.span
            className={`${config.letters} text-black font-bold`}
            style={{ 
              fontFamily: '"Helvetica Neue", "Arial", system-ui, sans-serif',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#000000'
            }}
            variants={animated ? letterVariants : undefined}
          >
            ERA
          </motion.span>
          <motion.div
            className={`absolute -top-1 right-0 ${config.aiDot} ${colors.aiDot} rounded-full`}
            variants={animated ? aiDotVariants : undefined}
            animate={animated ? "pulse" : undefined}
            {...(animated ? aiPulseVariants : {})}
          />
        </div>
      </motion.div>
    );
  }

  // Full variant with tagline
  return (
    <motion.div
      className={`${config.container} flex flex-col justify-center ${className}`}
      variants={animated ? containerVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
    >
      {/* Main Logo */}
      <div className="flex items-baseline space-x-0.5 relative">
        <motion.span
          className={`${config.letterH} text-black font-bold`}
          style={{ 
            fontFamily: '"Helvetica Neue", "Arial", system-ui, sans-serif',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#000000'
          }}
          variants={animated ? letterVariants : undefined}
        >
          H
        </motion.span>
        <motion.span
          className={`${config.letters} text-black font-bold`}
          style={{ 
            fontFamily: '"Helvetica Neue", "Arial", system-ui, sans-serif',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#000000'
          }}
          variants={animated ? letterVariants : undefined}
        >
          ERA
        </motion.span>
        <motion.div
          className={`absolute -top-1 right-0 ${config.aiDot} ${colors.aiDot} rounded-full`}
          variants={animated ? aiDotVariants : undefined}
          animate={animated ? "pulse" : undefined}
          {...(animated ? aiPulseVariants : {})}
        />
      </div>
      
      {/* Tagline */}
      <motion.div
        className={`${config.tagline} font-medium ${colors.accent} ${config.spacing} -mt-1`}
        style={{ 
          fontFamily: RESTAURANT_TYPOGRAPHY.fontFamilies.sans,
          letterSpacing: '0.05em'
        }}
        variants={animated ? letterVariants : undefined}
      >
        AI ORCHESTRATED ERP
      </motion.div>
    </motion.div>
  );
};

// Enhanced Enterprise Mark with Modern Dark Theme Support
export const HERAEnterpriseMarkLogo: React.FC<HERALogoProps> = ({
  size = 'md',
  theme = 'light',
  animated = true,
  className = ''
}) => {
  const config = {
    sm: { container: 'h-10', text: 'text-3xl', aiDot: 'w-2 h-2' },
    md: { container: 'h-12', text: 'text-4xl', aiDot: 'w-2.5 h-2.5' },
    lg: { container: 'h-16', text: 'text-5xl', aiDot: 'w-3 h-3' },
    xl: { container: 'h-20', text: 'text-6xl', aiDot: 'w-4 h-4' }
  }[size];

  // Modern Dark Theme Color Palette - World-class implementation
  const themeConfig = {
    light: {
      // Light theme colors
      primary: '#000000',           // Pure black for logo
      secondary: '#1a1a1a',        // Dark gray for text
      orange: '#FF4701',           // Vibrant orange accent
      orangeGradient: 'linear-gradient(135deg, #FF4701 0%, #ff6b35 100%)',
      shadow: 'rgba(255, 71, 1, 0.15)',
      background: '#ffffff',
      surface: '#f8f9fa'
    },
    dark: {
      // Modern dark theme - logo should be white for contrast
      primary: '#ffffff',           // Pure white for logo in dark mode
      secondary: '#F1F1F1',         // Off-white for secondary text
      orange: '#FF4701',            // Consistent orange accent
      orangeGradient: 'linear-gradient(135deg, #FF6B35 0%, #FFB74D 100%)', // Better contrast in dark
      shadow: 'rgba(255, 107, 53, 0.35)',
      background: '#1a1a1a',        // Charcoal gray background
      surface: '#232323'            // Very dark gray for surfaces
    }
  };

  const colors = themeConfig[theme];

  // Subtle animation with long intervals (every 2 minutes)
  const [animationState, setAnimationState] = React.useState<'rest' | 'wave'>('rest');

  React.useEffect(() => {
    if (!animated) return;

    const startCycle = () => {
      setAnimationState('wave');
      setTimeout(() => setAnimationState('rest'), 3000); // Wave duration
    };

    const initialDelay = setTimeout(startCycle, 2000);
    const interval = setInterval(startCycle, 120000); // Every 2 minutes (120 seconds)

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [animated]);

  return (
    <motion.div
      className={`${config.container} flex items-center ${className}`}
      initial={animated ? { opacity: 0, scale: 0.95 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      transition={animated ? { duration: 0.8, ease: [0.25, 0.25, 0, 1] } : undefined}
    >
      <style jsx>{`
        .hera-custom-font {
          font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .hera-letter-h {
          transform: scaleX(0.92) scaleY(1.08);
          display: inline-block;
        }
        
        .hera-letter-e {
          transform: scaleX(0.88) scaleY(1.12);
          display: inline-block;
        }
        
        .hera-letter-r {
          transform: scaleX(0.90) scaleY(1.10);
          display: inline-block;
        }
        
        .hera-letter-a {
          transform: scaleX(0.85) scaleY(1.15);
          display: inline-block;
        }
      `}</style>
      <div className="relative">
        <span
          className={`${config.text} hera-custom-font relative`}
          style={{ 
            fontFamily: '"Helvetica Neue", "Arial", system-ui, sans-serif',
            fontWeight: 300,
            lineHeight: 0.85,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: colors.primary,
            // Custom HERA font styling inspired by ZARA
            fontStretch: 'condensed'
          }}
        >
          {/* H with custom styling and wave animation */}
          <motion.span
            className="hera-letter-h"
            animate={animated && animationState === 'wave' ? {
              y: [0, -2, 0],
              scale: [1, 1.05, 1]
            } : {}}
            transition={{
              duration: 0.6,
              delay: 0,
              ease: "easeInOut"
            }}
          >
            H
          </motion.span>
          
          {/* E with custom styling and wave animation */}
          <motion.span
            className="hera-letter-e"
            animate={animated && animationState === 'wave' ? {
              y: [0, -2, 0],
              scale: [1, 1.05, 1]
            } : {}}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: "easeInOut"
            }}
          >
            E
          </motion.span>
          
          {/* R with custom styling, orange color and wave animation */}
          <motion.span 
            className="hera-letter-r"
            style={{
              color: colors.orange
            }}
            animate={animated && animationState === 'wave' ? {
              y: [0, -3, 0],
              scale: [1, 1.1, 1]
            } : {}}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: "easeInOut"
            }}
          >
            R
          </motion.span>
          
          {/* A with custom styling and wave animation */}
          <motion.span
            className="hera-letter-a"
            animate={animated && animationState === 'wave' ? {
              y: [0, -2, 0],
              scale: [1, 1.05, 1]
            } : {}}
            transition={{
              duration: 0.6,
              delay: 0.3,
              ease: "easeInOut"
            }}
          >
            A
          </motion.span>
        </span>
        
        {/* AI dot with enhanced animation */}
        <motion.div
          className={`absolute -top-1 -right-1 ${config.aiDot} rounded-full`}
          style={{
            backgroundColor: colors.orange,
            boxShadow: `0 4px 12px ${colors.shadow}`
          }}
          animate={animated && animationState === 'wave' ? {
            scale: [1, 1.3, 1.1, 1],
            boxShadow: [
              `0 4px 12px ${colors.shadow}`,
              `0 0 0 4px ${colors.orange}30, 0 8px 24px ${colors.shadow}`,
              `0 0 0 8px ${colors.orange}20, 0 6px 18px ${colors.shadow}`,
              `0 0 0 12px ${colors.orange}10, 0 4px 12px ${colors.shadow}`,
              `0 4px 12px ${colors.shadow}`
            ]
          } : {
            scale: 1,
            boxShadow: `0 4px 12px ${colors.shadow}`
          }}
          transition={{
            duration: 1.5,
            delay: 0.4,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
};

// Modern Enhanced HERA Logo - Version 2: Orange as Crossbar
export const HERAModernLogo: React.FC<HERALogoProps> = ({
  size = 'md',
  theme = 'light',
  animated = false,
  className = ''
}) => {
  const config = {
    sm: { container: 'h-8', text: 'text-2xl' },
    md: { container: 'h-10', text: 'text-3xl' },
    lg: { container: 'h-12', text: 'text-4xl' },
    xl: { container: 'h-16', text: 'text-5xl' }
  }[size];

  const themeConfig = {
    light: {
      primary: '#1a1a1a',
      orange: '#ff5722',
      shadow: 'rgba(255, 87, 34, 0.3)'
    },
    dark: {
      primary: '#ffffff',
      orange: '#ff7043',
      shadow: 'rgba(255, 112, 67, 0.3)'
    }
  };

  const colors = themeConfig[theme];

  return (
    <motion.div
      className={`${config.container} flex items-center ${className}`}
      initial={animated ? { opacity: 0, y: -10 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={animated ? { duration: 0.5, ease: [0.25, 0.25, 0, 1] } : undefined}
    >
      <div className="relative">
        <span
          className={`${config.text} font-bold relative`}
          style={{ 
            fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: colors.primary
          }}
        >
          HE
          <span className="relative inline-block">
            R
            <motion.div
              className="absolute left-0 top-1/2 w-full h-0.5 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${colors.orange} 0%, #ff6b35 100%)`,
                boxShadow: `0 0 8px ${colors.shadow}`
              }}
              initial={animated ? { scaleX: 0 } : undefined}
              animate={animated ? { scaleX: 1 } : undefined}
              transition={animated ? { duration: 0.6, delay: 0.3, ease: "easeOut" } : undefined}
            />
          </span>
          A
        </span>
      </div>
    </motion.div>
  );
};

// Modern Enhanced HERA Logo - Version 3: Geometric Orange Square
export const HERAGeometricLogo: React.FC<HERALogoProps> = ({
  size = 'md',
  theme = 'light',
  animated = false,
  className = ''
}) => {
  const config = {
    sm: { container: 'h-8', text: 'text-2xl', square: 'w-4 h-4' },
    md: { container: 'h-10', text: 'text-3xl', square: 'w-5 h-5' },
    lg: { container: 'h-12', text: 'text-4xl', square: 'w-6 h-6' },
    xl: { container: 'h-16', text: 'text-5xl', square: 'w-8 h-8' }
  }[size];

  const themeConfig = {
    light: {
      primary: '#1a1a1a',
      orange: '#ff5722',
      shadow: 'rgba(255, 87, 34, 0.2)'
    },
    dark: {
      primary: '#ffffff',
      orange: '#ff7043',
      shadow: 'rgba(255, 112, 67, 0.2)'
    }
  };

  const colors = themeConfig[theme];

  return (
    <motion.div
      className={`${config.container} flex items-center gap-3 ${className}`}
      initial={animated ? { opacity: 0, scale: 0.9 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      transition={animated ? { duration: 0.6, ease: [0.25, 0.25, 0, 1] } : undefined}
    >
      <motion.div
        className={`${config.square} rounded-lg shadow-md`}
        style={{
          background: `linear-gradient(135deg, ${colors.orange} 0%, #ff6b35 100%)`,
          boxShadow: `0 4px 12px ${colors.shadow}`
        }}
        initial={animated ? { rotate: -90, scale: 0 } : undefined}
        animate={animated ? { rotate: 0, scale: 1 } : undefined}
        transition={animated ? { duration: 0.8, delay: 0.2, ease: "backOut" } : undefined}
      />
      <span
        className={`${config.text} font-bold`}
        style={{ 
          fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: colors.primary
        }}
      >
        HERA
      </span>
    </motion.div>
  );
};

// Minimal monogram for tight spaces
export const HERAMonogram: React.FC<HERALogoProps> = ({
  size = 'md',
  theme = 'colored',
  animated = false,
  className = ''
}) => {
  const config = {
    sm: { container: 'w-8 h-8', text: 'text-lg' },
    md: { container: 'w-10 h-10', text: 'text-xl' },
    lg: { container: 'w-12 h-12', text: 'text-2xl' },
    xl: { container: 'w-16 h-16', text: 'text-3xl' }
  }[size];

  const colors = {
    light: 'bg-white text-slate-800 border-slate-200',
    dark: 'bg-slate-800 text-white border-slate-600',
    colored: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-400'
  }[theme];

  return (
    <motion.div
      className={`${config.container} ${colors} rounded-lg border shadow-sm flex items-center justify-center ${className}`}
      initial={animated ? { opacity: 0, rotate: -180, scale: 0 } : undefined}
      animate={animated ? { opacity: 1, rotate: 0, scale: 1 } : undefined}
      transition={animated ? { 
        duration: 0.8, 
        ease: [0.25, 0.25, 0, 1],
        type: "spring",
        stiffness: 200,
        damping: 20
      } : undefined}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span
        className={`${config.text} text-black font-bold`}
        style={{ 
          fontFamily: '"Helvetica Neue", "Arial", system-ui, sans-serif',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#000000'
        }}
      >
        H
      </span>
    </motion.div>
  );
};

// Usage guidelines component for design system
export const HERALogoUsage = () => {
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-6" style={{ fontFamily: RESTAURANT_TYPOGRAPHY.fontFamilies.display }}>
        HERA Logo System 2.0 - Enhanced Design
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Logo Variants */}
        <div>
          <h3 className="text-xl font-semibold text-slate-700 mb-6">Enhanced Logo Variants</h3>
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
              <div className="mb-3 text-sm font-medium text-slate-600">Original Enterprise Mark (Enhanced)</div>
              <div className="flex items-center gap-6">
                <HERAEnterpriseMarkLogo size="lg" theme="light" animated />
                <div className="p-4 bg-slate-800 rounded-lg">
                  <HERAEnterpriseMarkLogo size="lg" theme="dark" animated />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Enhanced with gradient R and better typography</p>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
              <div className="mb-3 text-sm font-medium text-slate-600">Modern Logo (Orange Crossbar)</div>
              <div className="flex items-center gap-6">
                <HERAModernLogo size="lg" theme="light" animated />
                <div className="p-4 bg-slate-800 rounded-lg">
                  <HERAModernLogo size="lg" theme="dark" animated />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Orange integrated as crossbar in the R</p>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
              <div className="mb-3 text-sm font-medium text-slate-600">Geometric Logo (Orange Square)</div>
              <div className="flex items-center gap-6">
                <HERAGeometricLogo size="lg" theme="light" animated />
                <div className="p-4 bg-slate-800 rounded-lg">
                  <HERAGeometricLogo size="lg" theme="dark" animated />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Geometric orange square as brand element</p>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
              <div className="mb-3 text-sm font-medium text-slate-600">Full Logo with Tagline</div>
              <HERALogo variant="full" size="lg" animated />
              <p className="text-xs text-slate-500 mt-2">Complete brand identity with tagline</p>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
              <div className="mb-3 text-sm font-medium text-slate-600">Monogram for Small Spaces</div>
              <HERAMonogram size="lg" animated />
              <p className="text-xs text-slate-500 mt-2">Compact version for favicons and small contexts</p>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div>
          <h3 className="text-xl font-semibold text-slate-700 mb-6">Usage Guidelines</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Primary Applications</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Enterprise Mark:</strong> POS systems, dashboards, main headers</li>
                <li>• <strong>Modern Logo:</strong> Modern interfaces, mobile apps</li>
                <li>• <strong>Geometric Logo:</strong> Marketing materials, presentations</li>
                <li>• <strong>Full Logo:</strong> Landing pages, brand materials</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Technical Specifications</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• <strong>Typography:</strong> Inter, SF Pro Display system fonts</li>
                <li>• <strong>Orange Gradient:</strong> #ff5722 to #ff6b35</li>
                <li>• <strong>Dark Mode:</strong> Automatic theme switching</li>
                <li>• <strong>Animation:</strong> Smooth 60fps transitions</li>
              </ul>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Size Guidelines</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• <strong>Small (sm):</strong> 32px height - Mobile navigation</li>
                <li>• <strong>Medium (md):</strong> 40px height - Desktop headers</li>
                <li>• <strong>Large (lg):</strong> 48px height - Main branding</li>
                <li>• <strong>XL (xl):</strong> 64px height - Hero sections</li>
              </ul>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg">
              <h4 className="font-semibold text-amber-800 mb-2">Do's & Don'ts</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• <strong>DO:</strong> Use consistent letter spacing (0.06-0.08em)</li>
                <li>• <strong>DO:</strong> Maintain orange element in all versions</li>
                <li>• <strong>DON'T:</strong> Stretch or distort the logo</li>
                <li>• <strong>DON'T:</strong> Use on backgrounds with insufficient contrast</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Evolution */}
      <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-slate-50 rounded-lg border">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Brand Evolution 2.0</h3>
        <p className="text-slate-700 leading-relaxed mb-4">
          The enhanced HERA logo system builds upon the original design while introducing modern typography, 
          better integration of the orange brand element, and improved accessibility. The new system offers 
          three distinct approaches to incorporating the orange element - as a gradient letter, crossbar, or 
          geometric shape - providing flexibility while maintaining brand consistency.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-white rounded border">
            <strong className="text-slate-800">Typography:</strong> 
            <span className="text-slate-600"> Modern Inter/SF Pro Display with optimized spacing</span>
          </div>
          <div className="p-3 bg-white rounded border">
            <strong className="text-slate-800">Color:</strong> 
            <span className="text-slate-600"> Enhanced orange gradients with better accessibility</span>
          </div>
          <div className="p-3 bg-white rounded border">
            <strong className="text-slate-800">Animation:</strong> 
            <span className="text-slate-600"> Smooth, intentional micro-interactions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HERALogo;