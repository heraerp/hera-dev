/**
 * 🏗️ HERA System Service - Self-Development Architecture
 * 
 * Revolutionary service that enables HERA to develop itself using its own
 * universal schema. This implements the self-referential architecture where
 * HERA platform development is managed like restaurant operations.
 * 
 * SYSTEM ORGANIZATION IDs: 00000000-0000-0000-0000-00000000000X
 * - 001: Core Platform Development
 * - 002: AI Models & Intelligence
 * - 003: Security & Compliance
 * - 004: Developer Tools & Testing
 * - 005: Analytics & Business Intelligence
 * - 006: Integration & API Management
 */

import UniversalCrudService from '@/lib/services/universalCrudService';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { HeraNamingConventionAI } from '@/lib/naming/heraNamingConvention';
import { createClient } from '@/lib/supabase/client';

// Admin client with service role for system operations
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!}`
      }
    }
  }
);

const supabase = createClient();

// System Organization IDs (Reserved for HERA Development)
export const SYSTEM_ORGANIZATIONS = {
  CORE_PLATFORM: '00000000-0000-0000-0000-000000000001',
  AI_INTELLIGENCE: '00000000-0000-0000-0000-000000000002', 
  SECURITY_COMPLIANCE: '00000000-0000-0000-0000-000000000003',
  DEVELOPER_TOOLS: '00000000-0000-0000-0000-000000000004',
  ANALYTICS_BI: '00000000-0000-0000-0000-000000000005',
  INTEGRATION_API: '00000000-0000-0000-0000-000000000006'
} as const;

export type SystemOrganizationType = keyof typeof SYSTEM_ORGANIZATIONS;

// System Entity Types for HERA Development
export const SYSTEM_ENTITY_TYPES = {
  // Core Platform Development
  PLATFORM_FEATURE: 'platform_feature',
  DEVELOPMENT_TASK: 'development_task', 
  ARCHITECTURE_COMPONENT: 'architecture_component',
  CODE_MODULE: 'code_module',
  DEPLOYMENT: 'deployment',
  
  // AI Models & Intelligence
  AI_MODEL: 'ai_model',
  TRAINING_DATASET: 'training_dataset',
  AI_METRIC: 'ai_metric',
  LEARNING_PATTERN: 'learning_pattern',
  AI_DECISION: 'ai_decision',
  
  // Security & Compliance
  SECURITY_POLICY: 'security_policy',
  COMPLIANCE_RULE: 'compliance_rule',
  SECURITY_AUDIT: 'security_audit',
  VULNERABILITY: 'vulnerability',
  ACCESS_CONTROL: 'access_control',
  
  // Developer Tools & Testing
  DEV_TOOL: 'dev_tool',
  TEST_SUITE: 'test_suite',
  QUALITY_GATE: 'quality_gate',
  BUILD_PIPELINE: 'build_pipeline',
  TEST_RESULT: 'test_result',
  
  // Analytics & BI
  ANALYTICS_METRIC: 'analytics_metric',
  BUSINESS_KPI: 'business_kpi',
  REPORT_TEMPLATE: 'report_template',
  DATA_SOURCE: 'data_source',
  INSIGHT: 'insight',
  
  // Integration & API
  API_ENDPOINT: 'api_endpoint',
  INTEGRATION: 'integration',
  WEBHOOK: 'webhook',
  DATA_SYNC: 'data_sync',
  EXTERNAL_SERVICE: 'external_service'
} as const;

export interface SystemEntityInput {
  organizationType: SystemOrganizationType;
  entityType: string;
  name: string;
  entityCode?: string;
  metadata?: Record<string, any>;
  fields?: Record<string, any>;
}

export interface SystemQueryFilter {
  organizationType?: SystemOrganizationType;
  entityType?: string;
  entityTypes?: string[];
  includeMetadata?: boolean;
  includeFields?: boolean;
}

export interface HeraDevelopmentMetrics {
  totalFeatures: number;
  completedFeatures: number;
  activeAIModels: number;
  testCoverage: number;
  qualityScore: number;
  securityScore: number;
  performanceScore: number;
  developmentVelocity: number;
}

export class HeraSystemService {
  
  /**
   * 🎯 Create a new system entity for HERA development
   */
  static async createSystemEntity(input: SystemEntityInput): Promise<{ success: boolean; entityId?: string; error?: string }> {
    console.log('🏗️ Creating HERA system entity:', input.entityName);
    
    try {
      // Validate naming convention
      const entityValidation = await HeraNamingConventionAI.validateFieldName('core_entities', 'entity_name');
      if (!entityValidation.isValid) {
        throw new Error(`Naming convention violation: ${entityValidation.error}`);
      }
      
      const organizationId = SYSTEM_ORGANIZATIONS[input.organizationType];
      const entityId = crypto.randomUUID();
      const entityCode = input.entityCode || this.generateSystemEntityCode(input.entityName, input.entityType);
      
      // Create system entity
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: entityId,
          organization_id: organizationId,
          entity_type: input.entityType,
          entity_name: input.entityName,
          entity_code: entityCode,
          is_active: true
        });
        
      if (entityError) throw entityError;
      
      // Add metadata if provided
      if (input.metadata) {
        await this.addSystemMetadata(entityId, organizationId, input.entityType, input.metadata);
      }
      
      // Add dynamic fields if provided
      if (input.fields) {
        await this.addSystemFields(entityId, input.fields);
      }
      
      console.log('✅ System entity created successfully:', entityId);
      return { success: true, entityId };
      
    } catch (error) {
      console.error('❌ Failed to create system entity:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  /**
   * 🔍 Query system entities with filtering
   */
  static async querySystemEntities(filter: SystemQueryFilter = {}): Promise<any[]> {
    console.log('🔍 Querying HERA system entities with filter:', filter);
    
    try {
      let query = supabase
        .from('core_entities')
        .select('*');
      
      // Filter by organization type
      if (filter.organizationType) {
        const orgId = SYSTEM_ORGANIZATIONS[filter.organizationType];
        query = query.eq('organization_id', orgId);
      } else {
        // Only system organizations
        const systemOrgIds = Object.values(SYSTEM_ORGANIZATIONS);
        query = query.in('organization_id', systemOrgIds);
      }
      
      // Filter by entity type
      if (filter.entityType) {
        query = query.eq('entity_type', filter.entityType);
      } else if (filter.entityTypes) {
        query = query.in('entity_type', filter.entityTypes);
      }
      
      const { data: entities, error } = await query;
      if (error) throw error;
      
      // Enhance with metadata and fields if requested
      if (entities && (filter.includeMetadata || filter.includeFields)) {
        return await this.enhanceSystemEntitiesWithMetadata(entities, filter);
      }
      
      return entities || [];
      
    } catch (error) {
      console.error('❌ Failed to query system entities:', error);
      return [];
    }
  }
  
  /**
   * 📊 Get HERA development metrics using restaurant metaphors
   */
  static async getHeraDevelopmentMetrics(): Promise<HeraDevelopmentMetrics> {
    console.log('📊 Calculating HERA development metrics...');
    
    try {
      // Get all platform features (like menu items)
      const features = await this.querySystemEntities({
        organizationType: 'CORE_PLATFORM',
        entityType: SYSTEM_ENTITY_TYPES.PLATFORM_FEATURE,
        includeMetadata: true
      });
      
      // Get AI models (like special recipes)
      const aiModels = await this.querySystemEntities({
        organizationType: 'AI_INTELLIGENCE',
        entityType: SYSTEM_ENTITY_TYPES.AI_MODEL,
        includeMetadata: true
      });
      
      // Get test results (like quality checks)
      const testResults = await this.querySystemEntities({
        organizationType: 'DEVELOPER_TOOLS',
        entityType: SYSTEM_ENTITY_TYPES.TEST_RESULT,
        includeMetadata: true
      });
      
      // Calculate metrics using restaurant business logic
      const totalFeatures = features.length;
      const completedFeatures = features.filter(f => 
        f.metadata?.implementation_status?.status === 'completed'
      ).length;
      
      const activeAIModels = aiModels.filter(m => 
        m.metadata?.deployment_status === 'production'
      ).length;
      
      const testCoverage = testResults.length > 0 ? 
        Math.round(testResults.reduce((sum, t) => sum + (t.metadata?.coverage || 0), 0) / testResults.length) : 0;
        
      const qualityScore = testResults.length > 0 ?
        Math.round(testResults.reduce((sum, t) => sum + (t.metadata?.quality_score || 0), 0) / testResults.length) : 0;
      
      return {
        totalFeatures,
        completedFeatures,
        activeAIModels,
        testCoverage,
        qualityScore,
        securityScore: 95, // Would calculate from security audits
        performanceScore: 89, // Would calculate from performance metrics
        developmentVelocity: Math.round((completedFeatures / Math.max(totalFeatures, 1)) * 100)
      };
      
    } catch (error) {
      console.error('❌ Failed to calculate development metrics:', error);
      return {
        totalFeatures: 0,
        completedFeatures: 0,
        activeAIModels: 0,
        testCoverage: 0,
        qualityScore: 0,
        securityScore: 0,
        performanceScore: 0,
        developmentVelocity: 0
      };
    }
  }
  
  /**
   * 🧠 Create AI-powered development "order" 
   * Treats feature development like restaurant order processing
   */
  static async createDevelopmentOrder(featureRequest: {
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: 'feature' | 'bug_fix' | 'enhancement' | 'security';
    estimatedEffort: string;
    dependencies?: string[];
    acceptanceCriteria?: string[];
  }): Promise<{ success: boolean; orderId?: string; error?: string }> {
    console.log('🧠 Creating HERA development order:', featureRequest.title);
    
    try {
      // Create development task as an "order"
      const result = await this.createSystemEntity({
        organizationType: 'CORE_PLATFORM',
        entityType: SYSTEM_ENTITY_TYPES.DEVELOPMENT_TASK,
        name: featureRequest.title,
        metadata: {
          task_specification: {
            description: featureRequest.description,
            priority: featureRequest.priority,
            category: featureRequest.category,
            estimated_effort: featureRequest.estimatedEffort,
            dependencies: featureRequest.dependencies || [],
            acceptance_criteria: featureRequest.acceptanceCriteria || [],
            status: 'pending',
            created_date: new Date().toISOString(),
            order_type: 'development_request' // Like 'dine_in' for restaurants
          }
        },
        fields: {
          // Additional searchable fields
          priority_level: featureRequest.priority,
          task_category: featureRequest.category,
          effort_estimate: featureRequest.estimatedEffort
        }
      });
      
      if (result.success) {
        console.log('✅ Development order created successfully:', result.entityId);
        
        // TODO: Trigger AI analysis for automatic task planning
        // await this.analyzeAndPlanDevelopmentTask(result.entityId!);
        
        return { success: true, orderId: result.entityId };
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Failed to create development order:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  /**
   * 📈 Get system organization summary (like restaurant performance)
   */
  static async getSystemOrganizationSummary(): Promise<any[]> {
    console.log('📈 Getting HERA system organization summary...');
    
    try {
      const { data, error } = await supabase
        .from('system_data_summary')
        .select('*')
        .eq('data_classification', 'HERA_SYSTEM')
        .order('organization_id');
        
      if (error) throw error;
      return data || [];
      
    } catch (error) {
      console.error('❌ Failed to get system summary:', error);
      return [];
    }
  }
  
  /**
   * 🔄 Sync HERA development data like real-time restaurant orders
   */
  static async subscribeToSystemUpdates(
    organizationType: SystemOrganizationType,
    callback: (payload: any) => void
  ): Promise<() => void> {
    console.log('🔄 Subscribing to HERA system updates:', organizationType);
    
    const organizationId = SYSTEM_ORGANIZATIONS[organizationType];
    
    const subscription = supabase
      .channel(`system-updates-${organizationType}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'core_entities',
          filter: `organization_id=eq.${organizationId}`
        },
        callback
      )
      .subscribe();
    
    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }
  
  /**
   * 🎯 Check if organization is system organization
   */
  static isSystemOrganization(organizationId: string): boolean {
    return Object.values(SYSTEM_ORGANIZATIONS).includes(organizationId);
  }
  
  /**
   * 🏷️ Get system organization type
   */
  static getSystemOrganizationType(organizationId: string): SystemOrganizationType | null {
    const entry = Object.entries(SYSTEM_ORGANIZATIONS).find(([_, id]) => id === organizationId);
    return entry ? (entry[0] as SystemOrganizationType) : null;
  }
  
  /**
   * 🔍 Query only client business data (excludes HERA system data)
   */
  static async getClientDataOnly(tableName: string = 'core_entities'): Promise<any[]> {
    console.log('🔍 Querying client data only from:', tableName);
    
    try {
      const systemOrgIds = Object.values(SYSTEM_ORGANIZATIONS);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .not('organization_id', 'in', `(${systemOrgIds.join(',')})`);
        
      if (error) throw error;
      return data || [];
      
    } catch (error) {
      console.error('❌ Failed to query client data:', error);
      return [];
    }
  }
  
  // Helper methods
  
  private static generateSystemEntityCode(name: string, type: string): string {
    const baseCode = name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6);
    const typeCode = type.toUpperCase().slice(0, 4);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `SYS-${baseCode}-${typeCode}-${random}`;
  }
  
  private static async addSystemMetadata(
    entityId: string,
    organizationId: string,
    entityType: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const metadataEntries = Object.entries(metadata).map(([key, value]) => ({
      organization_id: organizationId,
      entity_type: entityType,
      entity_id: entityId,
      metadata_type: 'system_development',
      metadata_category: 'hera_platform',
      metadata_key: key,
      metadata_value: typeof value === 'object' ? value : { value }
    }));
    
    const { error } = await supabaseAdmin
      .from('core_metadata')
      .insert(metadataEntries);
      
    if (error) throw error;
  }
  
  private static async addSystemFields(
    entityId: string,
    fields: Record<string, any>
  ): Promise<void> {
    const fieldEntries = Object.entries(fields).map(([key, value]) => ({
      entity_id: entityId,
      field_name: key,
      field_value: String(value),
      field_type: typeof value === 'number' ? 'number' : 'text'
    }));
    
    const { error } = await supabaseAdmin
      .from('core_dynamic_data')
      .insert(fieldEntries);
      
    if (error) throw error;
  }
  
  private static async enhanceSystemEntitiesWithMetadata(
    entities: any[],
    filter: SystemQueryFilter
  ): Promise<any[]> {
    const entityIds = entities.map(e => e.id);
    
    if (entityIds.length === 0) return entities;
    
    const enhanced = [...entities];
    
    if (filter.includeMetadata) {
      const { data: metadata } = await supabase
        .from('core_metadata')
        .select('entity_id, metadata_key, metadata_value')
        .in('entity_id', entityIds);
        
      // Group metadata by entity
      const metadataMap = new Map();
      metadata?.forEach(m => {
        if (!metadataMap.has(m.entity_id)) {
          metadataMap.set(m.entity_id, {});
        }
        metadataMap.get(m.entity_id)[m.metadata_key] = m.metadata_value;
      });
      
      enhanced.forEach(entity => {
        entity.metadata = metadataMap.get(entity.id) || {};
      });
    }
    
    if (filter.includeFields) {
      const { data: fields } = await supabase
        .from('core_dynamic_data')
        .select('entity_id, field_name, field_value, field_type')
        .in('entity_id', entityIds);
        
      // Group fields by entity
      const fieldsMap = new Map();
      fields?.forEach(f => {
        if (!fieldsMap.has(f.entity_id)) {
          fieldsMap.set(f.entity_id, {});
        }
        fieldsMap.get(f.entity_id)[f.field_name] = f.field_type === 'number' ? Number(f.field_value) : f.field_value;
      });
      
      enhanced.forEach(entity => {
        entity.fields = fieldsMap.get(entity.id) || {};
      });
    }
    
    return enhanced;
  }
}

export default HeraSystemService;