/**
 * HERA Universal ERP - Offline Data Manager
 * Advanced offline-first data management with IndexedDB
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database Schema Definition
interface HeraOfflineDB extends DBSchema {
  offlineTransactions: {
    key: number;
    value: OfflineTransaction;
    indexes: { 
      'by-timestamp': number;
      'by-type': string;
      'by-status': OfflineTransactionStatus;
    };
  };
  offlineData: {
    key: string;
    value: OfflineDataEntry;
    indexes: { 
      'by-timestamp': number;
      'by-type': string;
      'by-ttl': number;
    };
  };
  syncQueue: {
    key: number;
    value: SyncQueueItem;
    indexes: { 
      'by-priority': number;
      'by-timestamp': number;
      'by-status': SyncStatus;
    };
  };
  conflictResolution: {
    key: string;
    value: ConflictEntry;
    indexes: { 
      'by-timestamp': number;
      'by-entity': string;
    };
  };
}

// Type Definitions
export type OfflineTransactionStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
export type SyncStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ConflictResolutionStrategy = 'client-wins' | 'server-wins' | 'merge' | 'manual';

export interface OfflineTransaction {
  id?: number;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers: Record<string, string>;
  body?: string;
  entityType: string;
  entityId?: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: OfflineTransactionStatus;
  clientId: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface OfflineDataEntry {
  key: string;
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  type: string;
  version: number;
  checksum: string;
  metadata?: Record<string, any>;
}

export interface SyncQueueItem {
  id?: number;
  operation: 'create' | 'update' | 'delete' | 'read';
  entityType: string;
  entityId: string;
  data: any;
  priority: number; // 1 = highest, 10 = lowest
  timestamp: number;
  status: SyncStatus;
  retryCount: number;
  maxRetries: number;
  dependencies?: string[]; // Other queue item IDs this depends on
  metadata?: Record<string, any>;
}

export interface ConflictEntry {
  key: string;
  entityType: string;
  entityId: string;
  clientData: any;
  serverData: any;
  timestamp: number;
  strategy: ConflictResolutionStrategy;
  resolved: boolean;
  resolution?: any;
  metadata?: Record<string, any>;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: number;
  errors: string[];
}

export class OfflineDataManager {
  private db: IDBPDatabase<HeraOfflineDB> | null = null;
  private readonly dbName = 'hera-offline-db';
  private readonly dbVersion = 1;
  private readonly clientId: string;
  private isInitialized = false;

  constructor() {
    this.clientId = this.generateClientId();
  }

  /**
   * Initialize the offline database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await openDB<HeraOfflineDB>(this.dbName, this.dbVersion, {
        upgrade(db, oldVersion, newVersion, transaction) {
          console.log(`🗄️ HERA: Upgrading database from ${oldVersion} to ${newVersion}`);

          // Offline Transactions Store
          if (!db.objectStoreNames.contains('offlineTransactions')) {
            const transactionStore = db.createObjectStore('offlineTransactions', {
              keyPath: 'id',
              autoIncrement: true
            });
            transactionStore.createIndex('by-timestamp', 'timestamp');
            transactionStore.createIndex('by-type', 'entityType');
            transactionStore.createIndex('by-status', 'status');
          }

          // Offline Data Store
          if (!db.objectStoreNames.contains('offlineData')) {
            const dataStore = db.createObjectStore('offlineData', {
              keyPath: 'key'
            });
            dataStore.createIndex('by-timestamp', 'timestamp');
            dataStore.createIndex('by-type', 'type');
            dataStore.createIndex('by-ttl', 'ttl');
          }

          // Sync Queue Store
          if (!db.objectStoreNames.contains('syncQueue')) {
            const queueStore = db.createObjectStore('syncQueue', {
              keyPath: 'id',
              autoIncrement: true
            });
            queueStore.createIndex('by-priority', 'priority');
            queueStore.createIndex('by-timestamp', 'timestamp');
            queueStore.createIndex('by-status', 'status');
          }

          // Conflict Resolution Store
          if (!db.objectStoreNames.contains('conflictResolution')) {
            const conflictStore = db.createObjectStore('conflictResolution', {
              keyPath: 'key'
            });
            conflictStore.createIndex('by-timestamp', 'timestamp');
            conflictStore.createIndex('by-entity', 'entityType');
          }
        }
      });

      this.isInitialized = true;
      console.log('✅ HERA: Offline Data Manager initialized');

      // Clean up expired data
      await this.cleanupExpiredData();
    } catch (error) {
      console.error('❌ HERA: Failed to initialize offline database:', error);
      throw error;
    }
  }

  /**
   * Store data offline with TTL
   */
  async storeData(key: string, data: any, type: string, ttlMinutes = 60): Promise<void> {
    await this.ensureInitialized();

    const entry: OfflineDataEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl: Date.now() + (ttlMinutes * 60 * 1000),
      type,
      version: 1,
      checksum: this.generateChecksum(data)
    };

    await this.db!.put('offlineData', entry);
    console.log(`💾 HERA: Stored offline data: ${key}`);
  }

  /**
   * Retrieve data from offline storage
   */
  async getData(key: string): Promise<any | null> {
    await this.ensureInitialized();

    const entry = await this.db!.get('offlineData', key);
    
    if (!entry) return null;

    // Check if data has expired
    if (Date.now() > entry.ttl) {
      await this.db!.delete('offlineData', key);
      return null;
    }

    return entry.data;
  }

  /**
   * Store offline transaction for later sync
   */
  async storeOfflineTransaction(transaction: Omit<OfflineTransaction, 'id' | 'clientId' | 'timestamp' | 'retryCount' | 'status'>): Promise<number> {
    await this.ensureInitialized();

    const offlineTransaction: OfflineTransaction = {
      ...transaction,
      clientId: this.clientId,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    const id = await this.db!.add('offlineTransactions', offlineTransaction);
    console.log(`📝 HERA: Stored offline transaction: ${id}`);
    return id as number;
  }

  /**
   * Get all pending offline transactions
   */
  async getPendingTransactions(): Promise<OfflineTransaction[]> {
    await this.ensureInitialized();
    
    const transactions = await this.db!.getAllFromIndex('offlineTransactions', 'by-status', 'pending');
    return transactions.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(id: number, status: OfflineTransactionStatus, metadata?: Record<string, any>): Promise<void> {
    await this.ensureInitialized();

    const transaction = await this.db!.get('offlineTransactions', id);
    if (!transaction) return;

    transaction.status = status;
    if (metadata) {
      transaction.metadata = { ...transaction.metadata, ...metadata };
    }

    await this.db!.put('offlineTransactions', transaction);
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'status' | 'retryCount'>): Promise<number> {
    await this.ensureInitialized();

    const queueItem: SyncQueueItem = {
      ...item,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0
    };

    const id = await this.db!.add('syncQueue', queueItem);
    console.log(`🔄 HERA: Added to sync queue: ${id}`);
    return id as number;
  }

  /**
   * Get next items from sync queue
   */
  async getNextSyncItems(limit = 10): Promise<SyncQueueItem[]> {
    await this.ensureInitialized();

    const items = await this.db!.getAllFromIndex('syncQueue', 'by-status', 'pending');
    
    // Sort by priority (lower number = higher priority) then by timestamp
    items.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.timestamp - b.timestamp;
    });

    return items.slice(0, limit);
  }

  /**
   * Update sync queue item status
   */
  async updateSyncItemStatus(id: number, status: SyncStatus): Promise<void> {
    await this.ensureInitialized();

    const item = await this.db!.get('syncQueue', id);
    if (!item) return;

    item.status = status;
    await this.db!.put('syncQueue', item);
  }

  /**
   * Store conflict for resolution
   */
  async storeConflict(conflict: ConflictEntry): Promise<void> {
    await this.ensureInitialized();

    await this.db!.put('conflictResolution', conflict);
    console.log(`⚠️ HERA: Stored conflict: ${conflict.key}`);
  }

  /**
   * Get all unresolved conflicts
   */
  async getUnresolvedConflicts(): Promise<ConflictEntry[]> {
    await this.ensureInitialized();

    const conflicts = await this.db!.getAll('conflictResolution');
    return conflicts.filter(c => !c.resolved);
  }

  /**
   * Resolve conflict
   */
  async resolveConflict(key: string, resolution: any): Promise<void> {
    await this.ensureInitialized();

    const conflict = await this.db!.get('conflictResolution', key);
    if (!conflict) return;

    conflict.resolved = true;
    conflict.resolution = resolution;
    await this.db!.put('conflictResolution', conflict);
    
    console.log(`✅ HERA: Resolved conflict: ${key}`);
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    transactions: number;
    data: number;
    queue: number;
    conflicts: number;
    totalSize: number;
  }> {
    await this.ensureInitialized();

    const [transactions, data, queue, conflicts] = await Promise.all([
      this.db!.count('offlineTransactions'),
      this.db!.count('offlineData'),
      this.db!.count('syncQueue'),
      this.db!.count('conflictResolution')
    ]);

    // Estimate total size (rough calculation)
    const totalSize = await this.estimateStorageSize();

    return {
      transactions,
      data,
      queue,
      conflicts,
      totalSize
    };
  }

  /**
   * Clean up expired data
   */
  async cleanupExpiredData(): Promise<void> {
    await this.ensureInitialized();

    const now = Date.now();
    
    // Clean expired data entries
    const expiredData = await this.db!.getAllFromIndex('offlineData', 'by-ttl', IDBKeyRange.upperBound(now));
    for (const entry of expiredData) {
      await this.db!.delete('offlineData', entry.key);
    }

    // Clean old completed sync items
    const oldSyncItems = await this.db!.getAll('syncQueue');
    const cutoff = now - (7 * 24 * 60 * 60 * 1000); // 7 days
    
    for (const item of oldSyncItems) {
      if (item.status === 'completed' && item.timestamp < cutoff) {
        await this.db!.delete('syncQueue', item.id!);
      }
    }

    // Clean old resolved conflicts
    const oldConflicts = await this.db!.getAll('conflictResolution');
    for (const conflict of oldConflicts) {
      if (conflict.resolved && conflict.timestamp < cutoff) {
        await this.db!.delete('conflictResolution', conflict.key);
      }
    }

    console.log('🧹 HERA: Cleaned up expired offline data');
  }

  /**
   * Clear all offline data
   */
  async clearAllData(): Promise<void> {
    await this.ensureInitialized();

    await Promise.all([
      this.db!.clear('offlineTransactions'),
      this.db!.clear('offlineData'),
      this.db!.clear('syncQueue'),
      this.db!.clear('conflictResolution')
    ]);

    console.log('🗑️ HERA: Cleared all offline data');
  }

  /**
   * Export offline data for debugging
   */
  async exportData(): Promise<{
    transactions: OfflineTransaction[];
    data: OfflineDataEntry[];
    queue: SyncQueueItem[];
    conflicts: ConflictEntry[];
  }> {
    await this.ensureInitialized();

    const [transactions, data, queue, conflicts] = await Promise.all([
      this.db!.getAll('offlineTransactions'),
      this.db!.getAll('offlineData'),
      this.db!.getAll('syncQueue'),
      this.db!.getAll('conflictResolution')
    ]);

    return { transactions, data, queue, conflicts };
  }

  // Private helper methods

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private generateClientId(): string {
    return `hera-client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChecksum(data: any): string {
    // Simple checksum implementation
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private async estimateStorageSize(): Promise<number> {
    if (!navigator.storage || !navigator.storage.estimate) {
      return 0;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    } catch (error) {
      console.warn('Could not estimate storage size:', error);
      return 0;
    }
  }
}

// Singleton instance
export const offlineDataManager = new OfflineDataManager();