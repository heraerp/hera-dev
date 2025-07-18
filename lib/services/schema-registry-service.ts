/**
 * HERA Universal Schema Registry Service
 * Manages and tracks all entity schemas to prevent duplication
 * Provides AI with context about existing schemas
 */

import { supabase } from '@/lib/supabase/client';

export interface RegisteredSchema {
  id: string;
  organization_id: string;
  entity_type: string;
  entity_name: string;
  schema_definition: any;
  field_count: number;
  created_at: string;
  updated_at: string;
  usage_count: number;
  ai_generated: boolean;
  confidence_score?: number;
  business_domain?: string;
  keywords?: string[];
}

export interface SimilarityResult {
  entity_type: string;
  entity_name: string;
  similarity_score: number;
  matching_fields: string[];
  recommendation: 'use_existing' | 'create_variant' | 'create_new';
  reason: string;
}

export class SchemaRegistryService {
  private static instance: SchemaRegistryService;
  private schemaCache: Map<string, RegisteredSchema> = new Map();
  private lastCacheUpdate: Date = new Date(0);
  private cacheExpiryMinutes = 5;

  static getInstance(): SchemaRegistryService {
    if (!this.instance) {
      this.instance = new SchemaRegistryService();
    }
    return this.instance;
  }

  /**
   * Get all registered schemas for an organization
   */
  async getRegisteredSchemas(organizationId: string): Promise<RegisteredSchema[]> {
    try {
      // Check cache first
      if (this.isCacheValid()) {
        const cachedSchemas = Array.from(this.schemaCache.values())
          .filter(schema => schema.organization_id === organizationId);
        if (cachedSchemas.length > 0) {
          return cachedSchemas;
        }
      }

      // Query from database
      const { data: entities, error } = await supabase
        .from('core_entities')
        .select(`
          *,
          core_metadata!inner(*)
        `)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process and cache schemas
      const schemas: RegisteredSchema[] = [];
      for (const entity of entities || []) {
        const schema = await this.buildSchemaFromEntity(entity);
        schemas.push(schema);
        this.schemaCache.set(`${organizationId}-${entity.entity_type}`, schema);
      }

      this.lastCacheUpdate = new Date();
      return schemas;

    } catch (error) {
      console.error('Error fetching registered schemas:', error);
      return [];
    }
  }

  /**
   * Find similar existing schemas
   */
  async findSimilarSchemas(
    organizationId: string,
    requirement: string,
    proposedEntityType?: string,
    proposedFields?: string[]
  ): Promise<SimilarityResult[]> {
    try {
      const existingSchemas = await this.getRegisteredSchemas(organizationId);
      const similarities: SimilarityResult[] = [];

      for (const schema of existingSchemas) {
        const similarity = this.calculateSchemaSimilarity(
          schema,
          requirement,
          proposedEntityType,
          proposedFields
        );

        if (similarity.similarity_score > 0.3) {
          similarities.push(similarity);
        }
      }

      // Sort by similarity score
      return similarities.sort((a, b) => b.similarity_score - a.similarity_score);

    } catch (error) {
      console.error('Error finding similar schemas:', error);
      return [];
    }
  }

  /**
   * Register a new schema
   */
  async registerSchema(
    organizationId: string,
    entityType: string,
    name: string,
    schemaDefinition: any,
    aiGenerated: boolean = false
  ): Promise<RegisteredSchema> {
    try {
      // Check if schema already exists
      const existing = await this.getSchemaByType(organizationId, entityType);
      if (existing) {
        console.log('Schema already exists, returning existing:', entityType);
        return existing;
      }

      // Create new entity
      const { data: entity, error: entityError } = await supabase
        .from('core_entities')
        .insert({
          organization_id: organizationId,
          entity_type: entityType,
          entity_name: entityName,
          entity_code: entityType.toUpperCase(),
          is_active: true
        })
        .select()
        .single();

      if (entityError) throw entityError;

      // Store schema definition in metadata
      const { error: metadataError } = await supabase
        .from('core_metadata')
        .insert({
          entity_id: entity.id,
          metadata_type: 'schema_definition',
          metadata_key: 'full_schema',
          metadata_value: JSON.stringify(schemaDefinition),
          ai_generated: aiGenerated
        });

      if (metadataError) throw metadataError;

      // Build and cache the schema
      const registeredSchema = await this.buildSchemaFromEntity(entity);
      this.schemaCache.set(`${organizationId}-${entityType}`, registeredSchema);

      return registeredSchema;

    } catch (error) {
      console.error('Error registering schema:', error);
      throw error;
    }
  }

  /**
   * Get schema by entity type
   */
  async getSchemaByType(organizationId: string, entityType: string): Promise<RegisteredSchema | null> {
    try {
      // Check cache first
      const cacheKey = `${organizationId}-${entityType}`;
      if (this.schemaCache.has(cacheKey) && this.isCacheValid()) {
        return this.schemaCache.get(cacheKey)!;
      }

      // Query from database
      const { data: entity, error } = await supabase
        .from('core_entities')
        .select(`
          *,
          core_metadata!inner(*)
        `)
        .eq('organization_id', organizationId)
        .eq('entity_type', entityType)
        .eq('is_active', true)
        .single();

      if (error || !entity) return null;

      const schema = await this.buildSchemaFromEntity(entity);
      this.schemaCache.set(cacheKey, schema);

      return schema;

    } catch (error) {
      console.error('Error fetching schema by type:', error);
      return null;
    }
  }

  /**
   * Get schema usage statistics
   */
  async getSchemaUsageStats(organizationId: string, entityType: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('core_dynamic_data')
        .select('*', { count: 'exact', head: true })
        .eq('entity_id', `(select id from core_entities where organization_id = '${organizationId}' and entity_type = '${entityType}')`);

      return count || 0;

    } catch (error) {
      console.error('Error fetching usage stats:', error);
      return 0;
    }
  }

  /**
   * Generate context for AI about existing schemas
   */
  async generateAIContext(organizationId: string): Promise<string> {
    try {
      const schemas = await this.getRegisteredSchemas(organizationId);
      
      if (schemas.length === 0) {
        return 'No existing schemas found for this organization.';
      }

      let context = `Existing schemas in the system:\n\n`;

      for (const schema of schemas) {
        context += `Entity Type: ${schema.entity_type}\n`;
        context += `Entity Name: ${schema.entity_name}\n`;
        context += `Domain: ${schema.business_domain || 'general'}\n`;
        context += `Fields: ${schema.field_count}\n`;
        context += `Usage: ${schema.usage_count} records\n`;
        context += `Keywords: ${schema.keywords?.join(', ') || 'none'}\n`;
        context += `---\n`;
      }

      context += `\nIMPORTANT: Before creating a new schema, check if any existing schema can be reused or extended. Avoid duplication.`;

      return context;

    } catch (error) {
      console.error('Error generating AI context:', error);
      return 'Unable to fetch existing schemas.';
    }
  }

  /**
   * Private helper methods
   */
  private async buildSchemaFromEntity(entity: any): Promise<RegisteredSchema> {
    // Extract schema definition from metadata
    const schemaMetadata = entity.core_metadata?.find(
      (m: any) => m.metadata_type === 'schema_definition' && m.metadata_key === 'full_schema'
    );

    let schemaDefinition = {};
    let fieldCount = 0;
    let keywords: string[] = [];

    if (schemaMetadata?.metadata_value) {
      try {
        schemaDefinition = JSON.parse(schemaMetadata.metadata_value);
        fieldCount = schemaDefinition.fields?.length || 0;
        keywords = schemaDefinition.domain?.keywords || [];
      } catch (e) {
        console.warn('Failed to parse schema definition');
      }
    }

    // Get usage count
    const usageCount = await this.getSchemaUsageStats(entity.organization_id, entity.entity_type);

    return {
      id: entity.id,
      organization_id: entity.organization_id,
      entity_type: entity.entity_type,
      entity_name: entity.entity_name,
      schema_definition: schemaDefinition,
      field_count: fieldCount,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      usage_count: usageCount,
      ai_generated: schemaMetadata?.ai_generated || false,
      confidence_score: schemaDefinition.confidence,
      business_domain: schemaDefinition.domain?.name,
      keywords: keywords
    };
  }

  private calculateSchemaSimilarity(
    existingSchema: RegisteredSchema,
    requirement: string,
    proposedEntityType?: string,
    proposedFields?: string[]
  ): SimilarityResult {
    let score = 0;
    const matchingFields: string[] = [];
    const reasons: string[] = [];

    // Entity type similarity
    if (proposedEntityType) {
      const typeSimilarity = this.calculateStringSimilarity(
        existingSchema.entity_type.toLowerCase(),
        proposedEntityType.toLowerCase()
      );
      score += typeSimilarity * 0.3;
      if (typeSimilarity > 0.8) {
        reasons.push('Entity type is very similar');
      }
    }

    // Requirement text similarity
    const reqWords = requirement.toLowerCase().split(/\s+/);
    const keywords = existingSchema.keywords || [];
    
    let keywordMatches = 0;
    for (const keyword of keywords) {
      if (reqWords.includes(keyword.toLowerCase())) {
        keywordMatches++;
      }
    }
    
    if (keywords.length > 0) {
      const keywordScore = keywordMatches / keywords.length;
      score += keywordScore * 0.3;
      if (keywordScore > 0.5) {
        reasons.push(`Matches ${keywordMatches} keywords`);
      }
    }

    // Field similarity
    if (proposedFields && existingSchema.schema_definition?.fields) {
      const existingFieldNames = existingSchema.schema_definition.fields.map(
        (f: any) => f.name.toLowerCase()
      );
      
      for (const proposedField of proposedFields) {
        if (existingFieldNames.includes(proposedField.toLowerCase())) {
          matchingFields.push(proposedField);
        }
      }
      
      const fieldScore = matchingFields.length / Math.max(proposedFields.length, existingFieldNames.length);
      score += fieldScore * 0.4;
      
      if (fieldScore > 0.6) {
        reasons.push(`${matchingFields.length} matching fields`);
      }
    }

    // Determine recommendation
    let recommendation: 'use_existing' | 'create_variant' | 'create_new' = 'create_new';
    let reason = 'Low similarity - create new schema';

    if (score > 0.8) {
      recommendation = 'use_existing';
      reason = 'High similarity - use existing schema: ' + reasons.join(', ');
    } else if (score > 0.5) {
      recommendation = 'create_variant';
      reason = 'Moderate similarity - consider creating a variant: ' + reasons.join(', ');
    }

    return {
      entity_type: existingSchema.entity_type,
      entity_name: existingSchema.entity_name,
      similarity_score: score,
      matching_fields: matchingFields,
      recommendation,
      reason
    };
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private isCacheValid(): boolean {
    const now = new Date();
    const expiryTime = new Date(this.lastCacheUpdate.getTime() + this.cacheExpiryMinutes * 60 * 1000);
    return now < expiryTime;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.schemaCache.clear();
    this.lastCacheUpdate = new Date(0);
  }
}

// Export singleton instance
export const schemaRegistry = SchemaRegistryService.getInstance();