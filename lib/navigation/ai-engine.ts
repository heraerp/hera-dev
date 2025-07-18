/**
 * AI Navigation Engine
 * Provides intelligent navigation suggestions, insights, and predictions
 */

import { NavigationItem, NavigationPrediction, NavigationInsight, NavigationAnalytics, NavigationContext } from "./types"

export class AINavigationEngine {
  private analytics: NavigationAnalytics[] = []
  private userPatterns: Map<string, any> = new Map()
  private contextualFactors: Map<string, any> = new Map()

  /**
   * Analyze user navigation patterns and generate predictions
   */
  public generatePredictions(
    items: NavigationItem[],
    currentContext: NavigationContext,
    userId: string,
    currentTime: Date = new Date()
  ): NavigationPrediction[] {
    const userAnalytics = this.getUserAnalytics(userId)
    const timePatterns = this.analyzeTimePatterns(userAnalytics, currentTime)
    const contextPatterns = this.analyzeContextPatterns(userAnalytics, currentContext)
    const sequencePatterns = this.analyzeSequencePatterns(userAnalytics)

    return items
      .map(item => this.scorePrediction(item, timePatterns, contextPatterns, sequencePatterns, currentContext))
      .filter(prediction => prediction.score > 0.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Top 10 predictions
  }

  /**
   * Generate contextual insights based on user behavior
   */
  public generateInsights(
    items: NavigationItem[],
    currentContext: NavigationContext,
    userId: string
  ): NavigationInsight[] {
    const insights: NavigationInsight[] = []
    const userAnalytics = this.getUserAnalytics(userId)

    // Detect unused but relevant features
    const unusedInsights = this.detectUnusedFeatures(items, userAnalytics, currentContext)
    insights.push(...unusedInsights)

    // Detect workflow optimizations
    const workflowInsights = this.detectWorkflowOptimizations(userAnalytics, items)
    insights.push(...workflowInsights)

    // Detect productivity opportunities
    const productivityInsights = this.detectProductivityOpportunities(userAnalytics, items)
    insights.push(...productivityInsights)

    // Detect security concerns
    const securityInsights = this.detectSecurityConcerns(userAnalytics)
    insights.push(...securityInsights)

    return insights.slice(0, 5) // Top 5 insights
  }

  /**
   * Track user interaction for learning
   */
  public trackInteraction(analytics: NavigationAnalytics): void {
    this.analytics.push(analytics)
    this.updateUserPatterns(analytics)
    this.updateContextualFactors(analytics)
    
    // Keep only recent analytics (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    this.analytics = this.analytics.filter(a => a.timestamp > thirtyDaysAgo)
  }

  /**
   * Get personalized navigation recommendations
   */
  public getPersonalizedRecommendations(
    items: NavigationItem[],
    userId: string,
    context: NavigationContext
  ): NavigationItem[] {
    const userPreferences = this.getUserPatterns(userId)
    const frequentlyUsed = this.getFrequentlyUsedItems(userId)
    const contextualItems = this.getContextualItems(items, context)

    // Combine and score recommendations
    const recommendations = new Map<string, number>()

    // Score by frequency
    frequentlyUsed.forEach(itemId => {
      recommendations.set(itemId, (recommendations.get(itemId) || 0) + 0.4)
    })

    // Score by context relevance
    contextualItems.forEach(item => {
      recommendations.set(item.id, (recommendations.get(item.id) || 0) + 0.3)
    })

    // Score by AI predictions
    const predictions = this.generatePredictions(items, context, userId)
    predictions.forEach(prediction => {
      recommendations.set(prediction.itemId, (recommendations.get(prediction.itemId) || 0) + prediction.score * 0.3)
    })

    // Return sorted recommendations
    return Array.from(recommendations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([itemId]) => items.find(item => item.id === itemId))
      .filter(Boolean) as NavigationItem[]
  }

  /**
   * Analyze user search patterns for better suggestions
   */
  public analyzeSearchPatterns(searchHistory: string[]): string[] {
    const patterns = new Map<string, number>()
    
    searchHistory.forEach(query => {
      const terms = query.toLowerCase().split(' ')
      terms.forEach(term => {
        if (term.length > 2) {
          patterns.set(term, (patterns.get(term) || 0) + 1)
        }
      })
    })

    return Array.from(patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term]) => term)
  }

  /**
   * Predict optimal navigation shortcuts
   */
  public predictOptimalShortcuts(userId: string): Record<string, string[]> {
    const userAnalytics = this.getUserAnalytics(userId)
    const sequences = this.findCommonSequences(userAnalytics)
    const shortcuts: Record<string, string[]> = {}

    sequences.forEach(sequence => {
      if (sequence.length >= 2) {
        const shortcutKey = this.generateShortcutKey(sequence)
        shortcuts[shortcutKey] = sequence
      }
    })

    return shortcuts
  }

  // Private helper methods

  private scorePrediction(
    item: NavigationItem,
    timePatterns: any,
    contextPatterns: any,
    sequencePatterns: any,
    currentContext: NavigationContext
  ): NavigationPrediction {
    let score = 0
    const contextFactors: string[] = []
    let reason = ""

    // Time-based scoring
    const timeScore = timePatterns[item.id] || 0
    score += timeScore * 0.3
    if (timeScore > 0.5) {
      contextFactors.push("frequently_used_at_this_time")
      reason = "Often used at this time of day"
    }

    // Context-based scoring
    const contextScore = contextPatterns[item.id] || 0
    score += contextScore * 0.4
    if (contextScore > 0.5) {
      contextFactors.push("relevant_to_current_context")
      reason = reason || "Relevant to current business context"
    }

    // Sequence-based scoring
    const sequenceScore = sequencePatterns[item.id] || 0
    score += sequenceScore * 0.3
    if (sequenceScore > 0.5) {
      contextFactors.push("follows_usage_pattern")
      reason = reason || "Follows your typical usage pattern"
    }

    // AI score from item metadata
    if (item.aiScore) {
      score += item.aiScore * 0.2
      contextFactors.push("ai_recommended")
    }

    return {
      itemId: item.id,
      score: Math.min(score, 1), // Cap at 1.0
      reason: reason || "Based on usage patterns",
      confidence: score,
      contextFactors
    }
  }

  private getUserAnalytics(userId: string): NavigationAnalytics[] {
    return this.analytics.filter(a => a.userId === userId)
  }

  private analyzeTimePatterns(analytics: NavigationAnalytics[], currentTime: Date): Record<string, number> {
    const currentHour = currentTime.getHours()
    const patterns: Record<string, number> = {}

    analytics.forEach(entry => {
      const entryHour = entry.timestamp.getHours()
      const hourDiff = Math.abs(currentHour - entryHour)
      
      if (hourDiff <= 2) { // Within 2 hours
        patterns[entry.itemId] = (patterns[entry.itemId] || 0) + 0.1
      }
    })

    return patterns
  }

  private analyzeContextPatterns(analytics: NavigationAnalytics[], currentContext: NavigationContext): Record<string, number> {
    const patterns: Record<string, number> = {}

    analytics
      .filter(entry => entry.context === currentContext)
      .forEach(entry => {
        patterns[entry.itemId] = (patterns[entry.itemId] || 0) + 0.1
      })

    return patterns
  }

  private analyzeSequencePatterns(analytics: NavigationAnalytics[]): Record<string, number> {
    const patterns: Record<string, number> = {}
    const sequences = this.findCommonSequences(analytics)

    sequences.forEach(sequence => {
      if (sequence.length >= 2) {
        const lastItem = sequence[sequence.length - 1]
        patterns[lastItem] = (patterns[lastItem] || 0) + 0.1
      }
    })

    return patterns
  }

  private detectUnusedFeatures(
    items: NavigationItem[],
    userAnalytics: NavigationAnalytics[],
    context: NavigationContext
  ): NavigationInsight[] {
    const usedItemIds = new Set(userAnalytics.map(a => a.itemId))
    const contextualItems = items.filter(item => 
      item.contextualData?.contexts?.includes(context) || 
      item.category === context
    )

    const unusedRelevantItems = contextualItems.filter(item => !usedItemIds.has(item.id))

    return unusedRelevantItems.slice(0, 2).map(item => ({
      id: `unused-${item.id}`,
      type: "suggestion" as const,
      title: `Try ${item.label}`,
      description: `This feature might be useful for your current ${context} workflow`,
      relatedItemIds: [item.id],
      action: {
        label: "Learn More",
        href: item.href
      }
    }))
  }

  private detectWorkflowOptimizations(
    userAnalytics: NavigationAnalytics[],
    items: NavigationItem[]
  ): NavigationInsight[] {
    const sequences = this.findCommonSequences(userAnalytics)
    const optimizations: NavigationInsight[] = []

    sequences.forEach(sequence => {
      if (sequence.length >= 3) {
        // Look for potential shortcuts or bulk operations
        const sequenceItems = sequence.map(id => items.find(item => item.id === id)).filter(Boolean)
        
        if (sequenceItems.length === sequence.length) {
          optimizations.push({
            id: `workflow-${sequence.join('-')}`,
            type: "info" as const,
            title: "Workflow Shortcut Available",
            description: `Consider creating a custom shortcut for this ${sequence.length}-step workflow`,
            relatedItemIds: sequence
          })
        }
      }
    })

    return optimizations.slice(0, 1)
  }

  private detectProductivityOpportunities(
    userAnalytics: NavigationAnalytics[],
    items: NavigationItem[]
  ): NavigationInsight[] {
    const opportunities: NavigationInsight[] = []

    // Detect if user is not using keyboard shortcuts
    const keyboardUsage = userAnalytics.filter(a => a.action === "keyboard").length
    const totalUsage = userAnalytics.length

    if (totalUsage > 50 && keyboardUsage / totalUsage < 0.1) {
      opportunities.push({
        id: "keyboard-shortcuts",
        type: "suggestion" as const,
        title: "Speed up with keyboard shortcuts",
        description: "You could save time by using keyboard shortcuts for frequently accessed features",
        action: {
          label: "View Shortcuts",
          onClick: () => console.log("Show shortcuts guide")
        }
      })
    }

    return opportunities
  }

  private detectSecurityConcerns(userAnalytics: NavigationAnalytics[]): NavigationInsight[] {
    const concerns: NavigationInsight[] = []

    // Check for unusual patterns
    const recentAnalytics = userAnalytics.filter(a => 
      a.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    )

    if (recentAnalytics.length > 200) { // Unusually high activity
      concerns.push({
        id: "unusual-activity",
        type: "warning" as const,
        title: "Unusual navigation activity detected",
        description: "High number of navigation events in the last 24 hours",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // Expires in 1 hour
      })
    }

    return concerns
  }

  private updateUserPatterns(analytics: NavigationAnalytics): void {
    const userId = analytics.userId
    const patterns = this.userPatterns.get(userId) || {}
    
    patterns[analytics.itemId] = (patterns[analytics.itemId] || 0) + 1
    this.userPatterns.set(userId, patterns)
  }

  private updateContextualFactors(analytics: NavigationAnalytics): void {
    const key = `${analytics.context}-${analytics.itemId}`
    const current = this.contextualFactors.get(key) || 0
    this.contextualFactors.set(key, current + 1)
  }

  private getUserPatterns(userId: string): any {
    return this.userPatterns.get(userId) || {}
  }

  private getFrequentlyUsedItems(userId: string): string[] {
    const patterns = this.getUserPatterns(userId)
    return Object.entries(patterns)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5)
      .map(([itemId]) => itemId)
  }

  private getContextualItems(items: NavigationItem[], context: NavigationContext): NavigationItem[] {
    return items.filter(item => 
      item.contextualData?.contexts?.includes(context) ||
      item.category === context ||
      item.keywords?.includes(context)
    )
  }

  private findCommonSequences(analytics: NavigationAnalytics[]): string[][] {
    const sequences: string[][] = []
    const sortedAnalytics = analytics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    let currentSequence: string[] = []
    let lastTimestamp = 0

    sortedAnalytics.forEach(entry => {
      const timeDiff = entry.timestamp.getTime() - lastTimestamp
      
      if (timeDiff < 300000) { // Within 5 minutes
        currentSequence.push(entry.itemId)
      } else {
        if (currentSequence.length >= 2) {
          sequences.push([...currentSequence])
        }
        currentSequence = [entry.itemId]
      }
      
      lastTimestamp = entry.timestamp.getTime()
    })

    if (currentSequence.length >= 2) {
      sequences.push(currentSequence)
    }

    return sequences
  }

  private generateShortcutKey(sequence: string[]): string {
    return sequence.join(' → ')
  }
}

// Singleton instance
export const aiNavigationEngine = new AINavigationEngine()