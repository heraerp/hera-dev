/**
 * HERA Universal - Smooth Animations Library
 * Revolutionary animation system with physics-based spring curves and mobile optimization
 */

import React from 'react'
import { Variants, Transition, MotionValue, useSpring, useTransform } from 'framer-motion'

// ============================================================================
// PHYSICS-BASED SPRING CONFIGURATIONS
// ============================================================================

export const springConfig = {
  // Ultra-smooth spring for premium feel
  gentle: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },
  
  // Snappy but smooth for interactions
  responsive: {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
    mass: 0.6,
  },
  
  // Bouncy for delightful feedback
  bouncy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 20,
    mass: 0.5,
  },
  
  // Smooth for mobile (reduced motion)
  mobile: {
    type: "spring" as const,
    stiffness: 250,
    damping: 35,
    mass: 1.0,
  },
}

// ============================================================================
// EASING CURVES FOR DIFFERENT CONTEXTS
// ============================================================================

export const easings = {
  // Natural easing for organic feel
  natural: [0.25, 0.1, 0.25, 1],
  
  // Sharp easing for modern feel
  sharp: [0.4, 0, 0.2, 1],
  
  // Smooth easing for mobile
  smooth: [0.2, 0, 0.2, 1],
  
  // Elastic for playful interactions
  elastic: [0.68, -0.55, 0.265, 1.55],
}

// ============================================================================
// MOBILE-OPTIMIZED TRANSITIONS
// ============================================================================

export const createMobileTransition = (
  baseTransition: Transition,
  isMobile: boolean
): Transition => {
  if (isMobile) {
    return {
      ...baseTransition,
      duration: (baseTransition.duration || 0.3) * 0.8, // 20% faster on mobile
      ease: easings.smooth,
    }
  }
  return baseTransition
}

// ============================================================================
// UNIVERSAL ANIMATION VARIANTS
// ============================================================================

export const fadeInOut: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springConfig.gentle,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      ...springConfig.gentle,
      duration: 0.2,
    },
  },
}

export const slideUp: Variants = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: springConfig.responsive,
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: {
      ...springConfig.responsive,
      duration: 0.2,
    },
  },
}

export const slideDown: Variants = {
  initial: {
    y: -20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: springConfig.responsive,
  },
  exit: {
    y: 20,
    opacity: 0,
    transition: {
      ...springConfig.responsive,
      duration: 0.2,
    },
  },
}

export const slideLeft: Variants = {
  initial: {
    x: 20,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: springConfig.responsive,
  },
  exit: {
    x: -20,
    opacity: 0,
    transition: {
      ...springConfig.responsive,
      duration: 0.2,
    },
  },
}

export const slideRight: Variants = {
  initial: {
    x: -20,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: springConfig.responsive,
  },
  exit: {
    x: 20,
    opacity: 0,
    transition: {
      ...springConfig.responsive,
      duration: 0.2,
    },
  },
}

// ============================================================================
// MODAL & OVERLAY ANIMATIONS
// ============================================================================

export const modalOverlay: Variants = {
  initial: {
    opacity: 0,
    backdropFilter: "blur(0px)",
  },
  animate: {
    opacity: 1,
    backdropFilter: "blur(8px)",
    transition: {
      duration: 0.3,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: {
      duration: 0.2,
      ease: easings.smooth,
    },
  },
}

export const modalContent: Variants = {
  initial: {
    scale: 0.9,
    opacity: 0,
    y: 20,
  },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: springConfig.gentle,
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    y: 10,
    transition: {
      ...springConfig.gentle,
      duration: 0.2,
    },
  },
}

// ============================================================================
// MOBILE-SPECIFIC ANIMATIONS
// ============================================================================

export const mobileSlideUp: Variants = {
  initial: {
    y: "100%",
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: springConfig.mobile,
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      ...springConfig.mobile,
      duration: 0.25,
    },
  },
}

export const mobileDrawer: Variants = {
  initial: {
    x: "-100%",
  },
  animate: {
    x: 0,
    transition: springConfig.mobile,
  },
  exit: {
    x: "-100%",
    transition: {
      ...springConfig.mobile,
      duration: 0.25,
    },
  },
}

// ============================================================================
// STAGGERED ANIMATIONS FOR LISTS
// ============================================================================

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: springConfig.gentle,
  },
}

// ============================================================================
// BUTTON & INTERACTION ANIMATIONS
// ============================================================================

export const buttonPress: Variants = {
  initial: {
    scale: 1,
  },
  whileTap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: easings.sharp,
    },
  },
  whileHover: {
    scale: 1.02,
    transition: springConfig.responsive,
  },
}

export const buttonHover: Variants = {
  initial: {
    scale: 1,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  whileHover: {
    scale: 1.02,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    transition: springConfig.responsive,
  },
  whileTap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
}

// ============================================================================
// FORM ANIMATIONS
// ============================================================================

export const formField: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: springConfig.gentle,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
}

export const formError: Variants = {
  initial: {
    opacity: 0,
    height: 0,
    y: -10,
  },
  animate: {
    opacity: 1,
    height: "auto",
    y: 0,
    transition: springConfig.gentle,
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
}

// ============================================================================
// CARD ANIMATIONS
// ============================================================================

export const cardHover: Variants = {
  initial: {
    scale: 1,
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  },
  whileHover: {
    scale: 1.02,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: springConfig.responsive,
  },
}

export const cardPress: Variants = {
  whileTap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
}

// ============================================================================
// LOADING ANIMATIONS
// ============================================================================

export const loadingSpinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

export const loadingPulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: easings.smooth,
    },
  },
}

// ============================================================================
// NOTIFICATION ANIMATIONS
// ============================================================================

export const notificationSlide: Variants = {
  initial: {
    x: "100%",
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: springConfig.responsive,
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: easings.sharp,
    },
  },
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const createStagger = (count: number, delay: number = 0.1) => ({
  animate: {
    transition: {
      staggerChildren: delay,
      delayChildren: delay,
    },
  },
})

export const createDelayedAnimation = (
  variants: Variants,
  delay: number
): Variants => ({
  ...variants,
  animate: {
    ...variants.animate,
    transition: {
      ...variants.animate.transition,
      delay,
    },
  },
})

// ============================================================================
// MOBILE DETECTION & OPTIMIZATION
// ============================================================================

export const isMobile = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

export const useResponsiveAnimation = (
  desktopVariant: Variants,
  mobileVariant: Variants
) => {
  const mobile = isMobile()
  return mobile ? mobileVariant : desktopVariant
}

// ============================================================================
// PERFORMANCE OPTIMIZATIONS
// ============================================================================

export const performanceConfig = {
  // Reduce motion for better performance
  reducedMotion: {
    initial: false,
    animate: { transition: { duration: 0.01 } },
  },
  
  // GPU acceleration hints
  willChange: {
    transform: true,
    opacity: true,
  },
}

// ============================================================================
// ADVANCED INTERACTION ANIMATIONS
// ============================================================================

export const magneticButton: Variants = {
  initial: {
    scale: 1,
    x: 0,
    y: 0,
  },
  hover: {
    scale: 1.05,
    transition: springConfig.responsive,
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: easings.sharp,
    },
  },
}

export const floatingCard: Variants = {
  initial: {
    y: 0,
    scale: 1,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: springConfig.gentle,
  },
  tap: {
    y: -2,
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
}

export const pulsatingButton: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: easings.natural,
    },
  },
  hover: {
    scale: 1.1,
    transition: springConfig.responsive,
  },
}

// ============================================================================
// MOBILE-SPECIFIC GESTURE ANIMATIONS
// ============================================================================

export const swipeToDelete: Variants = {
  initial: {
    x: 0,
    opacity: 1,
  },
  swipeLeft: {
    x: -100,
    opacity: 0.7,
    transition: {
      duration: 0.3,
      ease: easings.sharp,
    },
  },
  swipeRight: {
    x: 100,
    opacity: 0.7,
    transition: {
      duration: 0.3,
      ease: easings.sharp,
    },
  },
  delete: {
    x: -300,
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.4,
      ease: easings.sharp,
    },
  },
}

export const pullToRefresh: Variants = {
  initial: {
    y: 0,
    rotate: 0,
  },
  pulling: {
    y: 60,
    rotate: 180,
    transition: {
      duration: 0.3,
      ease: easings.elastic,
    },
  },
  refreshing: {
    y: 60,
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

export const touchRipple: Variants = {
  initial: {
    scale: 0,
    opacity: 0.5,
  },
  animate: {
    scale: 4,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: easings.natural,
    },
  },
}

// ============================================================================
// COMPLEX LAYOUT ANIMATIONS
// ============================================================================

export const accordionContent: Variants = {
  initial: {
    height: 0,
    opacity: 0,
  },
  animate: {
    height: "auto",
    opacity: 1,
    transition: {
      height: {
        duration: 0.4,
        ease: easings.natural,
      },
      opacity: {
        duration: 0.2,
        delay: 0.1,
      },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: 0.3,
        ease: easings.sharp,
      },
      opacity: {
        duration: 0.1,
      },
    },
  },
}

export const tabContent: Variants = {
  initial: {
    x: 10,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.natural,
    },
  },
  exit: {
    x: -10,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: easings.sharp,
    },
  },
}

export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easings.natural,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: easings.sharp,
    },
  },
}

// ============================================================================
// PERFORMANCE OPTIMIZED ANIMATIONS
// ============================================================================

export const gpuOptimized: Variants = {
  initial: {
    opacity: 0,
    transform: "translateZ(0) scale(0.95)",
  },
  animate: {
    opacity: 1,
    transform: "translateZ(0) scale(1)",
    transition: springConfig.responsive,
  },
  exit: {
    opacity: 0,
    transform: "translateZ(0) scale(0.95)",
    transition: {
      duration: 0.2,
    },
  },
}

export const createOptimizedStagger = (itemCount: number) => ({
  animate: {
    transition: {
      staggerChildren: Math.min(0.1, 0.5 / itemCount), // Optimize stagger for large lists
      delayChildren: 0.1,
    },
  },
})

// ============================================================================
// RESPONSIVE ANIMATION HELPERS
// ============================================================================

export const createResponsiveAnimation = (
  animation: Variants,
  mobileOverrides: Partial<Variants> = {}
): Variants => {
  const mobile = isMobile()
  if (mobile) {
    return {
      ...animation,
      ...mobileOverrides,
      animate: {
        ...animation.animate,
        ...mobileOverrides.animate,
        transition: createMobileTransition(
          animation.animate?.transition || springConfig.gentle,
          true
        ),
      },
    }
  }
  return animation
}

export const createAccessibleAnimation = (
  animation: Variants,
  reducedMotion: boolean = false
): Variants => {
  if (reducedMotion) {
    return {
      ...animation,
      animate: {
        ...animation.animate,
        transition: {
          duration: 0.01,
        },
      },
    }
  }
  return animation
}

// ============================================================================
// CUSTOM HOOKS FOR ANIMATIONS
// ============================================================================

export const useAnimationControls = () => {
  const [isAnimating, setIsAnimating] = React.useState(false)
  const [animationQueue, setAnimationQueue] = React.useState<string[]>([])
  
  const startAnimation = (animationName: string) => {
    setIsAnimating(true)
    setAnimationQueue(prev => [...prev, animationName])
  }
  
  const endAnimation = (animationName: string) => {
    setAnimationQueue(prev => prev.filter(name => name !== animationName))
    if (animationQueue.length <= 1) {
      setIsAnimating(false)
    }
  }
  
  return { isAnimating, animationQueue, startAnimation, endAnimation }
}

// ============================================================================
// EXPORT ALL ANIMATIONS
// ============================================================================

export const animations = {
  // Basic animations
  fadeInOut,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  
  // Modal animations
  modalOverlay,
  modalContent,
  
  // Mobile animations
  mobileSlideUp,
  mobileDrawer,
  
  // Stagger animations
  staggerContainer,
  staggerItem,
  
  // Button animations
  buttonPress,
  buttonHover,
  magneticButton,
  pulsatingButton,
  
  // Form animations
  formField,
  formError,
  
  // Card animations
  cardHover,
  cardPress,
  floatingCard,
  
  // Loading animations
  loadingSpinner,
  loadingPulse,
  
  // Notification animations
  notificationSlide,
  
  // Mobile gestures
  swipeToDelete,
  pullToRefresh,
  touchRipple,
  
  // Layout animations
  accordionContent,
  tabContent,
  pageTransition,
  
  // Performance optimized
  gpuOptimized,
}

export default animations