"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, Command, ArrowRight, Clock, Star, Zap, Lightbulb,
  ChevronRight, Keyboard, Mic, MicOff, Sparkles, TrendingUp,
  Hash, AtSign, Calendar, FileText, Users, Settings, BarChart3
} from "lucide-react"
import { useCommandPalette, useNavigationAI } from "@/components/providers/navigation-provider"
import { useTheme } from "@/components/providers/theme-provider"
import { useAdaptiveColor } from "@/hooks/use-adaptive-color"
import { useGestures } from "@/hooks/use-gestures"
import { Button } from "@/components/ui/revolutionary-button"
import { Card } from "@/components/ui/revolutionary-card"
import { cn } from "@/lib/utils"
import motionConfig from "@/lib/motion"
import { CommandItem, CommandGroup } from "@/lib/navigation/types"

interface CommandPaletteProps {
  enableVoice?: boolean
  enableNLP?: boolean
  maxResults?: number
  showRecentCommands?: boolean
  showKeyboardShortcuts?: boolean
}

export function CommandPalette({
  enableVoice = false,
  enableNLP = true,
  maxResults = 10,
  showRecentCommands = true,
  showKeyboardShortcuts = true
}: CommandPaletteProps) {
  const { isOpen, results, query, open, close, execute, search } = useCommandPalette()
  const { predictions, insights, getRecommendations } = useNavigationAI()
  const { getAdaptedColor, getColorForContext } = useAdaptiveColor()
  const { context: themeContext } = useTheme()

  // Local state
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [isVoiceActive, setIsVoiceActive] = React.useState(false)
  const [commandGroups, setCommandGroups] = React.useState<CommandGroup[]>([])
  const [recentCommands, setRecentCommands] = React.useState<CommandItem[]>([])
  const [nlpSuggestions, setNlpSuggestions] = React.useState<string[]>([])

  // Refs
  const inputRef = React.useRef<HTMLInputElement>(null)
  const paletteRef = React.useRef<HTMLDivElement>(null)
  const voiceRef = React.useRef<any>(null)

  // Focus input when palette opens
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, Math.max(0, getAllItems().length - 1)))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case "Enter":
          e.preventDefault()
          handleExecuteSelected()
          break
        case "Escape":
          e.preventDefault()
          close()
          break
        case "Tab":
          e.preventDefault()
          if (nlpSuggestions.length > 0) {
            search(nlpSuggestions[0])
          }
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, selectedIndex, nlpSuggestions])

  // Voice recognition setup
  React.useEffect(() => {
    if (!enableVoice || typeof window === "undefined") return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    voiceRef.current = new SpeechRecognition()
    voiceRef.current.continuous = false
    voiceRef.current.interimResults = true
    voiceRef.current.lang = "en-US"

    voiceRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      search(transcript)
    }

    voiceRef.current.onend = () => {
      setIsVoiceActive(false)
    }

    voiceRef.current.onerror = () => {
      setIsVoiceActive(false)
    }

    return () => {
      if (voiceRef.current) {
        voiceRef.current.stop()
      }
    }
  }, [enableVoice])

  // Natural Language Processing
  React.useEffect(() => {
    if (!enableNLP || !query.trim()) {
      setNlpSuggestions([])
      return
    }

    const processNLP = async () => {
      // Simulate NLP processing
      const suggestions = generateNLPSuggestions(query)
      setNlpSuggestions(suggestions)
    }

    const debounceTimer = setTimeout(processNLP, 300)
    return () => clearTimeout(debounceTimer)
  }, [query, enableNLP])

  // Generate command groups
  React.useEffect(() => {
    const groups: CommandGroup[] = []

    // AI Recommendations
    if (predictions.length > 0 && !query) {
      groups.push({
        id: "ai-recommendations",
        label: "AI Recommendations",
        items: predictions.slice(0, 3).map(prediction => ({
          id: prediction.itemId,
          label: `Go to ${prediction.itemId}`,
          description: prediction.reason,
          icon: TrendingUp,
          group: "ai-recommendations",
          priority: prediction.score,
          aiScore: prediction.score,
          executeCommand: async () => execute(prediction.itemId)
        })),
        sortOrder: 1
      })
    }

    // Recent Commands
    if (showRecentCommands && recentCommands.length > 0 && !query) {
      groups.push({
        id: "recent",
        label: "Recent",
        items: recentCommands.slice(0, 5),
        sortOrder: 2
      })
    }

    // Search Results
    if (results.length > 0) {
      const groupedResults = groupSearchResults(results)
      groups.push(...groupedResults)
    }

    // Quick Actions (when no query)
    if (!query) {
      groups.push({
        id: "quick-actions",
        label: "Quick Actions",
        items: [
          {
            id: "settings",
            label: "Open Settings",
            description: "Configure application settings",
            icon: Settings,
            shortcut: ["Cmd", "Comma"],
            group: "quick-actions",
            executeCommand: async () => execute("settings")
          },
          {
            id: "search",
            label: "Search Everything",
            description: "Global search across all data",
            icon: Search,
            shortcut: ["Cmd", "K"],
            group: "quick-actions",
            executeCommand: async () => execute("global-search")
          },
          {
            id: "new-transaction",
            label: "New Transaction",
            description: "Create a new universal transaction",
            icon: Zap,
            shortcut: ["Cmd", "N"],
            group: "quick-actions",
            executeCommand: async () => execute("new-transaction")
          }
        ],
        sortOrder: 10
      })
    }

    setCommandGroups(groups.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)))
  }, [predictions, recentCommands, results, query, showRecentCommands])

  // Get all items for navigation
  const getAllItems = React.useCallback(() => {
    return commandGroups.flatMap(group => group.items)
  }, [commandGroups])

  // Execute selected command
  const handleExecuteSelected = React.useCallback(async () => {
    const allItems = getAllItems()
    const selectedItem = allItems[selectedIndex]
    
    if (selectedItem) {
      // Add to recent commands
      setRecentCommands(prev => [
        selectedItem,
        ...prev.filter(item => item.id !== selectedItem.id)
      ].slice(0, 10))

      // Execute command
      if (selectedItem.executeCommand) {
        await selectedItem.executeCommand()
      } else {
        await execute(selectedItem.id)
      }
    }
  }, [getAllItems, selectedIndex, execute])

  // Voice control
  const toggleVoice = React.useCallback(() => {
    if (!enableVoice || !voiceRef.current) return

    if (isVoiceActive) {
      voiceRef.current.stop()
      setIsVoiceActive(false)
    } else {
      voiceRef.current.start()
      setIsVoiceActive(true)
    }
  }, [enableVoice, isVoiceActive])

  // Handle input change
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    search(value)
    setSelectedIndex(0) // Reset selection
  }, [search])

  // Get contextual color
  const contextualColor = React.useMemo(() => 
    getColorForContext(getAdaptedColor("primary"), themeContext)
  , [getAdaptedColor, getColorForContext, themeContext])

  // Render command item
  const renderCommandItem = React.useCallback((item: CommandItem, index: number, globalIndex: number) => {
    const isSelected = globalIndex === selectedIndex

    return (
      <motion.div
        key={item.id}
        className={cn(
          "flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-all",
          isSelected && "bg-primary/10 text-primary",
          !isSelected && "hover:bg-muted/50"
        )}
        onClick={() => {
          setSelectedIndex(globalIndex)
          handleExecuteSelected()
        }}
        onMouseEnter={() => setSelectedIndex(globalIndex)}
        whileHover={{ x: 2 }}
        animate={isSelected ? { x: 4 } : { x: 0 }}
        transition={motionConfig.spring.swift}
      >
        {/* Icon */}
        <motion.div
          className={cn(
            "flex-shrink-0",
            isSelected && "text-primary",
            item.aiScore && item.aiScore > 0.7 && "text-yellow-500"
          )}
          animate={{
            scale: isSelected ? 1.1 : 1,
            rotate: item.aiScore && item.aiScore > 0.8 ? [0, 5, -5, 0] : 0
          }}
          transition={motionConfig.spring.gentle}
        >
          {item.icon ? (
            <item.icon className="w-5 h-5" />
          ) : (
            <Hash className="w-5 h-5" />
          )}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium truncate">{item.label}</span>
            
            {/* Badges */}
            <div className="flex items-center gap-2">
              {/* AI Score */}
              {item.aiScore && item.aiScore > 0.6 && (
                <motion.div
                  className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={motionConfig.spring.bounce}
                >
                  <Sparkles className="w-3 h-3" />
                  AI
                </motion.div>
              )}

              {/* Keyboard Shortcut */}
              {item.shortcut && showKeyboardShortcuts && (
                <motion.div
                  className="flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                >
                  {item.shortcut.map((key, keyIndex) => (
                    <React.Fragment key={key}>
                      {keyIndex > 0 && <span className="text-xs">+</span>}
                      <kbd className="px-2 py-1 text-xs bg-muted rounded">
                        {key}
                      </kbd>
                    </React.Fragment>
                  ))}
                </motion.div>
              )}

              {/* Arrow */}
              <motion.div
                animate={{ x: isSelected ? 4 : 0 }}
                transition={motionConfig.spring.swift}
              >
                <ArrowRight className="w-4 h-4 opacity-40" />
              </motion.div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-muted-foreground truncate mt-1">
              {item.description}
            </p>
          )}
        </div>
      </motion.div>
    )
  }, [selectedIndex, handleExecuteSelected, showKeyboardShortcuts])

  // Render command group
  const renderCommandGroup = React.useCallback((group: CommandGroup, startIndex: number) => {
    return (
      <motion.div
        key={group.id}
        className="space-y-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionConfig.spring.swift}
      >
        {/* Group Header */}
        <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground">
          {group.id === "ai-recommendations" && <TrendingUp className="w-4 h-4" />}
          {group.id === "recent" && <Clock className="w-4 h-4" />}
          {group.id === "quick-actions" && <Zap className="w-4 h-4" />}
          <span>{group.label}</span>
        </div>

        {/* Group Items */}
        <div className="space-y-1">
          {group.items.map((item, index) => 
            renderCommandItem(item, index, startIndex + index)
          )}
        </div>
      </motion.div>
    )
  }, [renderCommandItem])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        />

        {/* Command Palette */}
        <motion.div
          ref={paletteRef}
          className="relative w-full max-w-2xl mx-4"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={motionConfig.spring.swift}
        >
          <Card
            variant="glass"
            size="lg"
            className="backdrop-blur-xl border-primary/20 shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center gap-4">
                {/* Search Icon */}
                <motion.div
                  className="flex-shrink-0 text-muted-foreground"
                  animate={{ 
                    scale: query ? 1.1 : 1,
                    color: query ? contextualColor : undefined
                  }}
                  transition={motionConfig.spring.swift}
                >
                  <Search className="w-6 h-6" />
                </motion.div>

                {/* Input */}
                <motion.input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for commands, pages, or ask AI..."
                  value={query}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent text-lg placeholder:text-muted-foreground focus:outline-none"
                  whileFocus={{ scale: 1.02 }}
                  transition={motionConfig.spring.swift}
                />

                {/* Voice Toggle */}
                {enableVoice && (
                  <motion.button
                    onClick={toggleVoice}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      isVoiceActive ? "bg-red-100 text-red-600" : "hover:bg-muted"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isVoiceActive ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </motion.button>
                )}

                {/* Command Icon */}
                <motion.div
                  className="flex-shrink-0 text-muted-foreground"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Command className="w-5 h-5" />
                </motion.div>
              </div>

              {/* NLP Suggestions */}
              <AnimatePresence>
                {enableNLP && nlpSuggestions.length > 0 && (
                  <motion.div
                    className="mt-4 flex items-center gap-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">Did you mean:</span>
                    <div className="flex gap-2">
                      {nlpSuggestions.slice(0, 3).map((suggestion, index) => (
                        <motion.button
                          key={suggestion}
                          onClick={() => search(suggestion)}
                          className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {commandGroups.length > 0 ? (
                <div className="p-2 space-y-4">
                  {commandGroups.map((group, groupIndex) => {
                    const startIndex = commandGroups
                      .slice(0, groupIndex)
                      .reduce((acc, g) => acc + g.items.length, 0)
                    return renderCommandGroup(group, startIndex)
                  })}
                </div>
              ) : (
                <motion.div
                  className="p-8 text-center text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Search className="w-8 h-8 mx-auto mb-4 opacity-50" />
                  <p>No commands found</p>
                  <p className="text-sm mt-1">Try different keywords or use voice search</p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/50 bg-muted/20">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-background rounded text-xs">↑↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-background rounded text-xs">Enter</kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-background rounded text-xs">Esc</kbd>
                    <span>Close</span>
                  </div>
                  {enableNLP && (
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 bg-background rounded text-xs">Tab</kbd>
                      <span>Accept suggestion</span>
                    </div>
                  )}
                </div>
                
                <motion.div
                  className="flex items-center gap-2 opacity-60"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Powered</span>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Helper functions
function generateNLPSuggestions(query: string): string[] {
  const suggestions: string[] = []
  
  // Common patterns and suggestions
  const patterns = [
    { pattern: /create|new|add/i, suggestions: ["new transaction", "create invoice", "add customer"] },
    { pattern: /find|search|look/i, suggestions: ["search transactions", "find customer", "lookup invoice"] },
    { pattern: /report|analytics|dashboard/i, suggestions: ["financial report", "sales dashboard", "analytics overview"] },
    { pattern: /settings|config|preferences/i, suggestions: ["user settings", "system configuration", "preferences"] },
    { pattern: /help|support|guide/i, suggestions: ["user guide", "help center", "support documentation"] }
  ]

  patterns.forEach(({ pattern, suggestions: patternSuggestions }) => {
    if (pattern.test(query)) {
      suggestions.push(...patternSuggestions.filter(s => 
        s.toLowerCase().includes(query.toLowerCase()) || 
        query.toLowerCase().includes(s.toLowerCase())
      ))
    }
  })

  return [...new Set(suggestions)].slice(0, 3)
}

function groupSearchResults(results: CommandItem[]): CommandGroup[] {
  const groups = new Map<string, CommandItem[]>()

  results.forEach(item => {
    const groupKey = item.group || "search-results"
    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey)!.push(item)
  })

  return Array.from(groups.entries()).map(([groupId, items]) => ({
    id: groupId,
    label: formatGroupLabel(groupId),
    items: items.sort((a, b) => (b.priority || 0) - (a.priority || 0)),
    sortOrder: getGroupSortOrder(groupId)
  }))
}

function formatGroupLabel(groupId: string): string {
  const labels: Record<string, string> = {
    "search-results": "Search Results",
    "navigation": "Navigation",
    "transactions": "Transactions",
    "reports": "Reports",
    "settings": "Settings",
    "users": "Users & Teams"
  }
  
  return labels[groupId] || groupId.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
}

function getGroupSortOrder(groupId: string): number {
  const orders: Record<string, number> = {
    "ai-recommendations": 1,
    "recent": 2,
    "navigation": 3,
    "transactions": 4,
    "reports": 5,
    "users": 6,
    "settings": 7,
    "search-results": 8,
    "quick-actions": 10
  }
  
  return orders[groupId] || 9
}