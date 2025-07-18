/**
 * HERA Universal CRUD Template - Real-Time Sync Hook
 * Supabase real-time subscription management for live data updates
 */

import { useEffect, useRef } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface UseRealTimeSyncOptions {
  enabled: boolean
  organizationId: string
  entityType: string
  table?: string
  filter?: string
  events?: ('INSERT' | 'UPDATE' | 'DELETE')[]
  onUpdate?: () => void
  onInsert?: (payload: any) => void
  onUpdateRecord?: (payload: any) => void
  onDelete?: (payload: any) => void
  debounceMs?: number
}

export const useRealTimeSync = (options: UseRealTimeSyncOptions) => {
  const {
    enabled,
    organizationId,
    entityType,
    table = 'core_entities',
    filter,
    events = ['INSERT', 'UPDATE', 'DELETE'],
    onUpdate,
    onInsert,
    onUpdateRecord,
    onDelete,
    debounceMs = 1000
  } = options

  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled || !organizationId) {
      return
    }

    // Create channel name
    const channelName = `${table}_${organizationId}_${entityType}`
    
    // Create subscription
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter || `organization_id=eq.${organizationId} AND entity_type=eq.${entityType}`
        },
        (payload) => {
          console.log('Real-time event:', payload.eventType, payload)

          // Debounce updates to prevent excessive re-renders
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
          }

          debounceTimerRef.current = setTimeout(() => {
            switch (payload.eventType) {
              case 'INSERT':
                if (events.includes('INSERT')) {
                  onInsert?.(payload)
                  onUpdate?.()
                }
                break
              case 'UPDATE':
                if (events.includes('UPDATE')) {
                  onUpdateRecord?.(payload)
                  onUpdate?.()
                }
                break
              case 'DELETE':
                if (events.includes('DELETE')) {
                  onDelete?.(payload)
                  onUpdate?.()
                }
                break
            }
          }, debounceMs)
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status)
      })

    channelRef.current = channel

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [
    enabled, 
    organizationId, 
    entityType, 
    table, 
    filter, 
    JSON.stringify(events), 
    onUpdate, 
    onInsert, 
    onUpdateRecord, 
    onDelete, 
    debounceMs
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  return {
    channel: channelRef.current,
    isConnected: channelRef.current?.state === 'joined'
  }
}

// Hook for universal transactions real-time sync
export const useUniversalTransactionsSync = (options: {
  enabled: boolean
  organizationId: string
  transactionType?: string
  onUpdate?: () => void
  debounceMs?: number
}) => {
  const {
    enabled,
    organizationId,
    transactionType,
    onUpdate,
    debounceMs = 1000
  } = options

  return useRealTimeSync({
    enabled,
    organizationId,
    entityType: transactionType || 'transaction',
    table: 'universal_transactions',
    filter: transactionType 
      ? `organization_id=eq.${organizationId} AND transaction_type=eq.${transactionType}`
      : `organization_id=eq.${organizationId}`,
    onUpdate,
    debounceMs
  })
}

// Hook for metadata real-time sync
export const useMetadataSync = (options: {
  enabled: boolean
  organizationId: string
  entityType: string
  metadataType?: string
  onUpdate?: () => void
  debounceMs?: number
}) => {
  const {
    enabled,
    organizationId,
    entityType,
    metadataType,
    onUpdate,
    debounceMs = 1000
  } = options

  return useRealTimeSync({
    enabled,
    organizationId,
    entityType,
    table: 'core_metadata',
    filter: metadataType
      ? `organization_id=eq.${organizationId} AND entity_type=eq.${entityType} AND metadata_type=eq.${metadataType}`
      : `organization_id=eq.${organizationId} AND entity_type=eq.${entityType}`,
    onUpdate,
    debounceMs
  })
}

export default useRealTimeSync