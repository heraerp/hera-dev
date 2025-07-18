/**
 * HERA Universal ERP - Offline Status Indicator
 * Real-time offline/sync status display
 * Keeps users informed of connectivity and data sync state
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  Sync,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Signal,
  Loader2,
  X,
  RefreshCw
} from 'lucide-react';
import { useOfflineStatus, useOfflineSync, useOffline } from '@/components/providers/offline-provider';
import { Button } from '@/components/ui/revolutionary-button';
import { Card } from '@/components/ui/revolutionary-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import motionConfig from '@/lib/motion';

// ==================== COMPONENT INTERFACES ====================

interface OfflineStatusIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showDetails?: boolean;
  autoHide?: boolean;
  className?: string;
}

interface StatusDetails {
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  action?: string;
}

// ==================== MAIN COMPONENT ====================

export function OfflineStatusIndicator({
  position = 'top-right',
  showDetails = false,
  autoHide = true,
  className = ''
}: OfflineStatusIndicatorProps) {
  
  const { isOnline, isOfflineReady, canWorkOffline, hasPendingSync, hasFailedSync } = useOfflineStatus();
  const { status, sync, retry, pendingCount, failedCount } = useOfflineSync();
  const { storageStats } = useOffline();
  
  const [showDetailedView, setShowDetailedView] = useState(showDetails);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // ==================== STATUS DETERMINATION ====================

  const getStatusInfo = (): StatusDetails => {
    if (!isOfflineReady) {
      return {
        title: 'Initializing',
        description: 'Setting up offline capabilities...',
        color: 'text-blue-500',
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        action: undefined
      };
    }

    if (!isOnline && !canWorkOffline) {
      return {
        title: 'Offline - Limited',
        description: 'Some features may not be available',
        color: 'text-amber-500',
        icon: <WifiOff className="w-4 h-4" />,
        action: undefined
      };
    }

    if (!isOnline && canWorkOffline) {
      return {
        title: 'Offline Mode',
        description: 'Working offline - data will sync when online',
        color: 'text-blue-500',
        icon: <CloudOff className="w-4 h-4" />,
        action: undefined
      };
    }

    if (isOnline && hasFailedSync) {
      return {
        title: 'Sync Issues',
        description: `${failedCount} operations failed to sync`,
        color: 'text-red-500',
        icon: <AlertTriangle className="w-4 h-4" />,
        action: 'retry'
      };
    }

    if (isOnline && hasPendingSync) {
      return {
        title: 'Syncing',
        description: `${pendingCount} operations pending`,
        color: 'text-amber-500',
        icon: <Sync className="w-4 h-4 animate-spin" />,
        action: undefined
      };
    }

    if (isOnline && status.syncInProgress) {
      return {
        title: 'Syncing',
        description: 'Synchronizing data...',
        color: 'text-blue-500',
        icon: <Sync className="w-4 h-4 animate-spin" />,
        action: undefined
      };
    }

    return {
      title: 'Online',
      description: 'All systems operational',
      color: 'text-green-500',
      icon: <CheckCircle2 className="w-4 h-4" />,
      action: undefined
    };
  };

  const statusInfo = getStatusInfo();

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (status.lastSyncTimestamp > 0) {
      const time = new Date(status.lastSyncTimestamp).toLocaleTimeString();
      setLastSyncTime(time);
    }
  }, [status.lastSyncTimestamp]);

  useEffect(() => {
    // Auto-expand when there are issues
    if (hasFailedSync || (hasPendingSync && pendingCount > 5)) {
      setIsExpanded(true);
      setShowDetailedView(true);
    } else if (autoHide && isOnline && !hasPendingSync && !hasFailedSync) {
      // Auto-collapse when everything is good
      setTimeout(() => {
        setIsExpanded(false);
        if (!showDetails) {
          setShowDetailedView(false);
        }
      }, 3000);
    }
  }, [hasFailedSync, hasPendingSync, pendingCount, isOnline, autoHide, showDetails]);

  // ==================== EVENT HANDLERS ====================

  const handleStatusClick = () => {
    setIsExpanded(!isExpanded);
    setShowDetailedView(!showDetailedView);
  };

  const handleRetrySync = async () => {
    try {
      await retry();
    } catch (error) {
      console.error('Retry sync failed:', error);
    }
  };

  const handleManualSync = async () => {
    try {
      await sync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  // ==================== RENDER HELPERS ====================

  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStoragePercentage = (): number => {
    if (storageStats.totalSize === 0) return 0;
    return (storageStats.usedSize / storageStats.totalSize) * 100;
  };

  const getPositionClasses = (): string => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  // ==================== COMPACT VIEW ====================

  const renderCompactView = () => (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleStatusClick}
      className="cursor-pointer"
    >
      <Card variant="glass" className="p-3 bg-background/80 backdrop-blur-sm border-border/50">
        <div className="flex items-center gap-2">
          <div className={statusInfo.color}>
            {statusInfo.icon}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium">{statusInfo.title}</p>
          </div>
          {(hasPendingSync || hasFailedSync) && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {pendingCount + failedCount}
            </Badge>
          )}
        </div>
      </Card>
    </motion.div>
  );

  // ==================== DETAILED VIEW ====================

  const renderDetailedView = () => (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: -20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0, y: -20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <Card className="w-80 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={statusInfo.color}>
              {statusInfo.icon}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{statusInfo.title}</h3>
              <p className="text-xs text-muted-foreground">{statusInfo.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetailedView(false)}
            className="w-6 h-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        <Separator className="mb-4" />

        {/* Connection Status */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm">Connection</span>
            </div>
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Offline Ready</span>
            </div>
            <Badge variant={canWorkOffline ? "default" : "secondary"}>
              {canWorkOffline ? 'Ready' : 'Loading'}
            </Badge>
          </div>
        </div>

        {/* Sync Status */}
        {(hasPendingSync || hasFailedSync || lastSyncTime) && (
          <>
            <Separator className="mb-4" />
            <div className="space-y-3 mb-4">
              <h4 className="font-medium text-sm">Sync Status</h4>
              
              {hasPendingSync && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <Badge variant="secondary">{pendingCount}</Badge>
                </div>
              )}
              
              {hasFailedSync && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Failed</span>
                  <Badge variant="destructive">{failedCount}</Badge>
                </div>
              )}
              
              {lastSyncTime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Sync</span>
                  <span className="text-xs text-muted-foreground">{lastSyncTime}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Storage Status */}
        <Separator className="mb-4" />
        <div className="space-y-3 mb-4">
          <h4 className="font-medium text-sm">Storage</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Used</span>
              <span className="text-xs">
                {formatStorageSize(storageStats.usedSize)} / {formatStorageSize(storageStats.totalSize)}
              </span>
            </div>
            
            <Progress 
              value={getStoragePercentage()} 
              className="h-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <p className="font-medium">{storageStats.entryCount}</p>
              <p className="text-muted-foreground">Cached Items</p>
            </div>
            <div className="text-center">
              <p className="font-medium">
                {storageStats.hitRate > 0 ? Math.round((storageStats.hitRate / (storageStats.hitRate + storageStats.missRate)) * 100) : 0}%
              </p>
              <p className="text-muted-foreground">Hit Rate</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {(statusInfo.action || isOnline) && (
          <>
            <Separator className="mb-4" />
            <div className="flex gap-2">
              {statusInfo.action === 'retry' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetrySync}
                  className="flex-1"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              )}
              
              {isOnline && !status.syncInProgress && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSync}
                  className="flex-1"
                >
                  <Sync className="w-3 h-3 mr-1" />
                  Sync Now
                </Button>
              )}
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className={`fixed z-50 ${getPositionClasses()} ${className}`}>
      <AnimatePresence mode="wait">
        {showDetailedView ? (
          <motion.div key="detailed">
            {renderDetailedView()}
          </motion.div>
        ) : (
          <motion.div key="compact">
            {renderCompactView()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== OFFLINE SYNC PROGRESS ====================

interface OfflineSyncProgressProps {
  show: boolean;
  onComplete?: () => void;
}

export function OfflineSyncProgress({ show, onComplete }: OfflineSyncProgressProps) {
  const { status } = useOfflineSync();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status.syncInProgress) {
      // Simulate progress for visual feedback
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
      setTimeout(() => {
        setProgress(0);
        onComplete?.();
      }, 1000);
    }
  }, [status.syncInProgress, onComplete]);

  return (
    <AnimatePresence>
      {show && status.syncInProgress && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Card className="p-4 min-w-80">
            <div className="flex items-center gap-3 mb-3">
              <Sync className="w-5 h-5 text-blue-500 animate-spin" />
              <div>
                <h4 className="font-medium">Synchronizing Data</h4>
                <p className="text-sm text-muted-foreground">
                  Syncing your offline changes...
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==================== OFFLINE MODE BANNER ====================

interface OfflineModeBannerProps {
  show?: boolean;
  onDismiss?: () => void;
}

export function OfflineModeBanner({ show: showProp, onDismiss }: OfflineModeBannerProps) {
  const { isOnline, canWorkOffline } = useOfflineStatus();
  const [dismissed, setDismissed] = useState(false);
  
  const show = showProp !== undefined ? showProp : (!isOnline && canWorkOffline && !dismissed);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-0 left-0 right-0 z-40"
        >
          <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800 p-3">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <CloudOff className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Working Offline
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You're offline but can continue working. Changes will sync when you're back online.
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OfflineStatusIndicator;