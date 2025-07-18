/**
 * HERA Universal ERP - Sync Manager
 * Advanced synchronization with conflict resolution
 */

import { offlineDataManager, OfflineTransaction, SyncQueueItem, ConflictEntry } from './offline-data-manager';
import { supabase } from '@/lib/supabase/client';
import { EventEmitter } from 'events';

export type SyncEvent = 
  | 'sync-started'
  | 'sync-progress'
  | 'sync-completed'
  | 'sync-failed'
  | 'conflict-detected'
  | 'connection-changed';

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  conflicts: number;
  current?: string;
}

export interface SyncOptions {
  forceSync?: boolean;
  maxConcurrent?: number;
  timeout?: number;
  retryCount?: number;
}

export class SyncManager extends EventEmitter {
  private isOnline = navigator.onLine;
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly maxConcurrentSyncs = 5;
  private readonly syncIntervalMs = 30000; // 30 seconds
  private readonly timeoutMs = 30000; // 30 seconds

  constructor() {
    super();
    this.initializeNetworkListeners();
    this.startPeriodicSync();
  }

  /**
   * Initialize network status listeners
   */
  private initializeNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('🌐 HERA: Connection restored');
      this.isOnline = true;
      this.emit('connection-changed', { online: true });
      this.syncWhenOnline();
    });

    window.addEventListener('offline', () => {
      console.log('📴 HERA: Connection lost');
      this.isOnline = false;
      this.emit('connection-changed', { online: false });
    });

    // Check connection status periodically
    setInterval(() => {
      const wasOnline = this.isOnline;
      this.isOnline = navigator.onLine;
      
      if (wasOnline !== this.isOnline) {
        this.emit('connection-changed', { online: this.isOnline });
        if (this.isOnline) {
          this.syncWhenOnline();
        }
      }
    }, 5000);
  }

  /**
   * Start periodic sync when online
   */
  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncAll({ forceSync: false });
      }
    }, this.syncIntervalMs);
  }

  /**
   * Stop periodic sync
   */
  public stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Check if online and sync if needed
   */
  private async syncWhenOnline(): Promise<void> {
    if (this.isOnline && !this.isSyncing) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      await this.syncAll({ forceSync: true });
    }
  }

  /**
   * Sync all offline data
   */
  public async syncAll(options: SyncOptions = {}): Promise<void> {
    if (this.isSyncing) {
      console.log('⏳ HERA: Sync already in progress');
      return;
    }

    if (!this.isOnline) {
      console.log('📴 HERA: Cannot sync while offline');
      return;
    }

    this.isSyncing = true;
    this.emit('sync-started');

    const startTime = Date.now();
    console.log('🔄 HERA: Starting full sync...');

    try {
      // Get all pending items
      const [pendingTransactions, syncQueue] = await Promise.all([
        offlineDataManager.getPendingTransactions(),
        offlineDataManager.getNextSyncItems(100)
      ]);

      const total = pendingTransactions.length + syncQueue.length;
      let completed = 0;
      let failed = 0;
      let conflicts = 0;

      if (total === 0) {
        console.log('✅ HERA: No data to sync');
        this.emit('sync-completed', { 
          total: 0, 
          completed: 0, 
          failed: 0, 
          conflicts: 0,
          duration: Date.now() - startTime
        });
        return;
      }

      // Sync transactions first
      for (const transaction of pendingTransactions) {
        try {
          this.emit('sync-progress', {
            total,
            completed,
            failed,
            conflicts,
            current: `Transaction: ${transaction.entityType}`
          });

          await this.syncTransaction(transaction);
          completed++;
        } catch (error) {
          console.error('❌ HERA: Failed to sync transaction:', error);
          failed++;
          
          if (this.isConflictError(error)) {
            conflicts++;
            await this.handleConflict(transaction, error);
          }
        }
      }

      // Sync queue items
      for (const item of syncQueue) {
        try {
          this.emit('sync-progress', {
            total,
            completed,
            failed,
            conflicts,
            current: `${item.operation}: ${item.entityType}`
          });

          await this.syncQueueItem(item);
          completed++;
        } catch (error) {
          console.error('❌ HERA: Failed to sync queue item:', error);
          failed++;
          
          if (this.isConflictError(error)) {
            conflicts++;
            await this.handleQueueItemConflict(item, error);
          }
        }
      }

      const duration = Date.now() - startTime;
      console.log(`✅ HERA: Sync completed in ${duration}ms - ${completed}/${total} synced`);

      this.emit('sync-completed', {
        total,
        completed,
        failed,
        conflicts,
        duration
      });

    } catch (error) {
      console.error('❌ HERA: Sync failed:', error);
      this.emit('sync-failed', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync individual transaction
   */
  private async syncTransaction(transaction: OfflineTransaction): Promise<void> {
    await offlineDataManager.updateTransactionStatus(transaction.id!, 'syncing');

    try {
      const response = await fetch(transaction.url, {
        method: transaction.method,
        headers: {
          ...transaction.headers,
          'X-Sync-Client-Id': transaction.clientId,
          'X-Sync-Timestamp': transaction.timestamp.toString()
        },
        body: transaction.body,
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      await offlineDataManager.updateTransactionStatus(transaction.id!, 'synced', {
        syncedAt: Date.now(),
        serverResponse: result
      });

      console.log(`✅ HERA: Synced transaction ${transaction.id}`);

    } catch (error) {
      await offlineDataManager.updateTransactionStatus(transaction.id!, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        failedAt: Date.now()
      });
      throw error;
    }
  }

  /**
   * Sync queue item
   */
  private async syncQueueItem(item: SyncQueueItem): Promise<void> {
    await offlineDataManager.updateSyncItemStatus(item.id!, 'processing');

    try {
      let result;

      switch (item.operation) {
        case 'create':
          result = await this.createEntity(item);
          break;
        case 'update':
          result = await this.updateEntity(item);
          break;
        case 'delete':
          result = await this.deleteEntity(item);
          break;
        case 'read':
          result = await this.readEntity(item);
          break;
        default:
          throw new Error(`Unknown operation: ${item.operation}`);
      }

      await offlineDataManager.updateSyncItemStatus(item.id!, 'completed');
      console.log(`✅ HERA: Synced ${item.operation} ${item.entityType}:${item.entityId}`);

      return result;

    } catch (error) {
      await offlineDataManager.updateSyncItemStatus(item.id!, 'failed');
      throw error;
    }
  }

  /**
   * Create entity via Supabase
   */
  private async createEntity(item: SyncQueueItem): Promise<any> {
    const { data, error } = await supabase
      .from(item.entityType)
      .insert(item.data)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update entity via Supabase
   */
  private async updateEntity(item: SyncQueueItem): Promise<any> {
    // First, get current server data for conflict detection
    const { data: currentData, error: fetchError } = await supabase
      .from(item.entityType)
      .select('*')
      .eq('id', item.entityId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // Not found is ok
      throw fetchError;
    }

    // Check for conflicts
    if (currentData && this.hasConflict(item.data, currentData, item.metadata?.lastKnownVersion)) {
      throw new ConflictError('Data has been modified by another user', {
        clientData: item.data,
        serverData: currentData,
        entityType: item.entityType,
        entityId: item.entityId
      });
    }

    const { data, error } = await supabase
      .from(item.entityType)
      .update(item.data)
      .eq('id', item.entityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete entity via Supabase
   */
  private async deleteEntity(item: SyncQueueItem): Promise<any> {
    const { data, error } = await supabase
      .from(item.entityType)
      .delete()
      .eq('id', item.entityId)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is ok for delete
      throw error;
    }
    return data;
  }

  /**
   * Read entity via Supabase
   */
  private async readEntity(item: SyncQueueItem): Promise<any> {
    const { data, error } = await supabase
      .from(item.entityType)
      .select('*')
      .eq('id', item.entityId)
      .single();

    if (error) throw error;

    // Store updated data offline
    await offlineDataManager.storeData(
      `${item.entityType}:${item.entityId}`,
      data,
      item.entityType,
      60 // 1 hour TTL
    );

    return data;
  }

  /**
   * Handle transaction conflict
   */
  private async handleConflict(transaction: OfflineTransaction, error: any): Promise<void> {
    const conflictKey = `transaction-${transaction.id}`;
    
    const conflict: ConflictEntry = {
      key: conflictKey,
      entityType: transaction.entityType,
      entityId: transaction.entityId || 'unknown',
      clientData: transaction.body ? JSON.parse(transaction.body) : null,
      serverData: error.serverData || null,
      timestamp: Date.now(),
      strategy: 'manual',
      resolved: false
    };

    await offlineDataManager.storeConflict(conflict);
    await offlineDataManager.updateTransactionStatus(transaction.id!, 'conflict');
    
    this.emit('conflict-detected', conflict);
  }

  /**
   * Handle queue item conflict
   */
  private async handleQueueItemConflict(item: SyncQueueItem, error: any): Promise<void> {
    const conflictKey = `queue-${item.id}`;
    
    const conflict: ConflictEntry = {
      key: conflictKey,
      entityType: item.entityType,
      entityId: item.entityId,
      clientData: item.data,
      serverData: error.serverData || null,
      timestamp: Date.now(),
      strategy: 'manual',
      resolved: false
    };

    await offlineDataManager.storeConflict(conflict);
    await offlineDataManager.updateSyncItemStatus(item.id!, 'failed');
    
    this.emit('conflict-detected', conflict);
  }

  /**
   * Check if error is a conflict
   */
  private isConflictError(error: any): boolean {
    return error instanceof ConflictError || 
           (error.message && error.message.includes('conflict')) ||
           (error.code && error.code === 'CONFLICT');
  }

  /**
   * Check if data has conflict
   */
  private hasConflict(clientData: any, serverData: any, lastKnownVersion?: string): boolean {
    // Simple version-based conflict detection
    if (lastKnownVersion && serverData.version && serverData.version !== lastKnownVersion) {
      return true;
    }

    // Timestamp-based conflict detection
    const clientTimestamp = clientData.updated_at || clientData.modified_at;
    const serverTimestamp = serverData.updated_at || serverData.modified_at;
    
    if (clientTimestamp && serverTimestamp) {
      return new Date(serverTimestamp) > new Date(clientTimestamp);
    }

    return false;
  }

  /**
   * Resolve conflict with strategy
   */
  public async resolveConflict(conflictKey: string, strategy: 'client' | 'server' | 'merge', mergedData?: any): Promise<void> {
    const conflict = await offlineDataManager.getData(`conflict:${conflictKey}`);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    let resolution;

    switch (strategy) {
      case 'client':
        resolution = conflict.clientData;
        break;
      case 'server':
        resolution = conflict.serverData;
        break;
      case 'merge':
        resolution = mergedData || this.autoMerge(conflict.clientData, conflict.serverData);
        break;
    }

    // Apply resolution
    try {
      const { error } = await supabase
        .from(conflict.entityType)
        .update(resolution)
        .eq('id', conflict.entityId);

      if (error) throw error;

      await offlineDataManager.resolveConflict(conflictKey, resolution);
      console.log(`✅ HERA: Resolved conflict ${conflictKey} with ${strategy} strategy`);

    } catch (error) {
      console.error(`❌ HERA: Failed to resolve conflict ${conflictKey}:`, error);
      throw error;
    }
  }

  /**
   * Auto-merge conflicting data
   */
  private autoMerge(clientData: any, serverData: any): any {
    // Simple merge strategy - server wins for conflicts, client wins for new fields
    const merged = { ...serverData };
    
    for (const [key, value] of Object.entries(clientData)) {
      if (!(key in serverData)) {
        merged[key] = value;
      }
    }

    return merged;
  }

  /**
   * Get sync status
   */
  public getSyncStatus(): {
    isOnline: boolean;
    isSyncing: boolean;
    lastSync?: number;
  } {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSync: this.getLastSyncTime()
    };
  }

  /**
   * Get last sync time from storage
   */
  private getLastSyncTime(): number | undefined {
    const lastSync = localStorage.getItem('hera-last-sync');
    return lastSync ? parseInt(lastSync, 10) : undefined;
  }

  /**
   * Force immediate sync
   */
  public async forcSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    await this.syncAll({ forceSync: true });
  }

  /**
   * Get unresolved conflicts
   */
  public async getConflicts(): Promise<ConflictEntry[]> {
    return offlineDataManager.getUnresolvedConflicts();
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stopPeriodicSync();
    this.removeAllListeners();
  }
}

/**
 * Custom conflict error
 */
export class ConflictError extends Error {
  public serverData: any;
  public clientData: any;
  public entityType: string;
  public entityId: string;

  constructor(message: string, data: any) {
    super(message);
    this.name = 'ConflictError';
    this.serverData = data.serverData;
    this.clientData = data.clientData;
    this.entityType = data.entityType;
    this.entityId = data.entityId;
  }
}

// Singleton instance
export const syncManager = new SyncManager();