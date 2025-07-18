/**
 * HERA Universal ERP - Offline Provider
 * Revolutionary offline-first architecture provider
 * Enables complete mobile ERP operations without connectivity
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { offlineSyncManager, OfflineSyncManager, SyncStatus, SyncResult } from '@/lib/offline/offline-sync-manager';
import { offlineStorageManager, OfflineStorageManager, StorageStats } from '@/lib/offline/offline-storage-manager';
import { offlineProcessingEngine, OfflineProcessingEngine } from '@/lib/offline/offline-processing-engine';
import { CapturedPhoto, DocumentType } from '@/lib/camera/universal-camera-service';
import { InvoiceData, ReceiptData } from '@/lib/ai/document-processing-pipeline';

// ==================== CONTEXT INTERFACES ====================

export interface OfflineContextValue {
  // Connection Status
  isOnline: boolean;
  isOfflineReady: boolean;
  
  // Sync Management
  syncStatus: SyncStatus;
  triggerSync: () => Promise<SyncResult>;
  
  // Storage Management
  storageStats: StorageStats;
  clearCache: (pattern?: string) => Promise<void>;
  
  // Document Processing
  processDocumentOffline: (image: CapturedPhoto, documentType?: DocumentType) => Promise<any>;
  processInvoiceOffline: (image: CapturedPhoto) => Promise<InvoiceData>;
  processReceiptOffline: (image: CapturedPhoto) => Promise<ReceiptData>;
  processBusinessCardOffline: (image: CapturedPhoto) => Promise<any>;
  
  // Inventory Management
  updateInventoryOffline: (productId: string, quantity: number, operation: 'add' | 'subtract' | 'set') => Promise<string>;
  lookupProductOffline: (barcode: string) => Promise<any>;
  
  // Data Management
  storeOfflineData: <T>(key: string, data: T, options?: any) => Promise<void>;
  getOfflineData: <T>(key: string) => Promise<T | null>;
  
  // Queue Management
  getPendingOperations: () => number;
  getFailedOperations: () => number;
  retryFailedOperations: () => Promise<void>;
  
  // Events
  onSyncCompleted: (callback: (result: SyncResult) => void) => () => void;
  onOfflineDetected: (callback: () => void) => () => void;
  onOnlineDetected: (callback: () => void) => () => void;
}

// ==================== CONTEXT CREATION ====================

const OfflineContext = createContext<OfflineContextValue | null>(null);

export function useOffline(): OfflineContextValue {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

// ==================== PROVIDER COMPONENT ====================

interface OfflineProviderProps {
  children: React.ReactNode;
  enableAutoSync?: boolean;
  syncInterval?: number;
  maxCacheSize?: number;
  enableOfflineProcessing?: boolean;
}

export function OfflineProvider({
  children,
  enableAutoSync = true,
  syncInterval = 30000,
  maxCacheSize = 100,
  enableOfflineProcessing = true
}: OfflineProviderProps) {
  // ==================== STATE MANAGEMENT ====================
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSyncTimestamp: 0,
    pendingOperations: 0,
    failedOperations: 0,
    storageUsed: 0,
    storageAvailable: maxCacheSize,
    syncInProgress: false,
    nextScheduledSync: Date.now() + syncInterval
  });
  const [storageStats, setStorageStats] = useState<StorageStats>({
    totalSize: 0,
    usedSize: 0,
    availableSize: maxCacheSize * 1024 * 1024,
    entryCount: 0,
    hitRate: 0,
    missRate: 0,
    evictionCount: 0,
    lastCleanup: Date.now()
  });

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    console.log('🚀 HERA: Initializing offline provider...');
    
    const initializeOfflineServices = async () => {
      try {
        // Wait for all offline services to be ready
        await Promise.all([
          waitForService(offlineSyncManager, 'storage-ready'),
          waitForService(offlineStorageManager, 'storage-ready'),
          enableOfflineProcessing ? waitForService(offlineProcessingEngine, 'engine-ready') : Promise.resolve()
        ]);
        
        console.log('✅ HERA: All offline services ready');
        setIsOfflineReady(true);
        
        // Initial status update
        updateStatus();
        
      } catch (error) {
        console.error('❌ HERA: Offline initialization failed:', error);
      }
    };

    initializeOfflineServices();
    
    return () => {
      // Cleanup on unmount
      offlineSyncManager.destroy();
      offlineStorageManager.destroy();
      if (enableOfflineProcessing) {
        offlineProcessingEngine.destroy();
      }
    };
  }, [enableOfflineProcessing]);

  // ==================== NETWORK MONITORING ====================

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 HERA: Back online - triggering sync');
      setIsOnline(true);
      updateStatus();
      
      if (enableAutoSync) {
        triggerSync();
      }
    };

    const handleOffline = () => {
      console.log('📱 HERA: Gone offline - switching to offline mode');
      setIsOnline(false);
      updateStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableAutoSync]);

  // ==================== EVENT LISTENERS ====================

  useEffect(() => {
    // Sync manager events
    const handleSyncCompleted = (result: SyncResult) => {
      console.log('✅ HERA: Sync completed:', result);
      updateStatus();
    };

    const handleSyncFailed = (error: Error) => {
      console.error('❌ HERA: Sync failed:', error);
      updateStatus();
    };

    const handleOperationAdded = () => {
      updateStatus();
    };

    // Storage manager events
    const handleStorageUpdate = () => {
      updateStorageStats();
    };

    // Add event listeners
    offlineSyncManager.on('sync-completed', handleSyncCompleted);
    offlineSyncManager.on('sync-failed', handleSyncFailed);
    offlineSyncManager.on('operation-added', handleOperationAdded);
    
    offlineStorageManager.on('entry-stored', handleStorageUpdate);
    offlineStorageManager.on('entry-removed', handleStorageUpdate);
    offlineStorageManager.on('cache-cleared', handleStorageUpdate);

    return () => {
      offlineSyncManager.removeListener('sync-completed', handleSyncCompleted);
      offlineSyncManager.removeListener('sync-failed', handleSyncFailed);
      offlineSyncManager.removeListener('operation-added', handleOperationAdded);
      
      offlineStorageManager.removeListener('entry-stored', handleStorageUpdate);
      offlineStorageManager.removeListener('entry-removed', handleStorageUpdate);
      offlineStorageManager.removeListener('cache-cleared', handleStorageUpdate);
    };
  }, []);

  // ==================== STATUS UPDATES ====================

  const updateStatus = useCallback(() => {
    const newStatus = offlineSyncManager.getStatus();
    setSyncStatus(prev => ({
      ...prev,
      ...newStatus,
      isOnline
    }));
  }, [isOnline]);

  const updateStorageStats = useCallback(() => {
    const newStats = offlineStorageManager.getStats();
    setStorageStats(newStats);
  }, []);

  // ==================== SYNC OPERATIONS ====================

  const triggerSync = useCallback(async (): Promise<SyncResult> => {
    try {
      console.log('🔄 HERA: Triggering manual sync...');
      const result = await offlineSyncManager.triggerSync();
      updateStatus();
      return result;
    } catch (error) {
      console.error('❌ HERA: Manual sync failed:', error);
      throw error;
    }
  }, [updateStatus]);

  const retryFailedOperations = useCallback(async (): Promise<void> => {
    try {
      console.log('🔄 HERA: Retrying failed operations...');
      await offlineSyncManager.triggerSync();
      updateStatus();
    } catch (error) {
      console.error('❌ HERA: Retry failed:', error);
      throw error;
    }
  }, [updateStatus]);

  // ==================== STORAGE OPERATIONS ====================

  const clearCache = useCallback(async (pattern?: string): Promise<void> => {
    try {
      console.log('🧹 HERA: Clearing cache...', pattern ? `Pattern: ${pattern}` : 'All');
      await offlineStorageManager.clear(pattern);
      updateStorageStats();
    } catch (error) {
      console.error('❌ HERA: Cache clear failed:', error);
      throw error;
    }
  }, [updateStorageStats]);

  const storeOfflineData = useCallback(async (key: string, data: any, options?: any): Promise<void> => {
    try {
      await offlineStorageManager.set(key, data, options);
      updateStorageStats();
    } catch (error) {
      console.error('❌ HERA: Store data failed:', error);
      throw error;
    }
  }, [updateStorageStats]);

  const getOfflineData = useCallback(async (key: string): Promise<any> => {
    try {
      return await offlineStorageManager.get(key);
    } catch (error) {
      console.error('❌ HERA: Get data failed:', error);
      return null;
    }
  }, []);

  // ==================== DOCUMENT PROCESSING ====================

  const processDocumentOffline = useCallback(async (image: CapturedPhoto, documentType?: DocumentType): Promise<any> => {
    try {
      if (!enableOfflineProcessing) {
        throw new Error('Offline processing is disabled');
      }

      console.log('📄 HERA: Processing document offline...');
      
      // Process with offline engine
      const job = await offlineProcessingEngine.processDocument(image, documentType);
      
      // Queue for sync when online
      const operationId = await offlineSyncManager.processDocumentOffline(job.result, image.dataUrl);
      
      return {
        ...job.result,
        operationId,
        processedOffline: true
      };
      
    } catch (error) {
      console.error('❌ HERA: Offline document processing failed:', error);
      throw error;
    }
  }, [enableOfflineProcessing]);

  const processInvoiceOffline = useCallback(async (image: CapturedPhoto): Promise<InvoiceData> => {
    try {
      if (!enableOfflineProcessing) {
        throw new Error('Offline processing is disabled');
      }

      console.log('📄 HERA: Processing invoice offline...');
      
      const invoiceData = await offlineProcessingEngine.processInvoice(image);
      
      // Queue for sync when online
      await offlineSyncManager.processDocumentOffline(
        { documentType: 'invoice', extractedData: invoiceData },
        image.dataUrl
      );
      
      return invoiceData;
      
    } catch (error) {
      console.error('❌ HERA: Offline invoice processing failed:', error);
      throw error;
    }
  }, [enableOfflineProcessing]);

  const processReceiptOffline = useCallback(async (image: CapturedPhoto): Promise<ReceiptData> => {
    try {
      if (!enableOfflineProcessing) {
        throw new Error('Offline processing is disabled');
      }

      console.log('🧾 HERA: Processing receipt offline...');
      
      const receiptData = await offlineProcessingEngine.processReceipt(image);
      
      // Queue for sync when online
      await offlineSyncManager.processDocumentOffline(
        { documentType: 'receipt', extractedData: receiptData },
        image.dataUrl
      );
      
      return receiptData;
      
    } catch (error) {
      console.error('❌ HERA: Offline receipt processing failed:', error);
      throw error;
    }
  }, [enableOfflineProcessing]);

  const processBusinessCardOffline = useCallback(async (image: CapturedPhoto): Promise<any> => {
    try {
      if (!enableOfflineProcessing) {
        throw new Error('Offline processing is disabled');
      }

      console.log('👤 HERA: Processing business card offline...');
      
      const contactData = await offlineProcessingEngine.processBusinessCard(image);
      
      // Queue for sync when online
      await offlineSyncManager.processDocumentOffline(
        { documentType: 'business_card', extractedData: contactData },
        image.dataUrl
      );
      
      return contactData;
      
    } catch (error) {
      console.error('❌ HERA: Offline business card processing failed:', error);
      throw error;
    }
  }, [enableOfflineProcessing]);

  // ==================== INVENTORY OPERATIONS ====================

  const updateInventoryOffline = useCallback(async (
    productId: string, 
    quantity: number, 
    operation: 'add' | 'subtract' | 'set'
  ): Promise<string> => {
    try {
      console.log('📦 HERA: Updating inventory offline...', { productId, quantity, operation });
      
      const operationId = await offlineSyncManager.updateInventoryOffline(productId, quantity, operation);
      updateStatus();
      
      return operationId;
      
    } catch (error) {
      console.error('❌ HERA: Offline inventory update failed:', error);
      throw error;
    }
  }, [updateStatus]);

  const lookupProductOffline = useCallback(async (barcode: string): Promise<any> => {
    try {
      console.log('🏷️ HERA: Looking up product offline...', barcode);
      
      // First try local cache
      const cachedProduct = await offlineStorageManager.getProductByBarcode(barcode);
      if (cachedProduct) {
        return {
          success: true,
          product: cachedProduct,
          source: 'offline_cache'
        };
      }
      
      // If not found, queue for online lookup
      const result = await offlineSyncManager.scanBarcodeOffline(barcode);
      updateStatus();
      
      return result;
      
    } catch (error) {
      console.error('❌ HERA: Offline product lookup failed:', error);
      throw error;
    }
  }, [updateStatus]);

  // ==================== EVENT CALLBACKS ====================

  const onSyncCompleted = useCallback((callback: (result: SyncResult) => void) => {
    const handler = (result: SyncResult) => callback(result);
    offlineSyncManager.on('sync-completed', handler);
    
    return () => {
      offlineSyncManager.removeListener('sync-completed', handler);
    };
  }, []);

  const onOfflineDetected = useCallback((callback: () => void) => {
    const handler = () => callback();
    offlineSyncManager.on('network-offline', handler);
    
    return () => {
      offlineSyncManager.removeListener('network-offline', handler);
    };
  }, []);

  const onOnlineDetected = useCallback((callback: () => void) => {
    const handler = () => callback();
    offlineSyncManager.on('network-online', handler);
    
    return () => {
      offlineSyncManager.removeListener('network-online', handler);
    };
  }, []);

  // ==================== UTILITY FUNCTIONS ====================

  const getPendingOperations = useCallback((): number => {
    return syncStatus.pendingOperations;
  }, [syncStatus.pendingOperations]);

  const getFailedOperations = useCallback((): number => {
    return syncStatus.failedOperations;
  }, [syncStatus.failedOperations]);

  // ==================== CONTEXT VALUE ====================

  const contextValue: OfflineContextValue = {
    // Connection Status
    isOnline,
    isOfflineReady,
    
    // Sync Management
    syncStatus,
    triggerSync,
    
    // Storage Management
    storageStats,
    clearCache,
    
    // Document Processing
    processDocumentOffline,
    processInvoiceOffline,
    processReceiptOffline,
    processBusinessCardOffline,
    
    // Inventory Management
    updateInventoryOffline,
    lookupProductOffline,
    
    // Data Management
    storeOfflineData,
    getOfflineData,
    
    // Queue Management
    getPendingOperations,
    getFailedOperations,
    retryFailedOperations,
    
    // Events
    onSyncCompleted,
    onOfflineDetected,
    onOnlineDetected
  };

  // ==================== RENDER ====================

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
}

// ==================== UTILITY FUNCTIONS ====================

function waitForService(service: any, eventName: string): Promise<void> {
  return new Promise((resolve) => {
    if (service.isReady) {
      resolve();
      return;
    }
    
    const handler = () => {
      service.removeListener(eventName, handler);
      resolve();
    };
    
    service.on(eventName, handler);
    
    // Fallback timeout
    setTimeout(() => {
      service.removeListener(eventName, handler);
      resolve();
    }, 10000);
  });
}

// ==================== OFFLINE STATUS HOOK ====================

export function useOfflineStatus() {
  const { isOnline, isOfflineReady, syncStatus } = useOffline();
  
  return {
    isOnline,
    isOfflineReady,
    canWorkOffline: isOfflineReady,
    hasPendingSync: syncStatus.pendingOperations > 0,
    hasFailedSync: syncStatus.failedOperations > 0,
    lastSyncTime: syncStatus.lastSyncTimestamp,
    nextSyncTime: syncStatus.nextScheduledSync
  };
}

// ==================== OFFLINE OPERATIONS HOOK ====================

export function useOfflineOperations() {
  const {
    processDocumentOffline,
    processInvoiceOffline,
    processReceiptOffline,
    processBusinessCardOffline,
    updateInventoryOffline,
    lookupProductOffline
  } = useOffline();
  
  return {
    processDocument: processDocumentOffline,
    processInvoice: processInvoiceOffline,
    processReceipt: processReceiptOffline,
    processBusinessCard: processBusinessCardOffline,
    updateInventory: updateInventoryOffline,
    lookupProduct: lookupProductOffline
  };
}

// ==================== OFFLINE SYNC HOOK ====================

export function useOfflineSync() {
  const {
    syncStatus,
    triggerSync,
    retryFailedOperations,
    getPendingOperations,
    getFailedOperations,
    onSyncCompleted,
    onOfflineDetected,
    onOnlineDetected
  } = useOffline();
  
  return {
    status: syncStatus,
    sync: triggerSync,
    retry: retryFailedOperations,
    pendingCount: getPendingOperations(),
    failedCount: getFailedOperations(),
    onSyncComplete: onSyncCompleted,
    onGoOffline: onOfflineDetected,
    onGoOnline: onOnlineDetected
  };
}

export default OfflineProvider;