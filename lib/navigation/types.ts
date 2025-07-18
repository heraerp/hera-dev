import { LucideIcon } from "lucide-react"

// Navigation Types
export type NavigationItem = {
  id: string
  label: string
  icon?: LucideIcon
  href?: string
  action?: () => void
  badge?: string | number
  badgeVariant?: "default" | "success" | "warning" | "error"
  shortcut?: string[]
  description?: string
  keywords?: string[]
  category?: string
  children?: NavigationItem[]
  permissions?: string[]
  contextualData?: Record<string, any>
  aiScore?: number
  lastAccessed?: Date
  accessCount?: number
  isPinned?: boolean
  isHidden?: boolean
  customColor?: string
  tooltip?: string
}

export type NavigationCategory = {
  id: string
  label: string
  icon?: LucideIcon
  items: NavigationItem[]
  sortOrder?: number
  isCollapsed?: boolean
}

export type NavigationContext = "financial" | "operational" | "strategic" | "default"

export type NavigationMode = "default" | "compact" | "minimal" | "command"

export type NavigationPosition = "left" | "right" | "top" | "bottom"

// AI Navigation Types
export type NavigationPrediction = {
  itemId: string
  score: number
  reason: string
  confidence: number
  contextFactors: string[]
}

export type NavigationInsight = {
  id: string
  type: "suggestion" | "warning" | "info" | "success"
  title: string
  description: string
  relatedItemIds?: string[]
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  expiresAt?: Date
}

export type NavigationAnalytics = {
  userId: string
  sessionId: string
  timestamp: Date
  itemId: string
  action: "click" | "hover" | "search" | "keyboard" | "voice" | "gesture"
  context: NavigationContext
  duration?: number
  searchQuery?: string
  previousItemId?: string
}

// Command Palette Types
export type CommandItem = NavigationItem & {
  group?: string
  priority?: number
  aliases?: string[]
  executeCommand?: (args?: any) => Promise<void>
  preview?: () => React.ReactNode
}

export type CommandGroup = {
  id: string
  label: string
  items: CommandItem[]
  sortOrder?: number
}

// Breadcrumb Types
export type BreadcrumbItem = {
  id: string
  label: string
  href?: string
  icon?: LucideIcon
  isActive?: boolean
  isDynamic?: boolean
  contextualInfo?: string
}

// Navigation State
export type NavigationState = {
  // Core State
  items: NavigationItem[]
  categories: NavigationCategory[]
  currentPath: string
  mode: NavigationMode
  position: NavigationPosition
  isCollapsed: boolean
  isMobileOpen: boolean
  
  // AI State
  predictions: NavigationPrediction[]
  insights: NavigationInsight[]
  recentItems: NavigationItem[]
  pinnedItems: NavigationItem[]
  
  // Search State
  searchQuery: string
  searchResults: NavigationItem[]
  isSearching: boolean
  
  // Command Palette State
  isCommandPaletteOpen: boolean
  commandHistory: string[]
  
  // User Preferences
  userPreferences: {
    defaultMode: NavigationMode
    defaultPosition: NavigationPosition
    showShortcuts: boolean
    enableAI: boolean
    enableVoice: boolean
    enableGestures: boolean
    autoCollapse: boolean
    density: "comfortable" | "compact" | "spacious"
  }
}

// Navigation Actions
export type NavigationAction =
  | { type: "SET_ITEMS"; payload: NavigationItem[] }
  | { type: "SET_CATEGORIES"; payload: NavigationCategory[] }
  | { type: "SET_CURRENT_PATH"; payload: string }
  | { type: "SET_MODE"; payload: NavigationMode }
  | { type: "SET_POSITION"; payload: NavigationPosition }
  | { type: "TOGGLE_COLLAPSE" }
  | { type: "TOGGLE_MOBILE" }
  | { type: "SET_PREDICTIONS"; payload: NavigationPrediction[] }
  | { type: "ADD_INSIGHT"; payload: NavigationInsight }
  | { type: "REMOVE_INSIGHT"; payload: string }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SEARCH_RESULTS"; payload: NavigationItem[] }
  | { type: "TOGGLE_COMMAND_PALETTE" }
  | { type: "ADD_TO_HISTORY"; payload: string }
  | { type: "PIN_ITEM"; payload: string }
  | { type: "UNPIN_ITEM"; payload: string }
  | { type: "UPDATE_PREFERENCES"; payload: Partial<NavigationState["userPreferences"]> }
  | { type: "TRACK_ITEM_ACCESS"; payload: string }

// Provider Props
export interface NavigationProviderProps {
  children: React.ReactNode
  initialItems?: NavigationItem[]
  initialCategories?: NavigationCategory[]
  enableAI?: boolean
  enableAnalytics?: boolean
  onNavigate?: (item: NavigationItem) => void
  onSearch?: (query: string) => Promise<NavigationItem[]>
  customTheme?: {
    colors?: Record<string, string>
    animations?: Record<string, any>
  }
}

// Context Value
export interface NavigationContextValue extends NavigationState {
  // Actions
  navigate: (itemId: string) => void
  search: (query: string) => Promise<void>
  toggleCollapse: () => void
  toggleMobile: () => void
  setMode: (mode: NavigationMode) => void
  setPosition: (position: NavigationPosition) => void
  pinItem: (itemId: string) => void
  unpinItem: (itemId: string) => void
  
  // Command Palette
  openCommandPalette: () => void
  closeCommandPalette: () => void
  executeCommand: (commandId: string) => Promise<void>
  
  // AI Features
  getRecommendations: () => NavigationPrediction[]
  dismissInsight: (insightId: string) => void
  
  // Analytics
  trackInteraction: (analytics: Omit<NavigationAnalytics, "userId" | "sessionId" | "timestamp">) => void
}

// Hook Return Types
export interface UseNavigationReturn {
  items: NavigationItem[]
  currentPath: string
  isCollapsed: boolean
  navigate: (itemId: string) => void
  isActive: (itemId: string) => boolean
}

export interface UseCommandPaletteReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  search: (query: string) => void
  results: CommandItem[]
  execute: (commandId: string) => Promise<void>
}

export interface UseBreadcrumbsReturn {
  items: BreadcrumbItem[]
  navigate: (itemId: string) => void
}

export interface UseNavigationAIReturn {
  predictions: NavigationPrediction[]
  insights: NavigationInsight[]
  getRecommendations: () => NavigationPrediction[]
  trackInteraction: (itemId: string) => void
}