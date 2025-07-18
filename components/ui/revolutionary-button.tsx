"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAdaptiveColor } from "@/hooks/use-adaptive-color"

// === REVOLUTIONARY BUTTON SYSTEM ===

const buttonVariants = cva(
  [
    // Base styles
    "btn",
    "relative",
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-2",
    "whitespace-nowrap",
    "text-sm",
    "font-medium",
    "transition-all",
    "duration-fast",
    "ease-spring-smooth",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-ring",
    "focus-visible:ring-offset-2",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    "hover-lift",
    "group",
    
    // Revolutionary micro-interactions
    "before:absolute",
    "before:inset-0",
    "before:rounded-[inherit]",
    "before:bg-gradient-to-r",
    "before:from-transparent",
    "before:via-white/5",
    "before:to-transparent",
    "before:opacity-0",
    "before:transition-opacity",
    "before:duration-fast",
    "hover:before:opacity-100",
    
    // Performance optimizations
    "gpu-accelerated",
    "will-change-transform",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary",
          "text-primary-foreground",
          "shadow-moderate",
          "hover:bg-primary/90",
          "hover:shadow-prominent",
          "active:scale-95",
        ],
        destructive: [
          "bg-destructive",
          "text-destructive-foreground",
          "shadow-moderate",
          "hover:bg-destructive/90",
          "hover:shadow-prominent",
          "active:scale-95",
        ],
        outline: [
          "border",
          "border-input",
          "bg-background",
          "text-foreground",
          "shadow-subtle",
          "hover:bg-accent",
          "hover:text-accent-foreground",
          "hover:border-accent",
          "hover:shadow-gentle",
        ],
        secondary: [
          "bg-secondary",
          "text-secondary-foreground",
          "shadow-subtle",
          "hover:bg-secondary/80",
          "hover:shadow-gentle",
        ],
        ghost: [
          "text-foreground",
          "hover:bg-accent",
          "hover:text-accent-foreground",
        ],
        link: [
          "text-primary",
          "underline-offset-4",
          "hover:underline",
          "shadow-none",
        ],
        glass: [
          "glass-moderate",
          "text-foreground",
          "shadow-moderate",
          "hover:glass-prominent",
          "hover:shadow-prominent",
        ],
        gradient: [
          "bg-gradient-to-r",
          "from-primary",
          "via-primary-600",
          "to-primary-700",
          "text-primary-foreground",
          "shadow-moderate",
          "hover:shadow-prominent",
          "hover:from-primary/90",
          "hover:via-primary-600/90",
          "hover:to-primary-700/90",
        ],
        contextual: [
          "bg-accent",
          "text-accent-foreground",
          "shadow-moderate",
          "hover:bg-accent/90",
          "hover:shadow-prominent",
        ],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-11 w-11",
      },
      animation: {
        none: "",
        subtle: "animate-fade-in",
        bounce: "hover:animate-bounce",
        float: "animate-float",
        glow: "animate-glow",
        pulse: "animate-pulse-subtle",
      },
      interaction: {
        standard: "",
        magnetic: "magnetic-button",
        ripple: "ripple-button",
        morphing: "morphing-button",
        elastic: "elastic-button",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "subtle",
      interaction: "standard",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  tooltip?: string
  hapticFeedback?: boolean
  soundFeedback?: boolean
  glowColor?: string
  particleEffect?: boolean
  magneticStrength?: number
  contextualColor?: boolean
}

// === REVOLUTIONARY BUTTON COMPONENT ===

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    animation,
    interaction,
    asChild = false,
    isLoading = false,
    loadingText = "Loading...",
    leftIcon,
    rightIcon,
    tooltip,
    hapticFeedback = false,
    soundFeedback = false,
    glowColor,
    particleEffect = false,
    magneticStrength = 1,
    contextualColor = false,
    children,
    onClick,
    ...props
  }, ref) => {
    
    const { getAdaptedColor, getColorForContext } = useAdaptiveColor()
    
    // Motion values for advanced interactions
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const scale = useSpring(1, { stiffness: 300, damping: 30 })
    const rotate = useTransform([x, y], (latest) => {
      const [latestX, latestY] = latest
      return Math.atan2(latestY, latestX) * (180 / Math.PI) * 0.1
    })
    
    // Magnetic interaction state
    const [isHovered, setIsHovered] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const [isPressed, setIsPressed] = React.useState(false)
    const [userInteracted, setUserInteracted] = React.useState(false)
    
    // Particle effect state
    const [particles, setParticles] = React.useState<Array<{
      id: number
      x: number
      y: number
      angle: number
      velocity: number
    }>>([])
    
    // === ADVANCED INTERACTION HANDLERS ===
    
    const handleMouseMove = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (interaction !== "magnetic") return
      
      const rect = event.currentTarget.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = (event.clientX - centerX) * magneticStrength * 0.3
      const deltaY = (event.clientY - centerY) * magneticStrength * 0.3
      
      x.set(deltaX)
      y.set(deltaY)
    }, [interaction, magneticStrength, x, y])
    
    const handleMouseEnter = React.useCallback(() => {
      setIsHovered(true)
      scale.set(1.05)
      
      // Haptic feedback - only after user interaction
      if (hapticFeedback && userInteracted && 'vibrate' in navigator) {
        try {
          navigator.vibrate(1)
        } catch (error) {
          // Silently handle vibration errors
        }
      }
    }, [hapticFeedback, userInteracted, scale])
    
    const handleMouseLeave = React.useCallback(() => {
      setIsHovered(false)
      scale.set(1)
      x.set(0)
      y.set(0)
    }, [scale, x, y])
    
    const handleMouseDown = React.useCallback(() => {
      setIsPressed(true)
      scale.set(0.95)
      
      // Sound feedback
      if (soundFeedback) {
        // Web Audio API implementation would go here
        console.log("Button press sound")
      }
      
      // Particle effect
      if (particleEffect) {
        const newParticles = Array.from({ length: 6 }, (_, i) => ({
          id: Date.now() + i,
          x: 0,
          y: 0,
          angle: (i * 60) + Math.random() * 30,
          velocity: 2 + Math.random() * 2,
        }))
        setParticles(newParticles)
        
        // Clear particles after animation
        setTimeout(() => setParticles([]), 1000)
      }
    }, [soundFeedback, particleEffect, scale])
    
    const handleMouseUp = React.useCallback(() => {
      setIsPressed(false)
      scale.set(isHovered ? 1.05 : 1)
    }, [isHovered, scale])
    
    const handleFocus = React.useCallback(() => {
      setIsFocused(true)
    }, [])
    
    const handleBlur = React.useCallback(() => {
      setIsFocused(false)
    }, [])
    
    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || props.disabled) {
        event.preventDefault()
        return
      }
      
      // Mark that user has interacted
      setUserInteracted(true)
      
      // Enhanced haptic feedback on click
      if (hapticFeedback && 'vibrate' in navigator) {
        try {
          navigator.vibrate([2, 1, 2])
        } catch (error) {
          // Silently handle vibration errors
        }
      }
      
      // Call the original onClick handler
      onClick?.(event)
    }, [isLoading, props.disabled, hapticFeedback, onClick])
    
    // === DYNAMIC STYLING ===
    
    const dynamicStyles = React.useMemo(() => {
      const styles: React.CSSProperties = {}
      
      if (contextualColor) {
        styles.backgroundColor = getAdaptedColor('primary')
        styles.color = getAdaptedColor('foreground')
      }
      
      if (glowColor) {
        styles.boxShadow = `0 0 20px ${glowColor}, 0 0 40px ${glowColor}40`
      }
      
      return styles
    }, [contextualColor, glowColor, getAdaptedColor])
    
    // === RENDER COMPONENT ===
    
    const Comp = asChild ? Slot : "button"
    
    const buttonContent = (
      <>
        {/* Loading state */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center bg-inherit rounded-[inherit]"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
              {loadingText && (
                <span className="ml-2 text-sm">{loadingText}</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Button content */}
        <motion.div
          className={cn(
            "flex items-center justify-center gap-2 relative z-10",
            isLoading && "opacity-0"
          )}
          animate={{
            opacity: isLoading ? 0 : 1,
            y: isLoading ? 10 : 0,
          }}
        >
          {leftIcon && (
            <motion.span
              className="flex-shrink-0"
              animate={{
                x: isPressed ? -1 : 0,
                scale: isPressed ? 0.9 : 1,
              }}
              transition={{ duration: 0.1 }}
            >
              {leftIcon}
            </motion.span>
          )}
          
          {children && (
            <motion.span
              className="optical-center"
              animate={{
                scale: isPressed ? 0.95 : 1,
              }}
              transition={{ duration: 0.1 }}
            >
              {children}
            </motion.span>
          )}
          
          {rightIcon && (
            <motion.span
              className="flex-shrink-0"
              animate={{
                x: isPressed ? 1 : 0,
                scale: isPressed ? 0.9 : 1,
              }}
              transition={{ duration: 0.1 }}
            >
              {rightIcon}
            </motion.span>
          )}
        </motion.div>
        
        {/* Particle effects */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-current rounded-full pointer-events-none"
              initial={{
                x: "50%",
                y: "50%",
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: `calc(50% + ${Math.cos(particle.angle * Math.PI / 180) * particle.velocity * 20}px)`,
                y: `calc(50% + ${Math.sin(particle.angle * Math.PI / 180) * particle.velocity * 20}px)`,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
              }}
              exit={{ opacity: 0 }}
            />
          ))}
        </AnimatePresence>
        
        {/* Ripple effect */}
        {interaction === "ripple" && isPressed && (
          <motion.div
            className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none"
            initial={false}
          >
            <motion.div
              className="absolute w-0 h-0 bg-white/20 rounded-full"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
              animate={{
                width: "200%",
                height: "200%",
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
              }}
            />
          </motion.div>
        )}
        
        {/* Focus ring enhancement */}
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
      </>
    )
    
    return (
      <motion.div
        style={{ x, y, scale, rotate }}
        className="inline-block"
      >
        <Comp
          className={cn(buttonVariants({ variant, size, animation, interaction, className }))}
          style={dynamicStyles}
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={handleClick}
          disabled={isLoading || props.disabled}
          title={tooltip}
          {...props}
        >
          {buttonContent}
        </Comp>
      </motion.div>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }