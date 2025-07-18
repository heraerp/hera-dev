"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { 
  NavigationItem, 
  NavigationCategory, 
  NavigationState, 
  NavigationAction,
  NavigationContextValue,
  NavigationProviderProps,
  NavigationPrediction,
  NavigationInsight,
  NavigationAnalytics,
  NavigationContext
} from "@/lib/navigation/types"
import { aiNavigationEngine } from "@/lib/navigation/ai-engine"
import { useTheme } from "./theme-provider"

// Initial state
const initialState: NavigationState = {
  items: [],
  categories: [],
  currentPath: "",
  mode: "default",
  position: "left",
  isCollapsed: false,
  isMobileOpen: false,
  predictions: [],
  insights: [],
  recentItems: [],
  pinnedItems: [],
  searchQuery: "",
  searchResults: [],
  isSearching: false,
  isCommandPaletteOpen: false,
  commandHistory: [],
  userPreferences: {
    defaultMode: "default",
    defaultPosition: "left",
    showShortcuts: true,
    enableAI: true,
    enableVoice: false,
    enableGestures: true,
    autoCollapse: false,
    density: "comfortable"
  }
}

// Reducer
function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.payload }
    
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload }
    
    case "SET_CURRENT_PATH":
      return { ...state, currentPath: action.payload }
    
    case "SET_MODE":
      return { ...state, mode: action.payload }
    
    case "SET_POSITION":
      return { ...state, position: action.payload }
    
    case "TOGGLE_COLLAPSE":
      return { ...state, isCollapsed: !state.isCollapsed }
    
    case "TOGGLE_MOBILE":
      return { ...state, isMobileOpen: !state.isMobileOpen }
    
    case "SET_PREDICTIONS":
      return { ...state, predictions: action.payload }
    
    case "ADD_INSIGHT":
      return { 
        ...state, 
        insights: [action.payload, ...state.insights.slice(0, 4)] // Keep max 5 insights
      }
    
    case "REMOVE_INSIGHT":
      return { 
        ...state, 
        insights: state.insights.filter(insight => insight.id !== action.payload)
      }
    
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload }
    
    case "SET_SEARCH_RESULTS":
      return { ...state, searchResults: action.payload, isSearching: false }
    
    case "TOGGLE_COMMAND_PALETTE":
      return { ...state, isCommandPaletteOpen: !state.isCommandPaletteOpen }
    
    case "ADD_TO_HISTORY":
      return { 
        ...state, 
        commandHistory: [action.payload, ...state.commandHistory.slice(0, 9)] // Keep max 10
      }
    
    case "PIN_ITEM": {
      const item = state.items.find(item => item.id === action.payload)
      if (!item || state.pinnedItems.some(pinned => pinned.id === action.payload)) {
        return state
      }
      return { 
        ...state, 
        pinnedItems: [...state.pinnedItems, { ...item, isPinned: true }]
      }
    }
    
    case "UNPIN_ITEM":
      return { 
        ...state, 
        pinnedItems: state.pinnedItems.filter(item => item.id !== action.payload)
      }
    
    case "UPDATE_PREFERENCES":
      return { 
        ...state, 
        userPreferences: { ...state.userPreferences, ...action.payload }
      }
    
    case "TRACK_ITEM_ACCESS": {
      const item = state.items.find(item => item.id === action.payload)
      if (!item) return state
      
      const updatedItem = {
        ...item,
        lastAccessed: new Date(),
        accessCount: (item.accessCount || 0) + 1
      }
      
      const updatedItems = state.items.map(i => i.id === action.payload ? updatedItem : i)
      const recentItems = [
        updatedItem,
        ...state.recentItems.filter(recent => recent.id !== action.payload)
      ].slice(0, 10) // Keep max 10 recent items
      
      return { 
        ...state, 
        items: updatedItems,
        recentItems
      }
    }
    
    default:
      return state
  }
}

// Context
const NavigationContext = React.createContext<NavigationContextValue | null>(null)

// Provider Component
export function NavigationProvider({
  children,
  initialItems = [],
  initialCategories = [],
  enableAI = true,
  enableAnalytics = true,
  onNavigate,
  onSearch,
  customTheme
}: NavigationProviderProps) {
  const [state, dispatch] = React.useReducer(navigationReducer, {
    ...initialState,
    items: initialItems,
    categories: initialCategories
  })
  
  const router = useRouter()
  const pathname = usePathname()
  const { context: themeContext } = useTheme()
  const sessionId = React.useRef(crypto.randomUUID())
  const userId = React.useRef("user-123") // TODO: Get from auth context

  // Update current path when pathname changes
  React.useEffect(() => {
    dispatch({ type: "SET_CURRENT_PATH", payload: pathname })
  }, [pathname])

  // Generate AI predictions periodically
  React.useEffect(() => {
    if (!enableAI || state.items.length === 0) return

    const generatePredictions = () => {
      const predictions = aiNavigationEngine.generatePredictions(
        state.items,
        themeContext as NavigationContext,
        userId.current
      )
      dispatch({ type: "SET_PREDICTIONS", payload: predictions })
    }

    // Generate initial predictions
    generatePredictions()

    // Update predictions every 5 minutes
    const interval = setInterval(generatePredictions, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [enableAI, state.items, themeContext])

  // Generate AI insights
  React.useEffect(() => {
    if (!enableAI || state.items.length === 0) return

    const generateInsights = () => {
      const insights = aiNavigationEngine.generateInsights(
        state.items,
        themeContext as NavigationContext,
        userId.current
      )
      
      insights.forEach(insight => {
        dispatch({ type: "ADD_INSIGHT", payload: insight })
      })
    }

    // Generate insights on significant changes
    const timeout = setTimeout(generateInsights, 1000)
    return () => clearTimeout(timeout)
  }, [enableAI, state.items.length, themeContext])

  // Navigation actions
  const navigate = React.useCallback((itemId: string) => {
    const item = state.items.find(item => item.id === itemId)
    if (!item) return

    // Track interaction
    if (enableAnalytics) {
      const analytics: NavigationAnalytics = {
        userId: userId.current,
        sessionId: sessionId.current,
        timestamp: new Date(),
        itemId,
        action: "click",
        context: themeContext as NavigationContext,
        previousItemId: state.currentPath
      }
      aiNavigationEngine.trackInteraction(analytics)
    }

    // Update access tracking
    dispatch({ type: "TRACK_ITEM_ACCESS", payload: itemId })

    // Handle navigation
    if (item.href) {
      router.push(item.href)
    } else if (item.action) {
      item.action()
    }

    // Close mobile menu
    if (state.isMobileOpen) {
      dispatch({ type: "TOGGLE_MOBILE" })
    }

    // Custom navigation handler
    onNavigate?.(item)
  }, [state.items, state.currentPath, state.isMobileOpen, enableAnalytics, themeContext, router, onNavigate])

  // Search functionality
  const search = React.useCallback(async (query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query })
    
    if (!query.trim()) {
      dispatch({ type: "SET_SEARCH_RESULTS", payload: [] })
      return
    }

    // Track search interaction
    if (enableAnalytics) {
      const analytics: NavigationAnalytics = {
        userId: userId.current,
        sessionId: sessionId.current,
        timestamp: new Date(),
        itemId: "search",
        action: "search",
        context: themeContext as NavigationContext,
        searchQuery: query
      }
      aiNavigationEngine.trackInteraction(analytics)
    }

    try {
      let results: NavigationItem[]

      if (onSearch) {
        // Use custom search
        results = await onSearch(query)
      } else {
        // Default search implementation
        const lowercaseQuery = query.toLowerCase()
        results = state.items.filter(item => 
          item.label.toLowerCase().includes(lowercaseQuery) ||
          item.description?.toLowerCase().includes(lowercaseQuery) ||
          item.keywords?.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
        )

        // Add AI scoring to search results
        if (enableAI) {
          const predictions = aiNavigationEngine.generatePredictions(
            results,
            themeContext as NavigationContext,
            userId.current
          )
          
          const predictionMap = new Map(predictions.map(p => [p.itemId, p.score]))
          results = results.sort((a, b) => {
            const scoreA = predictionMap.get(a.id) || 0
            const scoreB = predictionMap.get(b.id) || 0
            return scoreB - scoreA
          })
        }
      }

      dispatch({ type: "SET_SEARCH_RESULTS", payload: results })
    } catch (error) {
      console.error("Search failed:", error)
      dispatch({ type: "SET_SEARCH_RESULTS", payload: [] })
    }
  }, [state.items, enableAnalytics, enableAI, themeContext, onSearch])

  // Command palette actions
  const openCommandPalette = React.useCallback(() => {
    dispatch({ type: "TOGGLE_COMMAND_PALETTE" })
  }, [])

  const closeCommandPalette = React.useCallback(() => {
    if (state.isCommandPaletteOpen) {
      dispatch({ type: "TOGGLE_COMMAND_PALETTE" })
    }
  }, [state.isCommandPaletteOpen])

  const executeCommand = React.useCallback(async (commandId: string) => {
    dispatch({ type: "ADD_TO_HISTORY", payload: commandId })
    
    // Track command execution
    if (enableAnalytics) {
      const analytics: NavigationAnalytics = {
        userId: userId.current,
        sessionId: sessionId.current,
        timestamp: new Date(),
        itemId: commandId,
        action: "keyboard",
        context: themeContext as NavigationContext
      }
      aiNavigationEngine.trackInteraction(analytics)
    }

    // Execute the command (delegate to navigate for now)
    navigate(commandId)
    closeCommandPalette()
  }, [enableAnalytics, themeContext, navigate, closeCommandPalette])

  // AI features
  const getRecommendations = React.useCallback((): NavigationPrediction[] => {
    if (!enableAI) return []
    return state.predictions.slice(0, 5)
  }, [enableAI, state.predictions])

  const dismissInsight = React.useCallback((insightId: string) => {
    dispatch({ type: "REMOVE_INSIGHT", payload: insightId })
  }, [])

  // Analytics tracking
  const trackInteraction = React.useCallback((
    analytics: Omit<NavigationAnalytics, "userId" | "sessionId" | "timestamp">
  ) => {
    if (!enableAnalytics) return

    const fullAnalytics: NavigationAnalytics = {
      ...analytics,
      userId: userId.current,
      sessionId: sessionId.current,
      timestamp: new Date()
    }

    aiNavigationEngine.trackInteraction(fullAnalytics)
  }, [enableAnalytics])

  // Other actions
  const toggleCollapse = React.useCallback(() => {
    dispatch({ type: "TOGGLE_COLLAPSE" })
  }, [])

  const toggleMobile = React.useCallback(() => {
    dispatch({ type: "TOGGLE_MOBILE" })
  }, [])

  const setMode = React.useCallback((mode: NavigationState["mode"]) => {
    dispatch({ type: "SET_MODE", payload: mode })
  }, [])

  const setPosition = React.useCallback((position: NavigationState["position"]) => {
    dispatch({ type: "SET_POSITION", payload: position })
  }, [])

  const pinItem = React.useCallback((itemId: string) => {
    dispatch({ type: "PIN_ITEM", payload: itemId })
  }, [])

  const unpinItem = React.useCallback((itemId: string) => {
    dispatch({ type: "UNPIN_ITEM", payload: itemId })
  }, [])

  // Context value
  const contextValue: NavigationContextValue = {
    ...state,
    navigate,
    search,
    toggleCollapse,
    toggleMobile,
    setMode,
    setPosition,
    pinItem,
    unpinItem,
    openCommandPalette,
    closeCommandPalette,
    executeCommand,
    getRecommendations,
    dismissInsight,
    trackInteraction
  }

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  )
}

// Hook to use navigation context
export function useNavigation(): NavigationContextValue {
  const context = React.useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider")
  }
  return context
}

// Specialized hooks
export function useNavigationItems() {
  const { items, currentPath, isCollapsed, navigate } = useNavigation()
  
  const isActive = React.useCallback((itemId: string) => {
    const item = items.find(item => item.id === itemId)
    return item?.href === currentPath
  }, [items, currentPath])

  return {
    items,
    currentPath,
    isCollapsed,
    navigate,
    isActive
  }
}

export function useCommandPalette() {
  const { 
    isCommandPaletteOpen, 
    searchResults, 
    searchQuery,
    openCommandPalette, 
    closeCommandPalette, 
    executeCommand,
    search
  } = useNavigation()

  return {
    isOpen: isCommandPaletteOpen,
    results: searchResults,
    query: searchQuery,
    open: openCommandPalette,
    close: closeCommandPalette,
    execute: executeCommand,
    search
  }
}

export function useNavigationAI() {
  const { predictions, insights, getRecommendations, trackInteraction, dismissInsight } = useNavigation()

  return {
    predictions,
    insights,
    getRecommendations,
    trackInteraction,
    dismissInsight
  }
}