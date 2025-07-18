/**
 * HERA Universal ERP - Offline Sync Manager
 * Revolutionary offline-first architecture for mobile ERP operations
 * Enables complete business operations without internet connectivity
 */

import { EventEmitter } from 'events';

// ==================== OFFLINE SYNC INTERFACES ====================

export interface OfflineSyncConfig {
  maxStorageSize: number; // MB
  syncInterval: number; // milliseconds
  retryAttempts: number;
  conflictResolution: 'local_wins' | 'server_wins' | 'merge' | 'manual';
  enablePeriodicSync: boolean;
  enableBackgroundSync: boolean;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  batchSize: number;
}

export interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'process_document' | 'scan_barcode' | 'inventory_update';
  entity: string;
  data: any;
  metadata: OperationMetadata;
  dependencies: string[];
  status: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
  retryCount: number;
  timestamp: number;
  localId?: string;
  serverId?: string;
}

export interface OperationMetadata {
  userId: string;
  deviceId: string;
  appVersion: string;
  source: 'mobile_scan' | 'manual_entry' | 'api';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiresNetwork: boolean;
  canBeBatched: boolean;
  estimatedSize: number;
  checksum: string;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTimestamp: number;
  pendingOperations: number;
  failedOperations: number;
  storageUsed: number;
  storageAvailable: number;
  syncInProgress: boolean;
  nextScheduledSync: number;
}

export interface ConflictResolution {
  conflictId: string;
  operation: OfflineOperation;
  localData: any;
  serverData: any;
  resolution: 'local' | 'server' | 'merge' | 'manual';
  resolvedData?: any;
  timestamp: number;
  resolvedBy?: string;
}

export interface SyncResult {
  success: boolean;
  operationsSynced: number;
  operationsFailed: number;
  conflicts: ConflictResolution[];
  errors: SyncError[];
  duration: number;
  timestamp: number;
}

export interface SyncError {
  operationId: string;
  errorType: 'network' | 'server' | 'validation' | 'conflict' | 'storage';
  message: string;
  retryable: boolean;
  timestamp: number;
}

// ==================== OFFLINE SYNC MANAGER ====================

export class OfflineSyncManager extends EventEmitter {
  private config: OfflineSyncConfig;
  private operations: Map<string, OfflineOperation> = new Map();
  private syncInProgress = false;
  private syncTimer?: NodeJS.Timeout;
  private isOnline = navigator.onLine;
  private db: IDBDatabase | null = null;
  private storageQuotaUsed = 0;

  constructor(config: Partial<OfflineSyncConfig> = {}) {
    super();
    
    this.config = {
      maxStorageSize: 100, // 100MB
      syncInterval: 30000, // 30 seconds
      retryAttempts: 3,
      conflictResolution: 'merge',
      enablePeriodicSync: true,
      enableBackgroundSync: true,
      compressionEnabled: true,
      encryptionEnabled: true,
      batchSize: 50,
      ...config
    };

    this.initializeStorage();
    this.setupNetworkMonitoring();
    this.setupPeriodicSync();
    this.setupBackgroundSync();
  }

  // ==================== INITIALIZATION ====================

  private async initializeStorage(): Promise<void> {
    try {
      console.log('🗄️ HERA: Initializing offline storage...');
      
      const request = indexedDB.open('hera_offline_storage', 1);
      
      request.onerror = () => {
        console.error('❌ HERA: Failed to open IndexedDB');
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Operations store
        if (!db.objectStoreNames.contains('operations')) {
          const operationsStore = db.createObjectStore('operations', { keyPath: 'id' });
          operationsStore.createIndex('status', 'status', { unique: false });
          operationsStore.createIndex('timestamp', 'timestamp', { unique: false });
          operationsStore.createIndex('entity', 'entity', { unique: false });
          operationsStore.createIndex('type', 'type', { unique: false });
        }
        
        // Documents store for offline document processing
        if (!db.objectStoreNames.contains('documents')) {
          const documentsStore = db.createObjectStore('documents', { keyPath: 'id' });
          documentsStore.createIndex('status', 'status', { unique: false });
          documentsStore.createIndex('documentType', 'documentType', { unique: false });
        }
        
        // Products store for offline barcode scanning
        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { keyPath: 'id' });
          productsStore.createIndex('barcode', 'barcode', { unique: false });
          productsStore.createIndex('sku', 'sku', { unique: false });
        }
        
        // Vendors store for offline invoice processing
        if (!db.objectStoreNames.contains('vendors')) {
          const vendorsStore = db.createObjectStore('vendors', { keyPath: 'id' });
          vendorsStore.createIndex('vendorName', 'vendorName', { unique: false });
          vendorsStore.createIndex('taxId', 'taxId', { unique: false });
        }
        
        // Inventory store for offline inventory updates
        if (!db.objectStoreNames.contains('inventory')) {
          const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id' });
          inventoryStore.createIndex('productId', 'productId', { unique: false });
          inventoryStore.createIndex('location', 'location', { unique: false });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('✅ HERA: Offline storage initialized');
        this.loadPendingOperations();
        this.emit('storage-ready');
      };
      
    } catch (error) {
      console.error('❌ HERA: Storage initialization failed:', error);
      throw error;
    }
  }

  private setupNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      console.log('🌐 HERA: Network connection restored');
      this.isOnline = true;
      this.emit('network-online');
      this.triggerSync();
    });
    
    window.addEventListener('offline', () => {
      console.log('📱 HERA: Network disconnected - entering offline mode');
      this.isOnline = false;
      this.emit('network-offline');
    });
  }

  private setupPeriodicSync(): void {
    if (this.config.enablePeriodicSync) {
      this.syncTimer = setInterval(() => {
        if (this.isOnline && !this.syncInProgress) {
          this.triggerSync();
        }
      }, this.config.syncInterval);
    }
  }

  private setupBackgroundSync(): void {
    if (this.config.enableBackgroundSync && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if ('sync' in registration) {
          console.log('⚡ HERA: Background sync available');
          this.emit('background-sync-ready');
        }
      });
    }
  }

  // ==================== OFFLINE OPERATIONS ====================

  async addOperation(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'status' | 'retryCount'>): Promise<string> {
    try {
      const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const fullOperation: OfflineOperation = {
        ...operation,
        id: operationId,
        timestamp: Date.now(),
        status: 'pending',
        retryCount: 0
      };

      // Store in memory
      this.operations.set(operationId, fullOperation);
      
      // Store in IndexedDB
      await this.storeOperation(fullOperation);
      
      console.log('📝 HERA: Added offline operation:', operationId);
      this.emit('operation-added', fullOperation);
      
      // Try immediate sync if online
      if (this.isOnline && !this.syncInProgress) {
        this.triggerSync();
      }
      
      return operationId;
      
    } catch (error) {
      console.error('❌ HERA: Failed to add operation:', error);
      throw error;
    }
  }

  async processDocumentOffline(documentData: any, imageData: string): Promise<string> {
    try {
      console.log('📄 HERA: Processing document offline...');
      
      // Store document for offline processing
      const documentId = `doc_${Date.now()}`;
      const document = {
        id: documentId,
        documentType: documentData.documentType,
        extractedData: documentData,
        imageData,
        status: 'pending_sync',
        processedAt: Date.now(),
        requiresSync: true
      };
      
      // Store in IndexedDB
      await this.storeDocument(document);
      
      // Add sync operation
      await this.addOperation({
        type: 'process_document',
        entity: 'documents',
        data: document,
        metadata: {
          userId: 'current_user',
          deviceId: this.getDeviceId(),
          appVersion: '1.0.0',
          source: 'mobile_scan',
          priority: 'high',
          requiresNetwork: true,
          canBeBatched: false,
          estimatedSize: this.estimateSize(document),
          checksum: this.generateChecksum(document)
        },
        dependencies: []
      });
      
      console.log('✅ HERA: Document queued for offline processing');
      return documentId;
      
    } catch (error) {
      console.error('❌ HERA: Offline document processing failed:', error);
      throw error;
    }
  }

  async updateInventoryOffline(productId: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<string> {
    try {
      console.log('📦 HERA: Updating inventory offline...');
      
      // Get current inventory state
      const currentInventory = await this.getInventoryData(productId);
      
      // Calculate new quantity
      let newQuantity: number;
      switch (operation) {
        case 'add':
          newQuantity = (currentInventory?.quantity || 0) + quantity;
          break;
        case 'subtract':
          newQuantity = Math.max(0, (currentInventory?.quantity || 0) - quantity);
          break;
        case 'set':
          newQuantity = quantity;
          break;
      }
      
      const inventoryUpdate = {
        id: `inv_${Date.now()}`,
        productId,
        quantity: newQuantity,
        operation,
        operationQuantity: quantity,
        timestamp: Date.now(),
        status: 'pending_sync'
      };
      
      // Store local update
      await this.storeInventoryUpdate(inventoryUpdate);
      
      // Add sync operation
      await this.addOperation({
        type: 'inventory_update',
        entity: 'inventory',
        data: inventoryUpdate,
        metadata: {
          userId: 'current_user',
          deviceId: this.getDeviceId(),
          appVersion: '1.0.0',
          source: 'mobile_scan',
          priority: 'high',
          requiresNetwork: true,
          canBeBatched: true,
          estimatedSize: this.estimateSize(inventoryUpdate),
          checksum: this.generateChecksum(inventoryUpdate)
        },
        dependencies: []
      });
      
      console.log('✅ HERA: Inventory update queued for sync');
      return inventoryUpdate.id;
      
    } catch (error) {
      console.error('❌ HERA: Offline inventory update failed:', error);
      throw error;
    }
  }

  async scanBarcodeOffline(barcode: string): Promise<any> {
    try {
      console.log('🏷️ HERA: Looking up barcode offline...');
      
      // Check local product database
      const product = await this.getProductByBarcode(barcode);
      
      if (product) {
        console.log('✅ HERA: Product found in offline cache');
        return {
          success: true,
          product,
          source: 'offline_cache',
          timestamp: Date.now()
        };
      } else {
        console.log('📡 HERA: Product not in cache, queuing for sync');
        
        // Queue for online lookup when connection available
        await this.addOperation({
          type: 'scan_barcode',
          entity: 'products',
          data: { barcode },
          metadata: {
            userId: 'current_user',
            deviceId: this.getDeviceId(),
            appVersion: '1.0.0',
            source: 'mobile_scan',
            priority: 'medium',
            requiresNetwork: true,
            canBeBatched: true,
            estimatedSize: this.estimateSize({ barcode }),
            checksum: this.generateChecksum({ barcode })
          },
          dependencies: []
        });
        
        return {
          success: false,
          message: 'Product not in offline cache - queued for online lookup',
          requiresSync: true
        };
      }
      
    } catch (error) {
      console.error('❌ HERA: Offline barcode scan failed:', error);
      throw error;
    }
  }

  // ==================== SYNC OPERATIONS ====================

  async triggerSync(): Promise<SyncResult> {
    if (this.syncInProgress) {
      console.log('⏳ HERA: Sync already in progress');
      return this.getCurrentSyncResult();
    }
    
    if (!this.isOnline) {
      console.log('📱 HERA: Cannot sync - device offline');
      throw new Error('Device is offline');
    }
    
    console.log('🔄 HERA: Starting sync process...');
    this.syncInProgress = true;
    this.emit('sync-started');
    
    const startTime = Date.now();
    let operationsSynced = 0;
    let operationsFailed = 0;
    const conflicts: ConflictResolution[] = [];
    const errors: SyncError[] = [];
    
    try {
      // Get all pending operations
      const pendingOps = Array.from(this.operations.values())
        .filter(op => op.status === 'pending' || op.status === 'failed')
        .sort((a, b) => a.timestamp - b.timestamp);
      
      console.log(`📊 HERA: Found ${pendingOps.length} operations to sync`);
      
      // Process operations in batches
      const batches = this.createBatches(pendingOps);
      
      for (const batch of batches) {
        try {
          const batchResult = await this.syncBatch(batch);
          operationsSynced += batchResult.success;
          operationsFailed += batchResult.failed;
          conflicts.push(...batchResult.conflicts);
          errors.push(...batchResult.errors);
          
        } catch (error) {
          console.error('❌ HERA: Batch sync failed:', error);
          operationsFailed += batch.length;
          errors.push({
            operationId: 'batch_error',
            errorType: 'server',
            message: error instanceof Error ? error.message : 'Batch sync failed',
            retryable: true,
            timestamp: Date.now()
          });
        }
      }
      
      // Update storage quota
      await this.updateStorageQuota();
      
      const result: SyncResult = {
        success: operationsFailed === 0,
        operationsSynced,
        operationsFailed,
        conflicts,
        errors,
        duration: Date.now() - startTime,
        timestamp: Date.now()
      };
      
      console.log('✅ HERA: Sync completed:', result);
      this.emit('sync-completed', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ HERA: Sync process failed:', error);
      this.emit('sync-failed', error);
      throw error;
      
    } finally {
      this.syncInProgress = false;
    }
  }

  private createBatches(operations: OfflineOperation[]): OfflineOperation[][] {
    const batches: OfflineOperation[][] = [];
    let currentBatch: OfflineOperation[] = [];
    
    for (const operation of operations) {
      if (operation.metadata.canBeBatched && currentBatch.length < this.config.batchSize) {
        currentBatch.push(operation);
      } else {
        if (currentBatch.length > 0) {
          batches.push(currentBatch);
          currentBatch = [];
        }
        batches.push([operation]); // Non-batchable or batch full
      }
    }
    
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }
    
    return batches;
  }

  private async syncBatch(batch: OfflineOperation[]): Promise<{
    success: number;
    failed: number;
    conflicts: ConflictResolution[];
    errors: SyncError[];
  }> {
    console.log(`📦 HERA: Syncing batch of ${batch.length} operations`);
    
    let success = 0;
    let failed = 0;
    const conflicts: ConflictResolution[] = [];
    const errors: SyncError[] = [];
    
    for (const operation of batch) {
      try {
        // Mark as syncing
        operation.status = 'syncing';
        await this.updateOperation(operation);
        
        // Perform sync operation
        const syncResult = await this.syncSingleOperation(operation);
        
        if (syncResult.success) {
          operation.status = 'synced';
          operation.serverId = syncResult.serverId;
          success++;
        } else if (syncResult.conflict) {
          operation.status = 'conflict';
          conflicts.push(syncResult.conflict);
        } else {
          operation.status = 'failed';
          operation.retryCount++;
          failed++;
          errors.push({
            operationId: operation.id,
            errorType: syncResult.errorType || 'server',
            message: syncResult.error || 'Unknown sync error',
            retryable: operation.retryCount < this.config.retryAttempts,
            timestamp: Date.now()
          });
        }
        
        await this.updateOperation(operation);
        
      } catch (error) {
        console.error('❌ HERA: Operation sync failed:', operation.id, error);
        operation.status = 'failed';
        operation.retryCount++;
        failed++;
        
        errors.push({
          operationId: operation.id,
          errorType: 'server',
          message: error instanceof Error ? error.message : 'Sync failed',
          retryable: operation.retryCount < this.config.retryAttempts,
          timestamp: Date.now()
        });
        
        await this.updateOperation(operation);
      }
    }
    
    return { success, failed, conflicts, errors };
  }

  private async syncSingleOperation(operation: OfflineOperation): Promise<{
    success: boolean;
    serverId?: string;
    conflict?: ConflictResolution;
    error?: string;
    errorType?: string;
  }> {
    // This would integrate with the actual backend API
    // For now, simulate successful sync
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
    
    // Simulate 90% success rate
    if (Math.random() > 0.1) {
      return {
        success: true,
        serverId: `server_${operation.id}`
      };
    } else {
      return {
        success: false,
        error: 'Simulated sync failure',
        errorType: 'server'
      };
    }
  }

  // ==================== STORAGE OPERATIONS ====================

  private async storeOperation(operation: OfflineOperation): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['operations'], 'readwrite');
    const store = transaction.objectStore('operations');
    
    return new Promise((resolve, reject) => {
      const request = store.put(operation);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async updateOperation(operation: OfflineOperation): Promise<void> {
    this.operations.set(operation.id, operation);
    await this.storeOperation(operation);
  }

  private async storeDocument(document: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['documents'], 'readwrite');
    const store = transaction.objectStore('documents');
    
    return new Promise((resolve, reject) => {
      const request = store.put(document);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async storeInventoryUpdate(update: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['inventory'], 'readwrite');
    const store = transaction.objectStore('inventory');
    
    return new Promise((resolve, reject) => {
      const request = store.put(update);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getProductByBarcode(barcode: string): Promise<any> {
    if (!this.db) return null;
    
    const transaction = this.db.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');
    const index = store.index('barcode');
    
    return new Promise((resolve, reject) => {
      const request = index.get(barcode);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getInventoryData(productId: string): Promise<any> {
    if (!this.db) return null;
    
    const transaction = this.db.transaction(['inventory'], 'readonly');
    const store = transaction.objectStore('inventory');
    const index = store.index('productId');
    
    return new Promise((resolve, reject) => {
      const request = index.get(productId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async loadPendingOperations(): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['operations'], 'readonly');
    const store = transaction.objectStore('operations');
    const index = store.index('status');
    
    const pendingRequest = index.getAll('pending');
    const failedRequest = index.getAll('failed');
    
    pendingRequest.onsuccess = () => {
      pendingRequest.result.forEach(op => this.operations.set(op.id, op));
    };
    
    failedRequest.onsuccess = () => {
      failedRequest.result.forEach(op => this.operations.set(op.id, op));
    };
  }

  // ==================== STATUS & UTILITIES ====================

  getStatus(): SyncStatus {
    const pendingOps = Array.from(this.operations.values()).filter(op => op.status === 'pending');
    const failedOps = Array.from(this.operations.values()).filter(op => op.status === 'failed');
    
    return {
      isOnline: this.isOnline,
      lastSyncTimestamp: this.getLastSyncTimestamp(),
      pendingOperations: pendingOps.length,
      failedOperations: failedOps.length,
      storageUsed: this.storageQuotaUsed,
      storageAvailable: this.config.maxStorageSize - this.storageQuotaUsed,
      syncInProgress: this.syncInProgress,
      nextScheduledSync: this.getNextScheduledSync()
    };
  }

  private getCurrentSyncResult(): SyncResult {
    return {
      success: false,
      operationsSynced: 0,
      operationsFailed: 0,
      conflicts: [],
      errors: [],
      duration: 0,
      timestamp: Date.now()
    };
  }

  private getLastSyncTimestamp(): number {
    const syncedOps = Array.from(this.operations.values()).filter(op => op.status === 'synced');
    return syncedOps.length > 0 ? Math.max(...syncedOps.map(op => op.timestamp)) : 0;
  }

  private getNextScheduledSync(): number {
    return Date.now() + this.config.syncInterval;
  }

  private async updateStorageQuota(): Promise<void> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      this.storageQuotaUsed = ((estimate.usage || 0) / 1024 / 1024); // Convert to MB
    }
  }

  private getDeviceId(): string {
    let deviceId = localStorage.getItem('hera_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('hera_device_id', deviceId);
    }
    return deviceId;
  }

  private estimateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private generateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  // ==================== CLEANUP ====================

  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    if (this.db) {
      this.db.close();
    }
    
    this.removeAllListeners();
  }
}

// ==================== FACTORY FUNCTION ====================

export function createOfflineSyncManager(config?: Partial<OfflineSyncConfig>): OfflineSyncManager {
  return new OfflineSyncManager(config);
}

// ==================== SINGLETON INSTANCE ====================

export const offlineSyncManager = createOfflineSyncManager();