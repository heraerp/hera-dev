"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"

// === REVOLUTIONARY THEME SYSTEM ===

type Theme = "light" | "dark" | "auto"
type Context = "financial" | "operational" | "strategic" | "general"
type CognitiveState = "focused" | "scanning" | "creative"
type CircadianTime = "morning" | "afternoon" | "evening"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultContext?: Context
  storageKey?: string
  enableCircadianRhythm?: boolean
  enableCognitiveAdaptation?: boolean
  enablePerformanceOptimization?: boolean
}

interface ThemeProviderState {
  // Core Theme Management
  theme: Theme
  context: Context
  cognitiveState: CognitiveState
  circadianTime: CircadianTime
  
  // Adaptive Intelligence
  isAdaptiveMode: boolean
  userPreferences: UserPreferences
  performanceMetrics: PerformanceMetrics
  
  // Theme Actions
  setTheme: (theme: Theme) => void
  setContext: (context: Context) => void
  setCognitiveState: (state: CognitiveState) => void
  
  // Adaptive Actions
  enableAdaptiveMode: () => void
  disableAdaptiveMode: () => void
  updateUserPreference: (key: string, value: any) => void
  
  // Performance Actions
  getOptimalTheme: () => Theme
  getContextualColors: () => ContextualColors
  getAdaptiveSpacing: () => AdaptiveSpacing
  getModernThemeColors: () => any
}

interface UserPreferences {
  preferredTheme: Theme
  preferredContext: Context
  reducedMotion: boolean
  highContrast: boolean
  fontSize: number
  colorBlindness?: 'protanopia' | 'deuteranopia' | 'tritanopia'
  workingHours: { start: number; end: number }
  focusBlocks: Array<{ start: number; end: number }>
}

interface PerformanceMetrics {
  averageSessionDuration: number
  taskCompletionRate: number
  errorRate: number
  eyeStrainIndicators: number
  timeOfDayPerformance: Record<string, number>
}

interface ContextualColors {
  primary: string
  secondary: string
  accent: string
  success: string
  warning: string
  danger: string
}

interface AdaptiveSpacing {
  base: string
  compact: string
  comfortable: string
  spacious: string
}

const initialState: ThemeProviderState = {
  theme: "auto",
  context: "general",
  cognitiveState: "scanning",
  circadianTime: "afternoon",
  isAdaptiveMode: false,
  userPreferences: {
    preferredTheme: "auto",
    preferredContext: "general",
    reducedMotion: false,
    highContrast: false,
    fontSize: 16,
    workingHours: { start: 9, end: 17 },
    focusBlocks: [],
  },
  performanceMetrics: {
    averageSessionDuration: 0,
    taskCompletionRate: 0,
    errorRate: 0,
    eyeStrainIndicators: 0,
    timeOfDayPerformance: {},
  },
  setTheme: () => null,
  setContext: () => null,
  setCognitiveState: () => null,
  enableAdaptiveMode: () => null,
  disableAdaptiveMode: () => null,
  updateUserPreference: () => null,
  getOptimalTheme: () => "light",
  getContextualColors: () => ({
    primary: "hsl(217, 91%, 60%)",
    secondary: "hsl(210, 40%, 96%)",
    accent: "hsl(217, 91%, 60%)",
    success: "hsl(142, 71%, 45%)",
    warning: "hsl(38, 92%, 50%)",
    danger: "hsl(0, 84%, 60%)",
  }),
  getAdaptiveSpacing: () => ({
    base: "1rem",
    compact: "0.75rem",
    comfortable: "1.25rem",
    spacious: "1.5rem",
  }),
  getModernThemeColors: () => ({
    primary: '#000000',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#1a1a1a',
    orange: '#FF4701'
  }),
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "auto",
  defaultContext = "general",
  storageKey = "hera-theme",
  enableCircadianRhythm = true,
  enableCognitiveAdaptation = true,
  enablePerformanceOptimization = true,
  ...props
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)
  // Core Theme State
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [context, setContextState] = useState<Context>(defaultContext)
  const [cognitiveState, setCognitiveStateState] = useState<CognitiveState>("scanning")
  const [circadianTime, setCircadianTime] = useState<CircadianTime>("afternoon")
  
  // Adaptive Intelligence State
  const [isAdaptiveMode, setIsAdaptiveMode] = useState(false)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(initialState.userPreferences)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>(initialState.performanceMetrics)
  
  // === CIRCADIAN RHYTHM DETECTION ===
  const detectCircadianTime = useCallback((): CircadianTime => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return "morning"
    if (hour >= 12 && hour < 17) return "afternoon"
    return "evening"
  }, [])
  
  // === COGNITIVE STATE DETECTION ===
  const detectCognitiveState = useCallback((): CognitiveState => {
    // Detect based on user interaction patterns
    const hour = new Date().getHours()
    const { workingHours, focusBlocks } = userPreferences
    
    // Check if in focus block
    const currentTime = hour * 60 + new Date().getMinutes()
    const inFocusBlock = focusBlocks.some(block => 
      currentTime >= block.start && currentTime <= block.end
    )
    
    if (inFocusBlock) return "focused"
    
    // Morning hours tend to be more focused
    if (hour >= 9 && hour <= 11) return "focused"
    
    // Afternoon creative time
    if (hour >= 14 && hour <= 16) return "creative"
    
    // Default to scanning
    return "scanning"
  }, [userPreferences])
  
  // === PERFORMANCE OPTIMIZATION ===
  const getOptimalTheme = useCallback((): Theme => {
    if (!enablePerformanceOptimization) return theme
    
    const hour = new Date().getHours()
    const { timeOfDayPerformance } = performanceMetrics
    
    // Use performance data to suggest optimal theme
    if (timeOfDayPerformance[`${hour}`] && timeOfDayPerformance[`${hour}`] < 0.7) {
      // Poor performance at this hour, suggest dark theme to reduce eye strain
      return "dark"
    }
    
    // Default system preference or manual selection
    return theme === "auto" ? 
      (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") :
      theme
  }, [theme, performanceMetrics, enablePerformanceOptimization])
  
  // === MODERN DARK THEME COLORS ===
  const getModernThemeColors = useCallback(() => {
    // Use the actual theme state instead of getOptimalTheme
    const currentTheme = theme === 'auto' ? 
      (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
      theme;
    
    if (currentTheme === "dark") {
      return {
        primary: '#ffffff',           // Pure white for logo in dark mode
        secondary: '#FAFAFA',         // Brighter off-white for better contrast
        tertiary: '#B8B9BD',          // Brighter gray for better readability
        orange: '#FF5722',            // Slightly brighter orange for dark mode
        orangeSecondary: '#ff7043',   // Secondary orange for dark mode
        background: '#0a0a0a',        // Darkest - 900 shade
        surface: '#141414',           // Dark surface - 800 shade
        surfaceElevated: '#1f1f1f',   // Elevated surface - 700 shade
        surfaceHover: '#262626',      // Hover state - 650 shade
        border: '#2d2d2d',            // Subtle border - 700 shade
        borderLight: '#3a3a3a',       // Lighter border - 600 shade
        borderFocus: '#4a4a4a',       // Focus border - 500 shade
        text: '#FAFAFA',              // Brighter text for readability
        textSecondary: '#C8C9CD',     // Brighter secondary text
        textMuted: '#8b92a0',         // Brighter muted text
        shadow: 'rgba(0, 0, 0, 0.5)', // Stronger shadow
        orangeShadow: 'rgba(255, 87, 34, 0.3)',
        // Additional depth shades
        gray900: '#0a0a0a',           // Darkest
        gray800: '#141414',           // Cards/surfaces
        gray700: '#1f1f1f',           // Elevated elements
        gray600: '#2d2d2d',           // Subtle borders
        gray500: '#3a3a3a',           // Active borders
        gray400: '#4a4a4a'            // Focus states
      }
    } else {
      // Light mode: Better contrast with darker text colors
      return {
        primary: '#000000',           // Pure black for logo
        secondary: '#1a1a1a',         // Dark gray for text
        tertiary: '#666666',          // Medium gray
        orange: '#FF4701',            // Vibrant orange accent
        orangeSecondary: '#ff6b35',   // Secondary orange
        background: '#ffffff',        // White background
        surface: 'rgba(35, 35, 35, 0.03)',     // Very light version of dark surface
        surfaceElevated: 'rgba(42, 42, 42, 0.02)', // Very light version of elevated surface
        surfaceHover: 'rgba(35, 35, 35, 0.05)',    // Light hover state
        border: 'rgba(41, 32, 35, 0.12)',      // Very light version of dark border
        borderLight: 'rgba(41, 32, 35, 0.08)',  // Even lighter border
        borderFocus: 'rgba(41, 32, 35, 0.2)',   // Focus border
        text: '#0f0f0f',              // Darker text for better contrast
        textSecondary: '#404040',     // Much darker secondary text
        textMuted: '#666666',         // Darker muted text
        shadow: 'rgba(0, 0, 0, 0.08)', // Very light shadow
        orangeShadow: 'rgba(255, 71, 1, 0.12)',
        // Light mode shades (not used but included for consistency)
        gray900: '#ffffff',
        gray800: '#fafafa',
        gray700: '#f5f5f5',
        gray600: '#e5e5e5',
        gray500: '#d4d4d4',
        gray400: '#a3a3a3'
      }
    }
  }, [theme])

  // === CONTEXTUAL COLOR SYSTEM ===
  const getContextualColors = useCallback((): ContextualColors => {
    const modernColors = getModernThemeColors()
    
    const baseColors = {
      primary: modernColors.orange,
      secondary: modernColors.surface,
      accent: modernColors.orange,
      success: "hsl(142, 71%, 45%)",
      warning: "hsl(38, 92%, 50%)",
      danger: "hsl(0, 84%, 60%)",
    }
    
    switch (context) {
      case "financial":
        return {
          ...baseColors,
          primary: modernColors.orange,
          accent: "hsl(142, 71%, 45%)",
          success: "hsl(142, 71%, 45%)",
          warning: "hsl(38, 92%, 50%)",
          danger: "hsl(0, 84%, 60%)",
        }
      
      case "operational":
        return {
          ...baseColors,
          primary: modernColors.orange,
          accent: modernColors.orange,
          success: "hsl(142, 71%, 45%)",
          warning: "hsl(38, 92%, 50%)",
          danger: "hsl(0, 84%, 60%)",
        }
      
      case "strategic":
        return {
          ...baseColors,
          primary: "hsl(262, 83%, 58%)",
          accent: "hsl(262, 83%, 58%)",
          success: "hsl(142, 71%, 45%)",
          warning: "hsl(38, 92%, 50%)",
          danger: "hsl(0, 84%, 60%)",
        }
      
      default:
        return baseColors
    }
  }, [context, getModernThemeColors])
  
  // === ADAPTIVE SPACING SYSTEM ===
  const getAdaptiveSpacing = useCallback((): AdaptiveSpacing => {
    const baseSpacing = {
      base: "1rem",
      compact: "0.75rem",
      comfortable: "1.25rem",
      spacious: "1.5rem",
    }
    
    // Adjust based on cognitive state
    switch (cognitiveState) {
      case "focused":
        return {
          base: "0.875rem",
          compact: "0.625rem",
          comfortable: "1rem",
          spacious: "1.25rem",
        }
      
      case "creative":
        return {
          base: "1.125rem",
          compact: "0.875rem",
          comfortable: "1.375rem",
          spacious: "1.75rem",
        }
      
      default:
        return baseSpacing
    }
  }, [cognitiveState])
  
  // === THEME ACTIONS ===
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    
    // Store preference
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify({
        theme: newTheme,
        context,
        timestamp: Date.now(),
      }))
    }
  }, [context, storageKey])
  
  const setContext = useCallback((newContext: Context) => {
    setContextState(newContext)
    
    // Update body class for contextual styling
    if (typeof document !== "undefined") {
      document.body.classList.remove("context-financial", "context-operational", "context-strategic", "context-general")
      document.body.classList.add(`context-${newContext}`)
    }
  }, [])
  
  const setCognitiveState = useCallback((newState: CognitiveState) => {
    setCognitiveStateState(newState)
    
    // Update body class for cognitive styling
    if (typeof document !== "undefined") {
      document.body.classList.remove("cognitive-focused", "cognitive-scanning", "cognitive-creative")
      document.body.classList.add(`cognitive-${newState}`)
    }
  }, [])
  
  // === ADAPTIVE MODE ACTIONS ===
  const enableAdaptiveMode = useCallback(() => {
    setIsAdaptiveMode(true)
    
    // Start adaptive monitoring
    if (enableCircadianRhythm) {
      const circadian = detectCircadianTime()
      setCircadianTime(circadian)
      
      // Update body class for circadian styling
      if (typeof document !== "undefined") {
        document.body.classList.remove("circadian-morning", "circadian-afternoon", "circadian-evening")
        document.body.classList.add(`circadian-${circadian}`)
      }
    }
    
    if (enableCognitiveAdaptation) {
      const cognitive = detectCognitiveState()
      setCognitiveState(cognitive)
    }
  }, [enableCircadianRhythm, enableCognitiveAdaptation, detectCircadianTime, detectCognitiveState, setCognitiveState])
  
  const disableAdaptiveMode = useCallback(() => {
    setIsAdaptiveMode(false)
  }, [])
  
  const updateUserPreference = useCallback((key: string, value: any) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: value,
    }))
  }, [])
  
  // === ACCESSIBILITY ENHANCEMENTS ===
  useEffect(() => {
    if (typeof window === "undefined") return
    
    // Detect user accessibility preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const prefersHighContrast = window.matchMedia("(prefers-contrast: high)").matches
    
    updateUserPreference("reducedMotion", prefersReducedMotion)
    updateUserPreference("highContrast", prefersHighContrast)
    
    // Apply accessibility classes
    if (prefersReducedMotion) {
      document.body.classList.add("reduce-motion")
    }
    
    if (prefersHighContrast) {
      document.body.classList.add("high-contrast")
    }
  }, [updateUserPreference])
  
  // === SYSTEM THEME DETECTION ===
  useEffect(() => {
    if (theme !== "auto" || typeof window === "undefined") return
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = () => {
      const systemTheme = mediaQuery.matches ? "dark" : "light"
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", systemTheme)
      }
    }
    
    mediaQuery.addEventListener("change", handleChange)
    handleChange() // Initial application
    
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])
  
  // === MANUAL THEME APPLICATION ===
  useEffect(() => {
    if (theme === "auto" || typeof document === "undefined") return
    
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])
  
  // === CIRCADIAN RHYTHM MONITORING ===
  useEffect(() => {
    if (!enableCircadianRhythm || !isAdaptiveMode) return
    
    const interval = setInterval(() => {
      const newTime = detectCircadianTime()
      if (newTime !== circadianTime) {
        setCircadianTime(newTime)
        
        // Update body class
        if (typeof document !== "undefined") {
          document.body.classList.remove("circadian-morning", "circadian-afternoon", "circadian-evening")
          document.body.classList.add(`circadian-${newTime}`)
        }
      }
    }, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [enableCircadianRhythm, isAdaptiveMode, circadianTime, detectCircadianTime])
  
  // === PERFORMANCE MONITORING ===
  useEffect(() => {
    if (!enablePerformanceOptimization || typeof window === "undefined") return
    
    // Monitor user performance patterns
    const startTime = Date.now()
    let errorCount = 0
    let actionCount = 0
    
    const handleError = () => errorCount++
    const handleAction = () => actionCount++
    
    window.addEventListener("error", handleError)
    if (typeof document !== "undefined") {
      document.addEventListener("click", handleAction)
      document.addEventListener("keydown", handleAction)
    }
    
    const interval = setInterval(() => {
      const sessionDuration = Date.now() - startTime
      const errorRate = actionCount > 0 ? errorCount / actionCount : 0
      const hour = new Date().getHours()
      
      setPerformanceMetrics(prev => ({
        ...prev,
        averageSessionDuration: sessionDuration,
        errorRate,
        timeOfDayPerformance: {
          ...prev.timeOfDayPerformance,
          [hour]: Math.max(0, 1 - errorRate), // Performance score
        },
      }))
    }, 300000) // Every 5 minutes
    
    return () => {
      clearInterval(interval)
      window.removeEventListener("error", handleError)
      if (typeof document !== "undefined") {
        document.removeEventListener("click", handleAction)
        document.removeEventListener("keydown", handleAction)
      }
    }
  }, [enablePerformanceOptimization])
  
  // === CLIENT MOUNTING ===
  useEffect(() => {
    setMounted(true)
  }, [])

  // === STORAGE PERSISTENCE ===
  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return
    
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        try {
          const { theme: storedTheme, context: storedContext } = JSON.parse(stored)
          if (storedTheme) setThemeState(storedTheme)
          if (storedContext) setContextState(storedContext)
        } catch (parseError) {
          // Clear invalid data and use defaults
          localStorage.removeItem(storageKey)
          console.info("Cleared invalid theme data, using defaults")
        }
      }
    } catch (error) {
      console.warn("Failed to load theme from storage:", error)
    }
  }, [storageKey, mounted])
  
  const value: ThemeProviderState = {
    theme,
    context,
    cognitiveState,
    circadianTime,
    isAdaptiveMode,
    userPreferences,
    performanceMetrics,
    setTheme,
    setContext,
    setCognitiveState,
    enableAdaptiveMode,
    disableAdaptiveMode,
    updateUserPreference,
    getOptimalTheme,
    getContextualColors,
    getAdaptiveSpacing,
    // Add modern theme colors
    getModernThemeColors,
  }
  
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      <div suppressHydrationWarning>
        {children}
      </div>
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  
  return context
}