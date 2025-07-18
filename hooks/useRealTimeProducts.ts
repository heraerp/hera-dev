import { useEffect, useCallback, useRef } from 'react';
import { ProductService } from '@/lib/services/productService';
import { ProductWithDetails, ProductRealtimeEvent } from '@/types/product';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface UseRealTimeProductsOptions {
  organizationId: string;
  onProductCreated?: (product: ProductWithDetails) => void;
  onProductUpdated?: (product: ProductWithDetails) => void;
  onProductDeleted?: (productId: string) => void;
  onInventoryChanged?: (productId: string, newCount: number) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export interface UseRealTimeProductsReturn {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  disconnect: () => void;
  reconnect: () => void;
  lastUpdate: Date | null;
}

export function useRealTimeProducts(options: UseRealTimeProductsOptions): UseRealTimeProductsReturn {
  const {
    organizationId,
    onProductCreated,
    onProductUpdated,
    onProductDeleted,
    onInventoryChanged,
    onError,
    enabled = true
  } = options;

  const channelRef = useRef<RealtimeChannel | null>(null);
  const isConnectedRef = useRef(false);
  const connectionStatusRef = useRef<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const lastUpdateRef = useRef<Date | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle entity changes (product creation/update/deletion)
  const handleEntityChange = useCallback(async (payload: any) => {
    try {
      lastUpdateRef.current = new Date();
      
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      if (newRecord?.organization_id !== organizationId) return;
      if (newRecord?.entity_type !== 'product') return;

      switch (eventType) {
        case 'INSERT':
          if (onProductCreated) {
            const product = await ProductService.fetchProductById(newRecord.id);
            if (product) {
              onProductCreated(product);
            }
          }
          break;

        case 'UPDATE':
          if (onProductUpdated) {
            const product = await ProductService.fetchProductById(newRecord.id);
            if (product) {
              onProductUpdated(product);
            }
          }
          break;

        case 'DELETE':
          if (onProductDeleted && oldRecord?.id) {
            onProductDeleted(oldRecord.id);
          }
          break;
      }
    } catch (error) {
      console.error('Error handling entity change:', error);
      onError?.(error instanceof Error ? error : new Error('Entity change error'));
    }
  }, [organizationId, onProductCreated, onProductUpdated, onProductDeleted, onError]);

  // Handle dynamic data changes (field updates, inventory changes)
  const handleDynamicDataChange = useCallback(async (payload: any) => {
    try {
      lastUpdateRef.current = new Date();
      
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      if (!newRecord?.entity_id) return;

      // Check if this is a product's dynamic data by fetching the entity
      const product = await ProductService.fetchProductById(newRecord.entity_id);
      if (!product || product.organization_id !== organizationId) return;

      switch (eventType) {
        case 'INSERT':
        case 'UPDATE':
          // Handle inventory changes specifically
          if (newRecord.field_name === 'inventory_count' && onInventoryChanged) {
            const newCount = parseInt(newRecord.field_value) || 0;
            onInventoryChanged(newRecord.entity_id, newCount);
          }
          
          // Handle general product updates
          if (onProductUpdated) {
            const updatedProduct = await ProductService.fetchProductById(newRecord.entity_id);
            if (updatedProduct) {
              onProductUpdated(updatedProduct);
            }
          }
          break;

        case 'DELETE':
          if (onProductUpdated) {
            const updatedProduct = await ProductService.fetchProductById(oldRecord.entity_id);
            if (updatedProduct) {
              onProductUpdated(updatedProduct);
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error handling dynamic data change:', error);
      onError?.(error instanceof Error ? error : new Error('Dynamic data change error'));
    }
  }, [organizationId, onProductUpdated, onInventoryChanged, onError]);

  // Connect to real-time updates
  const connect = useCallback(() => {
    if (!enabled || !organizationId) return;

    try {
      connectionStatusRef.current = 'connecting';
      
      const channel = ProductService.subscribeToProducts(organizationId, (payload) => {
        if (payload.table === 'core_entities') {
          handleEntityChange(payload);
        } else if (payload.table === 'core_dynamic_data') {
          handleDynamicDataChange(payload);
        }
      });

      channel.on('system', { event: 'connected' }, () => {
        console.log('Real-time connection established');
        isConnectedRef.current = true;
        connectionStatusRef.current = 'connected';
        
        // Clear any reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      channel.on('system', { event: 'disconnected' }, () => {
        console.log('Real-time connection lost');
        isConnectedRef.current = false;
        connectionStatusRef.current = 'disconnected';
        
        // Attempt to reconnect after 3 seconds
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            reconnect();
          }, 3000);
        }
      });

      channel.on('system', { event: 'error' }, (error) => {
        console.error('Real-time connection error:', error);
        isConnectedRef.current = false;
        connectionStatusRef.current = 'error';
        onError?.(new Error('Real-time connection error'));
      });

      channelRef.current = channel;
    } catch (error) {
      console.error('Failed to establish real-time connection:', error);
      connectionStatusRef.current = 'error';
      onError?.(error instanceof Error ? error : new Error('Connection failed'));
    }
  }, [enabled, organizationId, handleEntityChange, handleDynamicDataChange, onError]);

  // Disconnect from real-time updates
  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    isConnectedRef.current = false;
    connectionStatusRef.current = 'disconnected';
  }, []);

  // Reconnect to real-time updates
  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  // Auto-connect on mount and when dependencies change
  useEffect(() => {
    if (enabled && organizationId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, organizationId, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Return current state (note: these are ref values, so they won't trigger re-renders)
  return {
    isConnected: isConnectedRef.current,
    connectionStatus: connectionStatusRef.current,
    disconnect,
    reconnect,
    lastUpdate: lastUpdateRef.current
  };
}

// Hook for monitoring real-time connection health
export function useRealTimeHealth(organizationId: string) {
  const lastPingRef = useRef<Date | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHealthCheck = useCallback(() => {
    // Send a ping every 30 seconds to check connection health
    pingIntervalRef.current = setInterval(() => {
      lastPingRef.current = new Date();
      
      // You could implement a simple ping mechanism here
      // For now, we'll just track the last ping time
    }, 30000);
  }, []);

  const stopHealthCheck = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (organizationId) {
      startHealthCheck();
    }

    return () => {
      stopHealthCheck();
    };
  }, [organizationId, startHealthCheck, stopHealthCheck]);

  return {
    lastPing: lastPingRef.current,
    isHealthy: lastPingRef.current && (Date.now() - lastPingRef.current.getTime()) < 60000 // Healthy if pinged within last minute
  };
}

// Hook for batching real-time updates to prevent excessive re-renders
export function useRealTimeUpdateBatcher<T>(
  callback: (items: T[]) => void,
  batchSize: number = 10,
  batchDelay: number = 500
) {
  const batchRef = useRef<T[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addToBatch = useCallback((item: T) => {
    batchRef.current.push(item);

    // If batch is full, process immediately
    if (batchRef.current.length >= batchSize) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      callback([...batchRef.current]);
      batchRef.current = [];
    } else {
      // Otherwise, set a timeout to process the batch
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (batchRef.current.length > 0) {
          callback([...batchRef.current]);
          batchRef.current = [];
        }
        timeoutRef.current = null;
      }, batchDelay);
    }
  }, [callback, batchSize, batchDelay]);

  const flushBatch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (batchRef.current.length > 0) {
      callback([...batchRef.current]);
      batchRef.current = [];
    }
  }, [callback]);

  useEffect(() => {
    return () => {
      flushBatch();
    };
  }, [flushBatch]);

  return { addToBatch, flushBatch };
}