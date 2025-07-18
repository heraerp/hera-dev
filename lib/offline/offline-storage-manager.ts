/**
 * HERA Universal ERP - Offline Storage Manager
 * Advanced local data persistence and intelligent caching
 * Enables complete offline business operations
 */

import { EventEmitter } from 'events';

// ==================== STORAGE INTERFACES ====================

export interface StorageConfig {
  maxCacheSize: number; // MB
  cacheExpiry: number; // milliseconds
  compressionLevel: 'none' | 'low' | 'medium' | 'high';
  encryptionEnabled: boolean;
  enableSmartCaching: boolean;
  preloadCriticalData: boolean;
  cleanupInterval: number; // milliseconds
}

export interface CacheEntry<T = any> {
  id: string;
  data: T;
  metadata: CacheMetadata;
  version: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
  lastModified: number;
  expiresAt: number;
  tags: string[];
  dependencies: string[];
}

export interface CacheMetadata {
  entityType: string;
  source: 'api' | 'user_input' | 'processed' | 'generated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isStale: boolean;
  canEvict: boolean;
  syncRequired: boolean;
  compressionRatio?: number;
  checksum: string;
}

export interface StorageStats {
  totalSize: number;
  usedSize: number;
  availableSize: number;
  entryCount: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  lastCleanup: number;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  includeExpired?: boolean;
  tags?: string[];
}

// ==================== OFFLINE STORAGE MANAGER ====================

export class OfflineStorageManager extends EventEmitter {
  private config: StorageConfig;
  private db: IDBDatabase | null = null;
  private cache: Map<string, CacheEntry> = new Map();
  private stats: StorageStats;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<StorageConfig> = {}) {
    super();
    
    this.config = {
      maxCacheSize: 50, // 50MB
      cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
      compressionLevel: 'medium',
      encryptionEnabled: false,
      enableSmartCaching: true,
      preloadCriticalData: true,
      cleanupInterval: 60 * 60 * 1000, // 1 hour
      ...config
    };

    this.stats = {
      totalSize: 0,
      usedSize: 0,
      availableSize: this.config.maxCacheSize * 1024 * 1024,
      entryCount: 0,
      hitRate: 0,
      missRate: 0,
      evictionCount: 0,
      lastCleanup: Date.now()
    };

    this.initialize();
  }

  // ==================== INITIALIZATION ====================

  private async initialize(): Promise<void> {
    try {
      console.log('🗄️ HERA: Initializing offline storage manager...');
      
      await this.initializeDatabase();
      await this.loadCacheFromStorage();
      this.setupPeriodicCleanup();
      
      if (this.config.preloadCriticalData) {
        await this.preloadCriticalData();
      }
      
      console.log('✅ HERA: Offline storage manager ready');
      this.emit('storage-ready');
      
    } catch (error) {
      console.error('❌ HERA: Storage initialization failed:', error);
      throw error;
    }
  }

  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('hera_offline_cache', 2);
      
      request.onerror = () => reject(request.error);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Main cache store
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'id' });
          cacheStore.createIndex('entityType', 'metadata.entityType', { unique: false });
          cacheStore.createIndex('priority', 'metadata.priority', { unique: false });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
          cacheStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
          cacheStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }
        
        // Products cache for offline barcode scanning
        if (!db.objectStoreNames.contains('products_cache')) {
          const productsStore = db.createObjectStore('products_cache', { keyPath: 'id' });
          productsStore.createIndex('barcode', 'barcode', { unique: false });
          productsStore.createIndex('sku', 'sku', { unique: false });
          productsStore.createIndex('category', 'category', { unique: false });
          productsStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }
        
        // Vendors cache for offline invoice processing
        if (!db.objectStoreNames.contains('vendors_cache')) {
          const vendorsStore = db.createObjectStore('vendors_cache', { keyPath: 'id' });
          vendorsStore.createIndex('vendorName', 'vendorName', { unique: false });
          vendorsStore.createIndex('taxId', 'taxId', { unique: false });
          vendorsStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }
        
        // Document templates cache
        if (!db.objectStoreNames.contains('templates_cache')) {
          const templatesStore = db.createObjectStore('templates_cache', { keyPath: 'id' });
          templatesStore.createIndex('documentType', 'documentType', { unique: false });
          templatesStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }
        
        // Settings cache for offline configuration
        if (!db.objectStoreNames.contains('settings_cache')) {
          const settingsStore = db.createObjectStore('settings_cache', { keyPath: 'key' });
          settingsStore.createIndex('category', 'category', { unique: false });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
    });
  }

  private async loadCacheFromStorage(): Promise<void> {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      
      const request = store.getAll();
      request.onsuccess = () => {
        const entries = request.result as CacheEntry[];
        
        // Load non-expired entries into memory cache
        const now = Date.now();
        entries.forEach(entry => {
          if (entry.expiresAt > now) {
            this.cache.set(entry.id, entry);
          }
        });
        
        this.updateStats();
        console.log(`📊 HERA: Loaded ${this.cache.size} cache entries`);
      };
      
    } catch (error) {
      console.error('❌ HERA: Failed to load cache from storage:', error);
    }
  }

  private setupPeriodicCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval);
  }

  // ==================== CORE STORAGE OPERATIONS ====================

  async set<T>(id: string, data: T, options: Partial<CacheEntry> = {}): Promise<void> {
    try {
      const size = this.estimateSize(data);
      const now = Date.now();
      
      // Check storage quota
      if (this.stats.usedSize + size > this.stats.availableSize) {
        await this.evictLeastUsed(size);
      }
      
      const entry: CacheEntry<T> = {
        id,
        data,
        metadata: {
          entityType: options.metadata?.entityType || 'unknown',
          source: options.metadata?.source || 'user_input',
          priority: options.metadata?.priority || 'medium',
          isStale: false,
          canEvict: options.metadata?.canEvict !== false,
          syncRequired: options.metadata?.syncRequired || false,
          checksum: this.generateChecksum(data)
        },
        version: options.version || 1,
        size,
        accessCount: 0,
        lastAccessed: now,
        lastModified: now,
        expiresAt: now + this.config.cacheExpiry,
        tags: options.tags || [],
        dependencies: options.dependencies || [],
        ...options
      };
      
      // Store in memory cache
      this.cache.set(id, entry);
      
      // Store in IndexedDB
      await this.persistEntry(entry);
      
      this.updateStats();
      this.emit('entry-stored', { id, size });
      
      console.log(`💾 HERA: Stored cache entry: ${id} (${this.formatSize(size)})`);
      
    } catch (error) {
      console.error('❌ HERA: Failed to store entry:', id, error);
      throw error;
    }
  }

  async get<T>(id: string): Promise<T | null> {
    try {
      let entry = this.cache.get(id);
      
      // If not in memory, try loading from IndexedDB
      if (!entry) {
        entry = await this.loadEntry(id);
        if (entry) {
          this.cache.set(id, entry);
        }
      }
      
      if (!entry) {
        this.stats.missRate++;
        return null;
      }
      
      // Check expiration
      if (entry.expiresAt < Date.now()) {
        await this.remove(id);
        this.stats.missRate++;
        return null;
      }
      
      // Update access statistics
      entry.lastAccessed = Date.now();
      entry.accessCount++;
      this.stats.hitRate++;
      
      console.log(`📖 HERA: Retrieved cache entry: ${id}`);
      return entry.data as T;
      
    } catch (error) {
      console.error('❌ HERA: Failed to retrieve entry:', id, error);
      this.stats.missRate++;
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const entry = this.cache.get(id);
      
      // Remove from memory cache
      const removed = this.cache.delete(id);
      
      // Remove from IndexedDB
      if (this.db) {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        store.delete(id);
      }
      
      if (entry) {
        this.stats.usedSize -= entry.size;
        this.stats.entryCount--;
      }
      
      this.emit('entry-removed', { id });
      console.log(`🗑️ HERA: Removed cache entry: ${id}`);
      
      return removed;
      
    } catch (error) {
      console.error('❌ HERA: Failed to remove entry:', id, error);
      return false;
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        const regex = new RegExp(pattern);
        const entriesToRemove = Array.from(this.cache.keys()).filter(key => regex.test(key));
        
        for (const id of entriesToRemove) {
          await this.remove(id);
        }
        
        console.log(`🧹 HERA: Cleared ${entriesToRemove.length} entries matching pattern: ${pattern}`);
      } else {
        // Clear all
        this.cache.clear();
        
        if (this.db) {
          const transaction = this.db.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          store.clear();
        }
        
        this.stats.usedSize = 0;
        this.stats.entryCount = 0;
        
        console.log('🧹 HERA: Cleared all cache entries');
      }
      
      this.emit('cache-cleared', { pattern });
      
    } catch (error) {
      console.error('❌ HERA: Failed to clear cache:', error);
      throw error;
    }
  }

  async query<T>(options: QueryOptions = {}): Promise<CacheEntry<T>[]> {
    try {
      let entries = Array.from(this.cache.values());
      
      // Apply filters
      if (options.filters) {
        entries = entries.filter(entry => {
          return Object.entries(options.filters!).every(([key, value]) => {
            const entryValue = this.getNestedValue(entry, key);
            return entryValue === value;
          });
        });
      }
      
      // Filter by tags
      if (options.tags && options.tags.length > 0) {
        entries = entries.filter(entry => {
          return options.tags!.some(tag => entry.tags.includes(tag));
        });
      }
      
      // Filter expired entries unless specifically requested
      if (!options.includeExpired) {
        const now = Date.now();
        entries = entries.filter(entry => entry.expiresAt > now);
      }
      
      // Sort entries
      if (options.sortBy) {
        entries.sort((a, b) => {
          const aValue = this.getNestedValue(a, options.sortBy!);
          const bValue = this.getNestedValue(b, options.sortBy!);
          
          const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          return options.sortOrder === 'desc' ? -comparison : comparison;
        });
      }
      
      // Apply pagination
      if (options.offset) {
        entries = entries.slice(options.offset);
      }
      
      if (options.limit) {
        entries = entries.slice(0, options.limit);
      }
      
      return entries as CacheEntry<T>[];
      
    } catch (error) {
      console.error('❌ HERA: Cache query failed:', error);
      return [];
    }
  }

  // ==================== SPECIALIZED STORAGE METHODS ====================

  async storeProduct(product: any): Promise<void> {
    await this.set(`product_${product.id}`, product, {
      metadata: {
        entityType: 'product',
        source: 'api',
        priority: 'high',
        isStale: false,
        canEvict: true,
        syncRequired: false,
        checksum: this.generateChecksum(product)
      },
      tags: ['product', 'inventory', product.category],
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    });
    
    // Store in specialized products cache
    if (this.db) {
      const transaction = this.db.transaction(['products_cache'], 'readwrite');
      const store = transaction.objectStore('products_cache');
      store.put({
        ...product,
        lastUpdated: Date.now()
      });
    }
  }

  async getProduct(productId: string): Promise<any> {
    return await this.get(`product_${productId}`);
  }

  async getProductByBarcode(barcode: string): Promise<any> {
    if (!this.db) return null;
    
    try {
      const transaction = this.db.transaction(['products_cache'], 'readonly');
      const store = transaction.objectStore('products_cache');
      const index = store.index('barcode');
      
      return new Promise((resolve, reject) => {
        const request = index.get(barcode);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
    } catch (error) {
      console.error('❌ HERA: Failed to get product by barcode:', error);
      return null;
    }
  }

  async storeVendor(vendor: any): Promise<void> {
    await this.set(`vendor_${vendor.id}`, vendor, {
      metadata: {
        entityType: 'vendor',
        source: 'api',
        priority: 'medium',
        isStale: false,
        canEvict: true,
        syncRequired: false,
        checksum: this.generateChecksum(vendor)
      },
      tags: ['vendor', 'accounting'],
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    });
    
    // Store in specialized vendors cache
    if (this.db) {
      const transaction = this.db.transaction(['vendors_cache'], 'readwrite');
      const store = transaction.objectStore('vendors_cache');
      store.put({
        ...vendor,
        lastUpdated: Date.now()
      });
    }
  }

  async getVendor(vendorId: string): Promise<any> {
    return await this.get(`vendor_${vendorId}`);
  }

  async searchVendors(searchTerm: string): Promise<any[]> {
    if (!this.db) return [];
    
    try {
      const transaction = this.db.transaction(['vendors_cache'], 'readonly');
      const store = transaction.objectStore('vendors_cache');
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const vendors = request.result.filter(vendor => 
            vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (vendor.taxId && vendor.taxId.includes(searchTerm))
          );
          resolve(vendors);
        };
        request.onerror = () => reject(request.error);
      });
      
    } catch (error) {
      console.error('❌ HERA: Vendor search failed:', error);
      return [];
    }
  }

  async storeDocumentTemplate(template: any): Promise<void> {
    await this.set(`template_${template.id}`, template, {
      metadata: {
        entityType: 'template',
        source: 'api',
        priority: 'low',
        isStale: false,
        canEvict: true,
        syncRequired: false,
        checksum: this.generateChecksum(template)
      },
      tags: ['template', 'document', template.documentType],
      expiresAt: Date.now() + (90 * 24 * 60 * 60 * 1000) // 90 days
    });
  }

  async getDocumentTemplate(documentType: string): Promise<any> {
    const templates = await this.query({
      filters: { 'metadata.entityType': 'template' },
      tags: [documentType]
    });
    
    return templates.length > 0 ? templates[0].data : null;
  }

  async storeSetting(key: string, value: any, category = 'general'): Promise<void> {
    if (this.db) {
      const transaction = this.db.transaction(['settings_cache'], 'readwrite');
      const store = transaction.objectStore('settings_cache');
      store.put({
        key,
        value,
        category,
        lastUpdated: Date.now()
      });
    }
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) return null;
    
    try {
      const transaction = this.db.transaction(['settings_cache'], 'readonly');
      const store = transaction.objectStore('settings_cache');
      
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.value);
        request.onerror = () => reject(request.error);
      });
      
    } catch (error) {
      console.error('❌ HERA: Failed to get setting:', error);
      return null;
    }
  }

  // ==================== CACHE MANAGEMENT ====================

  private async evictLeastUsed(requiredSpace: number): Promise<void> {
    console.log(`🗑️ HERA: Evicting cache entries to free ${this.formatSize(requiredSpace)}`);
    
    // Get evictable entries sorted by access frequency and recency
    const evictableEntries = Array.from(this.cache.values())
      .filter(entry => entry.metadata.canEvict)
      .sort((a, b) => {
        const aScore = a.accessCount / (Date.now() - a.lastAccessed);
        const bScore = b.accessCount / (Date.now() - b.lastAccessed);
        return aScore - bScore; // Least used first
      });
    
    let freedSpace = 0;
    let evicted = 0;
    
    for (const entry of evictableEntries) {
      if (freedSpace >= requiredSpace) break;
      
      await this.remove(entry.id);
      freedSpace += entry.size;
      evicted++;
    }
    
    this.stats.evictionCount += evicted;
    console.log(`✅ HERA: Evicted ${evicted} entries, freed ${this.formatSize(freedSpace)}`);
  }

  private async performCleanup(): Promise<void> {
    console.log('🧹 HERA: Performing cache cleanup...');
    
    const now = Date.now();
    const expiredEntries: string[] = [];
    
    // Find expired entries
    for (const [id, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        expiredEntries.push(id);
      }
    }
    
    // Remove expired entries
    for (const id of expiredEntries) {
      await this.remove(id);
    }
    
    this.stats.lastCleanup = now;
    
    if (expiredEntries.length > 0) {
      console.log(`🗑️ HERA: Cleaned up ${expiredEntries.length} expired entries`);
    }
    
    this.emit('cleanup-completed', {
      expiredEntries: expiredEntries.length,
      timestamp: now
    });
  }

  private async preloadCriticalData(): Promise<void> {
    console.log('⚡ HERA: Preloading critical data for offline use...');
    
    try {
      // This would preload essential data from the API
      // For now, we'll simulate loading critical data
      
      const criticalData = [
        // Common product categories
        { id: 'cat_electronics', name: 'Electronics', type: 'category' },
        { id: 'cat_office', name: 'Office Supplies', type: 'category' },
        
        // Common expense categories
        { id: 'exp_travel', name: 'Travel', type: 'expense_category' },
        { id: 'exp_meals', name: 'Meals & Entertainment', type: 'expense_category' },
        
        // Common account codes
        { id: 'acc_6000', name: 'Expenses', code: '6000', type: 'account' },
        { id: 'acc_2000', name: 'Accounts Payable', code: '2000', type: 'account' }
      ];
      
      for (const item of criticalData) {
        await this.set(`critical_${item.id}`, item, {
          metadata: {
            entityType: item.type,
            source: 'api',
            priority: 'critical',
            isStale: false,
            canEvict: false,
            syncRequired: false,
            checksum: this.generateChecksum(item)
          },
          tags: ['critical', item.type],
          expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year
        });
      }
      
      console.log('✅ HERA: Critical data preloaded');
      
    } catch (error) {
      console.error('❌ HERA: Failed to preload critical data:', error);
    }
  }

  // ==================== UTILITY METHODS ====================

  private async persistEntry(entry: CacheEntry): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    return new Promise((resolve, reject) => {
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async loadEntry(id: string): Promise<CacheEntry | null> {
    if (!this.db) return null;
    
    const transaction = this.db.transaction(['cache'], 'readonly');
    const store = transaction.objectStore('cache');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private updateStats(): void {
    this.stats.entryCount = this.cache.size;
    this.stats.usedSize = Array.from(this.cache.values()).reduce((total, entry) => total + entry.size, 0);
    this.stats.availableSize = this.config.maxCacheSize * 1024 * 1024 - this.stats.usedSize;
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
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ==================== PUBLIC API ====================

  getStats(): StorageStats {
    return { ...this.stats };
  }

  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    const entriesToInvalidate = Array.from(this.cache.entries())
      .filter(([id]) => regex.test(id))
      .map(([, entry]) => entry);
    
    for (const entry of entriesToInvalidate) {
      entry.metadata.isStale = true;
      entry.metadata.syncRequired = true;
    }
    
    console.log(`🔄 HERA: Invalidated ${entriesToInvalidate.length} entries matching: ${pattern}`);
  }

  async refresh(id: string): Promise<void> {
    const entry = this.cache.get(id);
    if (entry) {
      entry.metadata.isStale = true;
      entry.metadata.syncRequired = true;
      console.log(`🔄 HERA: Marked entry for refresh: ${id}`);
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cache.clear();
    
    if (this.db) {
      this.db.close();
    }
    
    this.removeAllListeners();
  }
}

// ==================== FACTORY FUNCTION ====================

export function createOfflineStorageManager(config?: Partial<StorageConfig>): OfflineStorageManager {
  return new OfflineStorageManager(config);
}

// ==================== SINGLETON INSTANCE ====================

export const offlineStorageManager = createOfflineStorageManager();