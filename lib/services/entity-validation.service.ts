// 🔧 COMPLETELY FIXED: Entity Validation Service - No PromiseLike Issues
// File: lib/services/entity-validation.service.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ===================================================================
// TYPES & INTERFACES
// ===================================================================

export interface ValidationResult {
  isValid: boolean;
  normalizedType: string;
  confidence: number;
  reasoning: string;
  suggestions: string[];
  validationMethod: 'cache' | 'database' | 'fuzzy' | 'ai';
  cost: number;
  corrected?: boolean;
  original?: string;
}

export interface EntityTypeRegistry {
  entity_type: string;
  entity_category: string;
  display_name: string;
  display_name_plural: string;
  description: string;
  synonyms: string[];
  ai_keywords: string[];
  applicable_industries: string[];
  is_active: boolean;
}

export interface ValidationCache {
  input: string;
  normalized_type: string;
  confidence: number;
  validation_method: string;
  use_count: number;
  created_at: string;
  last_used_at: string;
}

export interface BatchValidationResult {
  results: Map<string, ValidationResult>;
  summary: {
    total: number;
    free: number;
    paid: number;
    totalCost: number;
    cacheHits: number;
  };
}

interface DatabaseValidationResult {
  entity_type: string;
  display_name: string;
  confidence: number;
}

interface FuzzyMatchResult {
  entity_type: string;
  display_name: string;
  similarity: number;
}

// ===================================================================
// MAIN HYBRID VALIDATION SERVICE - COMPLETELY FIXED
// ===================================================================

export class HybridEntityValidationService {
  private supabase: SupabaseClient;
  private cache: Map<string, ValidationCache> = new Map();
  private totalApiCost: number = 0;
  private readonly aiCostPerRequest = 0.001;
  private readonly maxDailyCost = 5.0;
  private lastRegistryUpdate: Date = new Date(0);
  private registry: Map<string, EntityTypeRegistry> = new Map();
  private isInitialized = false;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Initialize without promises in constructor
    this.startInitialization();
  }

  /**
   * Start initialization without promise chains
   */
  private startInitialization(): void {
    // Use requestAnimationFrame for true async initialization
    requestAnimationFrame(async () => {
      try {
        await this.performInitialization();
        this.isInitialized = true;
        console.log('✅ Hybrid Entity Validation Service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize validation service:', error);
        this.isInitialized = false;
      }
    });
  }

  /**
   * Perform the actual initialization
   */
  private async performInitialization(): Promise<void> {
    // Load cache first
    try {
      await this.loadValidationCache();
    } catch (error) {
      console.warn('Cache loading failed:', error);
    }

    // Then load registry
    try {
      await this.loadEntityRegistry();
    } catch (error) {
      console.warn('Registry loading failed:', error);
    }
  }

  /**
   * Wait for initialization to complete
   */
  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    
    // Wait up to 5 seconds for initialization
    for (let i = 0; i < 50; i++) {
      if (this.isInitialized) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.warn('Service not fully initialized, proceeding anyway');
  }

  /**
   * 🎯 MAIN VALIDATION METHOD - 4-tier hybrid approach
   */
  async validateEntityType(
    input: string,
    entityDescription?: string,
    organizationIndustry: string = 'restaurant'
  ): Promise<ValidationResult> {
    await this.ensureInitialized();
    
    const normalizedInput = this.normalizeInput(input);
    const cacheKey = `${normalizedInput}:${organizationIndustry}`;

    try {
      // TIER 1: Check validation cache (FREE)
      const cachedResult = await this.checkValidationCache(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // TIER 2: Direct database lookup (FREE)
      const dbResult = await this.validateWithDatabase(normalizedInput, organizationIndustry);
      if (dbResult.confidence >= 0.9) {
        this.scheduleCache(cacheKey, dbResult);
        return dbResult;
      }

      // TIER 3: Fuzzy matching with Supabase (FREE)
      const fuzzyResult = await this.validateWithFuzzyMatching(normalizedInput, organizationIndustry);
      if (fuzzyResult.confidence >= 0.7) {
        this.scheduleCache(cacheKey, fuzzyResult);
        return fuzzyResult;
      }

      // TIER 4: Return best result
      this.scheduleCache(cacheKey, fuzzyResult);
      return fuzzyResult;

    } catch (error) {
      console.error('Validation error:', error);
      return this.createErrorResult(input, error);
    }
  }

  /**
   * 🆓 TIER 1: Check validation cache
   */
  private async checkValidationCache(cacheKey: string): Promise<ValidationResult | null> {
    try {
      // Check in-memory cache first
      const memoryCache = this.cache.get(cacheKey);
      if (memoryCache) {
        this.scheduleUsageUpdate(cacheKey);
        
        return {
          isValid: memoryCache.confidence >= 0.8,
          normalizedType: memoryCache.normalized_type,
          confidence: memoryCache.confidence,
          reasoning: `Cached result (used ${memoryCache.use_count + 1} times)`,
          suggestions: [],
          validationMethod: 'cache',
          cost: 0
        };
      }

      // Check database cache
      const { data, error } = await this.supabase
        .from('entity_validation_cache')
        .select('*')
        .eq('input', cacheKey)
        .single();

      if (data && !error) {
        this.cache.set(cacheKey, data);
        this.scheduleUsageUpdate(cacheKey);

        return {
          isValid: data.confidence >= 0.8,
          normalizedType: data.normalized_type,
          confidence: data.confidence,
          reasoning: `Cached result (${data.validation_method})`,
          suggestions: [],
          validationMethod: 'cache',
          cost: 0
        };
      }

      return null;
    } catch (error) {
      console.warn('Cache check failed:', error);
      return null;
    }
  }

  /**
   * 🆓 TIER 2: Direct database validation
   */
  private async validateWithDatabase(
    input: string,
    industry: string
  ): Promise<ValidationResult> {
    try {
      const { data, error } = await this.supabase.rpc('validate_entity_type_advanced', {
        input_type: input,
        org_industry: industry
      });

      if (error) throw error;

      if (data && Array.isArray(data) && data.length > 0) {
        const result = data[0] as DatabaseValidationResult;
        return {
          isValid: true,
          normalizedType: result.entity_type,
          confidence: result.confidence,
          reasoning: `Direct match: ${result.display_name}`,
          suggestions: [],
          validationMethod: 'database',
          cost: 0,
          corrected: input !== result.entity_type,
          original: input !== result.entity_type ? input : undefined
        };
      }

      return this.createNotFoundResult(input, 'database');

    } catch (error) {
      console.warn('Database validation failed:', error);
      return this.createErrorResult(input, error, 'database');
    }
  }

  /**
   * 🆓 TIER 3: Fuzzy matching validation
   */
  private async validateWithFuzzyMatching(
    input: string,
    industry: string
  ): Promise<ValidationResult> {
    try {
      const { data, error } = await this.supabase.rpc('fuzzy_match_entity_type', {
        input_type: input,
        org_industry: industry,
        similarity_threshold: 0.3
      });

      if (error) throw error;

      if (data && Array.isArray(data) && data.length > 0) {
        const bestMatch = data[0] as FuzzyMatchResult;
        const confidence = Math.min(bestMatch.similarity * 0.9, 0.85);

        return {
          isValid: confidence >= 0.7,
          normalizedType: bestMatch.entity_type,
          confidence,
          reasoning: `Fuzzy match: "${input}" → "${bestMatch.entity_type}" (${(confidence * 100).toFixed(1)}% similarity)`,
          suggestions: data.slice(1, 4).map((item: FuzzyMatchResult) => item.entity_type),
          validationMethod: 'fuzzy',
          cost: 0,
          corrected: true,
          original: input
        };
      }

      return this.createNotFoundResult(input, 'fuzzy');

    } catch (error) {
      console.warn('Fuzzy matching failed:', error);
      return this.createErrorResult(input, error, 'fuzzy');
    }
  }

  /**
   * 🔄 Batch validation with smart processing
   */
  async validateBatch(
    inputs: string[],
    industry: string = 'restaurant'
  ): Promise<BatchValidationResult> {
    const results = new Map<string, ValidationResult>();
    let totalCost = 0;
    let freeValidations = 0;
    let paidValidations = 0;
    let cacheHits = 0;

    const batchSize = 10;
    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      
      const batchPromises = batch.map((input, index) => 
        new Promise<{input: string, result: ValidationResult}>(resolve => {
          setTimeout(async () => {
            const result = await this.validateEntityType(input, undefined, industry);
            resolve({ input, result });
          }, index * 50);
        })
      );

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ input, result }) => {
        results.set(input, result);
        totalCost += result.cost;
        
        if (result.cost === 0) freeValidations++;
        else paidValidations++;
        
        if (result.validationMethod === 'cache') cacheHits++;
      });
    }

    return {
      results,
      summary: {
        total: inputs.length,
        free: freeValidations,
        paid: paidValidations,
        totalCost,
        cacheHits
      }
    };
  }

  /**
   * Schedule cache operations without promise chains
   */
  private scheduleCache(cacheKey: string, result: ValidationResult): void {
    requestAnimationFrame(async () => {
      try {
        const cacheEntry: ValidationCache = {
          input: cacheKey,
          normalized_type: result.normalizedType,
          confidence: result.confidence,
          validation_method: result.validationMethod,
          use_count: 1,
          created_at: new Date().toISOString(),
          last_used_at: new Date().toISOString()
        };

        const { error } = await this.supabase
          .from('entity_validation_cache')
          .upsert(cacheEntry, { onConflict: 'input' });

        if (!error) {
          this.cache.set(cacheKey, cacheEntry);
        }
      } catch (error) {
        console.warn('Cache operation failed:', error);
      }
    });
  }

  private scheduleUsageUpdate(cacheKey: string): void {
    const cached = this.cache.get(cacheKey);
    if (cached) {
      cached.use_count += 1;
      cached.last_used_at = new Date().toISOString();
    }

    requestAnimationFrame(async () => {
      try {
        await this.supabase
          .from('entity_validation_cache')
          .update({ 
            use_count: cached?.use_count || 1,
            last_used_at: new Date().toISOString()
          })
          .eq('input', cacheKey);
      } catch (error) {
        console.warn('Usage update failed:', error);
      }
    });
  }

  private async loadValidationCache(): Promise<void> {
    const { data, error } = await this.supabase
      .from('entity_validation_cache')
      .select('*')
      .gte('use_count', 2)
      .limit(200);

    if (data && !error) {
      data.forEach((item: ValidationCache) => {
        this.cache.set(item.input, item);
      });
      console.log(`📦 Loaded ${data.length} cached validations`);
    }
  }

  private async loadEntityRegistry(): Promise<void> {
    const { data, error } = await this.supabase
      .from('core_entity_type_registry')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    this.registry.clear();
    if (data) {
      data.forEach((item: EntityTypeRegistry) => {
        this.registry.set(item.entity_type, item);
      });
    }

    this.lastRegistryUpdate = new Date();
    console.log(`📚 Loaded ${this.registry.size} entity types`);
  }

  /**
   * 🔧 Utility methods
   */
  private normalizeInput(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .replace(/s$/, '');
  }

  private createNotFoundResult(input: string, method: string, reason?: string): ValidationResult {
    return {
      isValid: false,
      normalizedType: this.normalizeInput(input),
      confidence: 0.0,
      reasoning: reason || `No match found using ${method} method`,
      suggestions: [],
      validationMethod: method as 'cache' | 'database' | 'fuzzy' | 'ai',
      cost: 0
    };
  }

  private createErrorResult(input: string, error: unknown, method: string = 'unknown'): ValidationResult {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      isValid: false,
      normalizedType: this.normalizeInput(input),
      confidence: 0.0,
      reasoning: `Validation error: ${errorMessage}`,
      suggestions: [],
      validationMethod: method as 'cache' | 'database' | 'fuzzy' | 'ai',
      cost: 0
    };
  }

  /**
   * 📊 Statistics and monitoring
   */
  getCostStats(): {
    totalApiCost: number;
    cacheHitRate: number;
    cacheSize: number;
    dailyBudgetUsed: number;
    recommendations: string[];
  } {
    const cacheHitRate = this.cache.size > 0 ? 
      Array.from(this.cache.values()).reduce((sum, item) => sum + item.use_count, 0) / this.cache.size : 0;

    const recommendations: string[] = [];
    
    if (this.totalApiCost > this.maxDailyCost * 0.8) {
      recommendations.push('Approaching daily AI budget limit');
    }
    if (cacheHitRate < 2.0) {
      recommendations.push('Consider pre-populating common validations');
    }
    if (this.cache.size > 1000) {
      recommendations.push('Consider cache cleanup');
    }

    return {
      totalApiCost: this.totalApiCost,
      cacheHitRate,
      cacheSize: this.cache.size,
      dailyBudgetUsed: (this.totalApiCost / this.maxDailyCost) * 100,
      recommendations
    };
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    database: boolean;
    cache: boolean;
    registrySize: number;
    cacheSize: number;
  }> {
    try {
      const { error: dbError } = await this.supabase
        .from('core_entity_type_registry')
        .select('entity_type')
        .limit(1);

      const dbHealthy = !dbError;
      const cacheHealthy = this.cache.size > 0;

      const status = dbHealthy && cacheHealthy ? 'healthy' : 
                   dbHealthy ? 'degraded' : 'unhealthy';

      return {
        status,
        database: dbHealthy,
        cache: cacheHealthy,
        registrySize: this.registry.size,
        cacheSize: this.cache.size
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: false,
        cache: false,
        registrySize: 0,
        cacheSize: 0
      };
    }
  }

  async cleanupCache(olderThanDays: number = 30): Promise<{ deleted: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    try {
      const { error } = await this.supabase
        .from('entity_validation_cache')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .eq('use_count', 1);

      if (error) {
        console.error('Cache cleanup failed:', error);
        return { deleted: 0 };
      }

      let deletedFromMemory = 0;
      for (const [key, value] of this.cache.entries()) {
        if (new Date(value.created_at) < cutoffDate && value.use_count === 1) {
          this.cache.delete(key);
          deletedFromMemory++;
        }
      }

      return { deleted: deletedFromMemory };

    } catch (error) {
      console.error('Cache cleanup failed:', error);
      return { deleted: 0 };
    }
  }

  async refreshRegistry(): Promise<void> {
    await this.loadEntityRegistry();
  }
}

// ===================================================================
// TEST FUNCTION
// ===================================================================

export async function testEntityValidation(): Promise<HybridEntityValidationService> {
  console.log('🧪 Testing Hybrid Entity Validation Service\n');

  const validator = new HybridEntityValidationService(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Wait for initialization
  await new Promise(resolve => setTimeout(resolve, 3000));

  const testCases = [
    'customers',
    'menu items', 
    'staff',
    'tables',
    'orders',
    'wine bottles',
    'reservations',
    'suppliers'
  ];

  console.log('Testing individual validations:\n');

  for (const testCase of testCases) {
    try {
      const result = await validator.validateEntityType(testCase, undefined, 'restaurant');
      
      console.log(`Input: "${testCase}"`);
      console.log(`✅ Result: "${result.normalizedType}" (confidence: ${result.confidence.toFixed(2)})`);
      console.log(`📝 Method: ${result.validationMethod} | Cost: $${result.cost.toFixed(3)}`);
      console.log(`💭 Reasoning: ${result.reasoning}`);
      if (result.suggestions.length > 0) {
        console.log(`💡 Suggestions: ${result.suggestions.join(', ')}`);
      }
      console.log('---\n');
    } catch (error) {
      console.error(`❌ Error testing "${testCase}":`, error);
    }
  }

  try {
    const health = await validator.healthCheck();
    console.log('\n🏥 Health Check:');
    console.log(`Status: ${health.status}`);
    console.log(`Database: ${health.database ? '✅' : '❌'}`);
    console.log(`Cache: ${health.cache ? '✅' : '❌'}`);
    console.log(`Registry Size: ${health.registrySize}`);
    console.log(`Cache Size: ${health.cacheSize}`);
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }

  return validator;
}

export const createZenRestaurantValidator = (): HybridEntityValidationService => {
  return new HybridEntityValidationService(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export default HybridEntityValidationService;