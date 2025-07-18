import { useState, useEffect, useCallback } from 'react'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import digitalAccountantService, { 
  Transaction, 
  TransactionWithAI, 
  PostingStats, 
  AIMetrics 
} from '@/lib/services/digitalAccountantService'

interface UseDigitalAccountantReturn {
  // State
  systemStatus: 'operational' | 'warning' | 'error'
  postingStats: PostingStats | null
  aiMetrics: AIMetrics | null
  recentTransactions: TransactionWithAI[]
  pendingReleaseTransactions: TransactionWithAI[]
  
  // Loading states
  isLoading: boolean
  isRefreshing: boolean
  
  // Actions
  refreshData: () => Promise<void>
  releaseTransaction: (transactionId: string, comment?: string) => Promise<boolean>
  forceAutoPost: (transactionId: string) => Promise<boolean>
  
  // Real-time subscription
  isSubscribed: boolean
}

export function useDigitalAccountant(): UseDigitalAccountantReturn {
  const { restaurantData } = useRestaurantManagement()
  const organizationId = restaurantData?.organizationId

  // State
  const [systemStatus, setSystemStatus] = useState<'operational' | 'warning' | 'error'>('operational')
  const [postingStats, setPostingStats] = useState<PostingStats | null>(null)
  const [aiMetrics, setAiMetrics] = useState<AIMetrics | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithAI[]>([])
  const [pendingReleaseTransactions, setPendingReleaseTransactions] = useState<TransactionWithAI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Fetch all data
  const fetchData = useCallback(async (showLoading = true) => {
    if (!organizationId) return

    try {
      if (showLoading) setIsLoading(true)

      // Fetch all data in parallel
      const [stats, metrics, recent, pending, status] = await Promise.all([
        digitalAccountantService.getPostingStats(organizationId),
        digitalAccountantService.getAIMetrics(organizationId),
        digitalAccountantService.getRecentTransactions(organizationId),
        digitalAccountantService.getPendingReleaseTransactions(organizationId),
        digitalAccountantService.getSystemStatus(organizationId)
      ])

      setPostingStats(stats)
      setAiMetrics(metrics)
      setRecentTransactions(recent)
      setPendingReleaseTransactions(pending)
      setSystemStatus(status.overallStatus)
    } catch (error) {
      console.error('Error fetching digital accountant data:', error)
      setSystemStatus('error')
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  // Refresh data without showing loading state
  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    await fetchData(false)
    setIsRefreshing(false)
  }, [fetchData])

  // Release transaction
  const releaseTransaction = useCallback(async (
    transactionId: string, 
    comment?: string
  ): Promise<boolean> => {
    if (!organizationId || !restaurantData?.userId) return false

    try {
      const result = await digitalAccountantService.releaseTransaction(
        transactionId,
        organizationId,
        restaurantData.userId,
        comment
      )

      if (result.success) {
        // Remove from pending list
        setPendingReleaseTransactions(prev => 
          prev.filter(t => t.id !== transactionId)
        )

        // Update stats
        setPostingStats(prev => {
          if (!prev) return prev
          return {
            ...prev,
            pendingRelease: Math.max(0, prev.pendingRelease - 1),
            releasedTransactions: prev.releasedTransactions + 1
          }
        })

        // Refresh recent transactions
        const recent = await digitalAccountantService.getRecentTransactions(organizationId)
        setRecentTransactions(recent)
      }

      return result.success
    } catch (error) {
      console.error('Error releasing transaction:', error)
      return false
    }
  }, [organizationId, restaurantData?.userId])

  // Force auto-post transaction
  const forceAutoPost = useCallback(async (transactionId: string): Promise<boolean> => {
    if (!organizationId) return false

    try {
      const result = await digitalAccountantService.forceAutoPost(transactionId, organizationId)
      
      if (result.success) {
        await refreshData()
      }

      return result.success
    } catch (error) {
      console.error('Error force auto-posting transaction:', error)
      return false
    }
  }, [organizationId, refreshData])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Set up real-time subscription
  useEffect(() => {
    if (!organizationId) return

    const channel = digitalAccountantService.subscribeToTransactionUpdates(
      organizationId,
      (payload) => {
        console.log('Transaction update received:', payload)
        
        // Handle different event types
        switch (payload.eventType) {
          case 'INSERT':
            // New transaction added
            if (payload.new.is_financial) {
              refreshData()
            }
            break
            
          case 'UPDATE':
            // Transaction updated
            if (payload.new.posting_status !== payload.old.posting_status ||
                payload.new.released_to_accounting !== payload.old.released_to_accounting) {
              refreshData()
            }
            break
            
          case 'DELETE':
            // Transaction deleted
            refreshData()
            break
        }
      }
    )

    setIsSubscribed(true)

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe()
      setIsSubscribed(false)
    }
  }, [organizationId, refreshData])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData()
    }, 30000)

    return () => clearInterval(interval)
  }, [refreshData])

  return {
    // State
    systemStatus,
    postingStats,
    aiMetrics,
    recentTransactions,
    pendingReleaseTransactions,
    
    // Loading states
    isLoading,
    isRefreshing,
    
    // Actions
    refreshData,
    releaseTransaction,
    forceAutoPost,
    
    // Real-time subscription
    isSubscribed
  }
}