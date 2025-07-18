/**
 * HERA Universal Frontend Template - Responsive Breakpoints
 * Mobile-first responsive design system
 */

import React from 'react'

// Breakpoint definitions following Tailwind CSS standards
export const breakpoints = {
  xs: '0px',      // Extra small devices (portrait phones)
  sm: '640px',    // Small devices (landscape phones)
  md: '768px',    // Medium devices (tablets)
  lg: '1024px',   // Large devices (laptops)
  xl: '1280px',   // Extra large devices (desktops)
  '2xl': '1536px' // 2X large devices (large desktops)
} as const

// Numeric breakpoints for calculations
export const breakpointsNumeric = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

// Container max widths
export const containerMaxWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const

// Media query generators
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs})`,
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
  
  // Max-width queries
  'max-xs': `(max-width: ${breakpointsNumeric.sm - 1}px)`,
  'max-sm': `(max-width: ${breakpointsNumeric.md - 1}px)`,
  'max-md': `(max-width: ${breakpointsNumeric.lg - 1}px)`,
  'max-lg': `(max-width: ${breakpointsNumeric.xl - 1}px)`,
  'max-xl': `(max-width: ${breakpointsNumeric['2xl'] - 1}px)`,
  
  // Range queries
  'sm-only': `(min-width: ${breakpoints.sm}) and (max-width: ${breakpointsNumeric.md - 1}px)`,
  'md-only': `(min-width: ${breakpoints.md}) and (max-width: ${breakpointsNumeric.lg - 1}px)`,
  'lg-only': `(min-width: ${breakpoints.lg}) and (max-width: ${breakpointsNumeric.xl - 1}px)`,
  'xl-only': `(min-width: ${breakpoints.xl}) and (max-width: ${breakpointsNumeric['2xl'] - 1}px)`,
  
  // Device-specific queries
  mobile: `(max-width: ${breakpointsNumeric.md - 1}px)`,
  tablet: `(min-width: ${breakpoints.md}) and (max-width: ${breakpointsNumeric.lg - 1}px)`,
  desktop: `(min-width: ${breakpoints.lg})`,
  
  // Orientation queries
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  
  // Touch device queries
  touch: '(hover: none) and (pointer: coarse)',
  'no-touch': '(hover: hover) and (pointer: fine)',
  
  // High DPI queries
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
  
  // Reduced motion
  'reduced-motion': '(prefers-reduced-motion: reduce)',
  
  // Dark mode
  'dark-mode': '(prefers-color-scheme: dark)',
  'light-mode': '(prefers-color-scheme: light)'
} as const

// Hook for detecting current breakpoint
export const useBreakpoint = () => {
  if (typeof window === 'undefined') {
    return { current: 'lg', isMobile: false, isTablet: false, isDesktop: true }
  }

  const getCurrentBreakpoint = () => {
    const width = window.innerWidth
    
    if (width >= breakpointsNumeric['2xl']) return '2xl'
    if (width >= breakpointsNumeric.xl) return 'xl'
    if (width >= breakpointsNumeric.lg) return 'lg'
    if (width >= breakpointsNumeric.md) return 'md'
    if (width >= breakpointsNumeric.sm) return 'sm'
    return 'xs'
  }

  const [breakpoint, setBreakpoint] = React.useState(getCurrentBreakpoint())

  React.useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getCurrentBreakpoint())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    current: breakpoint,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isSmall: breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md',
    isLarge: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl'
  }
}

// Utility function to check if current width is above a breakpoint
export const isAboveBreakpoint = (bp: keyof typeof breakpointsNumeric): boolean => {
  if (typeof window === 'undefined') return true
  return window.innerWidth >= breakpointsNumeric[bp]
}

// Utility function to check if current width is below a breakpoint
export const isBelowBreakpoint = (bp: keyof typeof breakpointsNumeric): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < breakpointsNumeric[bp]
}

// CSS-in-JS media query helper
export const mq = (bp: keyof typeof mediaQueries) => `@media ${mediaQueries[bp]}`

// Responsive spacing scale
export const responsiveSpacing = {
  xs: { base: '1rem', sm: '1.5rem', md: '2rem', lg: '3rem' },
  sm: { base: '1.5rem', sm: '2rem', md: '3rem', lg: '4rem' },
  md: { base: '2rem', sm: '3rem', md: '4rem', lg: '6rem' },
  lg: { base: '3rem', sm: '4rem', md: '6rem', lg: '8rem' },
  xl: { base: '4rem', sm: '6rem', md: '8rem', lg: '12rem' }
} as const

// Responsive font sizes
export const responsiveFontSizes = {
  xs: { base: '0.75rem', sm: '0.75rem', md: '0.875rem' },
  sm: { base: '0.875rem', sm: '0.875rem', md: '1rem' },
  base: { base: '1rem', sm: '1rem', md: '1.125rem' },
  lg: { base: '1.125rem', sm: '1.25rem', md: '1.5rem' },
  xl: { base: '1.25rem', sm: '1.5rem', md: '1.875rem' },
  '2xl': { base: '1.5rem', sm: '1.875rem', md: '2.25rem' },
  '3xl': { base: '1.875rem', sm: '2.25rem', md: '3rem' },
  '4xl': { base: '2.25rem', sm: '3rem', md: '3.75rem' }
} as const

// Grid system configuration
export const gridSystem = {
  columns: 12,
  gutter: {
    xs: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2.5rem',
    xl: '3rem'
  },
  container: {
    padding: {
      xs: '1rem',
      sm: '1.5rem',
      md: '2rem',
      lg: '2rem',
      xl: '2rem'
    }
  }
} as const

// Common responsive patterns
export const responsivePatterns = {
  // Stack on mobile, side-by-side on desktop
  stackToRow: {
    mobile: 'flex flex-col space-y-4',
    desktop: 'flex flex-row space-x-4 space-y-0'
  },
  
  // Hide on mobile, show on desktop
  hideOnMobile: {
    mobile: 'hidden',
    desktop: 'block'
  },
  
  // Show on mobile, hide on desktop  
  showOnMobile: {
    mobile: 'block',
    desktop: 'hidden'
  },
  
  // Full width on mobile, constrained on desktop
  fullWidthToConstrained: {
    mobile: 'w-full',
    desktop: 'max-w-4xl mx-auto'
  },
  
  // Single column on mobile, grid on desktop
  singleToGrid: {
    mobile: 'grid grid-cols-1 gap-4',
    desktop: 'grid grid-cols-2 lg:grid-cols-3 gap-6'
  }
} as const

export default {
  breakpoints,
  breakpointsNumeric,
  containerMaxWidths,
  mediaQueries,
  useBreakpoint,
  isAboveBreakpoint,
  isBelowBreakpoint,
  mq,
  responsiveSpacing,
  responsiveFontSizes,
  gridSystem,
  responsivePatterns
}