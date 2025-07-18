/**
 * HERA Universal ERP - Restaurant Registration Hook
 * Manages the habit-forming registration process with Hook Model analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { RestaurantService, RestaurantRegistrationData, RestaurantProfile, ActivityFeedItem } from '@/lib/services/restaurant-service'

export interface UseRestaurantRegistration {
  // Registration state
  isRegistering: boolean
  registrationProgress: number
  error: string | null
  
  // Registration functions
  registerRestaurant: (data: RestaurantRegistrationData) => Promise<RestaurantProfile>
  updateRegistrationProgress: (progress: number) => void
  
  // Activity feed
  activityFeed: ActivityFeedItem[]
  refreshActivityFeed: () => Promise<void>
  
  // Hook analytics
  trackAction: (action: string, phase: string) => void
  trackReward: (reward: string) => void
  trackTimeSpent: (seconds: number) => void
  
  // Social proof
  socialProofItems: ActivityFeedItem[]
  isLoadingSocialProof: boolean
}

export function useRestaurantRegistration(): UseRestaurantRegistration {
  const [isRegistering, setIsRegistering] = useState(false)
  const [registrationProgress, setRegistrationProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([])
  const [socialProofItems, setSocialProofItems] = useState<ActivityFeedItem[]>([])
  const [isLoadingSocialProof, setIsLoadingSocialProof] = useState(false)
  
  // Hook analytics tracking
  const [sessionStartTime] = useState(Date.now())
  const [actionsCount, setActionsCount] = useState(0)
  const [rewardsTriggered, setRewardsTriggered] = useState(0)
  
  // Register restaurant
  const registerRestaurant = useCallback(async (data: RestaurantRegistrationData): Promise<RestaurantProfile> => {
    try {
      setIsRegistering(true)
      setError(null)
      
      // Track registration attempt
      trackAction('registration_attempt', 'INVESTMENT')
      
      const profile = await RestaurantService.registerRestaurant(data)
      
      // Track successful registration
      trackAction('registration_completed', 'INVESTMENT')
      trackReward('🎉 Registration completed successfully!')
      
      // Update activity feed
      await refreshActivityFeed()
      
      return profile
    } catch (err: any) {
      setError(err.message || 'Registration failed')
      trackAction('registration_failed', 'INVESTMENT')
      throw err
    } finally {
      setIsRegistering(false)
    }
  }, [])
  
  // Update registration progress
  const updateRegistrationProgress = useCallback((progress: number) => {
    setRegistrationProgress(progress)
    trackAction(`progress_${Math.round(progress)}`, 'ACTION')
  }, [])
  
  // Refresh activity feed
  const refreshActivityFeed = useCallback(async () => {
    try {
      const feed = await RestaurantService.getActivityFeed(10)
      setActivityFeed(feed)
    } catch (err) {
      console.error('Failed to refresh activity feed:', err)
    }
  }, [])
  
  // Track user actions (Hook Model analytics)
  const trackAction = useCallback((action: string, phase: string) => {
    setActionsCount(prev => prev + 1)
    
    // Log action for analytics
    console.log(`[Hook Analytics] Action: ${action} | Phase: ${phase}`)
    
    // In production, you'd send this to your analytics service
    // RestaurantService.logActivity(action, phase, { timestamp: Date.now() })
  }, [])
  
  // Track rewards triggered
  const trackReward = useCallback((reward: string) => {
    setRewardsTriggered(prev => prev + 1)
    
    // Log reward for analytics
    console.log(`[Hook Analytics] Reward: ${reward}`)
    
    // In production, you'd send this to your analytics service
    // RestaurantService.logReward(reward, { timestamp: Date.now() })
  }, [])
  
  // Track time spent
  const trackTimeSpent = useCallback((seconds: number) => {
    // Log time spent for analytics
    console.log(`[Hook Analytics] Time spent: ${seconds} seconds`)
    
    // In production, you'd send this to your analytics service
    // RestaurantService.logTimeSpent(seconds)
  }, [])
  
  // Load social proof items
  const loadSocialProof = useCallback(async () => {
    try {
      setIsLoadingSocialProof(true)
      const feed = await RestaurantService.getActivityFeed(20)
      setSocialProofItems(feed)
    } catch (err) {
      console.error('Failed to load social proof:', err)
    } finally {
      setIsLoadingSocialProof(false)
    }
  }, [])
  
  // Initialize activity feed on mount
  useEffect(() => {
    refreshActivityFeed()
    loadSocialProof()
  }, [refreshActivityFeed, loadSocialProof])
  
  // Set up real-time activity feed subscription
  useEffect(() => {
    const subscription = RestaurantService.subscribeToActivityFeed((payload) => {
      console.log('New activity:', payload)
      
      // Add new activity to feed
      if (payload.eventType === 'INSERT') {
        const newActivity: ActivityFeedItem = {
          id: payload.new.id,
          type: 'achievement',
          restaurantName: payload.new.restaurant_name,
          message: payload.new.achievement,
          metric: payload.new.metric,
          value: payload.new.value,
          timestamp: payload.new.timestamp,
          icon: getIconForAchievement(payload.new.achievement)
        }
        
        setActivityFeed(prev => [newActivity, ...prev.slice(0, 9)])
        setSocialProofItems(prev => [newActivity, ...prev.slice(0, 19)])
      }
    })
    
    return () => {
      if (subscription) {
        RestaurantService.unsubscribe(subscription)
      }
    }
  }, [])
  
  // Track session time when component unmounts
  useEffect(() => {
    return () => {
      const sessionTimeSeconds = Math.round((Date.now() - sessionStartTime) / 1000)
      trackTimeSpent(sessionTimeSeconds)
    }
  }, [sessionStartTime, trackTimeSpent])
  
  return {
    isRegistering,
    registrationProgress,
    error,
    registerRestaurant,
    updateRegistrationProgress,
    activityFeed,
    refreshActivityFeed,
    trackAction,
    trackReward,
    trackTimeSpent,
    socialProofItems,
    isLoadingSocialProof
  }
}

// Helper function
function getIconForAchievement(achievement: string): string {
  if (achievement.includes('revenue')) return '💰'
  if (achievement.includes('efficiency')) return '⚡'
  if (achievement.includes('rating') || achievement.includes('star')) return '⭐'
  if (achievement.includes('cost')) return '💸'
  if (achievement.includes('satisfaction')) return '😊'
  if (achievement.includes('joined')) return '🎉'
  return '🚀'
}

export default useRestaurantRegistration