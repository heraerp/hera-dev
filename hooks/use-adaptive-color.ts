"use client"

import { useCallback, useEffect, useState } from "react"
import { useTheme } from "@/components/providers/theme-provider"

// === ADAPTIVE COLOR INTELLIGENCE SYSTEM ===

export interface ColorAdaptationConfig {
  enableCircadianAdaptation: boolean
  enableCognitiveAdaptation: boolean
  enableContextualAdaptation: boolean
  enableAccessibilityEnhancement: boolean
  enablePerformanceOptimization: boolean
  colorBlindnessSupport: boolean
}

export interface AdaptiveColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
  success: string
  warning: string
  error: string
  info: string
}

export interface ColorMetrics {
  contrast: number
  readability: number
  accessibility: "AAA" | "AA" | "A" | "FAIL"
  cognitiveLoad: number
  eyeStrainIndex: number
}

const defaultConfig: ColorAdaptationConfig = {
  enableCircadianAdaptation: true,
  enableCognitiveAdaptation: true,
  enableContextualAdaptation: true,
  enableAccessibilityEnhancement: true,
  enablePerformanceOptimization: true,
  colorBlindnessSupport: true,
}

export function useAdaptiveColor(config: Partial<ColorAdaptationConfig> = {}) {
  const mergedConfig = { ...defaultConfig, ...config }
  const { 
    theme, 
    context, 
    cognitiveState, 
    circadianTime, 
    userPreferences,
    getContextualColors 
  } = useTheme()
  
  const [adaptedPalette, setAdaptedPalette] = useState<AdaptiveColorPalette>({
    primary: "hsl(217, 91%, 60%)",
    secondary: "hsl(210, 40%, 96%)",
    accent: "hsl(217, 91%, 60%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(222.2, 84%, 4.9%)",
    muted: "hsl(210, 40%, 96%)",
    border: "hsl(214.3, 31.8%, 91.4%)",
    success: "hsl(142, 71%, 45%)",
    warning: "hsl(38, 92%, 50%)",
    error: "hsl(0, 84%, 60%)",
    info: "hsl(217, 91%, 60%)",
  })
  
  const [colorMetrics, setColorMetrics] = useState<ColorMetrics>({
    contrast: 4.5,
    readability: 0.8,
    accessibility: "AA",
    cognitiveLoad: 0.5,
    eyeStrainIndex: 0.3,
  })
  
  // === COLOR UTILITY FUNCTIONS ===
  
  const hslToRgb = useCallback((hsl: string): [number, number, number] => {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (!match) return [0, 0, 0]
    
    const h = parseInt(match[1]) / 360
    const s = parseInt(match[2]) / 100
    const l = parseInt(match[3]) / 100
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    let r, g, b
    
    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }, [])
  
  const calculateLuminance = useCallback((rgb: [number, number, number]): number => {
    const [r, g, b] = rgb.map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }, [])
  
  const calculateContrast = useCallback((color1: string, color2: string): number => {
    const rgb1 = hslToRgb(color1)
    const rgb2 = hslToRgb(color2)
    const lum1 = calculateLuminance(rgb1)
    const lum2 = calculateLuminance(rgb2)
    
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }, [hslToRgb, calculateLuminance])
  
  const adjustHslProperty = useCallback((
    hsl: string, 
    property: 'h' | 's' | 'l', 
    adjustment: number
  ): string => {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (!match) return hsl
    
    let h = parseInt(match[1])
    let s = parseInt(match[2])
    let l = parseInt(match[3])
    
    switch (property) {
      case 'h':
        h = (h + adjustment) % 360
        if (h < 0) h += 360
        break
      case 's':
        s = Math.max(0, Math.min(100, s + adjustment))
        break
      case 'l':
        l = Math.max(0, Math.min(100, l + adjustment))
        break
    }
    
    return `hsl(${h}, ${s}%, ${l}%)`
  }, [])
  
  // === CIRCADIAN RHYTHM ADAPTATION ===
  
  const applyCircadianAdaptation = useCallback((palette: AdaptiveColorPalette): AdaptiveColorPalette => {
    if (!mergedConfig.enableCircadianAdaptation) return palette
    
    let warmthAdjustment = 0
    let lightnessAdjustment = 0
    
    switch (circadianTime) {
      case "morning":
        // Cooler, brighter colors for alertness
        warmthAdjustment = -5
        lightnessAdjustment = 2
        break
      case "afternoon":
        // Neutral colors
        warmthAdjustment = 0
        lightnessAdjustment = 0
        break
      case "evening":
        // Warmer, dimmer colors to reduce blue light
        warmthAdjustment = 8
        lightnessAdjustment = -5
        break
    }
    
    return {
      ...palette,
      primary: adjustHslProperty(
        adjustHslProperty(palette.primary, 'h', warmthAdjustment),
        'l',
        lightnessAdjustment
      ),
      accent: adjustHslProperty(
        adjustHslProperty(palette.accent, 'h', warmthAdjustment),
        'l',
        lightnessAdjustment
      ),
      background: adjustHslProperty(palette.background, 'l', lightnessAdjustment * 0.5),
    }
  }, [mergedConfig.enableCircadianAdaptation, circadianTime, adjustHslProperty])
  
  // === COGNITIVE STATE ADAPTATION ===
  
  const applyCognitiveAdaptation = useCallback((palette: AdaptiveColorPalette): AdaptiveColorPalette => {
    if (!mergedConfig.enableCognitiveAdaptation) return palette
    
    switch (cognitiveState) {
      case "focused":
        // High contrast, minimal color distractions
        return {
          ...palette,
          primary: adjustHslProperty(palette.primary, 's', 10),
          accent: adjustHslProperty(palette.accent, 's', -20),
          muted: adjustHslProperty(palette.muted, 's', -10),
        }
      
      case "creative":
        // Richer, more inspiring colors
        return {
          ...palette,
          primary: adjustHslProperty(palette.primary, 's', 15),
          accent: adjustHslProperty(palette.accent, 'h', 30),
          border: adjustHslProperty(palette.border, 's', 5),
        }
      
      case "scanning":
      default:
        // Balanced colors for information processing
        return palette
    }
  }, [mergedConfig.enableCognitiveAdaptation, cognitiveState, adjustHslProperty])
  
  // === CONTEXTUAL ADAPTATION ===
  
  const applyContextualAdaptation = useCallback((palette: AdaptiveColorPalette): AdaptiveColorPalette => {
    if (!mergedConfig.enableContextualAdaptation) return palette
    
    const contextColors = getContextualColors()
    
    return {
      ...palette,
      primary: contextColors.primary,
      accent: contextColors.accent,
      success: contextColors.success,
      warning: contextColors.warning,
      error: contextColors.danger,
    }
  }, [mergedConfig.enableContextualAdaptation, getContextualColors])
  
  // === ACCESSIBILITY ENHANCEMENT ===
  
  const applyAccessibilityEnhancement = useCallback((palette: AdaptiveColorPalette): AdaptiveColorPalette => {
    if (!mergedConfig.enableAccessibilityEnhancement) return palette
    
    let enhancedPalette = { ...palette }
    
    // High contrast mode
    if (userPreferences.highContrast) {
      enhancedPalette = {
        ...enhancedPalette,
        foreground: theme === "dark" ? "hsl(0, 0%, 100%)" : "hsl(0, 0%, 0%)",
        background: theme === "dark" ? "hsl(0, 0%, 0%)" : "hsl(0, 0%, 100%)",
        border: adjustHslProperty(enhancedPalette.border, 'l', theme === "dark" ? 30 : -30),
      }
    }
    
    // Color blindness support
    if (mergedConfig.colorBlindnessSupport && userPreferences.colorBlindness) {
      switch (userPreferences.colorBlindness) {
        case "protanopia":
          // Red-blind: enhance green and blue channels
          enhancedPalette.error = "hsl(240, 100%, 50%)" // Blue instead of red
          enhancedPalette.success = adjustHslProperty(enhancedPalette.success, 's', 20)
          break
        case "deuteranopia":
          // Green-blind: enhance red and blue channels
          enhancedPalette.success = "hsl(240, 100%, 50%)" // Blue instead of green
          enhancedPalette.warning = adjustHslProperty(enhancedPalette.warning, 'h', -30)
          break
        case "tritanopia":
          // Blue-blind: enhance red and green channels
          enhancedPalette.primary = adjustHslProperty(enhancedPalette.primary, 'h', 60)
          enhancedPalette.info = adjustHslProperty(enhancedPalette.info, 'h', 60)
          break
      }
    }
    
    return enhancedPalette
  }, [
    mergedConfig.enableAccessibilityEnhancement,
    mergedConfig.colorBlindnessSupport,
    userPreferences,
    theme,
    adjustHslProperty,
  ])
  
  // === PERFORMANCE OPTIMIZATION ===
  
  const applyPerformanceOptimization = useCallback((palette: AdaptiveColorPalette): AdaptiveColorPalette => {
    if (!mergedConfig.enablePerformanceOptimization) return palette
    
    // Reduce saturation for long work sessions
    const currentHour = new Date().getHours()
    const workingHours = userPreferences.workingHours
    
    if (currentHour >= workingHours.start && currentHour <= workingHours.end) {
      const sessionDuration = currentHour - workingHours.start
      const fatigueAdjustment = Math.min(sessionDuration * -2, -10) // Gradual desaturation
      
      return {
        ...palette,
        primary: adjustHslProperty(palette.primary, 's', fatigueAdjustment),
        accent: adjustHslProperty(palette.accent, 's', fatigueAdjustment),
        background: adjustHslProperty(palette.background, 'l', Math.abs(fatigueAdjustment * 0.3)),
      }
    }
    
    return palette
  }, [mergedConfig.enablePerformanceOptimization, userPreferences, adjustHslProperty])
  
  // === COLOR METRICS CALCULATION ===
  
  const calculateColorMetrics = useCallback((palette: AdaptiveColorPalette): ColorMetrics => {
    const contrast = calculateContrast(palette.foreground, palette.background)
    
    let accessibility: ColorMetrics["accessibility"] = "FAIL"
    if (contrast >= 7) accessibility = "AAA"
    else if (contrast >= 4.5) accessibility = "AA"
    else if (contrast >= 3) accessibility = "A"
    
    // Calculate cognitive load based on color complexity
    const colorComplexity = Object.values(palette).reduce((acc, color) => {
      const rgb = hslToRgb(color)
      const variance = Math.sqrt(
        Math.pow(rgb[0] - 128, 2) + 
        Math.pow(rgb[1] - 128, 2) + 
        Math.pow(rgb[2] - 128, 2)
      ) / 128
      return acc + variance
    }, 0) / Object.keys(palette).length
    
    // Calculate eye strain index
    const blueLightAmount = hslToRgb(palette.background)[2] / 255
    const eyeStrainIndex = theme === "dark" ? blueLightAmount * 0.3 : blueLightAmount * 0.7
    
    return {
      contrast,
      readability: Math.min(contrast / 7, 1),
      accessibility,
      cognitiveLoad: colorComplexity,
      eyeStrainIndex,
    }
  }, [calculateContrast, hslToRgb, theme])
  
  // === MAIN ADAPTATION PIPELINE ===
  
  const generateAdaptivePalette = useCallback((): AdaptiveColorPalette => {
    // Start with base palette
    let palette: AdaptiveColorPalette = {
      primary: theme === "dark" ? "hsl(217, 91%, 60%)" : "hsl(217, 91%, 60%)",
      secondary: theme === "dark" ? "hsl(217.2, 32.6%, 17.5%)" : "hsl(210, 40%, 96%)",
      accent: theme === "dark" ? "hsl(217, 91%, 60%)" : "hsl(217, 91%, 60%)",
      background: theme === "dark" ? "hsl(222.2, 84%, 4.9%)" : "hsl(0, 0%, 100%)",
      foreground: theme === "dark" ? "hsl(210, 40%, 98%)" : "hsl(222.2, 84%, 4.9%)",
      muted: theme === "dark" ? "hsl(217.2, 32.6%, 17.5%)" : "hsl(210, 40%, 96%)",
      border: theme === "dark" ? "hsl(217.2, 32.6%, 17.5%)" : "hsl(214.3, 31.8%, 91.4%)",
      success: "hsl(142, 71%, 45%)",
      warning: "hsl(38, 92%, 50%)",
      error: "hsl(0, 84%, 60%)",
      info: "hsl(217, 91%, 60%)",
    }
    
    // Apply adaptation layers
    palette = applyCircadianAdaptation(palette)
    palette = applyCognitiveAdaptation(palette)
    palette = applyContextualAdaptation(palette)
    palette = applyAccessibilityEnhancement(palette)
    palette = applyPerformanceOptimization(palette)
    
    return palette
  }, [
    theme,
    applyCircadianAdaptation,
    applyCognitiveAdaptation,
    applyContextualAdaptation,
    applyAccessibilityEnhancement,
    applyPerformanceOptimization,
  ])
  
  // === EFFECTS ===
  
  useEffect(() => {
    const newPalette = generateAdaptivePalette()
    const metrics = calculateColorMetrics(newPalette)
    
    setAdaptedPalette(newPalette)
    setColorMetrics(metrics)
  }, [generateAdaptivePalette, calculateColorMetrics])
  
  // === PUBLIC API ===
  
  const getAdaptedColor = useCallback((colorKey: keyof AdaptiveColorPalette): string => {
    return adaptedPalette[colorKey]
  }, [adaptedPalette])
  
  const isHighContrast = useCallback((): boolean => {
    return colorMetrics.contrast >= 7
  }, [colorMetrics])
  
  const getColorForContext = useCallback((
    baseColor: string,
    targetContext: "financial" | "operational" | "strategic"
  ): string => {
    switch (targetContext) {
      case "financial":
        return adjustHslProperty(baseColor, 'h', -10) // Slightly blue shift for trust
      case "operational":
        return baseColor // Keep original
      case "strategic":
        return adjustHslProperty(baseColor, 'h', 30) // Purple shift for innovation
      default:
        return baseColor
    }
  }, [adjustHslProperty])
  
  return {
    adaptedPalette,
    colorMetrics,
    getAdaptedColor,
    isHighContrast,
    getColorForContext,
    calculateContrast,
    adjustHslProperty,
  }
}