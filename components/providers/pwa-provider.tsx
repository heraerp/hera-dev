/**
 * HERA Universal ERP - PWA Provider
 * Central PWA state management and context
 */

'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePWA, PWAHookReturn, UsePWAOptions } from '@/hooks/use-pwa';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { offlineDataManager } from '@/lib/offline/offline-data-manager';
import { syncManager } from '@/lib/offline/sync-manager';
import { pushNotificationService } from '@/lib/notifications/push-service';

interface PWAProviderProps {
  children: ReactNode;
  options?: UsePWAOptions;
  showOfflineIndicator?: boolean;
  showInstallPrompt?: boolean;
  offlineIndicatorPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  installPromptPosition?: 'bottom' | 'top' | 'center';
  vapidPublicKey?: string;
}

const PWAContext = createContext<PWAHookReturn | null>(null);

export function PWAProvider({
  children,
  options = {},
  showOfflineIndicator = true,
  showInstallPrompt = true,
  offlineIndicatorPosition = 'top-right',
  installPromptPosition = 'bottom',
  vapidPublicKey
}: PWAProviderProps) {
  const pwa = usePWA({
    autoSync: true,
    syncInterval: 30000,
    enablePush: true,
    enableInstallPrompt: true,
    storageStatsInterval: 60000,
    ...options
  });

  // Initialize PWA services
  useEffect(() => {
    const initializePWA = async () => {
      try {
        console.log('🚀 HERA: Initializing PWA services...');

        // Initialize offline data manager
        await offlineDataManager.initialize();
        console.log('✅ HERA: Offline data manager initialized');

        // Initialize push notifications if VAPID key is provided
        if (vapidPublicKey && pwa.utils.capabilities.pushManager) {
          try {
            await pushNotificationService.initialize();
            console.log('✅ HERA: Push notification service initialized');
          } catch (error) {
            console.warn('⚠️ HERA: Push notifications not available:', error);
          }
        }

        // Register service worker message listeners
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        }

        console.log('🎉 HERA: PWA initialization complete');
      } catch (error) {
        console.error('❌ HERA: PWA initialization failed:', error);
      }
    };

    initializePWA();

    // Cleanup
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [vapidPublicKey, pwa.utils.capabilities.pushManager]);

  // Handle service worker messages
  const handleServiceWorkerMessage = (event: MessageEvent) => {
    const { type, data } = event.data;

    switch (type) {
      case 'SYNC_SUCCESS':
        console.log('✅ HERA: Background sync successful:', data);
        // Refresh data or update UI
        break;

      case 'SYNC_FAILED':
        console.error('❌ HERA: Background sync failed:', data);
        // Show error notification
        pwa.actions.showNotification(
          'Sync Failed',
          {
            body: 'Some changes could not be synced. They will be retried automatically.',
            icon: '/icons/notification-error.png',
            tag: 'sync-failed'
          }
        );
        break;

      case 'BACKGROUND_SYNC_COMPLETE':
        console.log('✅ HERA: Background sync complete');
        // Update sync status
        break;

      case 'CACHE_UPDATED':
        console.log('🔄 HERA: App cache updated');
        // Notify user of available update
        pwa.actions.checkForUpdate();
        break;

      default:
        console.log('📱 HERA: Unknown service worker message:', type, data);
    }
  };

  // Handle app state changes for sync optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && pwa.state.isOnline) {
        // App became visible and we're online - trigger sync
        syncManager.forcSync().catch(console.error);
      }
    };

    const handleFocus = () => {
      if (pwa.state.isOnline) {
        // App got focus and we're online - check for updates
        pwa.actions.checkForUpdate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [pwa.state.isOnline, pwa.actions]);

  // Handle page unload for cleanup
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Warn user if there are pending offline changes
      if (pwa.state.storageUsage && pwa.state.storageUsage.queue > 0) {
        const message = 'You have unsaved changes that will be lost if you leave now.';
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pwa.state.storageUsage]);

  // Auto-sync when coming online
  useEffect(() => {
    if (pwa.state.isOnline && options.autoSync) {
      const timeout = setTimeout(() => {
        syncManager.forcSync().catch(console.error);
      }, 1000); // Delay to ensure connection is stable

      return () => clearTimeout(timeout);
    }
  }, [pwa.state.isOnline, options.autoSync]);

  // Periodic storage cleanup
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      try {
        await offlineDataManager.cleanupExpiredData();
        await pwa.actions.refreshStorageStats();
      } catch (error) {
        console.error('❌ HERA: Storage cleanup failed:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [pwa.actions]);

  // Monitor storage quota
  useEffect(() => {
    const checkStorageQuota = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const usagePercentage = estimate.usage && estimate.quota 
            ? (estimate.usage / estimate.quota) * 100 
            : 0;

          if (usagePercentage > 80) {
            console.warn('⚠️ HERA: Storage quota nearly full:', usagePercentage + '%');
            
            // Show notification to user
            pwa.actions.showNotification(
              'Storage Nearly Full',
              {
                body: 'Your offline storage is nearly full. Consider clearing old data.',
                icon: '/icons/notification-warning.png',
                tag: 'storage-warning',
                actions: [
                  { action: 'cleanup', title: 'Clean Up' },
                  { action: 'dismiss', title: 'Dismiss' }
                ]
              }
            );
          }
        } catch (error) {
          console.error('❌ HERA: Failed to check storage quota:', error);
        }
      }
    };

    // Check storage quota every 10 minutes
    const storageCheckInterval = setInterval(checkStorageQuota, 10 * 60 * 1000);
    
    // Initial check
    checkStorageQuota();

    return () => clearInterval(storageCheckInterval);
  }, [pwa.actions]);

  // Debug logging for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 HERA PWA Debug State:', pwa.state);
      console.log('🔍 HERA PWA Debug Utils:', pwa.utils);
    }
  }, [pwa.state, pwa.utils]);

  return (
    <PWAContext.Provider value={pwa}>
      {children}
      
      {/* PWA UI Components */}
      {showOfflineIndicator && (
        <OfflineIndicator 
          position={offlineIndicatorPosition}
          showDetails={true}
        />
      )}
      
      {showInstallPrompt && pwa.utils.capabilities.serviceWorker && (
        <InstallPrompt 
          position={installPromptPosition}
          autoShow={true}
          showDelay={30000}
        />
      )}
    </PWAContext.Provider>
  );
}

/**
 * Hook to access PWA context
 */
export function usePWAContext(): PWAHookReturn {
  const context = useContext(PWAContext);
  
  if (!context) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }
  
  return context;
}

/**
 * Hook to check if PWA features are available
 */
export function usePWASupport() {
  const context = useContext(PWAContext);
  
  return {
    isSupported: context?.utils.isSupported ?? false,
    capabilities: context?.utils.capabilities ?? {
      serviceWorker: false,
      pushManager: false,
      notifications: false,
      backgroundSync: false,
      periodicSync: false,
      webShare: false,
      fileSystem: false,
      vibration: false
    }
  };
}

/**
 * Hook for offline-first data operations
 */
export function useOfflineData() {
  const pwa = usePWAContext();
  
  return {
    isOnline: pwa.state.isOnline,
    isSyncing: pwa.state.isSyncing,
    syncProgress: pwa.state.syncProgress,
    storageUsage: pwa.state.storageUsage,
    forceSync: pwa.actions.forceSync,
    clearData: pwa.actions.clearOfflineData,
    exportData: pwa.actions.exportOfflineData,
    refreshStats: pwa.actions.refreshStorageStats
  };
}

/**
 * Hook for PWA installation
 */
export function usePWAInstall() {
  const pwa = usePWAContext();
  
  return {
    isInstalled: pwa.state.isInstalled,
    isInstallable: pwa.state.isInstallPromptAvailable,
    isInstalling: pwa.state.isInstalling,
    install: pwa.actions.installApp
  };
}

/**
 * Hook for push notifications
 */
export function usePWANotifications() {
  const pwa = usePWAContext();
  
  return {
    permission: pwa.state.notificationPermission,
    isSubscribed: pwa.state.isPushSubscribed,
    requestPermission: pwa.actions.requestNotificationPermission,
    subscribe: pwa.actions.subscribeToPush,
    unsubscribe: pwa.actions.unsubscribeFromPush,
    showNotification: pwa.actions.showNotification,
    vibrate: pwa.actions.vibrate
  };
}

/**
 * Hook for app updates
 */
export function usePWAUpdates() {
  const pwa = usePWAContext();
  
  return {
    hasUpdate: pwa.state.hasUpdate,
    isUpdating: pwa.state.isUpdating,
    checkForUpdate: pwa.actions.checkForUpdate,
    installUpdate: pwa.actions.installUpdate
  };
}