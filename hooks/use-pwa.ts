/**
 * HERA Universal ERP - PWA React Hook
 * Comprehensive PWA state management and utilities
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { syncManager } from '@/lib/offline/sync-manager';
import { offlineDataManager } from '@/lib/offline/offline-data-manager';
import { pushNotificationService } from '@/lib/notifications/push-service';

export interface PWAState {
  // Installation
  isInstalled: boolean;
  isInstallPromptAvailable: boolean;
  isInstalling: boolean;
  
  // Connection
  isOnline: boolean;
  connectionEffective: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  
  // Sync
  isSyncing: boolean;
  syncProgress: {
    total: number;
    completed: number;
    failed: number;
    conflicts: number;
    current?: string;
  } | null;
  lastSync: number | null;
  
  // Storage
  storageUsage: {
    transactions: number;
    data: number;
    queue: number;
    conflicts: number;
    totalSize: number;
  } | null;
  
  // Notifications
  notificationPermission: NotificationPermission;
  isPushSubscribed: boolean;
  
  // Update
  hasUpdate: boolean;
  isUpdating: boolean;
}

export interface PWAActions {
  // Installation
  installApp: () => Promise<boolean>;
  
  // Sync
  forceSync: () => Promise<void>;
  
  // Storage
  clearOfflineData: () => Promise<void>;
  exportOfflineData: () => Promise<any>;
  refreshStorageStats: () => Promise<void>;
  
  // Notifications
  requestNotificationPermission: () => Promise<boolean>;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
  
  // Update
  checkForUpdate: () => Promise<boolean>;
  installUpdate: () => Promise<void>;
  
  // Utilities
  showNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  vibrate: (pattern: number | number[]) => void;
}

export interface UsePWAOptions {
  autoSync?: boolean;
  syncInterval?: number;
  enablePush?: boolean;
  enableInstallPrompt?: boolean;
  storageStatsInterval?: number;
}

export interface PWAHookReturn {
  state: PWAState;
  actions: PWAActions;
  utils: {
    isSupported: boolean;
    capabilities: {
      serviceWorker: boolean;
      pushManager: boolean;
      notifications: boolean;
      backgroundSync: boolean;
      periodicSync: boolean;
      webShare: boolean;
      fileSystem: boolean;
      vibration: boolean;
    };
  };
}

export function usePWA(options: UsePWAOptions = {}): PWAHookReturn {
  const {
    autoSync = true,
    syncInterval = 30000,
    enablePush = true,
    enableInstallPrompt = true,
    storageStatsInterval = 60000
  } = options;

  // State
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    isInstallPromptAvailable: false,
    isInstalling: false,
    isOnline: navigator.onLine,
    connectionEffective: 'unknown',
    isSyncing: false,
    syncProgress: null,
    lastSync: null,
    storageUsage: null,
    notificationPermission: 'default',
    isPushSubscribed: false,
    hasUpdate: false,
    isUpdating: false
  });

  // Refs
  const deferredPromptRef = useRef<any>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const storageStatsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize PWA capabilities
  const capabilities = {
    serviceWorker: 'serviceWorker' in navigator,
    pushManager: 'PushManager' in window,
    notifications: 'Notification' in window,
    backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    periodicSync: 'serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype,
    webShare: 'share' in navigator,
    fileSystem: 'showOpenFilePicker' in window,
    vibration: 'vibrate' in navigator
  };

  const isSupported = capabilities.serviceWorker && capabilities.pushManager;

  // Update state helper
  const updateState = useCallback((updates: Partial<PWAState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Install app
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPromptRef.current) {
      return false;
    }

    try {
      updateState({ isInstalling: true });
      
      await deferredPromptRef.current.prompt();
      const { outcome } = await deferredPromptRef.current.userChoice;
      
      if (outcome === 'accepted') {
        updateState({ isInstalled: true, isInstallPromptAvailable: false });
        deferredPromptRef.current = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ HERA: Install failed:', error);
      return false;
    } finally {
      updateState({ isInstalling: false });
    }
  }, [updateState]);

  // Force sync
  const forceSync = useCallback(async (): Promise<void> => {
    if (!state.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    
    await syncManager.forcSync();
  }, [state.isOnline]);

  // Clear offline data
  const clearOfflineData = useCallback(async (): Promise<void> => {
    await offlineDataManager.clearAllData();
    await refreshStorageStats();
  }, []);

  // Export offline data
  const exportOfflineData = useCallback(async (): Promise<any> => {
    return offlineDataManager.exportData();
  }, []);

  // Refresh storage stats
  const refreshStorageStats = useCallback(async (): Promise<void> => {
    try {
      const stats = await offlineDataManager.getStorageStats();
      updateState({ storageUsage: stats });
    } catch (error) {
      console.error('❌ HERA: Failed to get storage stats:', error);
    }
  }, [updateState]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!capabilities.notifications) {
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      updateState({ notificationPermission: permission });
      return permission === 'granted';
    } catch (error) {
      console.error('❌ HERA: Failed to request notification permission:', error);
      return false;
    }
  }, [capabilities.notifications, updateState]);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (!enablePush || !capabilities.pushManager) {
      return false;
    }
    
    try {
      const granted = await requestNotificationPermission();
      if (!granted) {
        return false;
      }
      
      await pushNotificationService.initialize();
      const subscription = await pushNotificationService.subscribe();
      
      updateState({ isPushSubscribed: !!subscription });
      return !!subscription;
    } catch (error) {
      console.error('❌ HERA: Failed to subscribe to push notifications:', error);
      return false;
    }
  }, [enablePush, capabilities.pushManager, requestNotificationPermission, updateState]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    try {
      const success = await pushNotificationService.unsubscribe();
      updateState({ isPushSubscribed: false });
      return success;
    } catch (error) {
      console.error('❌ HERA: Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }, [updateState]);

  // Check for app update
  const checkForUpdate = useCallback(async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      
      const hasUpdate = registration.waiting !== null;
      updateState({ hasUpdate });
      return hasUpdate;
    } catch (error) {
      console.error('❌ HERA: Failed to check for update:', error);
      return false;
    }
  }, [updateState]);

  // Install update
  const installUpdate = useCallback(async (): Promise<void> => {
    try {
      updateState({ isUpdating: true });
      
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Wait for the new SW to take control
        await new Promise((resolve) => {
          navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
        });
        
        // Reload the page
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ HERA: Failed to install update:', error);
    } finally {
      updateState({ isUpdating: false });
    }
  }, [updateState]);

  // Show notification
  const showNotification = useCallback(async (title: string, options?: NotificationOptions): Promise<void> => {
    if (!capabilities.notifications || state.notificationPermission !== 'granted') {
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-96x96.png',
        ...options
      });
    } catch (error) {
      console.error('❌ HERA: Failed to show notification:', error);
    }
  }, [capabilities.notifications, state.notificationPermission]);

  // Vibrate
  const vibrate = useCallback((pattern: number | number[]): void => {
    if (capabilities.vibration) {
      navigator.vibrate(pattern);
    }
  }, [capabilities.vibration]);

  // Initialize PWA
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isWebApp = (window.navigator as any).standalone === true;
        updateState({ isInstalled: isStandalone || isWebApp });

        // Check notification permission
        if (capabilities.notifications) {
          updateState({ notificationPermission: Notification.permission });
        }

        // Check push subscription
        if (enablePush) {
          await pushNotificationService.initialize();
          updateState({ isPushSubscribed: pushNotificationService.isSubscribed() });
        }

        // Get initial sync status
        const syncStatus = syncManager.getSyncStatus();
        updateState({
          isSyncing: syncStatus.isSyncing,
          lastSync: syncStatus.lastSync || null
        });

        // Get storage stats
        await refreshStorageStats();

        // Check for updates
        await checkForUpdate();

        console.log('✅ HERA: PWA hook initialized');
      } catch (error) {
        console.error('❌ HERA: Failed to initialize PWA hook:', error);
      }
    };

    initialize();
  }, [enablePush, capabilities.notifications, updateState, refreshStorageStats, checkForUpdate]);

  // Network listeners
  useEffect(() => {
    const handleOnline = () => {
      updateState({ isOnline: true });
    };

    const handleOffline = () => {
      updateState({ isOnline: false });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateState]);

  // Install prompt listener
  useEffect(() => {
    if (!enableInstallPrompt) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      updateState({ isInstallPromptAvailable: true });
    };

    const handleAppInstalled = () => {
      updateState({ 
        isInstalled: true, 
        isInstallPromptAvailable: false 
      });
      deferredPromptRef.current = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [enableInstallPrompt, updateState]);

  // Sync listeners
  useEffect(() => {
    const handleSyncStarted = () => {
      updateState({ isSyncing: true });
    };

    const handleSyncProgress = (progress: any) => {
      updateState({ syncProgress: progress });
    };

    const handleSyncCompleted = (result: any) => {
      updateState({ 
        isSyncing: false, 
        syncProgress: null, 
        lastSync: Date.now() 
      });
    };

    const handleSyncFailed = () => {
      updateState({ 
        isSyncing: false, 
        syncProgress: null 
      });
    };

    syncManager.on('sync-started', handleSyncStarted);
    syncManager.on('sync-progress', handleSyncProgress);
    syncManager.on('sync-completed', handleSyncCompleted);
    syncManager.on('sync-failed', handleSyncFailed);

    return () => {
      syncManager.off('sync-started', handleSyncStarted);
      syncManager.off('sync-progress', handleSyncProgress);
      syncManager.off('sync-completed', handleSyncCompleted);
      syncManager.off('sync-failed', handleSyncFailed);
    };
  }, [updateState]);

  // Storage stats interval
  useEffect(() => {
    if (storageStatsInterval > 0) {
      storageStatsIntervalRef.current = setInterval(() => {
        refreshStorageStats();
      }, storageStatsInterval);
    }

    return () => {
      if (storageStatsIntervalRef.current) {
        clearInterval(storageStatsIntervalRef.current);
      }
    };
  }, [storageStatsInterval, refreshStorageStats]);

  // Connection effective type
  useEffect(() => {
    const connection = (navigator as any).connection;
    if (connection) {
      const updateConnection = () => {
        updateState({ 
          connectionEffective: connection.effectiveType || 'unknown' 
        });
      };

      connection.addEventListener('change', updateConnection);
      updateConnection();

      return () => {
        connection.removeEventListener('change', updateConnection);
      };
    }
  }, [updateState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (storageStatsIntervalRef.current) {
        clearInterval(storageStatsIntervalRef.current);
      }
    };
  }, []);

  const actions: PWAActions = {
    installApp,
    forceSync,
    clearOfflineData,
    exportOfflineData,
    refreshStorageStats,
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    checkForUpdate,
    installUpdate,
    showNotification,
    vibrate
  };

  return {
    state,
    actions,
    utils: {
      isSupported,
      capabilities
    }
  };
}