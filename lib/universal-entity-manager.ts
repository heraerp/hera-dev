/**
 * HERA Universal Entity Manager
 * Handles all entity operations using HERA's universal schema architecture
 * One system that adapts to ANY entity type - the core of HERA's revolutionary approach
 */

import UniversalCrudService from '@/lib/services/universalCrudService';
import { z } from 'zod';

// HERA Universal Schema Types
export interface CoreEntity {
  id: string;
  organization_id: string;
  entity_type: string;
  entity_name: string;
  entity_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoreDynamicData {
  id: string;
  entity_id: string;
  field_name: string;
  field_value: string;
  field_type: string;
  field_order: number;
  is_required: boolean;
  validation_rules: any;
  created_at: string;
}

export interface CoreMetadata {
  id: string;
  entity_id: string;
  metadata_type: string;
  metadata_key: string;
  metadata_value: any;
  ai_generated: boolean;
  ai_confidence_score: number;
  created_at: string;
}

export interface AISchemaRegistry {
  id: string;
  organization_id: string;
  entity_type: string;
  schema_definition: any;
  confidence_score: number;
  deployment_status: string;
  created_at: string;
}

// Universal Entity Creation Input
export interface UniversalEntityInput {
  organization_id: string;
  entity_type: string;
  entity_name: string;
  entity_code?: string;
  fields: Record<string, any>;
  metadata?: Record<string, any>;
}

// Universal Entity Response
export interface UniversalEntityResponse {
  entity: CoreEntity;
  fields: CoreDynamicData[];
  metadata: CoreMetadata[];
  success: boolean;
  error?: string;
}

// Universal Search Options
export interface UniversalSearchOptions {
  organization_id: string;
  entity_type?: string;
  search_query?: string;
  filters?: Record<string, any>;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export class UniversalEntityManager {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Create a new universal entity with dynamic fields
   * This is the core of HERA's universal architecture
   */
  async createEntity(input: UniversalEntityInput): Promise<UniversalEntityResponse> {
    try {
      // 1. Create entity in core_entities
      const entity_code = input.entity_code || this.generateEntityCode(input.entity_type);
      
      const { data: entity, error: entityError } = await this.supabase
        .from('core_entities')
        .insert({
          organization_id: input.organization_id,
          entity_type: input.entity_type,
          entity_name: input.entity_name,
          entity_code: entity_code,
          is_active: true
        })
        .select()
        .single();

      if (entityError) throw entityError;

      // 2. Store dynamic fields in core_dynamic_data
      const dynamicFields: CoreDynamicData[] = [];
      const fieldEntries = Object.entries(input.fields);
      
      for (let i = 0; i < fieldEntries.length; i++) {
        const [fieldName, fieldValue] = fieldEntries[i];
        
        const { data: fieldData, error: fieldError } = await this.supabase
          .from('core_dynamic_data')
          .insert({
            entity_id: entity.id,
            field_name: fieldName,
            field_value: String(fieldValue),
            field_type: this.inferFieldType(fieldValue),
            field_order: i + 1,
            is_required: false,
            validation_rules: this.generateValidationRules(fieldName, fieldValue)
          })
          .select()
          .single();

        if (fieldError) throw fieldError;
        dynamicFields.push(fieldData);
      }

      // 3. Add AI metadata
      const metadata: CoreMetadata[] = [];
      if (input.metadata) {
        for (const [key, value] of Object.entries(input.metadata)) {
          const { data: metadataData, error: metadataError } = await this.supabase
            .from('core_metadata')
            .insert({
              entity_id: entity.id,
              metadata_type: 'form_config',
              metadata_key: key,
              metadata_value: value,
              ai_generated: true,
              ai_confidence_score: 0.95
            })
            .select()
            .single();

          if (metadataError) throw metadataError;
          metadata.push(metadataData);
        }
      }

      // 4. Store AI-generated schema
      await this.updateAISchemaRegistry(input.organization_id, input.entity_type, {
        fields: input.fields,
        metadata: input.metadata,
        generated_at: new Date().toISOString()
      });

      return {
        entity,
        fields: dynamicFields,
        metadata,
        success: true
      };

    } catch (error) {
      console.error('Error creating universal entity:', error);
      return {
        entity: null as any,
        fields: [],
        metadata: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get entity with all dynamic fields and metadata
   */
  async getEntity(entityId: string): Promise<UniversalEntityResponse> {
    try {
      // Get entity
      const { data: entity, error: entityError } = await this.supabase
        .from('core_entities')
        .select('*')
        .eq('id', entityId)
        .single();

      if (entityError) throw entityError;

      // Get dynamic fields
      const { data: fields, error: fieldsError } = await this.supabase
        .from('core_dynamic_data')
        .select('*')
        .eq('entity_id', entityId)
        .order('field_order');

      if (fieldsError) throw fieldsError;

      // Get metadata
      const { data: metadata, error: metadataError } = await this.supabase
        .from('core_metadata')
        .select('*')
        .eq('entity_id', entityId);

      if (metadataError) throw metadataError;

      return {
        entity,
        fields: fields || [],
        metadata: metadata || [],
        success: true
      };

    } catch (error) {
      console.error('Error getting entity:', error);
      return {
        entity: null as any,
        fields: [],
        metadata: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update entity with dynamic fields
   */
  async updateEntity(entityId: string, updates: Partial<UniversalEntityInput>): Promise<UniversalEntityResponse> {
    try {
      // Update entity
      const { data: entity, error: entityError } = await this.supabase
        .from('core_entities')
        .update({
          entity_name: updates.entity_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', entityId)
        .select()
        .single();

      if (entityError) throw entityError;

      // Update dynamic fields
      const updatedFields: CoreDynamicData[] = [];
      if (updates.fields) {
        for (const [fieldName, fieldValue] of Object.entries(updates.fields)) {
          const { data: fieldData, error: fieldError } = await this.supabase
            .from('core_dynamic_data')
            .upsert({
              entity_id: entityId,
              field_name: fieldName,
              field_value: String(fieldValue),
              field_type: this.inferFieldType(fieldValue),
              validation_rules: this.generateValidationRules(fieldName, fieldValue)
            })
            .select()
            .single();

          if (fieldError) throw fieldError;
          updatedFields.push(fieldData);
        }
      }

      return {
        entity,
        fields: updatedFields,
        metadata: [],
        success: true
      };

    } catch (error) {
      console.error('Error updating entity:', error);
      return {
        entity: null as any,
        fields: [],
        metadata: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Search entities with advanced filtering
   */
  async searchEntities(options: UniversalSearchOptions): Promise<{
    entities: any[];
    total: number;
    success: boolean;
    error?: string;
  }> {
    try {
      let query = this.supabase
        .from('core_entities')
        .select(`
          *,
          core_dynamic_data (
            field_name,
            field_value,
            field_type,
            field_order
          )
        `)
        .eq('organization_id', options.organization_id);

      // Apply filters
      if (options.entity_type) {
        query = query.eq('entity_type', options.entity_type);
      }

      if (options.search_query) {
        query = query.ilike('entity_name', `%${options.search_query}%`);
      }

      // Apply sorting
      if (options.sort_by) {
        query = query.order(options.sort_by, { ascending: options.sort_order === 'asc' });
      }

      // Apply pagination
      if (options.limit) {
        query = query.range(options.offset || 0, (options.offset || 0) + options.limit - 1);
      }

      const { data: entities, error, count } = await query;

      if (error) throw error;

      return {
        entities: entities || [],
        total: count || 0,
        success: true
      };

    } catch (error) {
      console.error('Error searching entities:', error);
      return {
        entities: [],
        total: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete entity and all related data
   */
  async deleteEntity(entityId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete metadata
      await this.supabase
        .from('core_metadata')
        .delete()
        .eq('entity_id', entityId);

      // Delete dynamic data
      await this.supabase
        .from('core_dynamic_data')
        .delete()
        .eq('entity_id', entityId);

      // Delete entity
      const { error } = await this.supabase
        .from('core_entities')
        .delete()
        .eq('id', entityId);

      if (error) throw error;

      return { success: true };

    } catch (error) {
      console.error('Error deleting entity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get AI schema for entity type
   */
  async getAISchema(organizationId: string, entityType: string): Promise<{
    schema: any;
    confidence: number;
    success: boolean;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('ai_schema_registry')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', entityType)
        .eq('deployment_status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return {
        schema: data.schema_definition,
        confidence: data.confidence_score,
        success: true
      };

    } catch (error) {
      return {
        schema: null,
        confidence: 0,
        success: false
      };
    }
  }

  // Private helper methods
  private generateEntityCode(entityType: string): string {
    const prefix = entityType.toUpperCase().substring(0, 3);
    const timestamp = Date.now().toString(36);
    return `${prefix}-${timestamp}`;
  }

  private inferFieldType(value: any): string {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string') {
      if (value.includes('@')) return 'email';
      if (value.match(/^\d{4}-\d{2}-\d{2}/)) return 'date';
      if (value.match(/^\d+$/)) return 'number';
      if (value.match(/^(true|false)$/i)) return 'boolean';
    }
    return 'text';
  }

  private generateValidationRules(fieldName: string, fieldValue: any): any {
    const rules: any = {};
    
    if (fieldName.toLowerCase().includes('email')) {
      rules.pattern = '^[^@]+@[^@]+\\.[^@]+$';
    }
    
    if (fieldName.toLowerCase().includes('phone')) {
      rules.pattern = '^[\\d\\s\\-\\+\\(\\)]+$';
    }
    
    if (typeof fieldValue === 'string' && fieldValue.length > 0) {
      rules.minLength = 1;
      rules.maxLength = fieldValue.length < 50 ? 100 : 500;
    }
    
    return rules;
  }

  private async updateAISchemaRegistry(organizationId: string, entityType: string, schema: any): Promise<void> {
    try {
      await this.supabase
        .from('ai_schema_registry')
        .upsert({
          organization_id: organizationId,
          entity_type: entityType,
          schema_definition: schema,
          confidence_score: 0.95,
          deployment_status: 'active'
        });
    } catch (error) {
      console.error('Error updating AI schema registry:', error);
    }
  }
}

// Export singleton instance
export const universalEntityManager = new UniversalEntityManager();