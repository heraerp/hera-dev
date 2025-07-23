/**
 * HERA Universal - ERP Modules Management API
 * 
 * Sacred Multi-Tenancy: organization_id filtering on ALL operations
 * Manages the 26+ core ERP modules and custom organization modules
 * Uses HERA's universal architecture with strict tenant isolation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for system operations
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

// System constants
const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000001';
const SYSTEM_USER_ID = '00000001-0000-0000-0000-000000000001';

interface ERPModule {
  id: string;
  entity_code: string;
  entity_name: string;
  entity_type: string;
  description?: string;
  module_category?: string;
  functional_area?: string;
  is_core?: boolean;
  is_deployed?: boolean;
  deployment_time_minutes?: number;
  dependencies?: string[];
  configuration?: Record<string, any>;
  usage_analytics?: {
    deployments: number;
    active_organizations: number;
    average_utilization: number;
    last_deployed: string;
  };
  organization_id: string; // Always track which org owns/can access
}

interface ModuleFilters {
  category?: string;
  functionalArea?: string;
  isCore?: boolean;
  isDeployed?: boolean;
  organizationId?: string;
}

// GET /api/templates/modules
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    
    // SACRED: organization_id is required for proper tenant isolation
    const organizationId = searchParams.get('organizationId');
    if (!organizationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'organizationId is required for multi-tenant security' 
        },
        { status: 400 }
      );
    }
    
    const filters: ModuleFilters = {
      category: searchParams.get('category') || undefined,
      functionalArea: searchParams.get('functionalArea') || undefined,
      isCore: searchParams.get('isCore') === 'true',
      isDeployed: searchParams.get('isDeployed') === 'true',
      organizationId
    };
    
    const includeSystem = searchParams.get('includeSystem') !== 'false'; // Default true
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    console.log('🛠️ Fetching ERP modules for organization:', organizationId);

    // SACRED: Query modules - both system modules and org-specific modules
    const orgFilters = includeSystem ? [SYSTEM_ORG_ID, organizationId] : [organizationId];
    
    const { data: modules, error, count } = await supabase
      .from('core_entities')
      .select(`
        *,
        organization:core_organizations!inner(
          id,
          org_name,
          client:core_clients(
            id,
            client_name
          )
        )
      `)
      .in('organization_id', orgFilters) // SACRED: Multi-org filter
      .in('entity_type', ['erp_module_template', 'custom_module_template', 'deployed_erp_module'])
      .eq('is_active', true)
      .order('entity_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching modules:', error);
      throw error;
    }

    if (!modules || modules.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          modules: [],
          totalCount: 0,
          filters,
          pagination: { limit, offset }
        },
        message: 'No ERP modules found'
      });
    }

    // SACRED: Get dynamic data (filtered by organization_id implicitly through entity ownership)
    const moduleIds = modules.map(m => m.id);
    const { data: dynamicData } = await supabase
      .from('core_dynamic_data')
      .select('entity_id, field_name, field_value')
      .in('entity_id', moduleIds);

    // Get module dependencies via relationships
    const { data: dependencies } = await supabase
      .from('core_relationships')
      .select('parent_entity_id, child_entity_id')
      .in('organization_id', orgFilters) // SACRED: Filter relationships
      .in('parent_entity_id', moduleIds)
      .eq('relationship_type', 'module_depends_on')
      .eq('is_active', true);

    // Get deployment status for organization
    const { data: deployments } = await supabase
      .from('core_entities')
      .select('entity_code')
      .eq('organization_id', organizationId) // SACRED: Only org deployments
      .eq('entity_type', 'deployed_erp_module')
      .eq('is_active', true);

    const deployedModules = new Set(deployments?.map(d => d.entity_code.replace('-DEPLOYED', '')) || []);

    // Build dynamic data map
    const dynamicDataMap = new Map<string, Record<string, any>>();
    dynamicData?.forEach(dd => {
      if (!dynamicDataMap.has(dd.entity_id)) {
        dynamicDataMap.set(dd.entity_id, {});
      }
      dynamicDataMap.get(dd.entity_id)![dd.field_name] = dd.field_value;
    });

    // Build dependencies map
    const dependenciesMap = new Map<string, string[]>();
    dependencies?.forEach(dep => {
      if (!dependenciesMap.has(dep.parent_entity_id)) {
        dependenciesMap.set(dep.parent_entity_id, []);
      }
      dependenciesMap.get(dep.parent_entity_id)!.push(dep.child_entity_id);
    });

    // Enrich modules with metadata
    const enrichedModules: ERPModule[] = modules.map(module => {
      const metadata = dynamicDataMap.get(module.id) || {};
      const isDeployed = deployedModules.has(module.entity_code);
      const moduleDeps = dependenciesMap.get(module.id) || [];

      return {
        id: module.id,
        entity_code: module.entity_code,
        entity_name: module.entity_name,
        entity_type: module.entity_type,
        description: metadata.description,
        module_category: metadata.module_category || 'general',
        functional_area: metadata.functional_area || 'operations',
        is_core: metadata.is_core === 'true' || module.organization_id === SYSTEM_ORG_ID,
        is_deployed: isDeployed,
        deployment_time_minutes: parseInt(metadata.deployment_time_minutes || '15'),
        dependencies: moduleDeps,
        configuration: {
          requires_setup: metadata.requires_setup === 'true',
          has_ui_components: metadata.has_ui_components === 'true',
          data_migration_required: metadata.data_migration_required === 'true',
          coa_accounts: parseInt(metadata.coa_accounts || '0'),
          workflow_steps: parseInt(metadata.workflow_steps || '0')
        },
        usage_analytics: {
          deployments: parseInt(metadata.total_deployments || '0'),
          active_organizations: parseInt(metadata.active_organizations || '0'),
          average_utilization: parseFloat(metadata.average_utilization || '0'),
          last_deployed: metadata.last_deployed || new Date().toISOString()
        },
        organization_id: module.organization_id
      };
    });

    // Apply filters
    let filteredModules = enrichedModules;
    
    if (filters.category) {
      filteredModules = filteredModules.filter(m => m.module_category === filters.category);
    }
    
    if (filters.functionalArea) {
      filteredModules = filteredModules.filter(m => m.functional_area === filters.functionalArea);
    }
    
    if (filters.isCore !== undefined) {
      filteredModules = filteredModules.filter(m => m.is_core === filters.isCore);
    }
    
    if (filters.isDeployed !== undefined) {
      filteredModules = filteredModules.filter(m => m.is_deployed === filters.isDeployed);
    }

    // Get filter options
    const categories = [...new Set(enrichedModules.map(m => m.module_category).filter(Boolean))];
    const functionalAreas = [...new Set(enrichedModules.map(m => m.functional_area).filter(Boolean))];

    // Calculate summary statistics
    const summary = {
      totalModules: filteredModules.length,
      coreModules: filteredModules.filter(m => m.is_core).length,
      customModules: filteredModules.filter(m => !m.is_core).length,
      deployedModules: filteredModules.filter(m => m.is_deployed).length,
      availableModules: filteredModules.filter(m => !m.is_deployed).length
    };

    console.log('✅ ERP modules fetched successfully:', filteredModules.length);

    return NextResponse.json({
      success: true,
      data: {
        modules: filteredModules,
        summary,
        totalCount: filteredModules.length,
        filters,
        availableFilters: {
          categories,
          functionalAreas
        },
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < (count || 0)
        }
      },
      metadata: {
        organizationId,
        includeSystem,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ ERP modules error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch ERP modules' 
      },
      { status: 500 }
    );
  }
}

// POST /api/templates/modules - Create custom ERP module
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();
    
    const {
      organizationId,
      moduleName,
      description,
      moduleCategory,
      functionalArea,
      configuration,
      dependencies,
      createdBy
    } = body;

    // SACRED: Validate organization_id is provided
    if (!organizationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'organizationId is required for multi-tenant security' 
        },
        { status: 400 }
      );
    }

    console.log('🛠️ Creating custom ERP module for organization:', organizationId);

    // Validate required fields
    if (!moduleName || !functionalArea) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: moduleName, functionalArea' 
        },
        { status: 400 }
      );
    }

    // Generate unique entity code
    const entityCode = `CUSTOM-${functionalArea.toUpperCase()}-${Date.now()}`;
    const entityId = crypto.randomUUID();

    // SACRED: Create module entity with organization_id
    const { data: moduleEntity, error: entityError } = await supabase
      .from('core_entities')
      .insert({
        id: entityId,
        organization_id: organizationId, // SACRED: Organization isolation
        entity_type: 'custom_module_template',
        entity_name: moduleName,
        entity_code: entityCode,
        is_active: true
      })
      .select()
      .single();

    if (entityError) {
      console.error('❌ Error creating module entity:', entityError);
      throw entityError;
    }

    // SACRED: Create dynamic data
    const dynamicFields = [
      {
        entity_id: entityId,
        field_name: 'description',
        field_value: description || '',
        field_type: 'text'
      },
      {
        entity_id: entityId,
        field_name: 'module_category',
        field_value: moduleCategory || 'custom',
        field_type: 'text'
      },
      {
        entity_id: entityId,
        field_name: 'functional_area',
        field_value: functionalArea,
        field_type: 'text'
      },
      {
        entity_id: entityId,
        field_name: 'is_core',
        field_value: 'false',
        field_type: 'boolean'
      },
      {
        entity_id: entityId,
        field_name: 'created_by',
        field_value: createdBy || SYSTEM_USER_ID,
        field_type: 'text'
      },
      {
        entity_id: entityId,
        field_name: 'deployment_time_minutes',
        field_value: (configuration?.deployment_time_minutes || 15).toString(),
        field_type: 'number'
      },
      {
        entity_id: entityId,
        field_name: 'requires_setup',
        field_value: (configuration?.requires_setup || true).toString(),
        field_type: 'boolean'
      },
      {
        entity_id: entityId,
        field_name: 'has_ui_components',
        field_value: (configuration?.has_ui_components || true).toString(),
        field_type: 'boolean'
      }
    ];

    const { error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .insert(dynamicFields);

    if (dynamicError) {
      console.error('❌ Error creating dynamic data:', dynamicError);
      throw dynamicError;
    }

    // Create dependencies if specified
    if (dependencies && dependencies.length > 0) {
      const relationships = dependencies.map((depId: string) => ({
        organization_id: organizationId, // SACRED: Relationship isolation
        relationship_type: 'module_depends_on',
        parent_entity_id: entityId,
        child_entity_id: depId,
        is_active: true
      }));

      const { error: relError } = await supabase
        .from('core_relationships')
        .insert(relationships);

      if (relError) {
        console.error('❌ Error creating dependencies:', relError);
        throw relError;
      }
    }

    console.log('✅ Custom ERP module created successfully:', entityCode);

    return NextResponse.json({
      success: true,
      data: {
        moduleId: entityId,
        moduleCode: entityCode,
        moduleName: moduleName,
        organizationId: organizationId
      },
      message: 'Custom ERP module created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Create module error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create ERP module' 
      },
      { status: 500 }
    );
  }
}