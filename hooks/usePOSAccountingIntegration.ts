import { useState, useEffect, useCallback } from 'react'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import { posEventPublisher, Order, PaymentInfo } from '@/lib/services/posEventPublisher'
import { AccountingResult } from '@/lib/services/posAccountingBridge'

interface IntegrationStats {
  totalProcessed: number
  successfullyPosted: number
  failedToPost: number
  pendingReview: number
  averageProcessingTime: number
  lastProcessedAt?: string
}

interface IntegrationHealth {
  isOnline: boolean
  lastHeartbeat?: string
  errorCount: number
  successRate: number
  systemStatus: 'healthy' | 'degraded' | 'offline'
}

interface UsePOSAccountingIntegrationReturn {
  // State
  isInitialized: boolean
  isProcessing: boolean
  integrationStats: IntegrationStats
  integrationHealth: IntegrationHealth
  recentErrors: string[]
  
  // Actions
  processOrderCompletion: (order: Order) => Promise<AccountingResult>
  processPaymentReceived: (payment: PaymentInfo & { orderId: string }) => Promise<AccountingResult>
  processRefund: (refund: { orderId: string; refundAmount: number; reason: string }) => Promise<AccountingResult>
  processOrderVoid: (voidInfo: { orderId: string; reason: string }) => Promise<AccountingResult>
  
  // Utilities
  getEventStats: () => any
  clearErrors: () => void
  reinitialize: () => Promise<void>
}

export function usePOSAccountingIntegration(): UsePOSAccountingIntegrationReturn {
  const { restaurantData } = useRestaurantManagement()
  const organizationId = restaurantData?.organizationId
  const userId = restaurantData?.userId

  // State
  const [isInitialized, setIsInitialized] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [integrationStats, setIntegrationStats] = useState<IntegrationStats>({
    totalProcessed: 0,
    successfullyPosted: 0,
    failedToPost: 0,
    pendingReview: 0,
    averageProcessingTime: 0
  })
  const [integrationHealth, setIntegrationHealth] = useState<IntegrationHealth>({
    isOnline: false,
    errorCount: 0,
    successRate: 0,
    systemStatus: 'offline'
  })
  const [recentErrors, setRecentErrors] = useState<string[]>([])

  // Initialize integration
  const initialize = useCallback(async () => {
    if (!organizationId) return

    try {
      console.log('🚀 Initializing POS Accounting Integration...')
      
      // Reset initialization state
      setIsInitialized(false)
      
      await posEventPublisher.initialize(organizationId)
      
      // Set up event listeners
      setupEventListeners()
      
      setIsInitialized(true)
      setIntegrationHealth(prev => ({
        ...prev,
        isOnline: true,
        systemStatus: 'healthy',
        lastHeartbeat: new Date().toISOString()
      }))
      
      console.log('✅ POS Accounting Integration initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize POS Accounting Integration:', error)
      setRecentErrors(prev => [...prev, `Initialization failed: ${error.message}`].slice(-10))
      setIntegrationHealth(prev => ({
        ...prev,
        isOnline: false,
        systemStatus: 'offline',
        errorCount: prev.errorCount + 1
      }))
      setIsInitialized(false)
    }
  }, [organizationId])

  // Set up event listeners
  const setupEventListeners = useCallback(() => {
    // Success events
    posEventPublisher.on('pos:order:completed', handleOrderCompletionSuccess)
    posEventPublisher.on('pos:payment:received', handlePaymentReceivedSuccess)
    posEventPublisher.on('pos:refund:processed', handleRefundProcessedSuccess)
    posEventPublisher.on('pos:order:voided', handleOrderVoidedSuccess)
    
    // Error events
    posEventPublisher.on('pos:error', handleIntegrationError)
    
    return () => {
      posEventPublisher.removeAllListeners()
    }
  }, [])

  // Event handlers
  const handleOrderCompletionSuccess = useCallback((event: any) => {
    updateStats('success')
    console.log('✅ Order completion processed successfully:', event.data.orderNumber)
  }, [])

  const handlePaymentReceivedSuccess = useCallback((event: any) => {
    updateStats('success')
    console.log('✅ Payment received processed successfully:', event.data.reference)
  }, [])

  const handleRefundProcessedSuccess = useCallback((event: any) => {
    updateStats('success')
    console.log('✅ Refund processed successfully:', event.data.orderId)
  }, [])

  const handleOrderVoidedSuccess = useCallback((event: any) => {
    updateStats('success')
    console.log('✅ Order void processed successfully:', event.data.orderId)
  }, [])

  const handleIntegrationError = useCallback((errorEvent: any) => {
    updateStats('error')
    const errorMessage = `${errorEvent.event.type}: ${errorEvent.error}`
    setRecentErrors(prev => [...prev, errorMessage].slice(-10))
    
    setIntegrationHealth(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1,
      systemStatus: prev.errorCount > 5 ? 'degraded' : 'healthy'
    }))
    
    console.error('❌ Integration error:', errorEvent)
  }, [])

  // Update statistics
  const updateStats = useCallback((result: 'success' | 'error' | 'pending') => {
    setIntegrationStats(prev => {
      const newStats = { ...prev }
      newStats.totalProcessed += 1
      
      if (result === 'success') {
        newStats.successfullyPosted += 1
      } else if (result === 'error') {
        newStats.failedToPost += 1
      } else if (result === 'pending') {
        newStats.pendingReview += 1
      }
      
      newStats.lastProcessedAt = new Date().toISOString()
      
      // Calculate success rate
      const successRate = newStats.totalProcessed > 0 
        ? (newStats.successfullyPosted / newStats.totalProcessed) * 100 
        : 0
      
      setIntegrationHealth(prev => ({
        ...prev,
        successRate,
        lastHeartbeat: new Date().toISOString()
      }))
      
      return newStats
    })
  }, [])

  // Action functions
  const processOrderCompletion = useCallback(async (order: Order): Promise<AccountingResult> => {
    if (!isInitialized) {
      throw new Error('Integration not initialized')
    }

    setIsProcessing(true)
    
    try {
      const startTime = Date.now()
      
      await posEventPublisher.publishOrderCompletion(order)
      
      const processingTime = Date.now() - startTime
      setIntegrationStats(prev => ({
        ...prev,
        averageProcessingTime: (prev.averageProcessingTime + processingTime) / 2
      }))
      
      return {
        success: true,
        message: `Order ${order.orderNumber} processed successfully`,
        transactionId: order.id
      }
      
    } catch (error) {
      console.error('❌ Error processing order completion:', error)
      return {
        success: false,
        message: `Failed to process order ${order.orderNumber}`,
        error: error.message
      }
    } finally {
      setIsProcessing(false)
    }
  }, [isInitialized])

  const processPaymentReceived = useCallback(async (
    payment: PaymentInfo & { orderId: string }
  ): Promise<AccountingResult> => {
    if (!isInitialized || !organizationId) {
      throw new Error('Integration not initialized or organization not selected')
    }

    setIsProcessing(true)
    
    try {
      await posEventPublisher.publishPaymentReceived({
        ...payment,
        organizationId
      })
      
      return {
        success: true,
        message: `Payment for order ${payment.orderId} processed successfully`
      }
      
    } catch (error) {
      console.error('❌ Error processing payment received:', error)
      return {
        success: false,
        message: `Failed to process payment for order ${payment.orderId}`,
        error: error.message
      }
    } finally {
      setIsProcessing(false)
    }
  }, [isInitialized, organizationId])

  const processRefund = useCallback(async (refund: {
    orderId: string
    refundAmount: number
    reason: string
  }): Promise<AccountingResult> => {
    if (!isInitialized || !organizationId) {
      throw new Error('Integration not initialized or organization not selected')
    }

    setIsProcessing(true)
    
    try {
      await posEventPublisher.publishRefundProcessed({
        ...refund,
        organizationId,
        userId
      })
      
      return {
        success: true,
        message: `Refund for order ${refund.orderId} processed successfully`
      }
      
    } catch (error) {
      console.error('❌ Error processing refund:', error)
      return {
        success: false,
        message: `Failed to process refund for order ${refund.orderId}`,
        error: error.message
      }
    } finally {
      setIsProcessing(false)
    }
  }, [isInitialized, organizationId, userId])

  const processOrderVoid = useCallback(async (voidInfo: {
    orderId: string
    reason: string
  }): Promise<AccountingResult> => {
    if (!isInitialized || !organizationId) {
      throw new Error('Integration not initialized or organization not selected')
    }

    setIsProcessing(true)
    
    try {
      await posEventPublisher.publishOrderVoided({
        ...voidInfo,
        organizationId,
        userId
      })
      
      return {
        success: true,
        message: `Order ${voidInfo.orderId} voided successfully`
      }
      
    } catch (error) {
      console.error('❌ Error processing order void:', error)
      return {
        success: false,
        message: `Failed to void order ${voidInfo.orderId}`,
        error: error.message
      }
    } finally {
      setIsProcessing(false)
    }
  }, [isInitialized, organizationId, userId])

  // Utility functions
  const getEventStats = useCallback(() => {
    return posEventPublisher.getEventStats()
  }, [])

  const clearErrors = useCallback(() => {
    setRecentErrors([])
    setIntegrationHealth(prev => ({
      ...prev,
      errorCount: 0,
      systemStatus: 'healthy'
    }))
  }, [])

  const reinitialize = useCallback(async () => {
    setIsInitialized(false)
    await posEventPublisher.cleanup()
    await initialize()
  }, [initialize])

  // Initialize when organization ID is available
  useEffect(() => {
    if (organizationId) {
      initialize()
    }
  }, [organizationId, initialize])

  // Health check interval
  useEffect(() => {
    const healthCheckInterval = setInterval(() => {
      if (isInitialized) {
        setIntegrationHealth(prev => ({
          ...prev,
          lastHeartbeat: new Date().toISOString()
        }))
      }
    }, 30000) // Every 30 seconds

    return () => {
      clearInterval(healthCheckInterval)
    }
  }, [isInitialized])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      posEventPublisher.cleanup()
    }
  }, [])

  // Update health status based on error count
  useEffect(() => {
    if (integrationHealth.errorCount > 10) {
      setIntegrationHealth(prev => ({
        ...prev,
        systemStatus: 'degraded'
      }))
    } else if (integrationHealth.errorCount > 20) {
      setIntegrationHealth(prev => ({
        ...prev,
        systemStatus: 'offline'
      }))
    }
  }, [integrationHealth.errorCount])

  return {
    // State
    isInitialized,
    isProcessing,
    integrationStats,
    integrationHealth,
    recentErrors,
    
    // Actions
    processOrderCompletion,
    processPaymentReceived,
    processRefund,
    processOrderVoid,
    
    // Utilities
    getEventStats,
    clearErrors,
    reinitialize
  }
}

export default usePOSAccountingIntegration