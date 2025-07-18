"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// === REVOLUTIONARY GESTURE SYSTEM ===

export interface GestureConfig {
  swipeThreshold: number
  pinchThreshold: number
  longPressDelay: number
  doubleTapDelay: number
  velocityThreshold: number
  enabledGestures: GestureType[]
}

export type GestureType = 
  | "swipeLeft" 
  | "swipeRight" 
  | "swipeUp" 
  | "swipeDown"
  | "pinchZoom"
  | "pinchOut"
  | "longPress"
  | "doubleTap"
  | "twoFingerScroll"
  | "threeFingerTap"

export interface GestureEvent {
  type: GestureType
  startPoint: { x: number; y: number }
  endPoint: { x: number; y: number }
  velocity: { x: number; y: number }
  distance: number
  scale?: number
  duration: number
  preventDefault: () => void
  element: HTMLElement
}

export interface GestureHandlers {
  onSwipeLeft?: (event: GestureEvent) => void
  onSwipeRight?: (event: GestureEvent) => void
  onSwipeUp?: (event: GestureEvent) => void
  onSwipeDown?: (event: GestureEvent) => void
  onPinchZoom?: (event: GestureEvent) => void
  onPinchOut?: (event: GestureEvent) => void
  onLongPress?: (event: GestureEvent) => void
  onDoubleTap?: (event: GestureEvent) => void
  onTwoFingerScroll?: (event: GestureEvent) => void
  onThreeFingerTap?: (event: GestureEvent) => void
}

const defaultConfig: GestureConfig = {
  swipeThreshold: 50,
  pinchThreshold: 0.1,
  longPressDelay: 500,
  doubleTapDelay: 300,
  velocityThreshold: 0.5,
  enabledGestures: [
    "swipeLeft",
    "swipeRight", 
    "swipeUp",
    "swipeDown",
    "pinchZoom",
    "pinchOut",
    "longPress",
    "doubleTap",
    "twoFingerScroll",
    "threeFingerTap"
  ],
}

export function useGestures(
  elementRef: React.RefObject<HTMLElement>,
  handlers: GestureHandlers,
  config: Partial<GestureConfig> = {}
) {
  const mergedConfig = { ...defaultConfig, ...config }
  const gestureState = useRef({
    isTracking: false,
    startTime: 0,
    startPoint: { x: 0, y: 0 },
    currentPoint: { x: 0, y: 0 },
    startDistance: 0,
    currentDistance: 0,
    startScale: 1,
    touches: [] as Touch[],
    longPressTimer: null as NodeJS.Timeout | null,
    lastTapTime: 0,
    tapCount: 0,
  })
  
  // === UTILITY FUNCTIONS ===
  
  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])
  
  const getVelocity = useCallback((startPoint: { x: number; y: number }, endPoint: { x: number; y: number }, duration: number) => {
    const dx = endPoint.x - startPoint.x
    const dy = endPoint.y - startPoint.y
    return {
      x: duration > 0 ? dx / duration : 0,
      y: duration > 0 ? dy / duration : 0,
    }
  }, [])
  
  const createGestureEvent = useCallback((
    type: GestureType,
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    duration: number,
    element: HTMLElement,
    scale?: number
  ): GestureEvent => {
    const distance = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) + 
      Math.pow(endPoint.y - startPoint.y, 2)
    )
    
    const velocity = getVelocity(startPoint, endPoint, duration)
    
    return {
      type,
      startPoint,
      endPoint,
      velocity,
      distance,
      scale,
      duration,
      element,
      preventDefault: () => {
        // Prevent default browser gestures
      },
    }
  }, [getVelocity])
  
  // === GESTURE DETECTION ===
  
  const detectSwipe = useCallback((
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    velocity: { x: number; y: number }
  ): GestureType | null => {
    const dx = endPoint.x - startPoint.x
    const dy = endPoint.y - startPoint.y
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    
    // Check if velocity is sufficient
    const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
    if (velocityMagnitude < mergedConfig.velocityThreshold) return null
    
    // Horizontal swipe
    if (absDx > absDy && absDx > mergedConfig.swipeThreshold) {
      return dx > 0 ? "swipeRight" : "swipeLeft"
    }
    
    // Vertical swipe
    if (absDy > absDx && absDy > mergedConfig.swipeThreshold) {
      return dy > 0 ? "swipeDown" : "swipeUp"
    }
    
    return null
  }, [mergedConfig.swipeThreshold, mergedConfig.velocityThreshold])
  
  const detectPinch = useCallback((
    startDistance: number,
    currentDistance: number
  ): GestureType | null => {
    const scale = currentDistance / startDistance
    const scaleChange = Math.abs(scale - 1)
    
    if (scaleChange < mergedConfig.pinchThreshold) return null
    
    return scale > 1 ? "pinchZoom" : "pinchOut"
  }, [mergedConfig.pinchThreshold])
  
  // === EVENT HANDLERS ===
  
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const element = elementRef.current
    if (!element) return
    
    const touches = Array.from(event.touches)
    const now = Date.now()
    
    gestureState.current = {
      ...gestureState.current,
      isTracking: true,
      startTime: now,
      startPoint: { x: touches[0].clientX, y: touches[0].clientY },
      currentPoint: { x: touches[0].clientX, y: touches[0].clientY },
      touches,
    }
    
    // Handle multi-touch
    if (touches.length === 2) {
      gestureState.current.startDistance = getDistance(touches[0], touches[1])
      gestureState.current.currentDistance = gestureState.current.startDistance
    }
    
    // Start long press detection
    if (mergedConfig.enabledGestures.includes("longPress")) {
      gestureState.current.longPressTimer = setTimeout(() => {
        if (gestureState.current.isTracking) {
          const gestureEvent = createGestureEvent(
            "longPress",
            gestureState.current.startPoint,
            gestureState.current.currentPoint,
            now - gestureState.current.startTime,
            element
          )
          handlers.onLongPress?.(gestureEvent)
        }
      }, mergedConfig.longPressDelay)
    }
    
    // Handle tap detection
    if (mergedConfig.enabledGestures.includes("doubleTap")) {
      const timeSinceLastTap = now - gestureState.current.lastTapTime
      
      if (timeSinceLastTap < mergedConfig.doubleTapDelay) {
        gestureState.current.tapCount++
      } else {
        gestureState.current.tapCount = 1
      }
      
      gestureState.current.lastTapTime = now
    }
    
    // Handle three finger tap
    if (touches.length === 3 && mergedConfig.enabledGestures.includes("threeFingerTap")) {
      const gestureEvent = createGestureEvent(
        "threeFingerTap",
        gestureState.current.startPoint,
        gestureState.current.currentPoint,
        0,
        element
      )
      handlers.onThreeFingerTap?.(gestureEvent)
    }
  }, [elementRef, mergedConfig, handlers, getDistance, createGestureEvent])
  
  const handleTouchMove = useCallback((event: TouchEvent) => {
    const element = elementRef.current
    if (!element || !gestureState.current.isTracking) return
    
    const touches = Array.from(event.touches)
    const currentPoint = { x: touches[0].clientX, y: touches[0].clientY }
    
    gestureState.current.currentPoint = currentPoint
    
    // Handle pinch gestures
    if (touches.length === 2) {
      const currentDistance = getDistance(touches[0], touches[1])
      gestureState.current.currentDistance = currentDistance
      
      const pinchType = detectPinch(
        gestureState.current.startDistance,
        currentDistance
      )
      
      if (pinchType && mergedConfig.enabledGestures.includes(pinchType)) {
        const scale = currentDistance / gestureState.current.startDistance
        const gestureEvent = createGestureEvent(
          pinchType,
          gestureState.current.startPoint,
          currentPoint,
          Date.now() - gestureState.current.startTime,
          element,
          scale
        )
        
        if (pinchType === "pinchZoom") {
          handlers.onPinchZoom?.(gestureEvent)
        } else {
          handlers.onPinchOut?.(gestureEvent)
        }
      }
    }
    
    // Handle two finger scroll
    if (touches.length === 2 && mergedConfig.enabledGestures.includes("twoFingerScroll")) {
      const gestureEvent = createGestureEvent(
        "twoFingerScroll",
        gestureState.current.startPoint,
        currentPoint,
        Date.now() - gestureState.current.startTime,
        element
      )
      handlers.onTwoFingerScroll?.(gestureEvent)
    }
    
    // Cancel long press if finger moves too much
    const distance = Math.sqrt(
      Math.pow(currentPoint.x - gestureState.current.startPoint.x, 2) +
      Math.pow(currentPoint.y - gestureState.current.startPoint.y, 2)
    )
    
    if (distance > 10 && gestureState.current.longPressTimer) {
      clearTimeout(gestureState.current.longPressTimer)
      gestureState.current.longPressTimer = null
    }
  }, [elementRef, mergedConfig, handlers, getDistance, detectPinch, createGestureEvent])
  
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    const element = elementRef.current
    if (!element || !gestureState.current.isTracking) return
    
    const now = Date.now()
    const duration = now - gestureState.current.startTime
    const velocity = getVelocity(
      gestureState.current.startPoint,
      gestureState.current.currentPoint,
      duration
    )
    
    // Clear long press timer
    if (gestureState.current.longPressTimer) {
      clearTimeout(gestureState.current.longPressTimer)
      gestureState.current.longPressTimer = null
    }
    
    // Detect swipe gestures
    const swipeType = detectSwipe(
      gestureState.current.startPoint,
      gestureState.current.currentPoint,
      velocity
    )
    
    if (swipeType && mergedConfig.enabledGestures.includes(swipeType)) {
      const gestureEvent = createGestureEvent(
        swipeType,
        gestureState.current.startPoint,
        gestureState.current.currentPoint,
        duration,
        element
      )
      
      switch (swipeType) {
        case "swipeLeft":
          handlers.onSwipeLeft?.(gestureEvent)
          break
        case "swipeRight":
          handlers.onSwipeRight?.(gestureEvent)
          break
        case "swipeUp":
          handlers.onSwipeUp?.(gestureEvent)
          break
        case "swipeDown":
          handlers.onSwipeDown?.(gestureEvent)
          break
      }
    }
    
    // Handle double tap
    if (
      mergedConfig.enabledGestures.includes("doubleTap") &&
      gestureState.current.tapCount === 2 &&
      duration < 200
    ) {
      const gestureEvent = createGestureEvent(
        "doubleTap",
        gestureState.current.startPoint,
        gestureState.current.currentPoint,
        duration,
        element
      )
      handlers.onDoubleTap?.(gestureEvent)
      gestureState.current.tapCount = 0
    }
    
    // Reset tracking state
    gestureState.current = {
      ...gestureState.current,
      isTracking: false,
    }
  }, [elementRef, mergedConfig, handlers, getVelocity, detectSwipe, createGestureEvent])
  
  // === MOUSE EVENT HANDLERS ===
  
  const handleMouseDown = useCallback((event: MouseEvent) => {
    const element = elementRef.current
    if (!element) return
    
    const now = Date.now()
    
    gestureState.current = {
      ...gestureState.current,
      isTracking: true,
      startTime: now,
      startPoint: { x: event.clientX, y: event.clientY },
      currentPoint: { x: event.clientX, y: event.clientY },
      touches: [],
    }
    
    // Start long press detection for mouse
    if (mergedConfig.enabledGestures.includes("longPress")) {
      gestureState.current.longPressTimer = setTimeout(() => {
        if (gestureState.current.isTracking) {
          const gestureEvent = createGestureEvent(
            "longPress",
            gestureState.current.startPoint,
            gestureState.current.currentPoint,
            now - gestureState.current.startTime,
            element
          )
          handlers.onLongPress?.(gestureEvent)
        }
      }, mergedConfig.longPressDelay)
    }
    
    // Handle double click
    const timeSinceLastTap = now - gestureState.current.lastTapTime
    
    if (timeSinceLastTap < mergedConfig.doubleTapDelay) {
      gestureState.current.tapCount++
    } else {
      gestureState.current.tapCount = 1
    }
    
    gestureState.current.lastTapTime = now
  }, [elementRef, mergedConfig, handlers, createGestureEvent])
  
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!gestureState.current.isTracking) return
    
    gestureState.current.currentPoint = { x: event.clientX, y: event.clientY }
    
    // Cancel long press if mouse moves too much
    const distance = Math.sqrt(
      Math.pow(event.clientX - gestureState.current.startPoint.x, 2) +
      Math.pow(event.clientY - gestureState.current.startPoint.y, 2)
    )
    
    if (distance > 10 && gestureState.current.longPressTimer) {
      clearTimeout(gestureState.current.longPressTimer)
      gestureState.current.longPressTimer = null
    }
  }, [])
  
  const handleMouseUp = useCallback((event: MouseEvent) => {
    const element = elementRef.current
    if (!element || !gestureState.current.isTracking) return
    
    const now = Date.now()
    const duration = now - gestureState.current.startTime
    const velocity = getVelocity(
      gestureState.current.startPoint,
      { x: event.clientX, y: event.clientY },
      duration
    )
    
    // Clear long press timer
    if (gestureState.current.longPressTimer) {
      clearTimeout(gestureState.current.longPressTimer)
      gestureState.current.longPressTimer = null
    }
    
    // Detect swipe with mouse
    const swipeType = detectSwipe(
      gestureState.current.startPoint,
      { x: event.clientX, y: event.clientY },
      velocity
    )
    
    if (swipeType && mergedConfig.enabledGestures.includes(swipeType)) {
      const gestureEvent = createGestureEvent(
        swipeType,
        gestureState.current.startPoint,
        { x: event.clientX, y: event.clientY },
        duration,
        element
      )
      
      switch (swipeType) {
        case "swipeLeft":
          handlers.onSwipeLeft?.(gestureEvent)
          break
        case "swipeRight":
          handlers.onSwipeRight?.(gestureEvent)
          break
        case "swipeUp":
          handlers.onSwipeUp?.(gestureEvent)
          break
        case "swipeDown":
          handlers.onSwipeDown?.(gestureEvent)
          break
      }
    }
    
    // Handle double click
    if (
      mergedConfig.enabledGestures.includes("doubleTap") &&
      gestureState.current.tapCount === 2 &&
      duration < 200
    ) {
      const gestureEvent = createGestureEvent(
        "doubleTap",
        gestureState.current.startPoint,
        { x: event.clientX, y: event.clientY },
        duration,
        element
      )
      handlers.onDoubleTap?.(gestureEvent)
      gestureState.current.tapCount = 0
    }
    
    gestureState.current.isTracking = false
  }, [elementRef, mergedConfig, handlers, getVelocity, detectSwipe, createGestureEvent])
  
  // === ATTACH EVENT LISTENERS ===
  
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    // Touch events
    element.addEventListener("touchstart", handleTouchStart, { passive: false })
    element.addEventListener("touchmove", handleTouchMove, { passive: false })
    element.addEventListener("touchend", handleTouchEnd, { passive: false })
    
    // Mouse events
    element.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    
    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
      element.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      
      // Clear any pending timers
      if (gestureState.current.longPressTimer) {
        clearTimeout(gestureState.current.longPressTimer)
      }
    }
  }, [
    elementRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  ])
  
  return {
    gestureConfig: mergedConfig,
    isTracking: gestureState.current.isTracking,
  }
}