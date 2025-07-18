/**
 * HERA Universal - Responsive Design Hook
 * Provides responsive breakpoints and mobile detection
 */

import { useState, useEffect } from 'react'

export interface ResponsiveBreakpoints {
  xs: boolean    // < 480px
  sm: boolean    // 480px - 768px
  md: boolean    // 768px - 1024px
  lg: boolean    // 1024px - 1280px
  xl: boolean    // 1280px+
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export const useResponsive = (): ResponsiveBreakpoints => {
  const [breakpoints, setBreakpoints] = useState<ResponsiveBreakpoints>({
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  })

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth
      
      const newBreakpoints: ResponsiveBreakpoints = {
        xs: width < 480,
        sm: width >= 480 && width < 768,
        md: width >= 768 && width < 1024,
        lg: width >= 1024 && width < 1280,
        xl: width >= 1280,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      }
      
      setBreakpoints(newBreakpoints)
    }

    // Initial check
    updateBreakpoints()

    // Add event listener
    window.addEventListener('resize', updateBreakpoints)

    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoints)
  }, [])

  return breakpoints
}

// Touch device detection
export const useTouch = () => {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      )
    }

    checkTouch()
    window.addEventListener('resize', checkTouch)
    return () => window.removeEventListener('resize', checkTouch)
  }, [])

  return isTouch
}

// Device orientation
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    return () => window.removeEventListener('resize', updateOrientation)
  }, [])

  return orientation
}

// Viewport dimensions
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  return viewport
}

export default useResponsive