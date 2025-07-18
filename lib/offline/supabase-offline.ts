// 🔧 AUTO-FIX NEEDED: Replace supabase.from() calls with UniversalCrudService
// Example: const result = await UniversalCrudService.listEntities(organizationId, 'entity_type')

/**
 * HERA Universal ERP - Supabase Offline Wrapper
 * Seamless offline/online data access with conflict resolution
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { offlineDataManager } from './offline-data-manager';
import { syncManager } from './sync-manager';

interface SupabaseOfflineConfig {
  supabaseUrl: string;
  supabaseKey: string;
  defaultTTL?: number;
  autoSync?: boolean;
  conflictStrategy?: 'client' | 'server' | 'manual';
}

export interface OfflineQueryOptions {
  useCache?: boolean;
  ttl?: number;
  forceRefresh?: boolean;
  conflictStrategy?: 'client' | 'server' | 'manual';
}

export interface OfflineResponse<T = any> {
  data: T | null;
  error: Error | null;
  fromCache: boolean;
  timestamp: number;
}

export class SupabaseOfflineClient {
  private supabase: SupabaseClient;
  private config: SupabaseOfflineConfig;
  private isOnline: boolean = navigator.onLine;

  constructor(config: SupabaseOfflineConfig) {
    this.config = {
      defaultTTL: 60, // 1 hour default
      autoSync: true,
      conflictStrategy: 'manual',
      ...config
    };

    this.supabase = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });

    this.initializeNetworkListeners();
    this.initializeOfflineManager();
  }

  /**
   * Initialize network status listeners
   */
  private initializeNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('🌐 HERA: Connection restored');
      this.isOnline = true;
      if (this.config.autoSync) {
        syncManager.forcSync().catch(console.error);
      }
    });

    window.addEventListener('offline', () => {
      console.log('📴 HERA: Connection lost - switching to offline mode');
      this.isOnline = false;
    });
  }

  /**
   * Initialize offline data manager
   */
  private async initializeOfflineManager(): Promise<void> {
    await offlineDataManager.initialize();
  }

  /**
   * Get current user (offline-capable)
   */
  async getUser(): Promise<OfflineResponse> {
    const cacheKey = 'auth:user';
    
    try {
      if (this.isOnline) {
        const { data, error } = await this.supabase.auth.getUser();
        
        if (!error && data.user) {
          // Cache user data
          await offlineDataManager.storeData(cacheKey, data.user, 'auth', this.config.defaultTTL);
          return {
            data: data.user,
            error: null,
            fromCache: false,
            timestamp: Date.now()
          };
        }
      }
      
      // Fallback to cached data
      const cachedUser = await offlineDataManager.getData(cacheKey);
      return {
        data: cachedUser,
        error: cachedUser ? null : new Error('No cached user data'),
        fromCache: true,
        timestamp: Date.now()
      };
    } catch (error) {
      const cachedUser = await offlineDataManager.getData(cacheKey);
      return {
        data: cachedUser,
        error: error as Error,
        fromCache: true,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Select data with offline support
   */
  from(table: string) {
    return new SupabaseOfflineQuery(this.supabase, table, this.isOnline, this.config);
  }

  /**
   * Insert data with offline queueing
   */
  async insert(table: string, data: any[], options: OfflineQueryOptions = {}): Promise<OfflineResponse> {
    const cacheKey = `${table}:insert:${Date.now()}`;
    
    try {
      if (this.isOnline) {
        const { data: result, error } = await this.supabase
          .from(table)
          .insert(data)
          .select();

        if (!error) {
          // Cache successful insert
          await offlineDataManager.storeData(cacheKey, result, table, options.ttl || this.config.defaultTTL);
          
          return {
            data: result,
            error: null,
            fromCache: false,
            timestamp: Date.now()
          };
        }
        
        throw error;
      } else {
        // Queue for offline sync
        const queueId = await offlineDataManager.addToSyncQueue({
          operation: 'create',
          entityType: table,
          entityId: `temp-${Date.now()}`,
          data: Array.isArray(data) ? data[0] : data,
          priority: 1,
          maxRetries: 3
        });

        console.log(`📝 HERA: Queued insert for ${table} (ID: ${queueId})`);
        
        return {
          data: { id: queueId, ...data },
          error: null,
          fromCache: false,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        fromCache: false,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Update data with offline queueing
   */
  async update(table: string, id: string, data: any, options: OfflineQueryOptions = {}): Promise<OfflineResponse> {
    const cacheKey = `${table}:${id}`;
    
    try {
      if (this.isOnline) {
        // Get current data for conflict detection
        const currentData = await offlineDataManager.getData(cacheKey);
        
        const { data: result, error } = await this.supabase
          .from(table)
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (!error) {
          // Update cache
          await offlineDataManager.storeData(cacheKey, result, table, options.ttl || this.config.defaultTTL);
          
          return {
            data: result,
            error: null,
            fromCache: false,
            timestamp: Date.now()
          };
        }
        
        throw error;
      } else {
        // Queue for offline sync
        const queueId = await offlineDataManager.addToSyncQueue({
          operation: 'update',
          entityType: table,
          entityId: id,
          data,
          priority: 2,
          maxRetries: 3,
          metadata: {
            lastKnownVersion: await this.getDataVersion(cacheKey)
          }
        });

        // Update local cache optimistically
        const cachedData = await offlineDataManager.getData(cacheKey);
        const updatedData = { ...cachedData, ...data };
        await offlineDataManager.storeData(cacheKey, updatedData, table, options.ttl || this.config.defaultTTL);

        console.log(`📝 HERA: Queued update for ${table}:${id} (ID: ${queueId})`);
        
        return {
          data: updatedData,
          error: null,
          fromCache: true,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        fromCache: false,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Delete data with offline queueing
   */
  async delete(table: string, id: string, options: OfflineQueryOptions = {}): Promise<OfflineResponse> {
    const cacheKey = `${table}:${id}`;
    
    try {
      if (this.isOnline) {
        const { data: result, error } = await this.supabase
          .from(table)
          .delete()
          .eq('id', id)
          .select()
          .single();

        if (!error) {
          // Remove from cache
          await offlineDataManager.storeData(cacheKey, null, table, 0);
          
          return {
            data: result,
            error: null,
            fromCache: false,
            timestamp: Date.now()
          };
        }
        
        throw error;
      } else {
        // Queue for offline sync
        const queueId = await offlineDataManager.addToSyncQueue({
          operation: 'delete',
          entityType: table,
          entityId: id,
          data: { id },
          priority: 3,
          maxRetries: 3
        });

        // Mark as deleted in cache
        await offlineDataManager.storeData(cacheKey, null, table, 0);

        console.log(`📝 HERA: Queued delete for ${table}:${id} (ID: ${queueId})`);
        
        return {
          data: { id },
          error: null,
          fromCache: false,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        fromCache: false,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get data version for conflict detection
   */
  private async getDataVersion(key: string): Promise<string | undefined> {
    const entry = await offlineDataManager.getData(key);
    return entry?.version || entry?.updated_at || entry?.modified_at;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    isOnline: boolean;
    isSyncing: boolean;
    lastSync?: number;
  } {
    return syncManager.getSyncStatus();
  }

  /**
   * Force sync all pending data
   */
  async forcSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    
    await syncManager.forcSync();
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    return offlineDataManager.getStorageStats();
  }

  /**
   * Clear all offline data
   */
  async clearOfflineData(): Promise<void> {
    await offlineDataManager.clearAllData();
  }

  /**
   * Export offline data for debugging
   */
  async exportOfflineData() {
    return offlineDataManager.exportData();
  }

  /**
   * Get native Supabase client (for advanced operations)
   */
  getNativeClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Subscribe to real-time changes (online only)
   */
  subscribe(table: string, callback: (payload: any) => void) {
    if (!this.isOnline) {
      console.warn('📴 HERA: Real-time subscriptions not available offline');
      return null;
    }

    return this.supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  }

  /**
   * Unsubscribe from real-time changes
   */
  unsubscribe(subscription: any) {
    if (subscription) {
      this.supabase.removeChannel(subscription);
    }
  }
}

/**
 * Offline-capable query builder
 */
export class SupabaseOfflineQuery {
  private supabase: SupabaseClient;
  private table: string;
  private isOnline: boolean;
  private config: SupabaseOfflineConfig;
  private query: any;
  private cacheKey: string;

  constructor(supabase: SupabaseClient, table: string, isOnline: boolean, config: SupabaseOfflineConfig) {
    this.supabase = supabase;
    this.table = table;
    this.isOnline = isOnline;
    this.config = config;
    this.query = supabase.from(table);
    this.cacheKey = `${table}:query:${Date.now()}`;
  }

  /**
   * Select columns
   */
  select(columns = '*') {
    this.query = this.query.select(columns);
    this.cacheKey += `:select:${columns}`;
    return this;
  }

  /**
   * Filter by equality
   */
  eq(column: string, value: any) {
    this.query = this.query.eq(column, value);
    this.cacheKey += `:eq:${column}:${value}`;
    return this;
  }

  /**
   * Filter by not equal
   */
  neq(column: string, value: any) {
    this.query = this.query.neq(column, value);
    this.cacheKey += `:neq:${column}:${value}`;
    return this;
  }

  /**
   * Filter by greater than
   */
  gt(column: string, value: any) {
    this.query = this.query.gt(column, value);
    this.cacheKey += `:gt:${column}:${value}`;
    return this;
  }

  /**
   * Filter by less than
   */
  lt(column: string, value: any) {
    this.query = this.query.lt(column, value);
    this.cacheKey += `:lt:${column}:${value}`;
    return this;
  }

  /**
   * Filter by LIKE
   */
  like(column: string, pattern: string) {
    this.query = this.query.like(column, pattern);
    this.cacheKey += `:like:${column}:${pattern}`;
    return this;
  }

  /**
   * Filter by IN
   */
  in(column: string, values: any[]) {
    this.query = this.query.in(column, values);
    this.cacheKey += `:in:${column}:${values.join(',')}`;
    return this;
  }

  /**
   * Order results
   */
  order(column: string, options: { ascending?: boolean } = {}) {
    this.query = this.query.order(column, options);
    this.cacheKey += `:order:${column}:${options.ascending ? 'asc' : 'desc'}`;
    return this;
  }

  /**
   * Limit results
   */
  limit(count: number) {
    this.query = this.query.limit(count);
    this.cacheKey += `:limit:${count}`;
    return this;
  }

  /**
   * Get single result
   */
  single() {
    this.query = this.query.single();
    this.cacheKey += `:single`;
    return this;
  }

  /**
   * Execute query with offline support
   */
  async execute(options: OfflineQueryOptions = {}): Promise<OfflineResponse> {
    const useCache = options.useCache !== false;
    const ttl = options.ttl || this.config.defaultTTL;
    
    try {
      if (this.isOnline && !options.forceRefresh) {
        // Try online first
        const { data, error } = await this.query;
        
        if (!error) {
          // Cache successful result
          if (useCache) {
            await offlineDataManager.storeData(this.cacheKey, data, this.table, ttl);
          }
          
          return {
            data,
            error: null,
            fromCache: false,
            timestamp: Date.now()
          };
        }
        
        // If online query fails, try cache
        if (useCache) {
          const cachedData = await offlineDataManager.getData(this.cacheKey);
          if (cachedData) {
            return {
              data: cachedData,
              error: null,
              fromCache: true,
              timestamp: Date.now()
            };
          }
        }
        
        throw error;
      } else {
        // Offline mode - use cache only
        if (useCache) {
          const cachedData = await offlineDataManager.getData(this.cacheKey);
          return {
            data: cachedData,
            error: cachedData ? null : new Error('No cached data available'),
            fromCache: true,
            timestamp: Date.now()
          };
        }
        
        throw new Error('Offline and cache disabled');
      }
    } catch (error) {
      // Final fallback to cache
      if (useCache) {
        const cachedData = await offlineDataManager.getData(this.cacheKey);
        if (cachedData) {
          return {
            data: cachedData,
            error: null,
            fromCache: true,
            timestamp: Date.now()
          };
        }
      }
      
      return {
        data: null,
        error: error as Error,
        fromCache: false,
        timestamp: Date.now()
      };
    }
  }
}

// Factory function for easy initialization
export function createSupabaseOfflineClient(config: SupabaseOfflineConfig): SupabaseOfflineClient {
  return new SupabaseOfflineClient(config);
}