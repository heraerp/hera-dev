"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useAdaptiveColor } from "@/hooks/use-adaptive-color"
import { useTheme } from "@/components/providers/theme-provider"

// === REVOLUTIONARY CARD SYSTEM ===

const cardVariants = cva(
  [
    // Base foundation
    "dashboard-card",
    "relative",
    "overflow-hidden",
    "bg-card",
    "border",
    "border-border",
    "text-card-foreground",
    "transition-all",
    "duration-normal",
    "ease-spring-smooth",
    "group",
    
    // Performance optimizations
    "gpu-accelerated",
    "content-visibility-auto",
    
    // Advanced interactions
    "hover:shadow-prominent",
    "hover:border-primary/20",
    "focus-within:ring-2",
    "focus-within:ring-ring",
    "focus-within:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-card",
          "border-border",
        ],
        elevated: [
          "bg-card",
          "border-border",
          "shadow-gentle",
          "hover:shadow-moderate",
        ],
        glass: [
          "glass-moderate",
          "border-border/50",
          "backdrop-blur-lg",
        ],
        gradient: [
          "bg-gradient-to-br",
          "from-card",
          "via-card",
          "to-accent/5",
          "border-gradient",
        ],
        contextual: [
          "border-2",
          "border-primary/20",
          "bg-gradient-to-br",
          "from-primary/5",
          "to-transparent",
        ],
        interactive: [
          "cursor-pointer",
          "hover:bg-accent/50",
          "active:scale-[0.98]",
          "transition-transform",
        ],
        floating: [
          "shadow-moderate",
          "hover:shadow-prominent",
          "hover:-translate-y-1",
        ],
        minimal: [
          "border-0",
          "shadow-none",
          "bg-transparent",
        ],
      },
      size: {
        sm: "p-4 rounded-md",
        default: "p-6 rounded-lg",
        lg: "p-8 rounded-xl",
        xl: "p-10 rounded-2xl",
        compact: "p-3 rounded-md text-sm",
        spacious: "p-12 rounded-2xl",
      },
      animation: {
        none: "",
        fade: "animate-fade-in",
        slide: "animate-slide-in",
        scale: "animate-scale-in",
        float: "animate-float",
        glow: "animate-glow",
      },
      interaction: {
        none: "",
        hover: "hover-lift",
        magnetic: "magnetic-card",
        tilt: "tilt-card",
        parallax: "parallax-card",
      },
      context: {
        general: "",
        financial: "context-financial",
        operational: "context-operational",
        strategic: "context-strategic",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "fade",
      interaction: "hover",
      context: "general",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  loading?: boolean
  error?: boolean
  success?: boolean
  warning?: boolean
  onCardClick?: () => void
  tiltStrength?: number
  magneticStrength?: number
  parallaxStrength?: number
  glowColor?: string
  showLoadingBar?: boolean
  contextualColors?: boolean
  adaptiveSpacing?: boolean
  microAnimations?: boolean
}

// === REVOLUTIONARY CARD COMPONENT ===

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant,
    size,
    animation,
    interaction,
    context,
    loading = false,
    error = false,
    success = false,
    warning = false,
    onCardClick,
    tiltStrength = 1,
    magneticStrength = 1,
    parallaxStrength = 1,
    glowColor,
    showLoadingBar = false,
    contextualColors = false,
    adaptiveSpacing = false,
    microAnimations = true,
    children,
    ...props
  }, ref) => {
    
    const { getAdaptedColor, getColorForContext } = useAdaptiveColor()
    const { cognitiveState, getAdaptiveSpacing } = useTheme()
    
    // Motion values for advanced interactions
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useSpring(0, { stiffness: 300, damping: 30 })
    const rotateY = useSpring(0, { stiffness: 300, damping: 30 })
    const scale = useSpring(1, { stiffness: 300, damping: 30 })
    
    // Transform values for parallax effects
    const backgroundY = useTransform(y, [-100, 100], [-20 * parallaxStrength, 20 * parallaxStrength])
    const contentY = useTransform(y, [-100, 100], [10 * parallaxStrength, -10 * parallaxStrength])
    
    // State management
    const [isHovered, setIsHovered] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const [loadingProgress, setLoadingProgress] = React.useState(0)
    
    // === ADVANCED INTERACTION HANDLERS ===
    
    const handleMouseMove = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      // Magnetic interaction
      if (interaction === "magnetic") {
        const deltaX = (event.clientX - centerX) * magneticStrength * 0.2
        const deltaY = (event.clientY - centerY) * magneticStrength * 0.2
        x.set(deltaX)
        y.set(deltaY)
      }
      
      // Tilt interaction
      if (interaction === "tilt") {
        const deltaX = (event.clientX - centerX) / rect.width
        const deltaY = (event.clientY - centerY) / rect.height
        rotateY.set(deltaX * 15 * tiltStrength)
        rotateX.set(-deltaY * 15 * tiltStrength)
      }
      
      // Parallax interaction
      if (interaction === "parallax") {
        const deltaY = (event.clientY - centerY) * parallaxStrength * 0.1
        y.set(deltaY)
      }
    }, [interaction, magneticStrength, tiltStrength, parallaxStrength, x, y, rotateX, rotateY])
    
    const handleMouseEnter = React.useCallback(() => {
      setIsHovered(true)
      if (microAnimations) {
        scale.set(1.02)
      }
    }, [microAnimations, scale])
    
    const handleMouseLeave = React.useCallback(() => {
      setIsHovered(false)
      x.set(0)
      y.set(0)
      rotateX.set(0)
      rotateY.set(0)
      scale.set(1)
    }, [x, y, rotateX, rotateY, scale])
    
    const handleFocus = React.useCallback(() => {
      setIsFocused(true)
    }, [])
    
    const handleBlur = React.useCallback(() => {
      setIsFocused(false)
    }, [])
    
    const handleClick = React.useCallback(() => {
      if (onCardClick) {
        // Add click animation
        scale.set(0.98)
        setTimeout(() => scale.set(1), 150)
        onCardClick()
      }
    }, [onCardClick, scale])
    
    // === LOADING SIMULATION ===
    
    React.useEffect(() => {
      if (loading && showLoadingBar) {
        const interval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval)
              return 100
            }
            return prev + Math.random() * 10
          })
        }, 200)
        
        return () => clearInterval(interval)
      } else {
        setLoadingProgress(0)
      }
    }, [loading, showLoadingBar])
    
    // === DYNAMIC STYLING ===
    
    const dynamicStyles = React.useMemo(() => {
      const styles: React.CSSProperties = {}
      
      if (contextualColors) {
        if (error) {
          styles.borderColor = getAdaptedColor('error')
          styles.backgroundColor = `${getAdaptedColor('error')}10`
        } else if (success) {
          styles.borderColor = getAdaptedColor('success')
          styles.backgroundColor = `${getAdaptedColor('success')}10`
        } else if (warning) {
          styles.borderColor = getAdaptedColor('warning')
          styles.backgroundColor = `${getAdaptedColor('warning')}10`
        } else if (context !== "general") {
          const contextColor = getColorForContext(getAdaptedColor('primary'), context as any)
          styles.borderColor = `${contextColor}40`
          styles.backgroundColor = `${contextColor}05`
        }
      }
      
      if (glowColor) {
        styles.boxShadow = `0 0 20px ${glowColor}40, 0 0 40px ${glowColor}20`
      }
      
      if (adaptiveSpacing) {
        const spacing = getAdaptiveSpacing()
        styles.padding = spacing.base
      }
      
      return styles
    }, [
      contextualColors,
      error,
      success,
      warning,
      context,
      glowColor,
      adaptiveSpacing,
      getAdaptedColor,
      getColorForContext,
      getAdaptiveSpacing,
    ])
    
    // === STATUS INDICATORS ===
    
    const StatusIndicator = React.useMemo(() => {
      if (loading) {
        return (
          <motion.div
            className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )
      }
      
      if (error) {
        return (
          <div className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        )
      }
      
      if (success) {
        return (
          <div className="absolute top-2 right-2 w-2 h-2 bg-success rounded-full" />
        )
      }
      
      if (warning) {
        return (
          <div className="absolute top-2 right-2 w-2 h-2 bg-warning rounded-full" />
        )
      }
      
      return null
    }, [loading, error, success, warning])
    
    return (
      <motion.div
        ref={ref}
        className={cn(cardVariants({ variant, size, animation, interaction, context, className }))}
        style={{
          x,
          y,
          rotateX,
          rotateY,
          scale,
          ...dynamicStyles,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        tabIndex={onCardClick ? 0 : undefined}
        role={onCardClick ? "button" : undefined}
        {...props}
      >
        {/* Background Parallax Layer */}
        {interaction === "parallax" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-[inherit] pointer-events-none"
            style={{ y: backgroundY }}
          />
        )}
        
        {/* Loading Progress Bar */}
        <AnimatePresence>
          {loading && showLoadingBar && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-t-[inherit] overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Content Layer */}
        <motion.div
          className="relative z-10 h-full"
          style={interaction === "parallax" ? { y: contentY } : undefined}
        >
          {children}
        </motion.div>
        
        {/* Status Indicator */}
        {StatusIndicator}
        
        {/* Hover Glow Effect */}
        <AnimatePresence>
          {isHovered && glowColor && (
            <motion.div
              className="absolute inset-0 rounded-[inherit] pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${glowColor}20 0%, transparent 70%)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
        
        {/* Focus Ring */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-[inherit] ring-2 ring-ring ring-offset-2 ring-offset-background pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </AnimatePresence>
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-[inherit] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="flex items-center gap-2 text-sm text-muted-foreground"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Loading...
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }
)

Card.displayName = "Card"

// === CARD SUB-COMPONENTS ===

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight optical-center",
      className
    )}
    {...props}
  >
    {children}
  </h3>
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground reading-width", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
}