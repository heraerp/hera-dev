/**
 * HERA Universal ERP - PWA Offline Status Indicator
 * Real-time connection status with sync progress
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { syncManager } from '@/lib/offline/sync-manager';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Cloud,
  CloudOff,
  Activity
} from 'lucide-react';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync?: number;
  pendingItems?: number;
  syncProgress?: {
    total: number;
    completed: number;
    failed: number;
    conflicts: number;
    current?: string;
  };
}

export function OfflineIndicator({ 
  className = '', 
  showDetails = true,
  position = 'top-right'
}: OfflineIndicatorProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false
  });
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>>([]);

  useEffect(() => {
    // Initialize sync status
    const updateSyncStatus = () => {
      const status = syncManager.getSyncStatus();
      setSyncStatus(prev => ({
        ...prev,
        ...status
      }));
    };

    // Network status listeners
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      addNotification('success', 'Connection restored - syncing data...');
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false, isSyncing: false }));
      addNotification('warning', 'Working offline - changes will sync when connected');
    };

    // Sync event listeners
    const handleSyncStarted = () => {
      setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    };

    const handleSyncProgress = (progress: any) => {
      setSyncStatus(prev => ({
        ...prev,
        syncProgress: progress
      }));
    };

    const handleSyncCompleted = (result: any) => {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: Date.now(),
        syncProgress: undefined
      }));
      
      if (result.failed > 0 || result.conflicts > 0) {
        addNotification('warning', `Sync completed with ${result.failed} failed, ${result.conflicts} conflicts`);
      } else {
        addNotification('success', `Synced ${result.completed} items successfully`);
      }
    };

    const handleSyncFailed = (error: any) => {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncProgress: undefined
      }));
      addNotification('error', 'Sync failed - will retry automatically');
    };

    const handleConflictDetected = (conflict: any) => {
      addNotification('warning', `Data conflict detected in ${conflict.entityType}`);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    syncManager.on('sync-started', handleSyncStarted);
    syncManager.on('sync-progress', handleSyncProgress);
    syncManager.on('sync-completed', handleSyncCompleted);
    syncManager.on('sync-failed', handleSyncFailed);
    syncManager.on('conflict-detected', handleConflictDetected);

    // Initial status update
    updateSyncStatus();

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      syncManager.off('sync-started', handleSyncStarted);
      syncManager.off('sync-progress', handleSyncProgress);
      syncManager.off('sync-completed', handleSyncCompleted);
      syncManager.off('sync-failed', handleSyncFailed);
      syncManager.off('conflict-detected', handleConflictDetected);
    };
  }, []);

  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
    
    if (syncStatus.isOnline) {
      return <Wifi className="w-4 h-4" />;
    }
    
    return <WifiOff className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (syncStatus.isSyncing) {
      return 'bg-blue-500';
    }
    
    if (syncStatus.isOnline) {
      return 'bg-green-500';
    }
    
    return 'bg-amber-500';
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing && syncStatus.syncProgress) {
      const { completed, total, current } = syncStatus.syncProgress;
      return `Syncing ${completed}/${total}${current ? ` - ${current}` : ''}`;
    }
    
    if (syncStatus.isSyncing) {
      return 'Syncing...';
    }
    
    if (syncStatus.isOnline) {
      return syncStatus.lastSync 
        ? `Online - Last sync: ${new Date(syncStatus.lastSync).toLocaleTimeString()}`
        : 'Online';
    }
    
    return 'Offline';
  };

  const handleForceSync = async () => {
    if (!syncStatus.isOnline) {
      addNotification('warning', 'Cannot sync while offline');
      return;
    }
    
    try {
      await syncManager.forcSync();
      addNotification('success', 'Manual sync completed');
    } catch (error) {
      addNotification('error', 'Manual sync failed');
    }
  };

  return (
    <>
      {/* Main Status Indicator */}
      <motion.div 
        className={`fixed ${getPositionClasses()} z-50 ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <motion.button
            onClick={() => setShowDetailsPanel(!showDetailsPanel)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full ${getStatusColor()} text-white shadow-lg hover:shadow-xl transition-all duration-200`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {getStatusIcon()}
            {showDetails && (
              <span className="text-sm font-medium">
                {syncStatus.isOnline ? 'Online' : 'Offline'}
              </span>
            )}
          </motion.button>

          {/* Sync Progress */}
          <AnimatePresence>
            {syncStatus.isSyncing && syncStatus.syncProgress && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {syncStatus.syncProgress.completed}/{syncStatus.syncProgress.total}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Details Panel */}
        <AnimatePresence>
          {showDetailsPanel && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="space-y-3">
                {/* Status Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {syncStatus.isOnline ? (
                      <Cloud className="w-5 h-5 text-green-500" />
                    ) : (
                      <CloudOff className="w-5 h-5 text-amber-500" />
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {syncStatus.isOnline ? 'Connected' : 'Offline Mode'}
                    </h3>
                  </div>
                  <button
                    onClick={handleForceSync}
                    disabled={!syncStatus.isOnline || syncStatus.isSyncing}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Status Details */}
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {getStatusText()}
                </div>

                {/* Sync Progress Bar */}
                {syncStatus.syncProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Syncing...</span>
                      <span>
                        {syncStatus.syncProgress.completed}/{syncStatus.syncProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(syncStatus.syncProgress.completed / syncStatus.syncProgress.total) * 100}%` 
                        }}
                      />
                    </div>
                    {syncStatus.syncProgress.current && (
                      <div className="text-xs text-gray-500">
                        {syncStatus.syncProgress.current}
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowDetailsPanel(false)}
                    className="flex-1 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.location.href = '/settings/sync'}
                    className="flex-1 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    Settings
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Notifications */}
      <div className={`fixed ${getPositionClasses()} z-40 pointer-events-none`}>
        <div className="space-y-2 mt-16">
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg max-w-sm ${
                  notification.type === 'success' ? 'bg-green-500 text-white' :
                  notification.type === 'error' ? 'bg-red-500 text-white' :
                  notification.type === 'warning' ? 'bg-amber-500 text-white' :
                  'bg-blue-500 text-white'
                }`}
              >
                {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
                {notification.type === 'error' && <XCircle className="w-4 h-4" />}
                {notification.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                {notification.type === 'info' && <Activity className="w-4 h-4" />}
                <span className="text-sm">{notification.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}