// === HERA REVOLUTIONARY MOTION SYSTEM ===
// Physics-based animations that feel natural and delightful

import { Variants, Transition, MotionValue, useSpring, useTransform } from "framer-motion"

// === PHYSICS-BASED ANIMATION CURVES ===

export const springPresets = {
  // Gentle and organic
  gentle: {
    type: "spring" as const,
    stiffness: 120,
    damping: 14,
    mass: 0.8,
  },
  
  // Smooth and professional
  smooth: {
    type: "spring" as const,
    stiffness: 200,
    damping: 18,
    mass: 0.6,
  },
  
  // Quick and responsive
  swift: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    mass: 0.4,
  },
  
  // Bouncy and playful
  bounce: {
    type: "spring" as const,
    stiffness: 400,
    damping: 12,
    mass: 0.3,
  },
  
  // Elastic and satisfying
  elastic: {
    type: "spring" as const,
    stiffness: 600,
    damping: 15,
    mass: 0.2,
  },
  
  // Dramatic and attention-grabbing
  dramatic: {
    type: "spring" as const,
    stiffness: 100,
    damping: 8,
    mass: 1.2,
  },
} as const

export const easingCurves = {
  // Natural easing functions
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  
  // Custom curves for specific interactions
  anticipate: [0.68, -0.55, 0.265, 1.55],
  backOut: [0.34, 1.56, 0.64, 1],
  circOut: [0, 0.55, 0.45, 1],
  
  // ERP-specific curves
  dataEntry: [0.25, 0.1, 0.25, 1],
  navigation: [0.4, 0, 0.6, 1],
  feedback: [0.68, -0.55, 0.265, 1.55],
} as const

// === MICRO-INTERACTION VARIANTS ===

export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springPresets.smooth,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: springPresets.swift,
  },
}

export const slideVariants: Variants = {
  hiddenLeft: {
    x: -50,
    opacity: 0,
  },
  hiddenRight: {
    x: 50,
    opacity: 0,
  },
  hiddenUp: {
    y: -50,
    opacity: 0,
  },
  hiddenDown: {
    y: 50,
    opacity: 0,
  },
  visible: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: springPresets.smooth,
  },
  exit: {
    x: -50,
    opacity: 0,
    transition: springPresets.swift,
  },
}

export const scaleVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: springPresets.bounce,
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: springPresets.swift,
  },
}

export const morphVariants: Variants = {
  idle: {
    borderRadius: "8px",
    scale: 1,
  },
  hover: {
    borderRadius: "16px",
    scale: 1.02,
    transition: springPresets.gentle,
  },
  tap: {
    borderRadius: "12px",
    scale: 0.98,
    transition: springPresets.swift,
  },
}

// === REVOLUTIONARY STAGGER ANIMATIONS ===

export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: "afterChildren",
    },
  },
}

export const staggerItem: Variants = {
  hidden: {
    y: 20,
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: springPresets.smooth,
  },
  exit: {
    y: -20,
    opacity: 0,
    scale: 0.95,
    transition: springPresets.swift,
  },
}

// === LOADING & SHIMMER ANIMATIONS ===

export const shimmerVariants: Variants = {
  initial: {
    backgroundPosition: "-200px 0",
  },
  animate: {
    backgroundPosition: "calc(200px + 100%) 0",
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

export const pulseVariants: Variants = {
  initial: {
    opacity: 1,
  },
  animate: {
    opacity: 0.5,
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  },
}

export const spinVariants: Variants = {
  initial: {
    rotate: 0,
  },
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

// === ADVANCED GESTURE ANIMATIONS ===

export const magneticVariants = {
  rest: {
    x: 0,
    y: 0,
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: springPresets.gentle,
  },
}

export const tiltVariants = {
  rest: {
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: springPresets.gentle,
  },
}

// === DATA VISUALIZATION ANIMATIONS ===

export const chartVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        mass: 0.5,
      },
      opacity: {
        duration: 0.5,
      },
    },
  },
}

export const barVariants: Variants = {
  hidden: {
    scaleY: 0,
    originY: 1,
  },
  visible: (i: number) => ({
    scaleY: 1,
    transition: {
      delay: i * 0.1,
      ...springPresets.bounce,
    },
  }),
}

export const numberCounterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: springPresets.smooth,
  },
}

// === CONTEXTUAL ANIMATIONS ===

export const errorVariants: Variants = {
  initial: {
    x: 0,
  },
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
}

export const successVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 0,
  },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0, 1, 1],
    transition: {
      duration: 0.6,
      times: [0, 0.5, 1],
      ease: "easeOut",
    },
  },
}

export const warningVariants: Variants = {
  initial: {
    scale: 1,
  },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

// === LAYOUT ANIMATIONS ===

export const expandVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: "hidden",
  },
  expanded: {
    height: "auto",
    opacity: 1,
    overflow: "visible",
    transition: {
      height: springPresets.smooth,
      opacity: {
        delay: 0.1,
        duration: 0.3,
      },
    },
  },
}

export const accordionVariants: Variants = {
  closed: {
    height: 0,
    opacity: 0,
  },
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      height: springPresets.smooth,
      opacity: {
        delay: 0.1,
        duration: 0.2,
      },
    },
  },
}

// === UTILITY FUNCTIONS ===

export const createSpring = (stiffness: number, damping: number, mass = 1) => ({
  type: "spring" as const,
  stiffness,
  damping,
  mass,
})

export const createTween = (duration: number, ease: keyof typeof easingCurves = "easeInOut") => ({
  type: "tween" as const,
  duration,
  ease: easingCurves[ease],
})

export const delayedTransition = (delay: number, transition: Transition = springPresets.smooth) => ({
  ...transition,
  delay,
})

// === MAGNETIC INTERACTION UTILITIES ===

export const useMagneticInteraction = (strength = 1) => {
  const x = useSpring(0, springPresets.gentle)
  const y = useSpring(0, springPresets.gentle)
  
  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (event.clientX - centerX) * strength * 0.2
    const deltaY = (event.clientY - centerY) * strength * 0.2
    
    x.set(deltaX)
    y.set(deltaY)
  }
  
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }
  
  return {
    x,
    y,
    handleMouseMove,
    handleMouseLeave,
  }
}

// === PARALLAX UTILITIES ===

export const useParallax = (scrollY: MotionValue<number>, speed = 1) => {
  return useTransform(scrollY, [0, 1000], [0, -1000 * speed])
}

export const useParallaxRotation = (scrollY: MotionValue<number>, speed = 1) => {
  return useTransform(scrollY, [0, 1000], [0, 360 * speed])
}

// === PERFORMANCE OPTIMIZATIONS ===

export const layoutTransition: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.5,
}

export const exitTransition: Transition = {
  type: "tween",
  duration: 0.2,
  ease: "easeIn",
}

// === ANIMATION PRESETS FOR COMMON ERP INTERACTIONS ===

export const erpAnimations = {
  // Form field focus
  fieldFocus: {
    scale: 1.02,
    borderRadius: "6px",
    transition: springPresets.swift,
  },
  
  // Button press
  buttonPress: {
    scale: 0.95,
    transition: springPresets.swift,
  },
  
  // Card hover
  cardHover: {
    y: -4,
    scale: 1.01,
    transition: springPresets.gentle,
  },
  
  // Navigation transition
  pageTransition: {
    x: "100%",
    opacity: 0,
    transition: springPresets.smooth,
  },
  
  // Modal appearance
  modalAppear: {
    scale: 0.9,
    opacity: 0,
    y: 20,
    transition: springPresets.bounce,
  },
  
  // Data refresh
  dataRefresh: {
    rotateY: 180,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
  
  // Status change
  statusChange: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.3,
      times: [0, 0.5, 1],
    },
  },
} as const

export default {
  spring: springPresets,
  easing: easingCurves,
  variants: {
    fade: fadeVariants,
    slide: slideVariants,
    scale: scaleVariants,
    morph: morphVariants,
    stagger: { container: staggerContainer, item: staggerItem },
    shimmer: shimmerVariants,
    pulse: pulseVariants,
    spin: spinVariants,
    magnetic: magneticVariants,
    tilt: tiltVariants,
    chart: chartVariants,
    bar: barVariants,
    counter: numberCounterVariants,
    error: errorVariants,
    success: successVariants,
    warning: warningVariants,
    expand: expandVariants,
    accordion: accordionVariants,
  },
  utils: {
    createSpring,
    createTween,
    delayedTransition,
    useMagneticInteraction,
    useParallax,
    useParallaxRotation,
  },
  erp: erpAnimations,
}